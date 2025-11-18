import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import internalRouter from './routes/internal'
import alipayRouter from './routes/alipay'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'payment-server',
    domain: 'bambumoon.cn',
    timestamp: new Date().toISOString() 
  })
})

// 路由
app.use('/internal', internalRouter) // 内部 API（给项目后端调用）
app.use('/alipay', alipayRouter)     // 支付宝回调

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🚀 支付代理服务器启动成功`)
  console.log(`📍 端口: ${PORT}`)
  console.log(`🌐 域名: bambumoon.cn`)
  console.log(`🔒 环境: ${process.env.NODE_ENV}`)
})
