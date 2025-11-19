# 🚀 立即部署 - 3 步完成

## 你的架构很简单

```
GitHub → Vercel (前端 + API) → Supabase (数据库)
```

**不需要 Railway！** Vercel 可以同时部署前端和后端 API。

---

## 📋 3 步部署

### 第 1 步: 上传到 GitHub（5 分钟）

```bash
cd xiaohongshu-guide-generator
./upload-to-github.sh
```

然后：
1. 在 GitHub 创建新仓库: https://github.com/new
   - 名称: `xiaohongshu-guide-generator`
   - 类型: Private
2. 复制仓库 URL
3. 运行：
   ```bash
   git remote add origin https://github.com/你的用户名/xiaohongshu-guide-generator.git
   git push -u origin main
   ```

---

### 第 2 步: 部署到 Vercel（10 分钟）

#### 2.1 导入项目
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

#### 2.2 配置环境变量
在 "Environment Variables" 添加：

**复制粘贴这些**:
```env
VITE_SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ
VITE_BACKEND_URL=/api
VITE_USE_PROXY=false
VITE_MAX_FILE_SIZE=10485760

SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwNjcxNSwiZXhwIjoyMDc4OTgyNzE1fQ.wuLhNXtgFcVF1re_xKz7nSLA11BKSSnrAslMYvw336s

DEEPSEEK_API_KEY=sk-783505fb70064a26a2338e04f46b7df3
API_BASE_URL=https://api.deepseek.com
GEMINI_API_KEY=AIzaSyDR3EfRD5bEgpH2X6wOQydUZFmxSz4bPJY
GEMINI_BASE_URL=https://www.packyapi.com
GEMINI_PROXY_API_KEY=sk-yqvzNPkJ0akcMhENL3zT54T0uVOkoSv7rM1LnU50O9MckCoq

ALIPAY_APP_ID=9021000157676998
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
NODE_ENV=production
```

**注意**: 支付宝私钥和公钥需要你手动添加（从 backend/.env 复制）

#### 2.3 部署
点击 "Deploy" 按钮，等待 2-3 分钟。

---

### 第 3 步: 测试（5 分钟）

部署完成后，访问 Vercel 提供的 URL：
```
https://你的项目名.vercel.app
```

测试：
- [ ] 打开首页
- [ ] 注册账号
- [ ] 登录
- [ ] 刷新页面（应该保持登录）
- [ ] 生成攻略
- [ ] 查看定价

---

## ✅ 完成！

你的应用已经上线了！

### 你现在有：
- ✅ 前端：Vercel
- ✅ 后端 API：Vercel Serverless
- ✅ 数据库：Supabase
- ✅ 自动 HTTPS
- ✅ 全球 CDN

### 下一步（可选）：
1. 配置自定义域名
2. 申请正式支付宝账号
3. 邀请用户测试

---

## 🆘 遇到问题？

### 部署失败
- 查看 Vercel 的 Build Logs
- 检查环境变量是否都添加了

### API 不工作
- 确认 `VITE_BACKEND_URL=/api`
- 查看 Function Logs

### 支付不工作
- 检查支付宝配置
- 确认私钥和公钥正确

---

## 📚 详细文档

- `VERCEL_DEPLOY.md` - 完整 Vercel 部署指南
- `GITHUB_UPLOAD_GUIDE.md` - GitHub 上传指南
- `PRODUCTION_CHECKLIST.md` - 生产环境检查清单

---

**现在就开始吧！** 🚀

```bash
cd xiaohongshu-guide-generator
./upload-to-github.sh
```
