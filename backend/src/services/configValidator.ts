/**
 * Configuration Validator
 * 
 * 验证系统配置和环境变量
 */

import {
  IConfigurationValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  FixSuggestion
} from '../types/health'

/**
 * 必需的环境变量配置
 */
const REQUIRED_ENV_VARS = {
  // Supabase 配置
  supabase: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'],
  
  // 支付宝配置
  alipay: ['ALIPAY_APP_ID', 'ALIPAY_PRIVATE_KEY', 'ALIPAY_PUBLIC_KEY', 'ALIPAY_GATEWAY'],
  
  // AI 服务配置
  deepseek: ['DEEPSEEK_API_KEY', 'API_BASE_URL'],
  gemini: ['GEMINI_API_KEY', 'GEMINI_BASE_URL', 'GEMINI_PROXY_API_KEY']
}

/**
 * 可选的环境变量（有默认值）
 */
const OPTIONAL_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL',
  'BACKEND_URL',
  'ALLOWED_ORIGINS',
  'MAX_REQUEST_SIZE'
]

export class ConfigurationValidator implements IConfigurationValidator {
  private errors: ValidationError[] = []
  private warnings: ValidationWarning[] = []

  /**
   * 验证所有必需的环境变量
   */
  validateEnvironment(): ValidationResult {
    this.errors = []
    this.warnings = []

    // 验证所有服务的配置
    this.validateSupabaseConfig()
    this.validateAlipayConfig()
    this.validateDeepSeekConfig()
    this.validateGeminiConfig()

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    }
  }

  /**
   * 验证特定服务的配置
   */
  validateServiceConfig(serviceName: string): ValidationResult {
    this.errors = []
    this.warnings = []

    switch (serviceName.toLowerCase()) {
      case 'supabase':
        this.validateSupabaseConfig()
        break
      case 'alipay':
        this.validateAlipayConfig()
        break
      case 'deepseek':
        this.validateDeepSeekConfig()
        break
      case 'gemini':
        this.validateGeminiConfig()
        break
      default:
        this.errors.push({
          field: 'serviceName',
          message: `Unknown service: ${serviceName}`
        })
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    }
  }

  /**
   * 获取缺失的配置项
   */
  getMissingConfigs(): string[] {
    const missing: string[] = []

    Object.values(REQUIRED_ENV_VARS).forEach(vars => {
      vars.forEach(varName => {
        if (!process.env[varName]) {
          missing.push(varName)
        }
      })
    })

    return missing
  }

  /**
   * 获取配置修复建议
   */
  getFixSuggestions(): FixSuggestion[] {
    const suggestions: FixSuggestion[] = []
    const missing = this.getMissingConfigs()

    missing.forEach(configKey => {
      const suggestion = this.generateFixSuggestion(configKey)
      if (suggestion) {
        suggestions.push(suggestion)
      }
    })

    return suggestions
  }

  // ============================================
  // 私有方法 - 服务配置验证
  // ============================================

  /**
   * 验证 Supabase 配置
   */
  private validateSupabaseConfig(): void {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY

    if (!url) {
      this.errors.push({
        field: 'SUPABASE_URL',
        message: 'Supabase URL is required',
        expectedFormat: 'https://your-project.supabase.co'
      })
    } else if (!this.isValidUrl(url)) {
      this.errors.push({
        field: 'SUPABASE_URL',
        message: 'Supabase URL format is invalid',
        expectedFormat: 'https://your-project.supabase.co',
        actualValue: url
      })
    } else if (!url.includes('supabase.co')) {
      this.warnings.push({
        field: 'SUPABASE_URL',
        message: 'URL does not appear to be a Supabase URL',
        suggestion: 'Verify this is the correct Supabase project URL'
      })
    }

    if (!key) {
      this.errors.push({
        field: 'SUPABASE_SERVICE_KEY',
        message: 'Supabase service key is required',
        expectedFormat: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      })
    } else if (!this.isValidJWT(key)) {
      this.errors.push({
        field: 'SUPABASE_SERVICE_KEY',
        message: 'Supabase service key format is invalid',
        expectedFormat: 'JWT token (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)'
      })
    }
  }

  /**
   * 验证支付宝配置
   */
  private validateAlipayConfig(): void {
    const appId = process.env.ALIPAY_APP_ID
    const privateKey = process.env.ALIPAY_PRIVATE_KEY
    const publicKey = process.env.ALIPAY_PUBLIC_KEY
    const gateway = process.env.ALIPAY_GATEWAY

    if (!appId) {
      this.errors.push({
        field: 'ALIPAY_APP_ID',
        message: 'Alipay APP ID is required',
        expectedFormat: '20-digit number (e.g., 9021000157676998)'
      })
    } else if (!/^\d{16,20}$/.test(appId)) {
      this.errors.push({
        field: 'ALIPAY_APP_ID',
        message: 'Alipay APP ID format is invalid',
        expectedFormat: '16-20 digit number',
        actualValue: appId
      })
    }

    if (!privateKey) {
      this.errors.push({
        field: 'ALIPAY_PRIVATE_KEY',
        message: 'Alipay private key is required',
        expectedFormat: 'PKCS8 format RSA private key (without BEGIN/END markers)'
      })
    } else if (!this.isValidRSAKey(privateKey)) {
      this.errors.push({
        field: 'ALIPAY_PRIVATE_KEY',
        message: 'Alipay private key format is invalid',
        expectedFormat: 'Base64 encoded PKCS8 key without BEGIN/END markers'
      })
    }

    if (!publicKey) {
      this.errors.push({
        field: 'ALIPAY_PUBLIC_KEY',
        message: 'Alipay public key is required',
        expectedFormat: 'RSA public key (without BEGIN/END markers)'
      })
    } else if (!this.isValidRSAKey(publicKey)) {
      this.errors.push({
        field: 'ALIPAY_PUBLIC_KEY',
        message: 'Alipay public key format is invalid',
        expectedFormat: 'Base64 encoded public key without BEGIN/END markers'
      })
    }

    if (!gateway) {
      this.errors.push({
        field: 'ALIPAY_GATEWAY',
        message: 'Alipay gateway URL is required',
        expectedFormat: 'https://openapi.alipay.com/gateway.do or sandbox URL'
      })
    } else if (!this.isValidUrl(gateway)) {
      this.errors.push({
        field: 'ALIPAY_GATEWAY',
        message: 'Alipay gateway URL format is invalid',
        expectedFormat: 'https://openapi.alipay.com/gateway.do',
        actualValue: gateway
      })
    } else if (gateway.includes('sandbox')) {
      this.warnings.push({
        field: 'ALIPAY_GATEWAY',
        message: 'Using Alipay sandbox environment',
        suggestion: 'Switch to production gateway for live payments'
      })
    }
  }

  /**
   * 验证 DeepSeek 配置
   */
  private validateDeepSeekConfig(): void {
    const apiKey = process.env.DEEPSEEK_API_KEY
    const baseUrl = process.env.API_BASE_URL

    if (!apiKey) {
      this.errors.push({
        field: 'DEEPSEEK_API_KEY',
        message: 'DeepSeek API key is required',
        expectedFormat: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      })
    } else if (!apiKey.startsWith('sk-')) {
      this.warnings.push({
        field: 'DEEPSEEK_API_KEY',
        message: 'API key does not start with "sk-"',
        suggestion: 'Verify this is a valid DeepSeek API key'
      })
    }

    if (!baseUrl) {
      this.errors.push({
        field: 'API_BASE_URL',
        message: 'DeepSeek API base URL is required',
        expectedFormat: 'https://api.deepseek.com'
      })
    } else if (!this.isValidUrl(baseUrl)) {
      this.errors.push({
        field: 'API_BASE_URL',
        message: 'API base URL format is invalid',
        expectedFormat: 'https://api.deepseek.com',
        actualValue: baseUrl
      })
    }
  }

  /**
   * 验证 Gemini 配置
   */
  private validateGeminiConfig(): void {
    const apiKey = process.env.GEMINI_API_KEY
    const baseUrl = process.env.GEMINI_BASE_URL
    const proxyKey = process.env.GEMINI_PROXY_API_KEY

    if (!apiKey) {
      this.errors.push({
        field: 'GEMINI_API_KEY',
        message: 'Gemini API key is required',
        expectedFormat: 'AIzaSy...'
      })
    } else if (!apiKey.startsWith('AIzaSy')) {
      this.warnings.push({
        field: 'GEMINI_API_KEY',
        message: 'API key does not start with "AIzaSy"',
        suggestion: 'Verify this is a valid Gemini API key'
      })
    }

    if (!baseUrl) {
      this.errors.push({
        field: 'GEMINI_BASE_URL',
        message: 'Gemini base URL is required',
        expectedFormat: 'https://generativelanguage.googleapis.com or proxy URL'
      })
    } else if (!this.isValidUrl(baseUrl)) {
      this.errors.push({
        field: 'GEMINI_BASE_URL',
        message: 'Gemini base URL format is invalid',
        actualValue: baseUrl
      })
    }

    if (!proxyKey) {
      this.warnings.push({
        field: 'GEMINI_PROXY_API_KEY',
        message: 'Gemini proxy API key is not configured',
        suggestion: 'Set proxy key if using a proxy service'
      })
    }
  }

  // ============================================
  // 私有方法 - 格式验证辅助函数
  // ============================================

  /**
   * 验证 URL 格式
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * 验证 JWT 格式
   */
  private isValidJWT(token: string): boolean {
    const parts = token.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
  }

  /**
   * 验证 RSA 密钥格式
   */
  private isValidRSAKey(key: string): boolean {
    // 检查是否是 Base64 编码
    const base64Regex = /^[A-Za-z0-9+/]+=*$/
    
    // 移除可能的空格和换行
    const cleanKey = key.replace(/\s/g, '')
    
    // 检查长度和格式
    return cleanKey.length > 100 && base64Regex.test(cleanKey)
  }

  /**
   * 生成修复建议
   */
  private generateFixSuggestion(configKey: string): FixSuggestion | null {
    const suggestions: Record<string, FixSuggestion> = {
      SUPABASE_URL: {
        configKey: 'SUPABASE_URL',
        issue: 'Supabase URL is not configured',
        steps: [
          'Visit https://supabase.com/ and sign in',
          'Select your project',
          'Go to Settings → API',
          'Copy the "Project URL"',
          'Add to .env file: SUPABASE_URL=https://your-project.supabase.co'
        ],
        example: 'SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co'
      },
      SUPABASE_SERVICE_KEY: {
        configKey: 'SUPABASE_SERVICE_KEY',
        issue: 'Supabase service key is not configured',
        steps: [
          'Visit https://supabase.com/ and sign in',
          'Select your project',
          'Go to Settings → API',
          'Copy the "service_role" key (not anon key)',
          'Add to .env file: SUPABASE_SERVICE_KEY=your-key'
        ],
        example: 'SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      ALIPAY_APP_ID: {
        configKey: 'ALIPAY_APP_ID',
        issue: 'Alipay APP ID is not configured',
        steps: [
          'Visit https://open.alipay.com/',
          'Sign in to your developer account',
          'Go to your application',
          'Copy the APP ID',
          'Add to .env file: ALIPAY_APP_ID=your-app-id'
        ],
        example: 'ALIPAY_APP_ID=9021000157676998'
      },
      ALIPAY_PRIVATE_KEY: {
        configKey: 'ALIPAY_PRIVATE_KEY',
        issue: 'Alipay private key is not configured',
        steps: [
          'Generate RSA key pair using Alipay tools',
          'Copy the private key content (PKCS8 format)',
          'Remove BEGIN/END markers',
          'Remove all line breaks',
          'Add to .env file: ALIPAY_PRIVATE_KEY=your-key'
        ],
        example: 'ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEF...'
      },
      DEEPSEEK_API_KEY: {
        configKey: 'DEEPSEEK_API_KEY',
        issue: 'DeepSeek API key is not configured',
        steps: [
          'Visit https://platform.deepseek.com/',
          'Sign in or create an account',
          'Go to API Keys section',
          'Create a new API key',
          'Add to .env file: DEEPSEEK_API_KEY=your-key'
        ],
        example: 'DEEPSEEK_API_KEY=sk-783505fb70064a26a2338e04f46b7df3'
      },
      GEMINI_API_KEY: {
        configKey: 'GEMINI_API_KEY',
        issue: 'Gemini API key is not configured',
        steps: [
          'Visit https://makersuite.google.com/app/apikey',
          'Sign in with Google account',
          'Create a new API key',
          'Copy the key',
          'Add to .env file: GEMINI_API_KEY=your-key'
        ],
        example: 'GEMINI_API_KEY=AIzaSyDR3EfRD5bEgpH2X6wOQydUZFmxSz4bPJY'
      }
    }

    return suggestions[configKey] || null
  }
}
