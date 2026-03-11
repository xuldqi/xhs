// 首先加载环境变量 - 必须在其他导入之前
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 尝试多个可能的 .env 路径
const possiblePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
]

let envLoaded = false
for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath })
  if (!result.error) {
    console.log(`✅ Loaded .env from: ${envPath}`)
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found, using system environment variables')
}

import express, { Request, Response } from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai'
import { calendarRouter } from './routes/calendar'
import paymentRouter from './routes/payment'
import paymentTestRouter from './routes/payment-test'
import paymentSimpleRouter from './routes/payment-simple'
import healthRouter from './routes/health'
import subscribeRouter from './routes/subscribe'
import authRouter from './routes/auth' // 新增认证路由
import { automationRouter } from './routes/automation'
import { initDb } from './db' // 新增数据库初始化
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logger'
import { createRateLimiter } from './middleware/rateLimit'
import { ConfigurationValidator } from './services/configValidator'
import { startAutomationScheduler, stopAutomationScheduler } from './services/automationScheduler'
import { isAutomationSignatureRequired, isAutomationWebhookMisconfigured } from './services/automationWebhookSecurity'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(express.json({
  limit: process.env.MAX_REQUEST_SIZE || '10mb',
  verify: (req, _res, buf) => {
    ;(req as Request & { rawBody?: string }).rawBody = buf.toString('utf8')
  }
}))
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }))

// CORS 配置
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5178', 'http://localhost:5179', 'http://115.191.56.242']
app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Automation-Signature', 'X-Automation-Timestamp', 'X-Automation-Source'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24小时
}))

// 请求日志
app.use(requestLogger)

// 关键接口限流（基础防刷）
const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'ai',
  message: 'AI 请求过于频繁，请稍后再试'
})

const paymentRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyPrefix: 'payment',
  message: '支付请求过于频繁，请稍后再试'
})

const createOrderRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 6,
  keyPrefix: 'payment-create-order',
  message: '创建订单过于频繁，请稍后再试'
})

const authLoginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: 'auth-login',
  message: '登录尝试过于频繁，请稍后再试'
})

const authRegisterRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: 'auth-register',
  message: '注册请求过于频繁，请稍后再试'
})

app.use('/api/ai', aiRateLimiter)
app.use('/api/payment', paymentRateLimiter)
app.use('/api/payment/create-order', createOrderRateLimiter)
app.use('/api/payment-test', paymentRateLimiter)
app.use('/api/auth/login', authLoginRateLimiter)
app.use('/api/auth/register', authRegisterRateLimiter)

// API 路由
app.use('/api/health', healthRouter) // 健康检查路由
app.use('/api/auth', authRouter)     // 本地认证路由
app.use('/api/ai', aiRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/automation', automationRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/payment-test', paymentTestRouter) // 测试接口，不依赖数据库
app.use('/api/subscribe', subscribeRouter)

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  })
})

// 错误处理
app.use(errorHandler)

/**
 * 启动时配置检查
 */
async function startupCheck() {
  // 初始化本地数据库
  try {
    await initDb()
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    // 继续启动，可能会导致依赖 DB 的功能失败
  }

  console.log('\n🔍 Checking configuration...\n')

  const validator = new ConfigurationValidator()
  const result = validator.validateEnvironment()

  if (!result.valid) {
    console.error('❌ Configuration errors found:\n')
    result.errors.forEach(err => {
      console.error(`  ✗ ${err.field}: ${err.message}`)
      if (err.expectedFormat) {
        console.error(`    Expected: ${err.expectedFormat}`)
      }
    })

    const suggestions = validator.getFixSuggestions()
    if (suggestions.length > 0) {
      console.log('\n💡 Fix suggestions:\n')
      suggestions.forEach(sug => {
        console.log(`${sug.configKey}:`)
        sug.steps.forEach((step, i) => {
          console.log(`  ${i + 1}. ${step}`)
        })
        if (sug.example) {
          console.log(`  Example: ${sug.example}`)
        }
        console.log('')
      })
    }
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Configuration warnings:\n')
    result.warnings.forEach(warn => {
      console.warn(`  ⚠ ${warn.field}: ${warn.message}`)
      console.warn(`    Suggestion: ${warn.suggestion}`)
    })
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('✅ Configuration is valid\n')
  }

  // 显示配置摘要
  console.log('📋 Configuration Summary:')
  console.log(`  Supabase (Legacy): ${process.env.SUPABASE_URL ? '✓' : '✗'}`)
  console.log(`  Local Auth: ✓`)
  console.log(`  Alipay:    ${process.env.ALIPAY_APP_ID ? '✓' : '✗'}`)
  console.log(`  DeepSeek:  ${process.env.DEEPSEEK_API_KEY ? '✓' : '✗'}`)
  console.log(`  Gemini:    ${process.env.GEMINI_API_KEY ? '✓' : '✗'}`)
  console.log('')
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`)
  console.log('')

  // 执行启动配置检查
  await startupCheck()
  startAutomationScheduler()

  const signatureRequired = isAutomationSignatureRequired()
  const webhookMisconfigured = isAutomationWebhookMisconfigured()
  if (webhookMisconfigured) {
    console.error('❌ AUTOMATION_WEBHOOK_SECRET is required in production. Callback verification is now fail-closed.')
  } else if (!signatureRequired) {
    console.warn('⚠️  Automation webhook signature verification is disabled in this environment.')
  } else {
    console.log('🔐 Automation webhook signature verification: enabled')
  }

  console.log(`✨ Server ready! Health check available at http://localhost:${PORT}/api/health`)
  console.log(`🔐 Auth check available at http://localhost:${PORT}/api/auth/me`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  stopAutomationScheduler()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  stopAutomationScheduler()
  process.exit(0)
})
