import { ERROR_MESSAGES } from '@/types/constants'

/**
 * API调用结果类型
 */
export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * API调用函数类型
 */
export type ApiCall<T> = () => Promise<ApiResult<T>>

/**
 * 检查是否是服务过载错误
 */
function isOverloadedError(error: string): boolean {
  return error.includes('503') || 
         error.includes('overloaded') || 
         error.includes('UNAVAILABLE') ||
         error.includes('The model is overloaded')
}

/**
 * API重试处理器
 * 专门用于处理原生API和代理API之间的重试逻辑
 */
export class ApiRetryHandler {
  /**
   * 执行API调用，支持原生API失败后自动切换到代理API
   * @param nativeApiCall 原生API调用函数
   * @param proxyApiCall 代理API调用函数
   * @returns API调用结果
   */
  static async executeWithFallback<T>(
    nativeApiCall: ApiCall<T>,
    proxyApiCall: ApiCall<T>
  ): Promise<ApiResult<T>> {
    // 首先尝试原生API
    console.log('🔍 尝试使用原生API...')
    const nativeResult = await nativeApiCall()
    
    // 如果原生API调用成功，直接返回结果
    if (nativeResult.success) {
      console.log('✅ 原生API调用成功')
      return nativeResult
    }
    
    // 检查原生API错误类型
    const errorMessage = nativeResult.error || ''
    if (isOverloadedError(errorMessage)) {
      console.log('⚠️ 原生API服务过载，立即尝试代理API...')
    } else {
      console.warn('⚠️ 原生API调用失败:', errorMessage)
    }
    
    // 尝试代理API
    console.log('🔄 尝试使用代理API...')
    const proxyResult = await proxyApiCall()
    
    // 如果代理API调用成功，返回结果
    if (proxyResult.success) {
      console.log('✅ 代理API调用成功')
      return proxyResult
    }
    
    // 两个API都失败，返回错误信息
    console.error('❌ 代理API调用也失败:', proxyResult.error)
    return {
      success: false,
      error: ERROR_MESSAGES.AI_SERVICE_ERROR
    }
  }
}