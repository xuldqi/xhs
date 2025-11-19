# 🚀 Vercel 全栈部署指南

## 📊 你的架构

```
GitHub → Vercel (前端 + 后端 API) → Supabase 数据库
                    ↓
                AI 服务 + 支付宝
```

## ✅ 优势

- 前后端一起部署，配置简单
- 不需要担心 CORS 问题
- 自动 HTTPS 和 CDN
- 免费额度足够初期使用

---

## 📋 部署步骤

### 步骤 1: 上传到 GitHub

```bash
cd xiaohongshu-guide-generator
./upload-to-github.sh
```

按照提示操作：
1. 添加所有文件
2. 提交代码
3. 在 GitHub 创建仓库
4. 推送代码

---

### 步骤 2: 配置 Vercel 部署

#### 2.1 创建 `vercel.json` 配置

已经存在，内容如下：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

#### 2.2 创建 API 路由

在 `api/` 目录下创建 serverless functions。

**已有的 API**:
- `api/ai.ts` - AI 生成接口

**需要添加的 API**:
- `api/payment.ts` - 支付接口
- `api/health.ts` - 健康检查

---

### 步骤 3: 部署到 Vercel

#### 3.1 访问 Vercel
1. 打开 https://vercel.com
2. 登录或注册账号
3. 点击 "New Project"

#### 3.2 导入 GitHub 仓库
1. 选择 "Import Git Repository"
2. 授权 GitHub
3. 选择 `xiaohongshu-guide-generator` 仓库
4. 点击 "Import"

#### 3.3 配置项目
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 3.4 配置环境变量

点击 "Environment Variables"，添加以下变量：

**前端环境变量**:
```env
VITE_SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ
VITE_BACKEND_URL=/api
VITE_USE_PROXY=false
VITE_MAX_FILE_SIZE=10485760
```

**后端环境变量**:
```env
# Supabase
SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwNjcxNSwiZXhwIjoyMDc4OTgyNzE1fQ.wuLhNXtgFcVF1re_xKz7nSLA11BKSSnrAslMYvw336s

# AI 服务
DEEPSEEK_API_KEY=sk-783505fb70064a26a2338e04f46b7df3
API_BASE_URL=https://api.deepseek.com
GEMINI_API_KEY=AIzaSyDR3EfRD5bEgpH2X6wOQydUZFmxSz4bPJY
GEMINI_BASE_URL=https://www.packyapi.com
GEMINI_PROXY_API_KEY=sk-yqvzNPkJ0akcMhENL3zT54T0uVOkoSv7rM1LnU50O9MckCoq

# 支付宝（沙箱）
ALIPAY_APP_ID=9021000157676998
ALIPAY_PRIVATE_KEY=你的私钥
ALIPAY_PUBLIC_KEY=你的公钥
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do

# 其他
NODE_ENV=production
```

#### 3.5 部署
点击 "Deploy" 按钮，等待部署完成（约 2-3 分钟）。

---

### 步骤 4: 测试部署

#### 4.1 访问应用
部署完成后，Vercel 会提供一个 URL：
```
https://xiaohongshu-guide-generator.vercel.app
```

#### 4.2 测试功能
- [ ] 访问首页
- [ ] 用户注册和登录
- [ ] 刷新页面（保持登录）
- [ ] 生成攻略
- [ ] 查看定价
- [ ] 测试支付（沙箱）

---

## 🔧 后续配置

### 1. 自定义域名（可选）

#### 在 Vercel 添加域名
1. 进入项目设置
2. Domains > Add Domain
3. 输入你的域名
4. 按照提示配置 DNS

#### 配置 DNS
在你的域名注册商添加记录：
```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

### 2. 更新支付宝回调地址

在支付宝开放平台更新：
```
回调地址: https://你的域名.com/payment/return
通知地址: https://你的域名.com/api/payment/notify
```

### 3. 申请正式支付宝账号

当准备正式上线时：
1. 申请正式商户账号
2. 更新环境变量中的支付宝配置
3. 更新 `ALIPAY_GATEWAY` 为正式网关

---

## 📊 监控和维护

### 1. 查看部署日志
在 Vercel 项目页面：
- Deployments > 选择部署 > View Function Logs

### 2. 监控性能
- Analytics > 查看访问统计
- Speed Insights > 查看性能指标

### 3. 错误监控
推荐集成 Sentry：
```bash
npm install @sentry/vue @sentry/node
```

---

## 🆘 常见问题

### Q: API 调用失败？
A: 检查环境变量是否正确配置，特别是 `VITE_BACKEND_URL=/api`

### Q: 支付功能不工作？
A: 
1. 检查支付宝配置
2. 确认回调地址正确
3. 查看 Function Logs

### Q: 部署失败？
A: 
1. 查看 Build Logs
2. 检查 package.json 依赖
3. 确认环境变量配置

---

## 🎉 完成！

你的应用现在已经：
- ✅ 部署到 Vercel
- ✅ 前后端一体化
- ✅ 连接到 Supabase
- ✅ 自动 HTTPS
- ✅ 全球 CDN

### 下一步
1. 测试所有功能
2. 配置自定义域名
3. 申请正式支付宝账号
4. 邀请用户测试

---

**祝你部署顺利！** 🚀
