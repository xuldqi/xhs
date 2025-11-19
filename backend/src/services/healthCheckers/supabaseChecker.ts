/**
 * Supabase Health Checker
 * 
 * 检查 Supabase 数据库连接和配置状态
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  IServiceHealthChecker,
  ServiceHealthResult,
  ServiceDiagnostics,
  SupabaseDiagnostics,
  Recommendation
} from '../../types/health'

export class SupabaseChecker implements IServiceHealthChecker {
  readonly serviceName = 'supabase'
  private client: SupabaseClient | null = null

  /**
   * 检查 Supabase 服务健康状态
   */
  async check(timeout: number = 5000): Promise<ServiceHealthResult> {
    const startTime = Date.now()

    try {
      // 验证配置
      const url = process.env.SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_KEY

      if (!url || !key) {
        return {
          status: 'error',
          message: 'Supabase configuration is missing',
          error: {
            code: 'CONFIG_MISSING',
            message: 'SUPABASE_URL or SUPABASE_SERVICE_KEY not configured'
          }
        }
      }

      // 创建客户端
      this.client = createClient(url, key)

      // 执行简单的数据库查询来测试连接
      const { data, error } = await Promise.race([
        this.client.from('profiles').select('count', { count: 'exact', head: true }),
        this.timeoutPromise(timeout)
      ])

      const latency = Date.now() - startTime

      if (error) {
        return {
          status: 'error',
          message: `Supabase connection failed: ${error.message}`,
          latency,
          error: {
            code: error.code || 'CONNECTION_ERROR',
            message: error.message,
            context: { error }
          }
        }
      }

      return {
        status: 'ok',
        message: 'Supabase connection successful',
        latency,
        metadata: {
          connected: true,
          queryExecuted: true
        }
      }
    } catch (error: any) {
      const latency = Date.now() - startTime

      if (error.message === 'Operation timeout') {
        return {
          status: 'error',
          message: `Supabase connection timeout after ${timeout}ms`,
          latency,
          error: {
            code: 'TIMEOUT',
            message: `Connection timeout after ${timeout}ms`
          }
        }
      }

      return {
        status: 'error',
        message: `Supabase check failed: ${error.message}`,
        latency,
        error: {
          code: 'CHECK_FAILED',
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  /**
   * 获取详细诊断信息
   */
  async diagnose(): Promise<ServiceDiagnostics> {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY

    const diagnostics: SupabaseDiagnostics = {
      connected: false,
      configStatus: {
        urlConfigured: !!url,
        keyConfigured: !!key,
        urlValid: false,
        keyValid: false
      }
    }

    const recommendations: Recommendation[] = []

    // 验证 URL 配置
    if (!url) {
      recommendations.push({
        severity: 'critical',
        service: 'supabase',
        issue: 'SUPABASE_URL is not configured',
        solution: 'Add SUPABASE_URL to your .env file. Get it from Supabase Dashboard → Settings → API',
        documentation: 'https://supabase.com/docs/guides/api'
      })
    } else {
      try {
        const parsedUrl = new URL(url)
        diagnostics.configStatus.urlValid = true

        // 提取项目 ID 和区域
        const hostname = parsedUrl.hostname
        const match = hostname.match(/^([^.]+)\.supabase\.co$/)
        if (match) {
          diagnostics.projectId = match[1]
          diagnostics.region = 'unknown' // Supabase 不在 URL 中暴露区域信息
        }
      } catch {
        diagnostics.configStatus.urlValid = false
        recommendations.push({
          severity: 'critical',
          service: 'supabase',
          issue: 'SUPABASE_URL format is invalid',
          solution: 'URL should be in format: https://your-project.supabase.co',
          documentation: 'https://supabase.com/docs/guides/api'
        })
      }
    }

    // 验证密钥配置
    if (!key) {
      recommendations.push({
        severity: 'critical',
        service: 'supabase',
        issue: 'SUPABASE_SERVICE_KEY is not configured',
        solution: 'Add SUPABASE_SERVICE_KEY to your .env file. Get it from Supabase Dashboard → Settings → API (use service_role key)',
        documentation: 'https://supabase.com/docs/guides/api'
      })
    } else {
      // 验证 JWT 格式
      const parts = key.split('.')
      diagnostics.configStatus.keyValid = parts.length === 3
      
      if (!diagnostics.configStatus.keyValid) {
        recommendations.push({
          severity: 'critical',
          service: 'supabase',
          issue: 'SUPABASE_SERVICE_KEY format is invalid',
          solution: 'Key should be a JWT token with 3 parts separated by dots',
          documentation: 'https://supabase.com/docs/guides/api'
        })
      }
    }

    // 尝试连接测试
    if (diagnostics.configStatus.urlValid && diagnostics.configStatus.keyValid) {
      try {
        const result = await this.check(5000)
        diagnostics.connected = result.status === 'ok'
        diagnostics.latency = result.latency

        if (!diagnostics.connected && result.error) {
          diagnostics.error = result.error

          if (result.error.code === 'TIMEOUT') {
            recommendations.push({
              severity: 'warning',
              service: 'supabase',
              issue: 'Connection timeout',
              solution: 'Check your network connection and firewall settings. Verify Supabase service is accessible.',
              documentation: 'https://supabase.com/docs/guides/platform/going-into-prod'
            })
          } else {
            recommendations.push({
              severity: 'critical',
              service: 'supabase',
              issue: `Connection failed: ${result.error.message}`,
              solution: 'Verify your Supabase URL and service key are correct. Check if the project is active.',
              documentation: 'https://supabase.com/docs/guides/api'
            })
          }
        }
      } catch (error: any) {
        diagnostics.error = {
          code: 'DIAGNOSTIC_FAILED',
          message: error.message
        }
      }
    }

    return {
      serviceName: this.serviceName,
      healthy: diagnostics.connected,
      details: diagnostics,
      error: diagnostics.error,
      recommendations
    }
  }

  /**
   * 创建超时 Promise
   */
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), ms)
    })
  }
}
