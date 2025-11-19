/**
 * 支付宝沙箱环境测试脚本
 * 用于测试完整的支付流程
 */

import { AlipayService } from './src/services/alipayService'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

async function testAlipaySandbox() {
  console.log('🧪 开始测试支付宝沙箱环境...\n')

  try {
    // 1. 初始化服务
    console.log('📝 步骤 1: 初始化 AlipayService')
    const alipayService = new AlipayService()
    console.log('✅ AlipayService 初始化成功\n')

    // 2. 生成测试订单号
    const testOrderNo = AlipayService.generateOrderNo()
    console.log('📝 步骤 2: 生成测试订单号')
    console.log(`   订单号: ${testOrderNo}\n`)

    // 3. 创建支付订单（电脑网站支付）
    console.log('📝 步骤 3: 创建电脑网站支付订单')
    const paymentUrl = await alipayService.createPagePayment({
      outTradeNo: testOrderNo,
      totalAmount: '0.01', // 沙箱环境测试金额
      subject: '小红书攻略生成器 - 测试订单',
      body: '这是一个测试订单',
      returnUrl: process.env.FRONTEND_URL + '/payment/return',
    })
    console.log('✅ 支付订单创建成功')
    console.log(`   支付链接: ${paymentUrl.substring(0, 100)}...\n`)

    // 4. 查询订单状态（应该是待支付）
    console.log('📝 步骤 4: 查询订单状态')
    await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
    
    try {
      const orderStatus = await alipayService.queryOrder(testOrderNo)
      console.log('✅ 订单查询成功')
      console.log(`   交易状态: ${orderStatus.tradeStatus}`)
      console.log(`   支付宝交易号: ${orderStatus.tradeNo || '未生成'}`)
      console.log(`   订单金额: ${orderStatus.totalAmount || '0.01'}\n`)
    } catch (error: any) {
      // 订单可能还未在支付宝系统中生成，这是正常的
      console.log('⚠️  订单查询失败（订单可能还未在支付宝系统中生成）')
      console.log(`   错误信息: ${error.message}\n`)
    }

    // 5. 测试签名验证
    console.log('📝 步骤 5: 测试签名验证功能')
    const mockNotifyParams = {
      out_trade_no: testOrderNo,
      trade_no: '2024111922001234567890',
      trade_status: 'TRADE_SUCCESS',
      total_amount: '0.01',
      // 注意：这里的签名是模拟的，实际测试需要真实的支付宝回调
      sign: 'mock_signature',
      sign_type: 'RSA2',
    }
    
    // 这个测试会失败，因为签名是模拟的
    const isValid = await alipayService.verifyNotify(mockNotifyParams)
    console.log(`   签名验证结果: ${isValid ? '✅ 有效' : '❌ 无效（预期结果，因为使用了模拟签名）'}\n`)

    // 6. 测试关闭订单
    console.log('📝 步骤 6: 测试关闭订单')
    await new Promise(resolve => setTimeout(resolve, 2000)) // 等待 2 秒
    
    try {
      const closeResult = await alipayService.closeOrder(testOrderNo)
      console.log(`   关闭订单结果: ${closeResult ? '✅ 成功' : '❌ 失败'}\n`)
    } catch (error: any) {
      console.log('⚠️  关闭订单失败')
      console.log(`   错误信息: ${error.message}\n`)
    }

    // 7. 测试手机网站支付
    console.log('📝 步骤 7: 测试手机网站支付')
    const mobileOrderNo = AlipayService.generateOrderNo()
    const mobilePaymentUrl = await alipayService.createWapPayment({
      outTradeNo: mobileOrderNo,
      totalAmount: '0.01',
      subject: '小红书攻略生成器 - 移动端测试',
      returnUrl: process.env.FRONTEND_URL + '/payment/return',
    })
    console.log('✅ 手机支付订单创建成功')
    console.log(`   订单号: ${mobileOrderNo}`)
    console.log(`   支付链接: ${mobilePaymentUrl.substring(0, 100)}...\n`)

    // 测试总结
    console.log('=' .repeat(60))
    console.log('🎉 测试完成！\n')
    console.log('📋 测试总结:')
    console.log('   ✅ AlipayService 初始化')
    console.log('   ✅ 订单号生成')
    console.log('   ✅ 电脑网站支付订单创建')
    console.log('   ✅ 手机网站支付订单创建')
    console.log('   ⚠️  订单查询（需要实际支付后才能查到完整信息）')
    console.log('   ⚠️  签名验证（需要真实的支付宝回调数据）')
    console.log('   ⚠️  关闭订单（需要订单在支付宝系统中存在）')
    console.log('\n💡 下一步:')
    console.log('   1. 访问生成的支付链接进行实际支付测试')
    console.log('   2. 使用支付宝沙箱账号完成支付')
    console.log('   3. 验证异步通知回调是否正常')
    console.log('   4. 检查订单状态是否正确更新')
    console.log('   5. 验证会员权益是否正确开通')
    console.log('=' .repeat(60))

  } catch (error: any) {
    console.error('\n❌ 测试失败:', error.message)
    console.error('   详细错误:', error)
    process.exit(1)
  }
}

// 运行测试
testAlipaySandbox()
  .then(() => {
    console.log('\n✅ 测试脚本执行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 测试脚本执行失败:', error)
    process.exit(1)
  })
