import { ElMessage, ElNotification } from 'element-plus'
import type { AppError, ErrorType } from '@/types'
import { ERROR_MESSAGES } from '@/types'

export class ErrorHandler {
  private static instance: ErrorHandler
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }
  
  handle(error: AppError): void {
    // 记录错误
    this.logError(error)
    
    // 显示用户友好的错误消息
    this.showUserMessage(error)
    
    // 尝试恢复
    if (this.canRecover(error)) {
      this.attemptRecovery(error)
    }
  }
  
  private logError(error: AppError): void {
    console.error('[Error]', {
      type: error.type,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp
    })
  }
  
  private showUserMessage(error: AppError): void {
    const message = this.getUserFriendlyMessage(error)
    
    if (error.type === 'NETWORK_ERROR' || error.type === 'AI_SERVICE_ERROR') {
      ElNotification({
        title: '错误',
        message,
        type: 'error',
        duration: 5000
      })
    } else {
      ElMessage.error(message)
    }
  }
  
  private getUserFriendlyMessage(error: AppError): string {
    return error.message || ERROR_MESSAGES[error.type] || '发生未知错误'
  }
  
  private canRecover(error: AppError): boolean {
    return error.type === 'AI_SERVICE_ERROR' || error.type === 'NETWORK_ERROR'
  }
  
  private attemptRecovery(error: AppError): void {
    // 可以在这里实现重试逻辑
    console.log('尝试恢复:', error.type)
  }
}

export const errorHandler = ErrorHandler.getInstance()
