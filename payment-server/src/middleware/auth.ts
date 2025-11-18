import { Request, Response, NextFunction } from 'express'

// 内部 API 鉴权中间件
export const verifyInternalKey = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-internal-key']
  const internalKey = process.env.INTERNAL_API_KEY

  if (!internalKey) {
    console.error('❌ INTERNAL_API_KEY 未配置')
    return res.status(500).json({ code: -1, message: 'Server configuration error' })
  }

  if (key !== internalKey) {
    console.warn('⚠️ 内部 API 鉴权失败:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    })
    return res.status(403).json({ code: -1, message: 'Forbidden' })
  }

  next()
}

// 来源验证中间件（可选，额外安全层）
export const verifyOrigin = (req: Request, res: Response, next: NextFunction) => {
  const allowedBackends = process.env.ALLOWED_BACKENDS?.split(',') || []
  const origin = req.headers.origin || req.headers.referer

  if (allowedBackends.length > 0 && origin && !allowedBackends.some(backend => origin.includes(backend))) {
    console.warn('⚠️ 非法来源:', origin)
    return res.status(403).json({ code: -1, message: 'Origin not allowed' })
  }

  next()
}
