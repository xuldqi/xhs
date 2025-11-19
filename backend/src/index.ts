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
import paymentRouter from './routes/payment'
import paymentTestRouter from './routes/payment-test'
import paymentSimpleRouter from './routes/payment-simple'
import healthRouter from './routes/health'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logger'
import { ConfigurationValidator } from './services/configValidator'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }))
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }))

// CORS 配置
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24小时
}))

// 请求日志
app.use(requestLogger)

// API 路由
app.use('/api/health', healthRouter) // 健康检查路由
app.use('/api/ai', aiRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/payment-test', paymentTestRouter) // 测试接口，不依赖数据库

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
  console.log(`  Supabase:  ${process.env.SUPABASE_URL ? '✓' : '✗'}`)
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
  
  console.log(`✨ Server ready! Health check available at http://localhost:${PORT}/api/health`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  process.exit(0)
})
