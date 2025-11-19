# 📤 GitHub 上传和部署指南

## 🎯 当前状态

### ✅ 已配置
- Supabase 数据库: `dwgrurfoxqfoeiwjytbb.supabase.co`
- 前端准备: Vercel 部署
- 支付宝: 沙箱环境（测试用）

### ⚠️ 需要注意
- 当前使用沙箱支付宝，正式上线需要申请正式商户账号
- 环境变量包含敏感信息，不会上传到 GitHub

---

## 📋 上传到 GitHub 前的准备

### 1. 检查 .gitignore（已配置 ✅）
```bash
# 确认以下文件不会被上传
.env
backend/.env
node_modules/
dist/
```

### 2. 清理敏感信息
```bash
cd xiaohongshu-guide-generator

# 检查是否有敏感文件
git status

# 如果有 .env 文件显示，确保它在 .gitignore 中
```

---

## 🚀 上传到 GitHub

### 方法 1: 使用命令行（推荐）

#### 步骤 1: 初始化 Git（如果还没有）
```bash
cd xiaohongshu-guide-generator

# 检查是否已经是 Git 仓库
git status

# 如果不是，初始化
git init
```

#### 步骤 2: 添加所有文件
```bash
# 添加所有文件（.gitignore 会自动排除敏感文件）
git add .

# 查看将要提交的文件
git status
```

#### 步骤 3: 提交代码
```bash
git commit -m "feat: 完整的小红书攻略生成器

✨ 功能特性:
- 用户认证系统（支持持久化登录）
- AI 生成小红书攻略
- 会员订阅系统
- 支付宝支付集成
- 攻略导出功能
- 历史记录管理

🐛 修复:
- 认证持久化 - 刷新页面保持登录
- 定价页面布局优化
- 跨标签页状态同步

📚 文档:
- 完整的部署指南
- 测试文档
- API 文档"
```

#### 步骤 4: 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名称: `xiaohongshu-guide-generator`
3. 描述: `AI-powered 小红书攻略生成器 - 智能分析账号数据，生成专业运营攻略`
4. 选择 **Private**（推荐，因为包含业务逻辑）
5. 不要勾选 "Initialize with README"
6. 点击 "Create repository"

#### 步骤 5: 连接远程仓库
```bash
# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/xiaohongshu-guide-generator.git

# 推送代码
git branch -M main
git push -u origin main
```

---

### 方法 2: 使用 GitHub Desktop

1. 打开 GitHub Desktop
2. File > Add Local Repository
3. 选择 `xiaohongshu-guide-generator` 目录
4. 点击 "Publish repository"
5. 选择 Private
6. 点击 "Publish"

---

## 🔧 配置 Vercel 部署

### 步骤 1: 连接 GitHub 仓库

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择你刚上传的仓库
5. 点击 "Import"

### 步骤 2: 配置项目

**Framework Preset**: Vite
**Root Directory**: `./` (默认)
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### 步骤 3: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ

# 后端 API 地址（稍后配置后端后更新）
VITE_BACKEND_URL=https://你的后端域名.com

# 其他配置
VITE_USE_PROXY=false
VITE_MAX_FILE_SIZE=10485760
```

### 步骤 4: 部署

点击 "Deploy" 按钮，等待部署完成。

部署完成后，你会得到一个 URL，例如：
```
https://xiaohongshu-guide-generator.vercel.app
```

---

## 🖥️ 部署后端

### 选项 A: Railway（推荐）

#### 1. 创建账号
访问 https://railway.app 并登录

#### 2. 新建项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的仓库
4. 选择 `backend` 目录

#### 3. 配置环境变量
添加以下环境变量：

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# AI API 配置
DEEPSEEK_API_KEY=sk-783505fb70064a26a2338e04f46b7df3
API_BASE_URL=https://api.deepseek.com
GEMINI_API_KEY=AIzaSyDR3EfRD5bEgpH2X6wOQydUZFmxSz4bPJY
GEMINI_BASE_URL=https://www.packyapi.com
GEMINI_PROXY_API_KEY=sk-yqvzNPkJ0akcMhENL3zT54T0uVOkoSv7rM1LnU50O9MckCoq

# Supabase 配置
SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwNjcxNSwiZXhwIjoyMDc4OTgyNzE1fQ.wuLhNXtgFcVF1re_xKz7nSLA11BKSSnrAslMYvw336s

# 支付宝配置（沙箱环境）
ALIPAY_APP_ID=9021000157676998
ALIPAY_PRIVATE_KEY=你的私钥
ALIPAY_PUBLIC_KEY=你的公钥
ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do

# 前端地址
FRONTEND_URL=https://xiaohongshu-guide-generator.vercel.app
BACKEND_URL=https://你的railway域名.railway.app

# CORS 配置
ALLOWED_ORIGINS=https://xiaohongshu-guide-generator.vercel.app
```

#### 4. 部署
Railway 会自动部署，完成后你会得到一个 URL。

#### 5. 更新前端环境变量
回到 Vercel，更新 `VITE_BACKEND_URL` 为 Railway 提供的 URL。

---

### 选项 B: Render（免费）

1. 访问 https://render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 配置：
   ```
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   ```
5. 添加环境变量（同上）

---

## ✅ 部署后检查清单

### 1. 前端检查
- [ ] 访问 Vercel URL
- [ ] 检查页面是否正常加载
- [ ] 测试用户注册和登录
- [ ] 检查定价页面布局

### 2. 后端检查
- [ ] 访问后端 URL + `/api/health`
- [ ] 检查 API 是否响应
- [ ] 测试 AI 生成功能
- [ ] 测试支付流程

### 3. 数据库检查
- [ ] 登录 Supabase 控制台
- [ ] 检查表是否存在
- [ ] 检查 RLS 策略是否正确
- [ ] 测试数据读写

---

## 🔄 更新代码流程

以后更新代码时：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "描述你的更改"
git push

# Vercel 和 Railway 会自动重新部署
```

---

## ⚠️ 重要提醒

### 1. 环境变量安全
- ✅ .env 文件已在 .gitignore 中
- ✅ 敏感信息不会上传到 GitHub
- ⚠️ 在 Vercel 和 Railway 中手动配置环境变量

### 2. 支付宝配置
- ⚠️ 当前使用沙箱环境
- ⚠️ 正式上线前需要申请正式商户账号
- ⚠️ 更新 `ALIPAY_GATEWAY` 为正式网关

### 3. API 密钥
- ⚠️ DeepSeek API 密钥有使用限制
- ⚠️ Gemini API 密钥有使用限制
- ⚠️ 监控使用量，避免超额

---

## 🎉 完成！

你的应用现在已经：
- ✅ 上传到 GitHub
- ✅ 部署到 Vercel（前端）
- ✅ 部署到 Railway/Render（后端）
- ✅ 连接到 Supabase（数据库）

### 下一步
1. 测试所有功能
2. 申请正式支付宝账号
3. 配置自定义域名
4. 设置监控和分析

---

## 🆘 常见问题

### Q: 部署失败怎么办？
A: 查看 Vercel/Railway 的部署日志，通常是环境变量配置错误。

### Q: API 连接失败？
A: 检查 CORS 配置，确保前端 URL 在 `ALLOWED_ORIGINS` 中。

### Q: 支付功能不工作？
A: 检查支付宝配置，确保密钥正确，网关地址正确。

---

**准备好了吗？开始上传吧！** 🚀
