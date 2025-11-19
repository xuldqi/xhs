/**
 * AI Services Health Checker
 * 
 * 检查 DeepSeek 和 Gemini AI 服务配置和状态
 */

import {
  IServiceHealthChecker,
  ServiceHealthResult,
  ServiceDiagnostics,
  DeepSeekDiagnostics,
  GeminiDiagnostics,
  Recommendation
} from '../../types/health'

/**
 * DeepSeek AI 服务检查器
 */
export class DeepSeekChecker implements IServiceHealthChecker {
  readonly serviceName = 'deepseek'

  async check(timeout: number = 5000): Promise<ServiceHealthResult> {
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY
      const baseUrl = process.env.API_BASE_URL

      if (!apiKey || !baseUrl) {
        return {
          status: 'error',
          message: 'DeepSeek configuration is incomplete',
          error: {
            code: 'CONFIG_INCOMPLETE',
            message: 'DEEPSEEK_API_KEY or API_BASE_URL not configured'
          }
        }
      }

      // 验证 API 密钥格式
      if (!apiKey.startsWith('sk-')) {
        return {
          status: 'warning',
          message: 'DeepSeek API key format may be invalid',
          metadata: {
            available: true,
            authenticated: false
          }
        }
      }

      // 验证 URL 格式
      try {
        new URL(baseUrl)
      } catch {
        return {
          status: 'error',
          message: 'DeepSeek base URL format is invalid',
          error: {
            code: 'INVALID_URL',
            message: 'API_BASE_URL is not a valid URL'
          }
        }
      }

      // 尝试简单的 API 调用来验证认证（可选，避免消耗配额）
      // 这里我们只验证配置，不实际调用 API
      return {
        status: 'ok',
        message: 'DeepSeek configuration is valid',
        metadata: {
          available: true,
          authenticated: true // 假设配置正确就是已认证
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `DeepSeek check failed: ${error.message}`,
        error: {
          code: 'CHECK_FAILED',
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  async diagnose(): Promise<ServiceDiagnostics> {
    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.API_BASE_URL

    const diagnostics: DeepSeekDiagnostics = {
      available: false,
      apiKeyConfigured: !!apiKey,
      baseUrlConfigured: !!baseUrl,
      authenticated: false
    }

    const recommendations: Recommendation[] = []

    // 验证 API 密钥
    if (!apiKey) {
      recommendations.push({
        severity: 'critical',
        service: 'deepseek',
        issue: 'DEEPSEEK_API_KEY is not configured',
        solution: 'Add DEEPSEEK_API_KEY to your .env file. Get it from DeepSeek Platform',
        documentation: 'https://platform.deepseek.com/'
      })
    } else if (!apiKey.startsWith('sk-')) {
      recommendations.push({
        severity: 'warning',
        service: 'deepseek',
        issue: 'API key format may be invalid',
        solution: 'DeepSeek API keys typically start with "sk-". Verify your key is correct.',
        documentation: 'https://platform.deepseek.com/'
      })
    } else {
      diagnostics.authenticated = true
    }

    // 验证基础 URL
    if (!baseUrl) {
      recommendations.push({
        severity: 'critical',
        service: 'deepseek',
        issue: 'API_BASE_URL is not configured',
        solution: 'Add API_BASE_URL to your .env file. Use https://api.deepseek.com',
        documentation: 'https://platform.deepseek.com/docs'
      })
    } else {
      try {
        new URL(baseUrl)
        
        if (!baseUrl.includes('deepseek.com')) {
          recommendations.push({
            severity: 'warning',
            service: 'deepseek',
            issue: 'Base URL does not appear to be a DeepSeek URL',
            solution: 'Verify the URL is correct. Official URL is https://api.deepseek.com',
            documentation: 'https://platform.deepseek.com/docs'
          })
        }
      } catch {
        recommendations.push({
          severity: 'critical',
          service: 'deepseek',
          issue: 'API_BASE_URL format is invalid',
          solution: 'Base URL should be a valid HTTPS URL',
          documentation: 'https://platform.deepseek.com/docs'
        })
      }
    }

    diagnostics.available = diagnostics.apiKeyConfigured && diagnostics.baseUrlConfigured

    return {
      serviceName: this.serviceName,
      healthy: diagnostics.available && diagnostics.authenticated,
      details: diagnostics,
      error: diagnostics.available ? undefined : {
        code: 'NOT_CONFIGURED',
        message: 'DeepSeek configuration is incomplete'
      },
      recommendations
    }
  }
}

/**
 * Gemini AI 服务检查器
 */
export class GeminiChecker implements IServiceHealthChecker {
  readonly serviceName = 'gemini'

  async check(timeout: number = 5000): Promise<ServiceHealthResult> {
    try {
      const apiKey = process.env.GEMINI_API_KEY
      const baseUrl = process.env.GEMINI_BASE_URL
      const proxyKey = process.env.GEMINI_PROXY_API_KEY

      if (!apiKey || !baseUrl) {
        return {
          status: 'error',
          message: 'Gemini configuration is incomplete',
          error: {
            code: 'CONFIG_INCOMPLETE',
            message: 'GEMINI_API_KEY or GEMINI_BASE_URL not configured'
          }
        }
      }

      // 验证 API 密钥格式
      if (!apiKey.startsWith('AIzaSy')) {
        return {
          status: 'warning',
          message: 'Gemini API key format may be invalid',
          metadata: {
            available: true,
            authenticated: false
          }
        }
      }

      // 验证 URL 格式
      try {
        new URL(baseUrl)
      } catch {
        return {
          status: 'error',
          message: 'Gemini base URL format is invalid',
          error: {
            code: 'INVALID_URL',
            message: 'GEMINI_BASE_URL is not a valid URL'
          }
        }
      }

      return {
        status: 'ok',
        message: 'Gemini configuration is valid',
        metadata: {
          available: true,
          authenticated: true,
          proxyConfigured: !!proxyKey
        }
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `Gemini check failed: ${error.message}`,
        error: {
          code: 'CHECK_FAILED',
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  async diagnose(): Promise<ServiceDiagnostics> {
    const apiKey = process.env.GEMINI_API_KEY
    const baseUrl = process.env.GEMINI_BASE_URL
    const proxyKey = process.env.GEMINI_PROXY_API_KEY

    const diagnostics: GeminiDiagnostics = {
      available: false,
      apiKeyConfigured: !!apiKey,
      proxyConfigured: !!proxyKey,
      authenticated: false
    }

    const recommendations: Recommendation[] = []

    // 验证 API 密钥
    if (!apiKey) {
      recommendations.push({
        severity: 'critical',
        service: 'gemini',
        issue: 'GEMINI_API_KEY is not configured',
        solution: 'Add GEMINI_API_KEY to your .env file. Get it from Google AI Studio',
        documentation: 'https://makersuite.google.com/app/apikey'
      })
    } else if (!apiKey.startsWith('AIzaSy')) {
      recommendations.push({
        severity: 'warning',
        service: 'gemini',
        issue: 'API key format may be invalid',
        solution: 'Gemini API keys typically start with "AIzaSy". Verify your key is correct.',
        documentation: 'https://makersuite.google.com/app/apikey'
      })
    } else {
      diagnostics.authenticated = true
    }

    // 验证基础 URL
    if (!baseUrl) {
      recommendations.push({
        severity: 'critical',
        service: 'gemini',
        issue: 'GEMINI_BASE_URL is not configured',
        solution: 'Add GEMINI_BASE_URL to your .env file. Use https://generativelanguage.googleapis.com or your proxy URL',
        documentation: 'https://ai.google.dev/docs'
      })
    } else {
      try {
        const url = new URL(baseUrl)
        
        if (url.hostname.includes('googleapis.com')) {
          recommendations.push({
            severity: 'info',
            service: 'gemini',
            issue: 'Using official Google API endpoint',
            solution: 'Consider using a proxy if you experience connectivity issues in certain regions',
            documentation: 'https://ai.google.dev/docs'
          })
        } else {
          recommendations.push({
            severity: 'info',
            service: 'gemini',
            issue: 'Using proxy endpoint',
            solution: 'Ensure GEMINI_PROXY_API_KEY is configured for proxy authentication',
            documentation: 'Check your proxy service documentation'
          })
        }
      } catch {
        recommendations.push({
          severity: 'critical',
          service: 'gemini',
          issue: 'GEMINI_BASE_URL format is invalid',
          solution: 'Base URL should be a valid HTTPS URL',
          documentation: 'https://ai.google.dev/docs'
        })
      }
    }

    // 验证代理密钥（如果使用代理）
    if (baseUrl && !baseUrl.includes('googleapis.com') && !proxyKey) {
      recommendations.push({
        severity: 'warning',
        service: 'gemini',
        issue: 'GEMINI_PROXY_API_KEY is not configured',
        solution: 'Add GEMINI_PROXY_API_KEY if your proxy service requires authentication',
        documentation: 'Check your proxy service documentation'
      })
    }

    diagnostics.available = diagnostics.apiKeyConfigured && !!baseUrl

    return {
      serviceName: this.serviceName,
      healthy: diagnostics.available && diagnostics.authenticated,
      details: diagnostics,
      error: diagnostics.available ? undefined : {
        code: 'NOT_CONFIGURED',
        message: 'Gemini configuration is incomplete'
      },
      recommendations
    }
  }
}
