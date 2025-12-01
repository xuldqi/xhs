# Vercel 环境变量配置指南

## 📋 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量：

### 1. Supabase 配置

```bash
# Supabase URL
VITE_SUPABASE_URL=https://dwgrurfoxqfoeiwjytbb.supabase.co

# Supabase Anon Key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ
```

### 2. 后端 API 配置

```bash
# 后端 API 地址（使用 Vercel Serverless Functions）
VITE_BACKEND_URL=/api

# 启用代理模式
VITE_USE_PROXY=true

# 代理 URL
VITE_PROXY_URL=/api/ai
```

### 3. Google Analytics 配置

```bash
# Google Analytics Measurement ID
VITE_GA_MEASUREMENT_ID=G-K0X9LM3VPZ
```

### 4. 应用配置

```bash
# 应用名称
VITE_APP_NAME=小红书知识平台

# 应用 URL（部署后更新为实际域名）
VITE_APP_URL=https://your-domain.vercel.app

# 文件上传限制（10MB）
VITE_MAX_FILE_SIZE=10485760
```

### 5. 性能优化配置

```bash
# 启用 PWA
VITE_ENABLE_PWA=true

# 启用压缩
VITE_ENABLE_COMPRESSION=true
```

## 🔧 配置步骤

### 方式一：通过 Vercel Dashboard

1. **访问项目设置**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择你的项目
   - 点击 "Settings" 标签

2. **添加环境变量**
   - 点击左侧菜单的 "Environment Variables"
   - 点击 "Add New"
   - 输入变量名和值
   - 选择环境（Production, Preview, Development）
   - 点击 "Save"

3. **批量导入**
   - 点击 "Add New" 旁边的 "Import" 按钮
   - 粘贴所有环境变量（格式：KEY=VALUE）
   - 点击 "Import"

### 方式二：通过 Vercel CLI

```bash
# 设置单个环境变量
vercel env add VITE_SUPABASE_URL production

# 从文件导入
vercel env pull .env.production
```

## 📝 环境变量说明

### VITE_SUPABASE_URL
- **类型**: String
- **必需**: 是
- **说明**: Supabase 项目的 URL
- **获取方式**: Supabase Dashboard → Settings → API → Project URL

### VITE_SUPABASE_ANON_KEY
- **类型**: String
- **必需**: 是
- **说明**: Supabase 匿名密钥（公开密钥）
- **获取方式**: Supabase Dashboard → Settings → API → Project API keys → anon public

### VITE_BACKEND_URL
- **类型**: String
- **必需**: 是
- **说明**: 后端 API 的基础 URL
- **生产环境**: `/api`（使用 Vercel Serverless Functions）
- **开发环境**: `http://localhost:3001`

### VITE_GA_MEASUREMENT_ID
- **类型**: String
- **必需**: 否（但强烈推荐）
- **说明**: Google Analytics 4 的 Measurement ID
- **获取方式**: Google Analytics → Admin → Data Streams → 选择你的数据流 → Measurement ID

### VITE_APP_URL
- **类型**: String
- **必需**: 否
- **说明**: 应用的完整 URL，用于生成 OG 图片和分享链接
- **示例**: `https://xhs-helper.vercel.app`

## 🔒 安全注意事项

### 公开变量 vs 私密变量

在 Vite 中，所有以 `VITE_` 开头的环境变量都会被打包到前端代码中，因此：

✅ **可以使用 VITE_ 前缀的变量**:
- Supabase Anon Key（公开密钥）
- Google Analytics ID
- 公开的 API 端点
- 应用配置

❌ **不要使用 VITE_ 前缀的变量**:
- Supabase Service Role Key（服务端密钥）
- API 私密密钥
- 数据库密码
- 支付密钥

### 后端环境变量

后端 API 的私密环境变量应该配置在 `backend/.env` 中，不要使用 `VITE_` 前缀：

```bash
# backend/.env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
ALIPAY_PRIVATE_KEY=your-alipay-private-key
```

## 🧪 验证配置

### 1. 本地验证

```bash
# 创建 .env.production.local 文件进行测试
cp .env.production .env.production.local

# 使用生产模式构建
npm run build

# 预览构建结果
npm run preview
```

### 2. 部署后验证

访问以下 URL 检查环境变量是否正确加载：

```javascript
// 在浏览器控制台运行
console.log({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  backendUrl: import.meta.env.VITE_BACKEND_URL,
  gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  appUrl: import.meta.env.VITE_APP_URL
});
```

## 🔄 更新环境变量

### 更新后需要重新部署

环境变量的更改不会自动应用到已部署的版本，需要：

1. **自动重新部署**
   - 在 Vercel Dashboard 中更新环境变量
   - Vercel 会提示是否重新部署
   - 点击 "Redeploy" 按钮

2. **手动触发部署**
   ```bash
   # 使用 CLI
   vercel --prod
   
   # 或推送代码触发
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

## 📊 不同环境的配置

### Production（生产环境）
- 使用真实的 Supabase 项目
- 使用生产域名
- 启用所有优化

### Preview（预览环境）
- 可以使用相同的 Supabase 项目
- 或使用单独的测试项目
- 用于测试新功能

### Development（开发环境）
- 使用本地开发配置
- 通常不需要在 Vercel 中配置

## 🆘 常见问题

### 问题 1: 环境变量未生效

**症状**: 部署后环境变量显示为 undefined

**解决方案**:
1. 确认变量名以 `VITE_` 开头
2. 检查 Vercel Dashboard 中的配置
3. 重新部署项目
4. 清除浏览器缓存

### 问题 2: Supabase 连接失败

**症状**: 无法连接到 Supabase

**解决方案**:
1. 验证 VITE_SUPABASE_URL 格式正确
2. 验证 VITE_SUPABASE_ANON_KEY 有效
3. 检查 Supabase 项目是否暂停
4. 查看浏览器控制台的错误信息

### 问题 3: Google Analytics 不工作

**症状**: GA 不记录数据

**解决方案**:
1. 验证 Measurement ID 格式（G-XXXXXXXXXX）
2. 检查 GA 数据流是否激活
3. 等待 24-48 小时数据可能延迟
4. 使用 GA Debug View 实时查看

## 📚 相关文档

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase 文档](https://supabase.com/docs)

---

**最后更新**: 2024年1月
