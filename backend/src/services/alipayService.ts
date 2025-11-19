const { AlipaySdk, AlipayFormData } = require('alipay-sdk')

// 支付宝支付服务（官方 SDK）
export class AlipayService {
  private alipaySdk: any

  constructor() {
    const appId = process.env.ALIPAY_APP_ID
    const privateKey = process.env.ALIPAY_PRIVATE_KEY
    const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY
    const gateway = process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do'

    if (!appId || !privateKey || !alipayPublicKey) {
      throw new Error('Missing Alipay configuration: ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, or ALIPAY_PUBLIC_KEY')
    }

    this.alipaySdk = new AlipaySdk({
      appId,
      privateKey,
      alipayPublicKey,
      gateway,
      signType: 'RSA2',
      charset: 'utf-8',
      version: '1.0',
    })

    console.log('✅ AlipayService initialized successfully')
  }

  // 创建电脑网站支付订单
  async createPagePayment(params: {
    outTradeNo: string
    totalAmount: string
    subject: string
    body?: string
    returnUrl: string
  }): Promise<string> {
    try {
      const formData = new AlipayFormData()
      formData.setMethod('get')

      formData.addField('notifyUrl', process.env.BACKEND_URL + '/api/payment/notify')
      formData.addField('returnUrl', params.returnUrl)
      formData.addField('bizContent', {
        out_trade_no: params.outTradeNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: params.totalAmount,
        subject: params.subject,
        body: params.body || params.subject,
      })

      // 使用 pageExec 生成 HTML 表单
      const result = await this.alipaySdk.pageExec(
        'alipay.trade.page.pay',
        'POST',
        {
          notifyUrl: process.env.BACKEND_URL + '/api/payment/notify',
          returnUrl: params.returnUrl,
          bizContent: {
            out_trade_no: params.outTradeNo,
            product_code: 'FAST_INSTANT_TRADE_PAY',
            total_amount: params.totalAmount,
            subject: params.subject,
            body: params.body || params.subject,
          }
        }
      )

      console.log('✅ Created Alipay page payment:', params.outTradeNo)
      return result as string
    } catch (error: any) {
      console.error('❌ Failed to create Alipay page payment:', error.message)
      throw new Error('创建支付订单失败: ' + error.message)
    }
  }

  // 创建手机网站支付订单
  async createWapPayment(params: {
    outTradeNo: string
    totalAmount: string
    subject: string
    body?: string
    returnUrl: string
  }): Promise<string> {
    try {
      // 使用 pageExec 生成 HTML 表单
      const result = await this.alipaySdk.pageExec(
        'alipay.trade.wap.pay',
        'POST',
        {
          notifyUrl: process.env.BACKEND_URL + '/api/payment/notify',
          returnUrl: params.returnUrl,
          bizContent: {
            out_trade_no: params.outTradeNo,
            product_code: 'QUICK_WAP_WAY',
            total_amount: params.totalAmount,
            subject: params.subject,
            body: params.body || params.subject,
          }
        }
      )

      console.log('✅ Created Alipay WAP payment:', params.outTradeNo)
      return result as string
    } catch (error: any) {
      console.error('❌ Failed to create Alipay WAP payment:', error.message)
      throw new Error('创建手机支付订单失败: ' + error.message)
    }
  }

  // 查询订单状态
  async queryOrder(outTradeNo: string): Promise<{
    tradeStatus: string
    tradeNo?: string
    totalAmount?: string
    buyerPayAmount?: string
  }> {
    try {
      const result = await this.alipaySdk.exec('alipay.trade.query', {
        bizContent: {
          out_trade_no: outTradeNo,
        },
      })

      console.log('✅ Queried Alipay order:', outTradeNo, result)

      return {
        tradeStatus: result.tradeStatus || 'UNKNOWN',
        tradeNo: result.tradeNo,
        totalAmount: result.totalAmount,
        buyerPayAmount: result.buyerPayAmount,
      }
    } catch (error: any) {
      console.error('❌ Failed to query Alipay order:', error.message)
      throw new Error('查询订单失败: ' + error.message)
    }
  }

  // 验证异步通知签名
  async verifyNotify(params: any): Promise<boolean> {
    try {
      const isValid = this.alipaySdk.checkNotifySign(params)
      console.log(isValid ? '✅ Alipay notify signature valid' : '❌ Alipay notify signature invalid')
      return isValid
    } catch (error: any) {
      console.error('❌ Failed to verify Alipay notify:', error.message)
      return false
    }
  }

  // 关闭订单
  async closeOrder(outTradeNo: string): Promise<boolean> {
    try {
      const result = await this.alipaySdk.exec('alipay.trade.close', {
        bizContent: {
          out_trade_no: outTradeNo,
        },
      })

      console.log('✅ Closed Alipay order:', outTradeNo)
      return result.code === '10000'
    } catch (error: any) {
      console.error('❌ Failed to close Alipay order:', error.message)
      return false
    }
  }

  // 映射支付宝交易状态
  mapAlipayStatus(
    tradeStatus: string
  ): 'pending' | 'paid' | 'failed' | 'cancelled' {
    switch (tradeStatus) {
      case 'TRADE_SUCCESS':
      case 'TRADE_FINISHED':
        return 'paid'
      case 'WAIT_BUYER_PAY':
        return 'pending'
      case 'TRADE_CLOSED':
        return 'cancelled'
      default:
        return 'failed'
    }
  }

  // 生成订单号
  static generateOrderNo(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    return `XHS${timestamp}${random}`
  }
}
