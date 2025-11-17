# Vercel 付费系统配置指南

## 🎉 代码已推送到 GitHub

Vercel 会自动检测到更新并开始部署。

## 📋 部署后需要配置的环境变量

### 步骤 1：等待 Vercel 部署完成（2-3分钟）

1. 访问 https://vercel.com/dashboard
2. 找到你的项目
3. 等待部署完成（绿色勾号✅）

### 步骤 2：配置 Supabase 环境变量

1. 在 Vercel Dashboard，点击你的项目
2. 点击 **"Settings"** 标签
3. 点击左侧 **"Environment Variables"**
4. 添加以下变量：

```
VITE_SUPABASE_URL = https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY = 你的anon-public-key
VITE_BACKEND_URL = https://你的后端域名.com
```

**重要**：
- `VITE_BACKEND_URL` 需要指向你的后端服务
- 如果后端还没部署，可以先填 `http://localhost:3001`（仅用于测试）

### 步骤 3：重新部署

添加环境变量后：

1. 点击 **"Deployments"** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 等待重新部署完成

---

## 🚀 部署后端到 Railway（推荐）

前端已经部署到 Vercel，现在需要部署后端。

### 方法 1：使用 Railway（推荐，免费 $5/月）

1. **访问** https://railway.app/
2. **登录** 用 GitHub 账号
3. **点击** "New Project"
4. **选择** "Deploy from GitHub repo"
5. **选择** 你的仓库 `xhs`
6. **配置**：
   - Root Directory: `xiaohongshu-guide-generator/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

7. **添加环境变量**：
   ```
   PORT=3001
   NODE_ENV=production
   DEEPSEEK_API_KEY=你的key
   API_BASE_URL=https://api.deepseek.com
   GEMINI_API_KEY=你的key
   GEMINI_BASE_URL=https://www.packyapi.com
   GEMINI_PROXY_API_KEY=你的key
   SUPABASE_URL=https://你的项目.supabase.co
   SUPABASE_SERVICE_KEY=你的service-role-key
   PAYMENT_API_URL=https://你的备案域名.com
   INTERNAL_API_KEY=你的内部密钥
   FRONTEND_URL=https://你的vercel域名.vercel.app
   BACKEND_URL=https://你的railway域名.railway.app
   ALLOWED_ORIGINS=https://你的vercel域名.vercel.app
   MAX_REQUEST_SIZE=10mb
   ```

8. **部署** Railway 会自动部署
9. **获取域名** 部署完成后，复制 Railway 提供的域名

### 方法 2：使用 Render（免费）

1. 访问 https://render.com/
2. 用 GitHub 登录
3. 点击 "New +" → "Web Service"
4. 选择你的仓库
5. 配置：
   - Name: `xiaohongshu-backend`
   - Root Directory: `xiaohongshu-guide-generator/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. 添加环境变量（同上）
7. 点击 "Create Web Service"

---

## 🔄 更新 Vercel 的后端地址

后端部署完成后：

1. 回到 Vercel Dashboard
2. Settings → Environment Variables
3. 更新 `VITE_BACKEND_URL` 为后端域名：
   ```
   VITE_BACKEND_URL = https://你的railway域名.railway.app
   ```
4. 重新部署 Vercel

---

## ✅ 测试部署

### 1. 测试前端

访问你的 Vercel 域名：
```
https://你的项目.vercel.app
```

应该能看到：
- ✅ 首页正常显示
- ✅ 点击"会员套餐"能看到 4 个套餐
- ✅ 点击"登录/注册"能打开登录页面

### 2. 测试后端

访问后端健康检查：
```
https://你的railway域名.railway.app/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-11-18T...",
  "uptime": 123.45
}
```

### 3. 测试完整流程

1. 在 Vercel 网站注册账号
2. 查看会员信息
3. 尝试生成指南（测试权限限制）

---

## 🐛 常见问题

### Q1: Vercel 部署失败

**原因**：依赖安装失败或构建错误

**解决**：
1. 查看 Vercel 部署日志
2. 检查 `package.json` 是否正确
3. 确保所有依赖都在 `dependencies` 中

### Q2: 前端无法连接后端

**原因**：CORS 配置或后端地址错误

**解决**：
1. 检查 `VITE_BACKEND_URL` 是否正确
2. 检查后端 `ALLOWED_ORIGINS` 包含 Vercel 域名
3. 打开浏览器控制台查看错误

### Q3: 登录后提示 "Failed to fetch"

**原因**：Supabase 配置错误

**解决**：
1. 检查 Vercel 环境变量中的 Supabase 配置
2. 确保 Supabase 项目正常运行
3. 检查 Supabase 数据库脚本是否执行

### Q4: Railway 部署失败

**原因**：构建命令或环境变量错误

**解决**：
1. 确保 Root Directory 设置为 `xiaohongshu-guide-generator/backend`
2. 检查所有环境变量是否填写
3. 查看 Railway 部署日志

---

## 📊 部署架构

```
用户浏览器
    ↓
Vercel (前端)
    ↓
Railway/Render (后端)
    ↓
Supabase (数据库)
    ↓
备案域名 (支付 API)
    ↓
支付宝
```

---

## 💰 成本估算

- **Vercel**: 免费（Hobby 计划）
- **Railway**: 免费 $5/月额度
- **Supabase**: 免费（Free 计划）
- **总计**: $0/月（免费额度内）

---

## 🎯 下一步

部署完成后：

1. ✅ 配置 Supabase（创建项目、执行脚本）
2. ✅ 测试注册登录
3. ✅ 测试权限控制
4. ⏳ 配置支付宝（可选）
5. ⏳ 自定义域名（可选）

---

**部署文档**：
- 详细部署指南：`DEPLOYMENT.md`
- 付费系统配置：`PAYMENT_QUICKSTART.md`
- 测试指南：`TEST_PAYMENT.md`

**祝你部署顺利！** 🚀
