/**
 * Health Check Routes
 * 
 * 提供健康检查 API 端点
 */

import { Router, Request, Response } from 'express'
import { createHealthCheckController } from '../controllers/healthController'

const router = Router()
const healthController = createHealthCheckController()

/**
 * GET /api/health
 * 基础健康检查 - 快速返回系统整体状态
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await healthController.getBasicHealth()
    
    // 根据健康状态设置 HTTP 状态码
    const statusCode = health.status === 'healthy' ? 200 : 503
    
    res.status(statusCode).json(health)
  } catch (error: any) {
    console.error('Health check failed:', error)
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: error.message
      }
    })
  }
})

/**
 * GET /api/health/detailed
 * 详细健康检查 - 返回所有服务的详细诊断信息
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const health = await healthController.getDetailedHealth()
    
    // 根据健康状态设置 HTTP 状态码
    const statusCode = health.status === 'healthy' ? 200 : 503
    
    res.status(statusCode).json(health)
  } catch (error: any) {
    console.error('Detailed health check failed:', error)
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    })
  }
})

/**
 * POST /api/health/clear-cache
 * 清除健康检查缓存（用于测试或强制刷新）
 */
router.post('/clear-cache', (req: Request, res: Response) => {
  try {
    healthController.clearCache()
    
    res.json({
      success: true,
      message: 'Health check cache cleared'
    })
  } catch (error: any) {
    console.error('Failed to clear cache:', error)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CACHE_CLEAR_FAILED',
        message: error.message
      }
    })
  }
})

export default router
