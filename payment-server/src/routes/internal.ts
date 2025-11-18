import express from 'express'
import { alipaySdk } from '../config/alipay'
import { verifyInternalKey } from '../middleware/auth'

const router = express.Router()

/**
 * 创建支付宝订单
 * POST /internal/alipay/create
 */
router.post('/alipay/create', verifyInternalKey, async (req, res) => {
  try {
    const { out_trade_no, total_amount, subject, body, return_url, notify_url } = req.body

    // 参数验证
    if (!out_trade_no || !total_amount || !subject) {
      return res.json({ 
        code: -1, 
        message: '缺少必要参数: out_trade_no, total_amount, subject' 
      })
    }

    console.log('📝 创建支付订单:', { out_trade_no, total_amount, subject })

    // 调用支付宝 API
    const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
      bizContent: {
        outTradeNo: out_trade_no,
        totalAmount: total_amount,
        subject,
        body,
        productCode: 'FAST_INSTANT_TRADE_PAY',
      },
      returnUrl: return_url,
      notifyUrl: notify_url,
    })

    console.log('✅ 支付订单创建成功:', out_trade_no)

    res.json({
      code: 0,
      message: '创建成功',
      data: {
        payUrl: result,
      },
    })
  } catch (error: any) {
    console.error('❌ 创建支付订单失败:', error.message)
    res.json({ 
      code: -1, 
      message: error.message || '创建订单失败' 
    })
  }
})

/**
 * 查询订单状态
 * GET /internal/alipay/query?out_trade_no=xxx
 */
router.get('/alipay/query', verifyInternalKey, async (req, res) => {
  try {
    const { out_trade_no } = req.query

    if (!out_trade_no) {
      return res.json({ code: -1, message: '缺少参数: out_trade_no' })
    }

    console.log('🔍 查询订单状态:', out_trade_no)

    const result = await alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        outTradeNo: out_trade_no as string,
      },
    })

    console.log('✅ 订单查询成功:', result)

    res.json({
      code: 0,
      message: '查询成功',
      data: result,
    })
  } catch (error: any) {
    console.error('❌ 查询订单失败:', error.message)
    res.json({ 
      code: -1, 
      message: error.message || '查询订单失败' 
    })
  }
})

/**
 * 验证支付宝回调签名
 * POST /internal/alipay/verify
 */
router.post('/alipay/verify', verifyInternalKey, async (req, res) => {
  try {
    const params = req.body

    console.log('🔐 验证回调签名...')

    const valid = alipaySdk.checkNotifySign(params)

    console.log(valid ? '✅ 签名验证通过' : '❌ 签名验证失败')

    res.json({
      code: 0,
      message: '验证完成',
      data: { valid },
    })
  } catch (error: any) {
    console.error('❌ 验证签名失败:', error.message)
    res.json({ 
      code: -1, 
      message: error.message || '验证失败' 
    })
  }
})

export default router
