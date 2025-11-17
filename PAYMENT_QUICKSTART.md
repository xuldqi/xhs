# 付费系统快速开始

5分钟快速配置付费系统。

## 📋 前置准备

1. **Supabase 账号**（免费）
2. **支付宝商家账号**（已在备案域名配置）
3. **备案域名的支付 API**

## 🚀 快速配置（5步）

### 步骤 1：创建 Supabase 项目（2分钟）

1. 访问 https://supabase.com/ 并登录
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `xiaohongshu-guide`
   - Database Password: 设置一个强密码
   - Region: 选择 `Northeast Asia (Tokyo)` 或最近的区域
4. 等待项目创建完成（约1分钟）

### 步骤 2：执行数据库脚本（1分钟）

1. 在 Supabase Dashboard，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase-schema.sql` 的全部内容
4. 粘贴到编辑器
5. 点击 "Run" 执行

✅ 成功后会看到 "Success. No rows returned"

### 步骤 3：获取 Supabase 密钥（30秒）

1. 在 Supabase Dashboard，点击左侧 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 步骤 4：配置环境变量（1分钟）

**前端 `.env`**：
```bash
cp .env.example .env
```

编辑 `.env`：
```env
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
VITE_BACKEND_URL=http://localhost:3000
```

**后端 `backend/.env`**：
```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env`：
```env
# Supabase
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_KEY=你的service-role-key

# 支付配置
PAYMENT_API_URL=https://你的备案域名.com
INTERNAL_API_KEY=生成一个随机字符串

# DeepSeek（已有）
DEEPSEEK_API_KEY=你的deepseek-key

# 其他保持默认
```

生成 INTERNAL_API_KEY：
```bash
# macOS/Linux
openssl rand -hex 32

# 或者使用在线工具
# https://www.random.org/strings/
```

### 步骤 5：启动服务（1分钟）

```bash
# 终端 1：启动后端
cd backend
npm install
npm run dev

# 终端 2：启动前端
npm install
npm run dev
```

访问 http://localhost:5173

## ✅ 测试功能

### 1. 测试注册登录

```bash
# 访问 http://localhost:5173/login
# 注册一个测试账号
# 登录成功后应该看到用户头像
```

### 2. 测试套餐页面

```bash
# 访问 http://localhost:5173/pricing
# 应该看到 4 个套餐
# 点击"立即购买"会跳转到支付页面（需要配置支付宝）
```

### 3. 测试权限控制

```bash
# 免费用户每天只能生成 1 次
# 尝试生成第 2 次时会提示升级会员
```

## 🔧 配置支付宝（可选）

如果你已经有备案域名的支付 API：

### 在备案域名后端添加内部 API

参考 `PAYMENT_SETUP.md` 中的详细说明。

简单来说，需要在备案域名后端添加 3 个接口：
1. `POST /internal/alipay/create` - 创建支付订单
2. `GET /internal/alipay/query` - 查询订单状态
3. `POST /internal/alipay/verify` - 验证回调签名

### 配置回调地址

在备案域名的支付宝回调中，转发到当前项目：

```typescript
// 备案域名后端
await axios.post(
  `${process.env.XIAOHONGSHU_BACKEND_URL}/api/payment/notify`,
  req.body,
  {
    headers: {
      'X-Internal-Key': process.env.INTERNAL_API_KEY
    }
  }
)
```

## 📊 默认套餐

| 套餐 | 价格 | 每日生成 | 每日导出 |
|------|------|----------|----------|
| 免费体验 | ¥0 | 1次 | 1次 |
| 基础会员 | ¥29.9 | 10次 | 无限 |
| 专业会员 | ¥99 | 无限 | 无限 |
| 终身会员 | ¥299 | 无限 | 无限 |

可以在 Supabase 的 `plan_configs` 表中修改。

## 🐛 常见问题

### 1. Supabase 连接失败

```bash
# 检查环境变量是否正确
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 检查 Supabase 项目是否正常运行
# 访问 Supabase Dashboard
```

### 2. 注册后无法登录

```bash
# 检查 Supabase Email Auth 是否启用
# Dashboard → Authentication → Settings → Email
# 确保 "Enable Email provider" 已勾选
```

### 3. 权限检查不生效

```bash
# 检查数据库表是否创建成功
# 在 Supabase SQL Editor 执行：
SELECT * FROM plan_configs;
SELECT * FROM subscriptions;

# 应该看到 4 个套餐和用户的订阅记录
```

### 4. 支付跳转失败

```bash
# 检查 PAYMENT_API_URL 是否正确
# 检查 INTERNAL_API_KEY 是否与备案域名一致
# 查看后端日志
```

## 📝 下一步

1. **自定义套餐**：修改 `plan_configs` 表
2. **配置邮件模板**：Supabase → Authentication → Email Templates
3. **添加手机号登录**：配置 Supabase Phone Auth
4. **部署到生产环境**：参考 `DEPLOYMENT.md`

## 💡 提示

- 开发阶段可以不配置支付宝，使用免费套餐测试
- 生产环境必须配置 HTTPS
- 定期备份 Supabase 数据库
- 监控 API 使用量

---

**配置完成！开始使用付费系统吧** 🎉

有问题查看详细文档：`PAYMENT_SETUP.md`
