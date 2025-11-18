import express from 'express'
import axios from 'axios'
import { alipaySdk } from '../config/alipay'

const router = express.Router()

/**
 * 支付宝异步回调
 * POST /alipay/notify
 * 
 * 注意：支付宝会直接调用这个接口，无需鉴权
 */
router.post('/notify', async (req, res) => {
  try {
    console.log('📨 收到支付宝回调:', req.body)

    // 验证签名
    const valid = alipaySdk.checkNotifySign(req.body)
    if (!valid) {
      console.error('❌ 支付宝回调签名验证失败')
      return res.send('fail')
    }

    console.log('✅ 签名验证通过')

    const { out_trade_no, trade_no, trade_status } = req.body

    // 只处理支付成功的回调
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      console.log('💰 支付成功，转发到项目后端...')

      // 从订单号中提取项目标识（如果有）
      // 格式：XHS{timestamp}{random} 表示小红书项目
      const projectKey = out_trade_no.substring(0, 3)
      
      // 根据项目标识获取对应的后端地址
      const backendUrl = getBackendUrlByProject(projectKey)

      if (backendUrl) {
        try {
          // 转发到项目后端
          await axios.post(
            `${backendUrl}/api/payment/notify`,
            req.body,
            {
              headers: {
                'X-Internal-Key': process.env.INTERNAL_API_KEY,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          )
          console.log('✅ 回调转发成功:', backendUrl)
        } catch (error: any) {
          console.error('❌ 转发回调到项目后端失败:', error.message)
          // 即使转发失败也要返回 success，避免支付宝重复通知
        }
      } else {
        console.warn('⚠️ 未找到项目后端地址，项目标识:', projectKey)
      }
    }

    // 必须返回 success 告知支付宝已收到
    res.send('success')
  } catch (error: any) {
    console.error('❌ 处理支付回调失败:', error.message)
    res.send('fail')
  }
})

/**
 * 支付宝同步回调（用户支付完成后跳转）
 * GET /alipay/return
 * 
 * 这个接口通常不需要处理，让用户直接跳转到前端即可
 */
router.get('/return', (req, res) => {
  console.log('🔄 支付宝同步回调:', req.query)
  
  // 可以直接重定向到项目前端
  const returnUrl = req.query.return_url as string || 'https://xhs.bambumoon.cn'
  res.redirect(returnUrl)
})

/**
 * 根据项目标识获取后端地址
 */
function getBackendUrlByProject(projectKey: string): string | null {
  const projectBackends: Record<string, string> = {
    'XHS': process.env.XHS_BACKEND_URL || '',           // 小红书项目
    'WX': process.env.WX_BACKEND_URL || '',             // 微信项目（示例）
    'DY': process.env.DY_BACKEND_URL || '',             // 抖音项目（示例）
  }

  return projectBackends[projectKey] || null
}

export default router
