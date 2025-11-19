import express from 'express'
import { AlipayService } from '../services/alipayService'

const router = express.Router()

// 简化版创建订单（不需要数据库）
router.post('/create-order-simple', async (req, res) => {
  try {
    const { amount = 0.01, subject = '小红书攻略生成器 - 测试订单' } = req.body

    // 生成订单号
    const orderNo = AlipayService.generateOrderNo()

    // 调用支付宝创建支付订单
    const currentDomain = process.env.FRONTEND_URL || 'http://localhost:5174'

    // 检测设备类型
    const userAgent = req.headers['user-agent'] || ''
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)

    // 初始化支付宝服务
    const alipay = new AlipayService()

    // 根据设备类型选择支付方式
    const paymentUrl = isMobile
      ? await alipay.createWapPayment({
          outTradeNo: orderNo,
          totalAmount: amount.toString(),
          subject: subject,
          body: subject,
          returnUrl: `${currentDomain}/payment/return?order_no=${orderNo}`,
        })
      : await alipay.createPagePayment({
          outTradeNo: orderNo,
          totalAmount: amount.toString(),
          subject: subject,
          body: subject,
          returnUrl: `${currentDomain}/payment/return?order_no=${orderNo}`,
        })

    console.log('✅ 创建支付订单成功:', orderNo)

    res.json({
      success: true,
      orderNo: orderNo,
      paymentUrl: paymentUrl,
      amount: amount,
    })
  } catch (error: any) {
    console.error('❌ 创建订单失败:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || '创建订单失败' 
    })
  }
})

// 简化版查询订单（直接查询支付宝）
router.get('/query-order-simple', async (req, res) => {
  try {
    const { orderNo } = req.query

    if (!orderNo) {
      return res.status(400).json({ 
        success: false,
        error: '缺少订单号' 
      })
    }

    const alipay = new AlipayService()
    const paymentStatus = await alipay.queryOrder(orderNo as string)
    
    const mappedStatus = alipay.mapAlipayStatus(paymentStatus.tradeStatus)

    res.json({
      success: true,
      order: {
        order_no: orderNo,
        status: mappedStatus,
        trade_status: paymentStatus.tradeStatus,
        trade_no: paymentStatus.tradeNo,
        amount: paymentStatus.totalAmount,
      },
    })
  } catch (error: any) {
    console.error('❌ 查询订单失败:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || '查询订单失败' 
    })
  }
})

// 支付宝异步回调（简化版）
router.post('/notify-simple', async (req, res) => {
  try {
    console.log('📨 收到支付宝回调:', req.body)

    // 验证签名
    const alipay = new AlipayService()
    const isValid = await alipay.verifyNotify(req.body)
    
    if (!isValid) {
      console.error('❌ 支付宝回调签名验证失败')
      return res.send('fail')
    }

    const { out_trade_no, trade_no, trade_status, total_amount } = req.body

    console.log('✅ 签名验证通过')
    console.log(`   订单号: ${out_trade_no}`)
    console.log(`   支付宝交易号: ${trade_no}`)
    console.log(`   交易状态: ${trade_status}`)
    console.log(`   金额: ${total_amount}`)

    // 处理支付成功
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      console.log('🎉 支付成功！')
    }

    res.send('success')
  } catch (error) {
    console.error('❌ 处理支付回调失败:', error)
    res.send('fail')
  }
})

export default router
