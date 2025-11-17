# 付费系统配置指南

本文档详细说明如何配置和部署付费系统。

## 📋 目录

1. [系统架构](#系统架构)
2. [Supabase 配置](#supabase-配置)
3. [支付宝集成](#支付宝集成)
4. [环境变量配置](#环境变量配置)
5. [部署步骤](#部署步骤)
6. [测试流程](#测试流程)

## 🏗️ 系统架构

```
用户浏览器
    ↓
前端 (Vue 3)
    ↓
当前项目后端 (Express)
    ↓
备案域名后端 (支付 API)
    ↓
支付宝
```

**数据流程**：
1. 用户选择套餐 → 前端调用后端创建订单
2. 后端调用备案域名的支付 API → 获取支付链接
3. 用户跳转到支付宝完成支付
4. 支付宝回调备案域名 → 备案域名回调当前项目后端
5. 后端更新订单状态 → 开通会员

## 🗄️ Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 记录以下信息：
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. 执行数据库脚本

在 Supabase SQL Editor 中执行 `supabase-schema.sql` 文件：

```bash
# 复制 supabase-schema.sql 的内容
# 粘贴到 Supabase SQL Editor
# 点击 Run 执行
```

这将创建：
- 用户表 (profiles)
- 订阅表 (subscriptions)
- 使用记录表 (usage_logs)
- 订单表 (orders)
- 历史记录表 (guide_history)
- 套餐配置表 (plan_configs)

### 3. 配置认证

在 Supabase Dashboard → Authentication → Settings：

**Email Auth**（推荐）：
- 启用 Email provider
- 配置 Email templates（可选）

**Phone Auth**（可选）：
- 启用 Phone provider
- 配置短信服务商（Twilio/MessageBird）

## 💰 支付宝集成

### 方案：通过备案域名代理

假设你的备案域名是 `https://payment.example.com`

### 1. 在备案域名后端添加内部 API

```typescript
// 备案域名后端：routes/internal.ts
import express from 'express'
import AlipaySdk from 'alipay-sdk'

const router = express.Router()

// 初始化支付宝 SDK
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  gateway: 'https://openapi.alipay.com/gateway.do',
})

// 内部鉴权中间件
const verifyInternalKey = (req, res, next) => {
  const key = req.headers['x-internal-key']
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ code: -1, message: 'Forbidden' })
  }
  next()
}

// 创建支付订单
router.post('/alipay/create', verifyInternalKey, async (req, res) => {
  try {
    const { out_trade_no, total_amount, subject, body, return_url, notify_url } = req.body

    const result = await alipaySdk.pageExec('alipay.trade.page.pay', {
      bizContent: {
        out_trade_no,
        total_amount,
        subject,
        body,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      },
      returnUrl: return_url,
      notifyUrl: notify_url,
    })

    res.json({
      code: 0,
      data: {
        payUrl: result,
      },
    })
  } catch (error) {
    res.json({ code: -1, message: error.message })
  }
})

// 查询订单状态
router.get('/alipay/query', verifyInternalKey, async (req, res) => {
  try {
    const { out_trade_no } = req.query

    const result = await alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no,
      },
    })

    res.json({
      code: 0,
      data: result,
    })
  } catch (error) {
    res.json({ code: -1, message: error.message })
  }
})

// 验证回调签名
router.post('/alipay/verify', verifyInternalKey, async (req, res) => {
  try {
    const valid = alipaySdk.checkNotifySign(req.body)
    res.json({
      code: 0,
      data: { valid },
    })
  } catch (error) {
    res.json({ code: -1, message: error.message })
  }
})

export default router
```

### 2. 配置支付宝回调

在备案域名后端添加支付宝回调处理：

```typescript
// 备案域名后端：routes/alipay.ts
router.post('/notify', async (req, res) => {
  try {
    // 验证签名
    const valid = alipaySdk.checkNotifySign(req.body)
    if (!valid) {
      return res.send('fail')
    }

    const { out_trade_no, trade_no, trade_status } = req.body

    // 转发到当前项目后端
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      await axios.post(
        `${process.env.XIAOHONGSHU_BACKEND_URL}/api/payment/notify`,
        req.body,
        {
          headers: {
            'X-Internal-Key': process.env.INTERNAL_API_KEY,
          },
        }
      )
    }

    res.send('success')
  } catch (error) {
    console.error('支付宝回调处理失败:', error)
    res.send('fail')
  }
})
```

## ⚙️ 环境变量配置

### 前端 `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:3000
VITE_MAX_FILE_SIZE=10485760
```

### 后端 `backend/.env`

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

# DeepSeek
DEEPSEEK_API_KEY=your-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# 支付配置
PAYMENT_API_URL=https://payment.example.com
INTERNAL_API_KEY=your-internal-key-here

# 回调地址
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

### 备案域名后端 `.env`

```env
# 支付宝配置
ALIPAY_APP_ID=your-app-id
ALIPAY_PRIVATE_KEY=your-private-key
ALIPAY_PUBLIC_KEY=alipay-public-key

# 内部 API 密钥（与当前项目后端保持一致）
INTERNAL_API_KEY=your-internal-key-here

# 当前项目后端地址
XIAOHONGSHU_BACKEND_URL=https://your-backend.com
```

## 🚀 部署步骤

### 1. 本地开发测试

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端
npm install
npm run dev
```

### 2. 生产环境部署

**前端（Vercel）**：
```bash
# 在 Vercel 配置环境变量
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_BACKEND_URL=https://your-backend.com

# 部署
vercel --prod
```

**后端（Railway/Render）**：
```bash
# 配置环境变量（所有 backend/.env 中的变量）
# 部署后端服务
```

## 🧪 测试流程

### 1. 测试用户注册登录

```bash
# 访问 /login
# 注册新用户
# 登录成功后跳转到首页
```

### 2. 测试套餐购买

```bash
# 访问 /pricing
# 选择套餐
# 点击购买
# 应该跳转到支付宝支付页面
```

### 3. 测试支付回调

```bash
# 使用支付宝沙箱环境测试
# 完成支付后
# 检查订单状态是否更新为 paid
# 检查用户订阅是否开通
```

### 4. 测试权限控制

```bash
# 免费用户：每天只能生成 1 次
# 付费用户：根据套餐限制
# 超出限制时应该提示升级
```

## 📊 套餐配置

默认套餐（可在数据库中修改）：

| 套餐 | 价格 | 有效期 | 每日生成 | 每日导出 | 历史记录 |
|------|------|--------|----------|----------|----------|
| 免费体验 | ¥0 | 永久 | 1次 | 1次 | 3条 |
| 基础会员 | ¥29.9 | 30天 | 10次 | 无限 | 50条 |
| 专业会员 | ¥99 | 30天 | 无限 | 无限 | 无限 |
| 终身会员 | ¥299 | 永久 | 无限 | 无限 | 无限 |

## 🔒 安全注意事项

1. **API 密钥保护**
   - 所有密钥存储在环境变量中
   - 不要提交到 Git
   - 使用 `.env.example` 作为模板

2. **内部 API 鉴权**
   - 使用强随机字符串作为 INTERNAL_API_KEY
   - 可选：添加 IP 白名单

3. **支付回调验证**
   - 必须验证支付宝签名
   - 防止重复回调
   - 记录所有回调日志

4. **数据库安全**
   - 启用 Row Level Security (RLS)
   - 使用 Service Key 进行后端操作
   - 前端只使用 Anon Key

## 🐛 常见问题

### 1. 支付宝回调失败

- 检查 notify_url 是否可公网访问
- 检查签名验证是否正确
- 查看支付宝开放平台的回调日志

### 2. 订单状态未更新

- 检查支付宝回调是否成功
- 检查后端日志
- 手动调用查询接口

### 3. 用户权限不生效

- 检查 Supabase RLS 策略
- 检查订阅表数据
- 刷新用户状态

## 📞 技术支持

如有问题，请查看：
- [Supabase 文档](https://supabase.com/docs)
- [支付宝开放平台](https://open.alipay.com/)
- 项目 Issues

---

**祝你部署顺利！** 🎉
