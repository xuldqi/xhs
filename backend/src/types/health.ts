/**
 * Health Check System Type Definitions
 * 
 * 定义健康检查系统的所有类型和接口
 */

// ============================================
// 基础类型
// ============================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'
export type ServiceStatus = 'ok' | 'warning' | 'error'
export type RecommendationSeverity = 'critical' | 'warning' | 'info'

// ============================================
// 健康检查响应类型
// ============================================

/**
 * 基础健康检查响应
 */
export interface BasicHealthResponse {
  status: HealthStatus
  timestamp: string
  uptime: number
  services: {
    supabase: ServiceStatusInfo
    alipay: ServiceStatusInfo
    deepseek: ServiceStatusInfo
    gemini: ServiceStatusInfo
  }
}

/**
 * 服务状态信息
 */
export interface ServiceStatusInfo {
  status: ServiceStatus
  message?: string
}

/**
 * 详细健康检查响应
 */
export interface DetailedHealthResponse extends BasicHealthResponse {
  diagnostics: {
    supabase: SupabaseDiagnostics
    alipay: AlipayDiagnostics
    deepseek: DeepSeekDiagnostics
    gemini: GeminiDiagnostics
  }
  configuration: ConfigurationStatus
  recommendations: Recommendation[]
}

// ============================================
// 服务诊断信息类型
// ============================================

/**
 * Supabase 诊断信息
 */
export interface SupabaseDiagnostics {
  connected: boolean
  projectId?: string
  region?: string
  latency?: number
  error?: ErrorDetails
  configStatus: {
    urlConfigured: boolean
    keyConfigured: boolean
    urlValid: boolean
    keyValid: boolean
  }
}

/**
 * 支付宝诊断信息
 */
export interface AlipayDiagnostics {
  initialized: boolean
  appIdConfigured: boolean
  privateKeyConfigured: boolean
  publicKeyConfigured: boolean
  gatewayReachable: boolean
  error?: ErrorDetails
  keyFormat: {
    privateKeyValid: boolean
    publicKeyValid: boolean
  }
}

/**
 * DeepSeek AI 服务诊断信息
 */
export interface DeepSeekDiagnostics {
  available: boolean
  apiKeyConfigured: boolean
  baseUrlConfigured: boolean
  authenticated: boolean
  error?: ErrorDetails
}

/**
 * Gemini AI 服务诊断信息
 */
export interface GeminiDiagnostics {
  available: boolean
  apiKeyConfigured: boolean
  proxyConfigured: boolean
  authenticated: boolean
  error?: ErrorDetails
}

// ============================================
// 配置相关类型
// ============================================

/**
 * 配置状态
 */
export interface ConfigurationStatus {
  allRequired: boolean
  missing: string[]
  invalid: string[]
  warnings: string[]
}

/**
 * 错误详情
 */
export interface ErrorDetails {
  code: string
  message: string
  stack?: string
  context?: Record<string, any>
}

/**
 * 修复建议
 */
export interface Recommendation {
  severity: RecommendationSeverity
  service: string
  issue: string
  solution: string
  documentation?: string
}

// ============================================
// 验证相关类型
// ============================================

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string
  message: string
  expectedFormat?: string
  actualValue?: string
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  field: string
  message: string
  suggestion: string
}

/**
 * 修复建议
 */
export interface FixSuggestion {
  configKey: string
  issue: string
  steps: string[]
  example?: string
}

// ============================================
// 服务检查相关类型
// ============================================

/**
 * 服务健康检查结果
 */
export interface ServiceHealthResult {
  status: ServiceStatus
  message?: string
  latency?: number
  error?: ErrorDetails
  metadata?: Record<string, any>
}

/**
 * 服务诊断信息（通用）
 */
export interface ServiceDiagnostics {
  serviceName: string
  healthy: boolean
  details: Record<string, any>
  error?: ErrorDetails
  recommendations: Recommendation[]
}

// ============================================
// 重试相关类型
// ============================================

/**
 * 重试选项
 */
export interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
}

/**
 * 重试结果
 */
export interface RetryResult<T> {
  success: boolean
  result?: T
  attempts: number
  error?: Error
  recoveredOnAttempt?: number
}

// ============================================
// 健康检查错误类
// ============================================

/**
 * 健康检查错误类
 */
export class HealthCheckError extends Error {
  constructor(
    message: string,
    public code: string,
    public service: string,
    public recoverable: boolean,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'HealthCheckError'
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, HealthCheckError.prototype)
  }
}

// ============================================
// 接口定义
// ============================================

/**
 * 健康检查控制器接口
 */
export interface IHealthCheckController {
  /**
   * 基础健康检查 - 快速返回系统整体状态
   */
  getBasicHealth(): Promise<BasicHealthResponse>
  
  /**
   * 详细健康检查 - 返回所有服务的详细状态
   */
  getDetailedHealth(): Promise<DetailedHealthResponse>
}

/**
 * 服务健康检查器接口
 */
export interface IServiceHealthChecker {
  /**
   * 服务名称
   */
  readonly serviceName: string
  
  /**
   * 检查服务健康状态
   * @param timeout 超时时间（毫秒）
   */
  check(timeout?: number): Promise<ServiceHealthResult>
  
  /**
   * 获取详细诊断信息
   */
  diagnose(): Promise<ServiceDiagnostics>
}

/**
 * 配置验证器接口
 */
export interface IConfigurationValidator {
  /**
   * 验证所有必需的环境变量
   */
  validateEnvironment(): ValidationResult
  
  /**
   * 验证特定服务的配置
   */
  validateServiceConfig(serviceName: string): ValidationResult
  
  /**
   * 获取缺失的配置项
   */
  getMissingConfigs(): string[]
  
  /**
   * 获取配置修复建议
   */
  getFixSuggestions(): FixSuggestion[]
}

/**
 * 重试处理器接口
 */
export interface IRetryHandler {
  /**
   * 执行带重试的操作
   * @param operation 要执行的操作
   * @param options 重试选项
   */
  executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<RetryResult<T>>
}
