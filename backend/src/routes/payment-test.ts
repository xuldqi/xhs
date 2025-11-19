import express from 'express'
import { AlipayService } from '../services/alipayService'

const router = express.Router()

// 测试接口：创建支付宝支付订单（不依赖数据库）
router.post('/test-create-order', async (req, res) => {
  try {
    const { amount = '0.01', subject = '测试订单' } = req.body

    // 初始化支付宝服务
    const alipayService = new AlipayService()
    
    // 生成订单号
    const orderNo = AlipayService.generateOrderNo()
    
    // 获取前端地址
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
    const returnUrl = `${frontendUrl}/payment/return?order_no=${orderNo}`

    // 检测设备类型
    const userAgent = req.headers['user-agent'] || ''
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)

    // 创建支付订单
    const paymentForm = isMobile
      ? await alipayService.createWapPayment({
          outTradeNo: orderNo,
          totalAmount: amount.toString(),
          subject,
          body: `测试订单 - ${orderNo}`,
          returnUrl,
        })
      : await alipayService.createPagePayment({
          outTradeNo: orderNo,
          totalAmount: amount.toString(),
          subject,
          body: `测试订单 - ${orderNo}`,
          returnUrl,
        })

    res.json({
      success: true,
      data: {
        orderNo,
        paymentForm,
        amount: amount.toString(),
        isMobile,
        message: '支付订单创建成功，请提交表单跳转到支付宝'
      }
    })
  } catch (error: any) {
    console.error('测试创建订单失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '创建订单失败',
      details: error.toString()
    })
  }
})

// 测试接口：查询订单状态
router.get('/test-query-order', async (req, res) => {
  try {
    const { orderNo } = req.query

    if (!orderNo) {
      return res.status(400).json({ error: '缺少订单号' })
    }

    const alipayService = new AlipayService()
    const orderStatus = await alipayService.queryOrder(orderNo as string)

    res.json({
      success: true,
      data: {
        orderNo,
        tradeStatus: orderStatus.tradeStatus,
        tradeNo: orderStatus.tradeNo,
        totalAmount: orderStatus.totalAmount,
        buyerPayAmount: orderStatus.buyerPayAmount,
        mappedStatus: alipayService.mapAlipayStatus(orderStatus.tradeStatus)
      }
    })
  } catch (error: any) {
    console.error('查询订单失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '查询订单失败',
      details: error.toString()
    })
  }
})

// 测试接口：检查支付宝配置
router.get('/test-config', async (req, res) => {
  try {
    const config = {
      hasAppId: !!process.env.ALIPAY_APP_ID,
      hasPrivateKey: !!process.env.ALIPAY_PRIVATE_KEY,
      hasPublicKey: !!process.env.ALIPAY_PUBLIC_KEY,
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do',
      backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5174',
      isSandbox: (process.env.ALIPAY_GATEWAY || '').includes('alipaydev'),
    }

    // 尝试初始化服务
    let serviceStatus = '未初始化'
    try {
      const alipayService = new AlipayService()
      serviceStatus = '初始化成功'
    } catch (error: any) {
      serviceStatus = `初始化失败: ${error.message}`
    }

    res.json({
      success: true,
      data: {
        ...config,
        serviceStatus
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

