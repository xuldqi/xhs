# 开发环境设置指南

## 🚀 快速启动

### 方法 1：使用启动脚本（推荐）

```bash
./dev.sh
```

这会自动启动前端和后端服务器。

### 方法 2：手动启动

**终端 1 - 启动后端：**
```bash
cd backend
npm run dev
```

**终端 2 - 启动前端：**
```bash
npm run dev
```

## 📡 服务地址

- **前端开发服务器**：http://localhost:5174
- **后端 API 服务器**：http://localhost:3001
- **API 代理路径**：`/api/ai` → `http://localhost:3001/api/ai`

## 🔧 配置说明

### Vite 代理配置

在 `vite.config.ts` 中配置了 API 代理：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false
    }
  }
}
```

这样前端的 `/api/ai` 请求会自动转发到后端服务器。

### 环境变量

**前端 (`.env`)：**
```env
VITE_USE_PROXY=true
VITE_PROXY_URL=/api/ai
```

**后端 (`backend/.env`)：**
```env
PORT=3001
DEEPSEEK_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
GEMINI_PROXY_API_KEY=your_key_here
```

## 🐛 常见问题

### 1. API 404 错误

**问题**：前端请求 `/api/ai` 返回 404

**原因**：
- 后端服务器未启动
- Vite 代理配置未生效（需要重启前端服务器）

**解决**：
1. 确保后端服务器在运行：`cd backend && npm run dev`
2. 重启前端服务器以应用代理配置

### 2. CORS 错误

**问题**：跨域请求被阻止

**原因**：后端 CORS 配置不正确

**解决**：检查 `backend/src/index.ts` 中的 CORS 配置，确保包含前端地址：
```typescript
const allowedOrigins = [
  'http://localhost:5174',
  // ...
]
```

### 3. 环境变量未加载

**问题**：API Key 未配置

**解决**：
1. 复制 `.env.example` 为 `.env`
2. 填入真实的 API Key
3. 重启服务器

## 📝 开发流程

1. **启动服务**：运行 `./dev.sh` 或手动启动两个服务器
2. **访问应用**：打开 http://localhost:5174
3. **测试功能**：上传图片 → 分析 → 生成指南
4. **查看日志**：
   - 前端：浏览器控制台
   - 后端：终端输出

## 🔄 热更新

- **前端**：Vite 自动热更新，修改代码后立即生效
- **后端**：使用 `tsx watch`，修改代码后自动重启

## 📦 依赖安装

如果是首次运行，需要安装依赖：

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

## 🚢 部署说明

开发环境使用本地后端服务器，生产环境使用 Vercel Serverless Functions。

**生产环境**：
- 前端：Vercel 静态托管
- 后端：`api/ai.ts` Serverless Function
- 无需手动启动后端服务器

**开发环境**：
- 前端：Vite Dev Server (5174)
- 后端：Express Server (3001)
- 通过 Vite 代理连接

## ✅ 检查清单

启动前确认：
- [ ] Node.js 已安装（v18+）
- [ ] 依赖已安装（`npm install`）
- [ ] 环境变量已配置（`.env` 和 `backend/.env`）
- [ ] 端口 5174 和 3001 未被占用

---

**提示**：如果遇到问题，先检查两个服务器是否都在运行，然后查看控制台日志。
