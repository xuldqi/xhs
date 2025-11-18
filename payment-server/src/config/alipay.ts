import AlipaySdk from 'alipay-sdk'

// 初始化支付宝 SDK
export const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  timeout: 10000,
  camelCase: true,
})

// 验证配置
if (!process.env.ALIPAY_APP_ID || !process.env.ALIPAY_PRIVATE_KEY || !process.env.ALIPAY_PUBLIC_KEY) {
  console.error('❌ 支付宝配置缺失，请检查环境变量')
  process.exit(1)
}

console.log('✅ 支付宝 SDK 初始化成功')
console.log(`   App ID: ${process.env.ALIPAY_APP_ID}`)
console.log(`   Gateway: ${process.env.ALIPAY_GATEWAY}`)
