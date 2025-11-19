# ⚡ 快速发布指南

## 🚀 5 分钟发布到 Vercel

### 前提条件
- GitHub 账号
- Vercel 账号（免费）
- Supabase 账号（免费）

---

## 步骤 1: 准备代码

```bash
# 1. 确保代码已提交到 GitHub
cd xiaohongshu-guide-generator
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 步骤 2: 部署前端到 Vercel

### 2.1 导入项目
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 选择 `xiaohongshu-guide-generator` 目录

### 2.2 配置构建设置
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.3 配置环境变量
在 Vercel 项目设置中添加：
```
VITE_SUPABASE_URL=你的Supabase URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_BACKEND_URL=你的后端URL（稍后配置）
```

### 2.4 部署
点击 "Deploy" 按钮，等待部署完成。

---

## 步骤 3: 部署后端

### 选项 A: Vercel Serverless（推荐）

**创建 `api/index.ts`**
```typescript
import express from 'express'
import cors from 'cors'
// 导入你的路由

const app = express()
app.use(cors())
app.use(express.json())

// 添加路由
// app.use('/api/ai', aiRouter)
// app.use('/api/payment', paymentRouter)

export default app
```

**配置 `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

### 选项 B: Railway（推荐后端）

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 选择 `backend` 目录
4. 配置环境变量
5. 自动部署

### 选项 C: Render（免费）

1. 访问 https://render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 配置：
   ```
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   ```
5. 添加环境变量

---

## 步骤 4: 配置 Supabase

### 4.1 创建项目
1. 访问 https://app.supabase.com
2. 创建新项目
3. 等待初始化完成

### 4.2 初始化数据库
```bash
# 1. 打开 SQL Editor
# 2. 复制 init-database-complete.sql 内容
# 3. 运行 SQL
```

### 4.3 获取密钥
```bash
# 在 Project Settings > API 中获取：
# - Project URL
# - anon public key
# - service_role key（后端使用）
```

---

## 步骤 5: 更新环境变量

### 前端（Vercel）
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_BACKEND_URL=https://你的后端域名.com
```

### 后端（Railway/Render）
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...
DASHSCOPE_API_KEY=sk-xxx...
ALIPAY_APP_ID=xxx
ALIPAY_PRIVATE_KEY=xxx
ALIPAY_PUBLIC_KEY=xxx
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
```

---

## 步骤 6: 测试

### 6.1 访问应用
```
前端: https://你的项目.vercel.app
后端: https://你的项目.railway.app
```

### 6.2 测试功能
- [ ] 用户注册和登录
- [ ] 生成攻略
- [ ] 查看定价
- [ ] 测试支付（沙箱）

---

## 🎉 完成！

你的应用已经成功发布！

### 获取自定义域名
1. 在 Vercel 项目设置中添加域名
2. 配置 DNS 记录
3. 等待 SSL 证书自动配置

### 下一步
- 申请正式支付宝商户账号
- 配置生产环境支付
- 添加监控和分析
- 优化性能

---

## 📊 免费额度

### Vercel
- 100 GB 带宽/月
- 无限部署
- 自动 HTTPS

### Railway
- $5 免费额度/月
- 自动部署
- 自定义域名

### Supabase
- 500 MB 数据库
- 1 GB 文件存储
- 50,000 月活用户

---

## 🆘 常见问题

### 问题 1: 构建失败
```bash
# 检查 package.json 中的依赖
# 确保所有依赖都已安装
npm install
```

### 问题 2: 环境变量未生效
```bash
# 重新部署
vercel --prod

# 或在 Vercel 控制台重新部署
```

### 问题 3: API 连接失败
```bash
# 检查 CORS 配置
# 检查后端 URL 是否正确
# 检查环境变量
```

---

## 📞 需要帮助？

查看完整文档：
- `DEPLOYMENT_CHECKLIST.md` - 完整检查清单
- `DEPLOYMENT.md` - 详细部署指南
- `STATUS.md` - 项目状态

---

**祝你发布顺利！** 🚀
