/**
 * Retry Handler
 * 
 * 处理操作重试逻辑，支持指数退避策略
 */

import { IRetryHandler, RetryOptions, RetryResult } from '../types/health'

/**
 * 默认重试选项
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  backoffMultiplier: 2 // 指数退避倍数
}

/**
 * 重试处理器实现
 */
export class RetryHandler implements IRetryHandler {
  private logger: (message: string, context?: any) => void

  constructor(logger?: (message: string, context?: any) => void) {
    this.logger = logger || console.log
  }

  /**
   * 执行带重试的操作
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<RetryResult<T>> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
    
    let lastError: Error | undefined
    let currentDelay = opts.initialDelay

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        this.logger(`Attempt ${attempt}/${opts.maxAttempts}`, {
          attempt,
          maxAttempts: opts.maxAttempts
        })

        const result = await operation()

        // 成功
        if (attempt > 1) {
          this.logger(`✅ Operation succeeded on attempt ${attempt}`, {
            attempt,
            recoveredAfterFailures: attempt - 1
          })
        }

        return {
          success: true,
          result,
          attempts: attempt,
          recoveredOnAttempt: attempt > 1 ? attempt : undefined
        }
      } catch (error) {
        lastError = error as Error
        
        this.logger(`❌ Attempt ${attempt} failed: ${lastError.message}`, {
          attempt,
          error: lastError.message,
          stack: lastError.stack
        })

        // 如果还有重试机会，等待后重试
        if (attempt < opts.maxAttempts) {
          this.logger(`⏳ Waiting ${currentDelay}ms before retry...`, {
            delay: currentDelay,
            nextAttempt: attempt + 1
          })

          await this.sleep(currentDelay)

          // 计算下一次延迟（指数退避）
          currentDelay = Math.min(
            currentDelay * opts.backoffMultiplier,
            opts.maxDelay
          )
        }
      }
    }

    // 所有重试都失败
    this.logger(`❌ All ${opts.maxAttempts} attempts failed`, {
      maxAttempts: opts.maxAttempts,
      finalError: lastError?.message
    })

    return {
      success: false,
      attempts: opts.maxAttempts,
      error: lastError
    }
  }

  /**
   * 睡眠指定毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建默认的重试处理器实例
 */
export function createRetryHandler(
  logger?: (message: string, context?: any) => void
): RetryHandler {
  return new RetryHandler(logger)
}

/**
 * 便捷函数：执行带重试的操作
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>,
  logger?: (message: string, context?: any) => void
): Promise<RetryResult<T>> {
  const handler = new RetryHandler(logger)
  return handler.executeWithRetry(operation, options)
}
