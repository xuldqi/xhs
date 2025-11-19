/**
 * Health Check Controller
 * 
 * 协调所有服务的健康检查
 */

import {
  IHealthCheckController,
  BasicHealthResponse,
  DetailedHealthResponse,
  HealthStatus,
  ServiceStatusInfo,
  ConfigurationStatus,
  Recommendation
} from '../types/health'
import { SupabaseChecker } from '../services/healthCheckers/supabaseChecker'
import { AlipayChecker } from '../services/healthCheckers/alipayChecker'
import { DeepSeekChecker, GeminiChecker } from '../services/healthCheckers/aiChecker'
import { ConfigurationValidator } from '../services/configValidator'

/**
 * 健康检查结果缓存
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class HealthCheckController implements IHealthCheckController {
  private supabaseChecker = new SupabaseChecker()
  private alipayChecker = new AlipayChecker()
  private deepseekChecker = new DeepSeekChecker()
  private geminiChecker = new GeminiChecker()
  private configValidator = new ConfigurationValidator()

  // 缓存
  private basicHealthCache: CacheEntry<BasicHealthResponse> | null = null
  private detailedHealthCache: CacheEntry<DetailedHealthResponse> | null = null

  // 缓存时间（毫秒）
  private readonly BASIC_CACHE_TTL = 30000 // 30秒
  private readonly DETAILED_CACHE_TTL = 60000 // 60秒

  /**
   * 基础健康检查
   */
  async getBasicHealth(): Promise<BasicHealthResponse> {
    // 检查缓存
    if (this.basicHealthCache && Date.now() - this.basicHealthCache.timestamp < this.BASIC_CACHE_TTL) {
      return this.basicHealthCache.data
    }

    const startTime = Date.now()

    // 并行检查所有服务
    const [supabaseResult, alipayResult, deepseekResult, geminiResult] = await Promise.all([
      this.supabaseChecker.check(500),
      this.alipayChecker.check(500),
      this.deepseekChecker.check(500),
      this.geminiChecker.check(500)
    ])

    // 构建响应
    const response: BasicHealthResponse = {
      status: this.calculateOverallStatus([
        supabaseResult.status,
        alipayResult.status,
        deepseekResult.status,
        geminiResult.status
      ]),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        supabase: {
          status: supabaseResult.status,
          message: supabaseResult.message
        },
        alipay: {
          status: alipayResult.status,
          message: alipayResult.message
        },
        deepseek: {
          status: deepseekResult.status,
          message: deepseekResult.message
        },
        gemini: {
          status: geminiResult.status,
          message: geminiResult.message
        }
      }
    }

    // 缓存结果
    this.basicHealthCache = {
      data: response,
      timestamp: Date.now()
    }

    console.log(`✅ Basic health check completed in ${Date.now() - startTime}ms`)

    return response
  }

  /**
   * 详细健康检查
   */
  async getDetailedHealth(): Promise<DetailedHealthResponse> {
    // 检查缓存
    if (this.detailedHealthCache && Date.now() - this.detailedHealthCache.timestamp < this.DETAILED_CACHE_TTL) {
      return this.detailedHealthCache.data
    }

    const startTime = Date.now()

    // 并行获取所有诊断信息
    const [supabaseDiag, alipayDiag, deepseekDiag, geminiDiag] = await Promise.all([
      this.supabaseChecker.diagnose(),
      this.alipayChecker.diagnose(),
      this.deepseekChecker.diagnose(),
      this.geminiChecker.diagnose()
    ])

    // 验证配置
    const configValidation = this.configValidator.validateEnvironment()
    const missingConfigs = this.configValidator.getMissingConfigs()
    const fixSuggestions = this.configValidator.getFixSuggestions()

    // 构建配置状态
    const configStatus: ConfigurationStatus = {
      allRequired: configValidation.valid,
      missing: missingConfigs,
      invalid: configValidation.errors.map(e => e.field),
      warnings: configValidation.warnings.map(w => w.field)
    }

    // 收集所有建议
    const allRecommendations: Recommendation[] = [
      ...supabaseDiag.recommendations,
      ...alipayDiag.recommendations,
      ...deepseekDiag.recommendations,
      ...geminiDiag.recommendations
    ]

    // 从修复建议生成推荐
    fixSuggestions.forEach(suggestion => {
      allRecommendations.push({
        severity: 'critical',
        service: 'configuration',
        issue: suggestion.issue,
        solution: suggestion.steps.join(' → '),
        documentation: suggestion.example
      })
    })

    // 构建响应
    const response: DetailedHealthResponse = {
      status: this.calculateOverallStatus([
        supabaseDiag.healthy ? 'ok' : 'error',
        alipayDiag.healthy ? 'ok' : 'error',
        deepseekDiag.healthy ? 'ok' : 'error',
        geminiDiag.healthy ? 'ok' : 'error'
      ]),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        supabase: {
          status: supabaseDiag.healthy ? 'ok' : 'error',
          message: supabaseDiag.healthy ? 'Supabase is healthy' : 'Supabase has issues'
        },
        alipay: {
          status: alipayDiag.healthy ? 'ok' : 'error',
          message: alipayDiag.healthy ? 'Alipay is healthy' : 'Alipay has issues'
        },
        deepseek: {
          status: deepseekDiag.healthy ? 'ok' : 'error',
          message: deepseekDiag.healthy ? 'DeepSeek is healthy' : 'DeepSeek has issues'
        },
        gemini: {
          status: geminiDiag.healthy ? 'ok' : 'error',
          message: geminiDiag.healthy ? 'Gemini is healthy' : 'Gemini has issues'
        }
      },
      diagnostics: {
        supabase: supabaseDiag.details as any,
        alipay: alipayDiag.details as any,
        deepseek: deepseekDiag.details as any,
        gemini: geminiDiag.details as any
      },
      configuration: configStatus,
      recommendations: allRecommendations
    }

    // 缓存结果
    this.detailedHealthCache = {
      data: response,
      timestamp: Date.now()
    }

    console.log(`✅ Detailed health check completed in ${Date.now() - startTime}ms`)

    return response
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.basicHealthCache = null
    this.detailedHealthCache = null
  }

  /**
   * 计算整体健康状态
   */
  private calculateOverallStatus(serviceStatuses: string[]): HealthStatus {
    const hasError = serviceStatuses.some(s => s === 'error')
    const hasWarning = serviceStatuses.some(s => s === 'warning')

    if (hasError) {
      return 'unhealthy'
    } else if (hasWarning) {
      return 'degraded'
    } else {
      return 'healthy'
    }
  }
}

/**
 * 创建健康检查控制器实例
 */
export function createHealthCheckController(): HealthCheckController {
  return new HealthCheckController()
}
