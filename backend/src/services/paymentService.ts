import axios from 'axios'

// 支付宝支付服务（通过备案域名代理）
export class PaymentService {
  private paymentApiUrl: string
  private internalApiKey: string

  constructor() {
    this.paymentApiUrl = process.env.PAYMENT_API_URL || ''
    this.internalApiKey = process.env.INTERNAL_API_KEY || ''

    if (!this.paymentApiUrl || !this.internalApiKey) {
      throw new Error('Missing payment configuration')
    }
  }

  // 创建支付宝订单
  async createAlipayOrder(params: {
    orderId: string
    amount: number
    subject: string
    userId: string
    returnUrl?: string
    notifyUrl?: string
  }): Promise<{ payUrl: string; orderId: string }> {
    try {
      const response = await axios.post(
        `${this.paymentApiUrl}/internal/alipay/create`,
        {
          out_trade_no: params.orderId,
          total_amount: params.amount,
          subject: params.subject,
          body: `用户${params.userId}购买${params.subject}`,
          return_url: params.returnUrl,
          notify_url: params.notifyUrl,
        },
        {
          headers: {
            'X-Internal-Key': this.internalApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      if (response.data.code !== 0) {
        throw new Error(response.data.message || '创建订单失败')
      }

      return {
        payUrl: response.data.data.payUrl,
        orderId: params.orderId,
      }
    } catch (error: any) {
      console.error('创建支付宝订单失败:', error.message)
      throw new Error('创建支付订单失败，请稍后重试')
    }
  }

  // 查询订单状态
  async queryOrderStatus(orderId: string): Promise<{
    status: 'pending' | 'paid' | 'failed' | 'cancelled'
    tradeNo?: string
    paidAt?: string
  }> {
    try {
      const response = await axios.get(
        `${this.paymentApiUrl}/internal/alipay/query`,
        {
          params: { out_trade_no: orderId },
          headers: {
            'X-Internal-Key': this.internalApiKey,
          },
          timeout: 10000,
        }
      )

      if (response.data.code !== 0) {
        throw new Error(response.data.message || '查询订单失败')
      }

      const data = response.data.data
      return {
        status: this.mapAlipayStatus(data.trade_status),
        tradeNo: data.trade_no,
        paidAt: data.send_pay_date,
      }
    } catch (error: any) {
      console.error('查询订单状态失败:', error.message)
      throw new Error('查询订单状态失败')
    }
  }

  // 验证支付宝回调签名
  async verifyNotify(params: any): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.paymentApiUrl}/internal/alipay/verify`,
        params,
        {
          headers: {
            'X-Internal-Key': this.internalApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      return response.data.code === 0 && response.data.data.valid === true
    } catch (error: any) {
      console.error('验证支付宝回调失败:', error.message)
      return false
    }
  }

  // 映射支付宝交易状态
  private mapAlipayStatus(
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
