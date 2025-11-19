# 支付宝支付配置指南

## 已完成的工作

✅ 安装支付宝官方 SDK (alipay-sdk)
✅ 创建 AlipayService 服务类
✅ 更新支付路由（创建订单、查询订单、异步通知、关闭订单）
✅ 更新前端支付流程
✅ 配置环境变量

## 配置说明

### 1. 后端配置

已在 `backend/.env` 中配置：

```bash
ALIPAY_APP_ID=2021006107647819
ALIPAY_PRIVATE_KEY=<已配置>
ALIPAY_PUBLIC_KEY=<已配置>
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do  # 沙箱环境
```

### 2. 切换到生产环境

当准备上线时，修改 `backend/.env`：

```bash
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

并使用生产环境的 APPID 和密钥。

### 3. 支付流程

1. 用户在定价页面选择套餐
2. 前端调用 `/api/payment/create-order` 创建订单
3. 后端返回支付表单 HTML
4. 前端自动提交表单跳转到支付宝
5. 用户完成支付
6. 支付宝异步通知 `/api/payment/notify`
7. 后端验证签名并开通会员
8. 用户跳转回 `/payment/return` 页面

### 4. 测试

#### 沙箱测试

1. 确保使用沙箱环境网关
2. 使用支付宝沙箱账号测试
3. 沙箱买家账号可在支付宝开放平台获取

#### 生产测试

1. 切换到生产环境网关
2. 使用真实支付宝账号
3. 建议先用小额订单测试

### 5. 注意事项

- ✅ 私钥已添加到 .gitignore，不会被提交
- ✅ 所有签名操作在后端完成
- ✅ 支持 PC 和移动端自动识别
- ✅ 实现了订单幂等性处理
- ✅ 包含完整的错误处理和日志

### 6. API 接口

#### 创建订单
```
POST /api/payment/create-order
Body: { userId, planType }
Response: { success, data: { orderId, orderNo, paymentForm, amount } }
```

#### 查询订单
```
GET /api/payment/query-order?orderNo=xxx
Response: { success, data: { orderNo, status, amount, ... } }
```

#### 关闭订单
```
POST /api/payment/close-order
Body: { orderNo }
Response: { success, message }
```

#### 异步通知（支付宝调用）
```
POST /api/payment/notify
Body: 支付宝回调参数
Response: "success" 或 "fail"
```

## 下一步

1. 在支付宝开放平台配置回调地址：
   - 异步通知地址：`https://your-domain.com/api/payment/notify`
   - 同步跳转地址：`https://your-domain.com/payment/return`

2. 测试完整支付流程

3. 监控支付成功率和错误日志

## 问题排查

### 签名验证失败
- 检查私钥和公钥是否正确
- 确认支付宝公钥是否是最新的
- 查看后端日志中的详细错误信息

### 回调未收到
- 检查回调地址是否可公网访问
- 确认支付宝开放平台配置的回调地址
- 查看支付宝开放平台的通知日志

### 订单状态未更新
- 检查数据库连接
- 查看后端日志
- 确认异步通知是否成功处理
