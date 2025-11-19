/**
 * 全局错误处理器
 * 统一处理应用中的各种错误
 */

import { ElMessage, ElNotification } from 'element-plus'

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  FILE = 'FILE',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  details?: any
  code?: string
  timestamp: Date
}

class ErrorHandler {
  private errorLog: AppError[] = []
  private maxLogSize = 50

  /**
   * 处理错误
   */
  handle(error: any, context?: string): AppError {
    const appError = this.parseError(error, context)
    
    // 记录错误
    this.log(appError)
    
    // 显示用户友好的错误提示
    this.showUserMessage(appError)
    
    // 在开发环境打印详细错误
    if (import.meta.env.DEV) {
      console.error('❌ Error:', appError, error)
    }
    
    return appError
  }

  /**
   * 解析错误对象
   */
  private parseError(error: any, context?: string): AppError {
    const timestamp = new Date()
    
    // 网络错误
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message: '网络连接失败，请检查网络设置',
        details: error,
        timestamp
      }
    }
    
    // API 错误
    if (error.response) {
      const status = error.response.status
      let message = '服务器错误，请稍后重试'
      
      if (status === 401) {
        message = '登录已过期，请重新登录'
      } else if (status === 403) {
        message = '没有权限执行此操作'
      } else if (status === 404) {
        message = '请求的资源不存在'
      } else if (status === 429) {
        message = '请求过于频繁，请稍后再试'
      } else if (status >= 500) {
        message = '服务器错误，请稍后重试'
      }
      
      return {
        type: ErrorType.API,
        message,
        code: status.toString(),
        details: error.response.data,
        timestamp
      }
    }
    
    // 验证错误
    if (error.name === 'ValidationError' || context?.includes('validation')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || '数据验证失败',
        details: error,
        timestamp
      }
    }
    
    // 认证错误
    if (error.name === 'AuthError' || context?.includes('auth')) {
      return {
        type: ErrorType.AUTH,
        message: error.message || '认证失败，请重新登录',
        details: error,
        timestamp
      }
    }
    
    // 文件错误
    if (context?.includes('file') || context?.includes('upload')) {
      return {
        type: ErrorType.FILE,
        message: error.message || '文件处理失败',
        details: error,
        timestamp
      }
    }
    
    // 未知错误
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || '操作失败，请重试',
      details: error,
      timestamp
    }
  }

  /**
   * 显示用户提示
   */
  private showUserMessage(error: AppError) {
    const duration = 5000
    
    switch (error.type) {
      case ErrorType.NETWORK:
        ElNotification({
          title: '网络错误',
          message: error.message,
          type: 'error',
          duration
        })
        break
        
      case ErrorType.API:
        if (error.code === '401') {
          ElNotification({
            title: '登录过期',
            message: error.message,
            type: 'warning',
            duration
          })
        } else {
          ElMessage.error({
            message: error.message,
            duration
          })
        }
        break
        
      case ErrorType.VALIDATION:
        ElMessage.warning({
          message: error.message,
          duration: 3000
        })
        break
        
      case ErrorType.AUTH:
        ElNotification({
          title: '认证失败',
          message: error.message,
          type: 'warning',
          duration
        })
        break
        
      case ErrorType.FILE:
        ElMessage.error({
          message: error.message,
          duration: 4000
        })
        break
        
      default:
        ElMessage.error({
          message: error.message,
          duration
        })
    }
  }

  /**
   * 记录错误
   */
  private log(error: AppError) {
    this.errorLog.unshift(error)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }
    
    // 在生产环境可以发送到监控服务
    if (import.meta.env.PROD) {
      this.sendToMonitoring(error)
    }
  }

  /**
   * 发送到监控服务（可选）
   */
  private sendToMonitoring(error: AppError) {
    // TODO: 集成 Sentry 或其他监控服务
    // 示例：
    // Sentry.captureException(error)
  }

  /**
   * 获取错误日志
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  /**
   * 清空错误日志
   */
  clearLog() {
    this.errorLog = []
  }

  /**
   * 创建自定义错误
   */
  createError(type: ErrorType, message: string, details?: any): AppError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    }
  }
}

// 导出单例
export const errorHandler = new ErrorHandler()

/**
 * 异步函数错误包装器
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.handle(error, context)
      throw error
    }
  }) as T
}

/**
 * 重试包装器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    context?: string
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, context } = options
  
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i < maxRetries - 1) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        console.log(`🔄 重试 ${i + 1}/${maxRetries}...`)
      }
    }
  }
  
  // 所有重试都失败
  errorHandler.handle(lastError, context)
  throw lastError
}
