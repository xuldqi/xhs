import { Request, Response, NextFunction } from 'express'

interface RateLimitOptions {
  windowMs: number
  max: number
  keyPrefix: string
  message?: string
}

interface RateBucket {
  count: number
  resetAt: number
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim()
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(',')[0].trim()
  }
  return req.ip || req.socket.remoteAddress || 'unknown'
}

export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, RateBucket>()
  const { windowMs, max, keyPrefix, message } = options

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const key = `${keyPrefix}:${getClientIp(req)}`
    const current = buckets.get(key)

    if (!current || now >= current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      res.setHeader('X-RateLimit-Limit', String(max))
      res.setHeader('X-RateLimit-Remaining', String(max - 1))
      next()
      return
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfterSeconds))
      res.setHeader('X-RateLimit-Limit', String(max))
      res.setHeader('X-RateLimit-Remaining', '0')
      res.status(429).json({
        error: 'Too Many Requests',
        message: message || '请求过于频繁，请稍后再试'
      })
      return
    }

    current.count += 1
    buckets.set(key, current)
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(max - current.count))
    next()
  }
}
