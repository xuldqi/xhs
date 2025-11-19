import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { AlipayService } from '../services/alipayService'

const router = express.Router()

// 初始化 Supabase 客户端（延迟初始化，避免配置缺失时启动失败）
let supabase: ReturnType<typeof createClient> | null = null

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_KEY || ''
  }
}

function getSupabase() {
  if (!supabase) {
    const { url, key } = getSupabaseConfig()
    if (!url || !key) {
      throw new Error('Supabase 配置缺失：请设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY')
    }
    supabase = createClient(url, key)
  }
  return supabase
}

// 延迟初始化 AlipayService，避免启动时出错
let alipayService: AlipayService | null = null

function getAlipayService(): AlipayService {
  if (!alipayService) {
    try {
      alipayService = new AlipayService()
    } catch (error: any) {
      console.error('❌ AlipayService 初始化失败:', error.message)
      throw new Error('支付宝服务初始化失败: ' + error.message)
    }
  }
  return alipayService
}

// 创建订单并获取支付链接
router.post('/create-order', async (req, res) => {
  try {
    const { userId, planType } = req.body

    if (!userId || !planType) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    // 获取套餐配置
    const { data: planConfig, error: planError } = await getSupabase()
      .from('plan_configs')
      .select('*')
      .eq('plan_type', planType)
      .single()

    if (planError || !planConfig) {
      return res.status(400).json({ error: '套餐不存在' })
    }

    // 生成订单号
    const orderNo = AlipayService.generateOrderNo()

    // 创建订单记录
    const { data: order, error: orderError } = await getSupabase()
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

    // 检测设备类型（简单判断，可以根据 User-Agent 优化）
    const userAgent = req.headers['user-agent'] || ''
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)

    // 根据设备类型选择支付方式
    const alipay = getAlipayService()
    const paymentForm = isMobile
      ? await alipay.createWapPayment({
          outTradeNo: orderNo,
          totalAmount: planConfig.price.toString(),
          subject: planConfig.name,
          body: `用户${userId}购买${planConfig.name}`,
          returnUrl: `${currentDomain}/payment/return?order_no=${orderNo}`,
        })
      : await alipay.createPagePayment({
          outTradeNo: orderNo,
          totalAmount: planConfig.price.toString(),
          subject: planConfig.name,
          body: `用户${userId}购买${planConfig.name}`,
          returnUrl: `${currentDomain}/payment/return?order_no=${orderNo}`,
        })

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: orderNo,
        paymentForm: paymentForm,
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
    const { data: order, error } = await getSupabase()
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
        const alipay = getAlipayService()
        const paymentStatus = await alipay.queryOrder(orderNo as string)
        
        // 如果支付成功，更新订单状态
        const mappedStatus = alipay.mapAlipayStatus(paymentStatus.tradeStatus)
        if (mappedStatus === 'paid') {
          await handlePaymentSuccess(orderNo as string, paymentStatus.tradeNo || '')
        }
      } catch (error) {
        console.error('查询支付宝订单状态失败:', error)
      }
    }

    // 重新查询订单（可能已更新）
    const { data: updatedOrder } = await getSupabase()
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
    const alipay = getAlipayService()
    const isValid = await alipay.verifyNotify(req.body)
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
    const { data: order, error: orderError } = await getSupabase()
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
    await getSupabase()
      .from('orders')
      .update({
        status: 'paid',
        alipay_trade_no: tradeNo,
        paid_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo)

    // 获取套餐配置
    const { data: planConfig } = await getSupabase()
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
    await getSupabase()
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', order.user_id)
      .eq('status', 'active')

    // 创建新订阅
    await getSupabase().from('subscriptions').insert({
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

// 关闭订单
router.post('/close-order', async (req, res) => {
  try {
    const { orderNo } = req.body

    if (!orderNo) {
      return res.status(400).json({ error: '缺少订单号' })
    }

    // 查询订单
    const { data: order, error: orderError } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single()

    if (orderError || !order) {
      return res.status(404).json({ error: '订单不存在' })
    }

    // 检查订单状态是否允许关闭
    if (order.status !== 'pending') {
      return res.status(400).json({ error: '订单状态不允许关闭' })
    }

    // 调用支付宝关闭订单
    const alipay = getAlipayService()
    const closed = await alipay.closeOrder(orderNo)

    if (closed) {
      // 更新本地订单状态
      await getSupabase()
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('order_no', orderNo)

      res.json({
        success: true,
        message: '订单已关闭',
      })
    } else {
      res.status(500).json({ error: '关闭订单失败' })
    }
  } catch (error: any) {
    console.error('关闭订单失败:', error)
    res.status(500).json({ error: error.message || '关闭订单失败' })
  }
})

// 配置检查接口
router.get('/check-config', async (req, res) => {
  try {
    // 检查 Supabase 配置
    const { url: supabaseUrl, key: supabaseServiceKey } = getSupabaseConfig()
    const supabaseConfig = {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl ? supabaseUrl.replace(/https?:\/\/([^.]+).*/, '$1') : '未配置',
    }

    // 测试 Supabase 连接
    let supabaseConnected = false
    let supabaseError = null
    try {
      if (!supabaseUrl || !supabaseServiceKey) {
        supabaseError = 'Supabase 配置缺失'
      } else {
        const { data, error } = await getSupabase().from('plan_configs').select('count').limit(1)
        supabaseConnected = !error
        supabaseError = error?.message || null
      }
    } catch (error: any) {
      supabaseError = error.message
    }

    // 检查支付宝配置
    const alipayConfig = {
      hasAppId: !!process.env.ALIPAY_APP_ID,
      hasPrivateKey: !!process.env.ALIPAY_PRIVATE_KEY,
      hasPublicKey: !!process.env.ALIPAY_PUBLIC_KEY,
      gateway: process.env.ALIPAY_GATEWAY || '未配置',
      isSandbox: (process.env.ALIPAY_GATEWAY || '').includes('alipaydev'),
    }

    // 测试支付宝服务初始化
    let alipayInitialized = false
    let alipayError = null
    try {
      const testService = new AlipayService()
      alipayInitialized = true
    } catch (error: any) {
      alipayError = error.message
    }

    res.json({
      success: true,
      data: {
        supabase: {
          ...supabaseConfig,
          connected: supabaseConnected,
          error: supabaseError,
        },
        alipay: {
          ...alipayConfig,
          initialized: alipayInitialized,
          error: alipayError,
        },
        allReady: supabaseConnected && alipayInitialized,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router
