import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { PaymentService } from '../services/paymentService'

const router = express.Router()

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '' // 使用 service key 进行后端操作
)

const paymentService = new PaymentService()

// 创建订单并获取支付链接
router.post('/create-order', async (req, res) => {
  try {
    const { userId, planType } = req.body

    if (!userId || !planType) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 获取套餐配置
    const { data: planConfig, error: planError } = await supabase
      .from('plan_configs')
      .select('*')
      .eq('plan_type', planType)
      .single()

    if (planError || !planConfig) {
      return res.status(400).json({ error: '套餐不存在' })
    }

    // 生成订单号
    const orderNo = PaymentService.generateOrderNo()

    // 创建订单记录
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_no: orderNo,
        plan_type: planType,
        amount: planConfig.price,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('创建订单记录失败:', orderError)
      return res.status(500).json({ error: '创建订单失败' })
    }

    // 调用支付宝创建支付订单
    const currentDomain = process.env.FRONTEND_URL || 'http://localhost:5173'
    const backendDomain = process.env.BACKEND_URL || 'http://localhost:3000'

    const paymentResult = await paymentService.createAlipayOrder({
      orderId: orderNo,
      amount: planConfig.price,
      subject: planConfig.name,
      userId,
      returnUrl: `${currentDomain}/payment/return?order_no=${orderNo}`,
      notifyUrl: `${backendDomain}/api/payment/notify`,
    })

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: orderNo,
        payUrl: paymentResult.payUrl,
        amount: planConfig.price,
      },
    })
  } catch (error: any) {
    console.error('创建订单失败:', error)
    res.status(500).json({ error: error.message || '创建订单失败' })
  }
})

// 查询订单状态
router.get('/query-order', async (req, res) => {
  try {
    const { orderNo } = req.query

    if (!orderNo) {
      return res.status(400).json({ error: '缺少订单号' })
    }

    // 从数据库查询订单
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo as string)
      .single()

    if (error || !order) {
      return res.status(404).json({ error: '订单不存在' })
    }

    // 如果订单还是 pending，查询支付宝状态
    if (order.status === 'pending') {
      try {
        const paymentStatus = await paymentService.queryOrderStatus(orderNo as string)
        
        // 如果支付成功，更新订单状态
        if (paymentStatus.status === 'paid') {
          await handlePaymentSuccess(orderNo as string, paymentStatus.tradeNo || '')
        }
      } catch (error) {
        console.error('查询支付宝订单状态失败:', error)
      }
    }

    // 重新查询订单（可能已更新）
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo as string)
      .single()

    res.json({
      success: true,
      data: updatedOrder || order,
    })
  } catch (error: any) {
    console.error('查询订单失败:', error)
    res.status(500).json({ error: '查询订单失败' })
  }
})

// 支付宝异步回调
router.post('/notify', async (req, res) => {
  try {
    console.log('收到支付宝回调:', req.body)

    // 验证签名
    const isValid = await paymentService.verifyNotify(req.body)
    if (!isValid) {
      console.error('支付宝回调签名验证失败')
      return res.send('fail')
    }

    const { out_trade_no, trade_no, trade_status } = req.body

    // 处理支付成功
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      await handlePaymentSuccess(out_trade_no, trade_no)
    }

    res.send('success')
  } catch (error) {
    console.error('处理支付回调失败:', error)
    res.send('fail')
  }
})

// 处理支付成功逻辑
async function handlePaymentSuccess(orderNo: string, tradeNo: string) {
  try {
    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single()

    if (orderError || !order) {
      throw new Error('订单不存在')
    }

    // 如果订单已经处理过，直接返回
    if (order.status === 'paid') {
      return
    }

    // 更新订单状态
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        alipay_trade_no: tradeNo,
        paid_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo)

    // 获取套餐配置
    const { data: planConfig } = await supabase
      .from('plan_configs')
      .select('*')
      .eq('plan_type', order.plan_type)
      .single()

    if (!planConfig) {
      throw new Error('套餐配置不存在')
    }

    // 计算过期时间
    let expiresAt = null
    if (planConfig.duration_days) {
      const now = new Date()
      now.setDate(now.getDate() + planConfig.duration_days)
      expiresAt = now.toISOString()
    }

    // 更新用户订阅
    // 先将旧订阅设为过期
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', order.user_id)
      .eq('status', 'active')

    // 创建新订阅
    await supabase.from('subscriptions').insert({
      user_id: order.user_id,
      plan_type: order.plan_type,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
      auto_renew: false,
    })

    console.log(`订单 ${orderNo} 支付成功，已开通 ${order.plan_type} 会员`)
  } catch (error) {
    console.error('处理支付成功逻辑失败:', error)
    throw error
  }
}

export default router
