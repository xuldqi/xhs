# 支付宝测试指南

## 🚀 快速测试步骤

### 1. 启动后端服务

```bash
cd backend
npm run dev
```

确保看到：
```
🚀 Server is running on http://localhost:3001
```

### 2. 检查配置（第一步必做）

在浏览器访问：
```
http://localhost:3001/api/payment/check-config
```

或者用 curl：
```bash
curl http://localhost:3001/api/payment/check-config
```

**期望结果**：
- `supabase.connected: true` ✅
- `alipay.initialized: true` ✅
- `allReady: true` ✅

如果看到错误，根据错误信息修复配置。

---

## 📝 测试方法

### 方法 1：使用测试接口（最简单）

#### 测试 1：检查配置
```bash
curl http://localhost:3001/api/payment/check-config
```

#### 测试 2：创建测试订单（不依赖数据库）
```bash
curl -X POST http://localhost:3001/api/payment-test/test-create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": "0.01", "subject": "测试订单"}'
```

**返回结果**会包含 `paymentForm`，这是支付宝支付表单的 HTML。

#### 测试 3：查询订单状态
```bash
curl "http://localhost:3001/api/payment-test/test-query-order?orderNo=你的订单号"
```

---

### 方法 2：使用完整支付流程（需要 Supabase）

#### 步骤 1：确保 Supabase 有套餐数据

在 Supabase Dashboard 的 SQL Editor 执行：

```sql
-- 检查是否有套餐数据
SELECT * FROM plan_configs;

-- 如果没有，插入测试数据
INSERT INTO plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit)
VALUES 
  ('free', '免费版', 0, NULL, 3, 3, 10),
  ('pro', '专业版', 29.9, 30, 999, 999, 999),
  ('premium', '高级版', 99.9, 90, 999, 999, 999)
ON CONFLICT (plan_type) DO NOTHING;
```

#### 步骤 2：创建订单

```bash
curl -X POST http://localhost:3001/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "planType": "pro"
  }'
```

**返回结果**：
```json
{
  "success": true,
  "data": {
    "orderId": "...",
    "orderNo": "XHS...",
    "paymentForm": "<form>...</form>",
    "amount": 29.9
  }
}
```

#### 步骤 3：提交支付表单

将返回的 `paymentForm` 保存为 HTML 文件，在浏览器打开，会自动跳转到支付宝。

或者在前端代码中：
```javascript
const response = await fetch('http://localhost:3001/api/payment/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-123',
    planType: 'pro'
  })
})

const { data } = await response.json()

// 创建临时表单并提交
const div = document.createElement('div')
div.innerHTML = data.paymentForm
document.body.appendChild(div)
div.querySelector('form').submit()
```

---

### 方法 3：在前端页面测试

#### 步骤 1：启动前端

```bash
npm run dev
```

#### 步骤 2：访问定价页面

打开：`http://localhost:5174/pricing`

点击"立即购买"按钮，应该会：
1. 创建订单
2. 自动跳转到支付宝支付页面

#### 步骤 3：使用支付宝沙箱账号支付

- 沙箱账号：在支付宝开放平台获取
- 支付密码：沙箱环境有测试密码
- 支付成功后会自动跳转回你的网站

---

## 🔍 常见问题排查

### 问题 1：配置检查失败

**症状**：`/api/payment/check-config` 返回错误

**解决**：
1. 检查 `backend/.env` 文件是否存在
2. 确认以下变量已配置：
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   ALIPAY_APP_ID=...
   ALIPAY_PRIVATE_KEY=...
   ALIPAY_PUBLIC_KEY=...
   ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do
   ```

### 问题 2：创建订单失败

**症状**：返回 "套餐不存在" 或 "创建订单失败"

**解决**：
1. 检查 Supabase 中是否有 `plan_configs` 表
2. 检查表中是否有对应的套餐数据
3. 检查 Supabase 连接是否正常

### 问题 3：支付表单无法提交

**症状**：返回了 `paymentForm` 但无法跳转

**解决**：
1. 检查 `paymentForm` 是否包含完整的 HTML 表单
2. 检查支付宝网关地址是否正确（沙箱 vs 生产）
3. 检查浏览器控制台是否有错误

### 问题 4：支付后回调失败

**症状**：支付成功但订单状态未更新

**解决**：
1. 检查 `/api/payment/notify` 接口是否可访问（需要公网地址）
2. 检查支付宝开放平台配置的回调地址
3. 查看后端日志中的错误信息

---

## 📊 测试检查清单

- [ ] 后端服务启动成功
- [ ] `/api/payment/check-config` 返回 `allReady: true`
- [ ] Supabase 连接正常
- [ ] 支付宝服务初始化成功
- [ ] 可以创建测试订单
- [ ] 支付表单可以正常提交
- [ ] 可以跳转到支付宝支付页面
- [ ] 支付成功后可以查询订单状态

---

## 💡 快速测试脚本

创建一个 `test-payment.sh` 文件：

```bash
#!/bin/bash

echo "🧪 开始测试支付宝功能..."
echo ""

echo "1️⃣  检查配置..."
curl -s http://localhost:3001/api/payment/check-config | jq '.'
echo ""

echo "2️⃣  创建测试订单..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/payment-test/test-create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": "0.01", "subject": "测试订单"}')

echo "$ORDER_RESPONSE" | jq '.'
echo ""

ORDER_NO=$(echo "$ORDER_RESPONSE" | jq -r '.data.orderNo')
echo "订单号: $ORDER_NO"
echo ""

echo "3️⃣  查询订单状态..."
curl -s "http://localhost:3001/api/payment-test/test-query-order?orderNo=$ORDER_NO" | jq '.'
echo ""

echo "✅ 测试完成！"
```

运行：
```bash
chmod +x test-payment.sh
./test-payment.sh
```

