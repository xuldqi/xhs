// @ts-nocheck
import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { AlipayService } from '../services/alipayService'

const router = express.Router()
const SUCCESS_TRADE_STATUSES = new Set(['TRADE_SUCCESS', 'TRADE_FINISHED'])
const CALLBACK_AMOUNT_TOLERANCE = 0.01
const processingOrders = new Set<string>()

function parseAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

function isAmountMatch(orderAmount: unknown, callbackAmount: unknown): boolean {
  const expected = parseAmount(orderAmount)
  const actual = parseAmount(callbackAmount)
  if (expected === null || actual === null) {
    return false
  }
  return Math.abs(expected - actual) <= CALLBACK_AMOUNT_TOLERANCE
}

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
          await handlePaymentSuccess(orderNo as string, paymentStatus.tradeNo || '', paymentStatus.totalAmount)
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
    const { out_trade_no, trade_no, trade_status, total_amount, app_id } = req.body || {}

    if (
      typeof out_trade_no !== 'string' ||
      typeof trade_no !== 'string' ||
      typeof trade_status !== 'string' ||
      !out_trade_no.trim() ||
      !trade_no.trim() ||
      !trade_status.trim()
    ) {
      console.error('支付宝回调缺少关键字段')
      return res.send('fail')
    }

    const orderNo = out_trade_no.trim()
    const tradeNo = trade_no.trim()
    const tradeStatus = trade_status.trim()
    const expectedAppId = process.env.ALIPAY_APP_ID?.trim()

    // 仅记录必要字段，避免输出完整回调内容
    console.log('收到支付宝回调:', { out_trade_no: orderNo, trade_status: tradeStatus })

    // 验证签名
    const alipay = getAlipayService()
    const isValid = await alipay.verifyNotify(req.body)
    if (!isValid) {
      console.error('支付宝回调签名验证失败')
      return res.send('fail')
    }

    if (expectedAppId && typeof app_id === 'string' && app_id.trim() && app_id.trim() !== expectedAppId) {
      console.error(`支付宝回调 app_id 不匹配: ${app_id}`)
      return res.send('fail')
    }

    // 处理支付成功
    if (SUCCESS_TRADE_STATUSES.has(tradeStatus)) {
      if (typeof total_amount !== 'string' && typeof total_amount !== 'number') {
        console.error(`支付宝回调缺少 total_amount: ${orderNo}`)
        return res.send('fail')
      }
      await handlePaymentSuccess(orderNo, tradeNo, total_amount)
    }

    res.send('success')
  } catch (error) {
    console.error('处理支付回调失败:', error)
    res.send('fail')
  }
})

// 处理支付成功逻辑
async function handlePaymentSuccess(orderNo: string, tradeNo: string, callbackAmount?: unknown) {
  if (processingOrders.has(orderNo)) {
    console.log(`订单 ${orderNo} 正在处理，忽略重复并发回调`)
    return
  }

  processingOrders.add(orderNo)

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
      console.log(`订单 ${orderNo} 已支付，忽略重复回调`)
      return
    }

    if (order.status !== 'pending') {
      console.warn(`订单 ${orderNo} 状态为 ${order.status}，跳过支付成功处理`)
      return
    }

    if (
      callbackAmount !== undefined &&
      callbackAmount !== null &&
      !isAmountMatch(order.amount, callbackAmount)
    ) {
      throw new Error(`订单金额校验失败: expected=${order.amount}, actual=${callbackAmount}`)
    }

    // 仅允许 pending -> paid，避免并发重复处理
    const { data: updatedOrders, error: updateError } = await getSupabase()
      .from('orders')
      .update({
        status: 'paid',
        alipay_trade_no: tradeNo,
        paid_at: new Date().toISOString(),
      })
      .eq('order_no', orderNo)
      .eq('status', 'pending')
      .select('*')

    if (updateError) {
      throw new Error(`更新订单状态失败: ${updateError.message}`)
    }

    if (!updatedOrders || updatedOrders.length === 0) {
      const { data: latestOrder } = await getSupabase()
        .from('orders')
        .select('status')
        .eq('order_no', orderNo)
        .single()

      if (latestOrder?.status === 'paid') {
        console.log(`订单 ${orderNo} 已被其他请求处理为 paid`)
        return
      }

      throw new Error('订单状态更新失败，可能被关闭或状态异常')
    }

    const paidOrder = updatedOrders[0]

    // 获取套餐配置
    const { data: planConfig } = await getSupabase()
      .from('plan_configs')
      .select('*')
      .eq('plan_type', paidOrder.plan_type)
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
      .eq('user_id', paidOrder.user_id)
      .eq('status', 'active')

    // 创建新订阅
    await getSupabase().from('subscriptions').insert({
      user_id: paidOrder.user_id,
      plan_type: paidOrder.plan_type,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
      auto_renew: false,
    })

    console.log(`订单 ${orderNo} 支付成功，已开通 ${paidOrder.plan_type} 会员`)
  } catch (error) {
    console.error('处理支付成功逻辑失败:', error)
    throw error
  } finally {
    processingOrders.delete(orderNo)
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
