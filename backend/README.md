# 小红书涨粉指南生成器 - 后端服务

这是一个简单的 Node.js + Express 后端服务，用于代理 AI API 请求，保护 API Key 不被暴露。

## 功能

- 🔒 安全地代理 DeepSeek API 请求
- 🚀 支持图像分析和内容生成
- 📊 请求日志和错误处理
- 🌐 CORS 跨域支持

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
PORT=3001
DEEPSEEK_API_KEY=sk-your-api-key-here
API_BASE_URL=https://api.deepseek.com
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## API 接口

### 健康检查

```
GET /health
```

### 图像分析

```
POST /api/ai/analyze
Content-Type: application/json

{
  "prompt": "分析这张图片...",
  "image": "base64_encoded_image"
}
```

### 内容生成

```
POST /api/ai/generate
Content-Type: application/json

{
  "systemPrompt": "你是一位专家...",
  "userPrompt": "请生成..."
}
```

### 测试接口

```
GET /api/ai/test
```

## 部署

### 方式 1：使用 PM2（推荐）

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name xiaohongshu-backend
```

### 方式 2：使用 Docker

```bash
docker build -t xiaohongshu-backend .
docker run -p 3001:3001 --env-file .env xiaohongshu-backend
```

### 方式 3：部署到云服务

- **Railway**: 直接连接 GitHub 仓库，自动部署
- **Render**: 免费套餐，支持自动部署
- **Heroku**: 经典 PaaS 平台
- **阿里云/腾讯云**: 使用云服务器或容器服务

## 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务器端口 | 3001 |
| NODE_ENV | 运行环境 | development |
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | - |
| API_BASE_URL | API 基础地址 | https://api.deepseek.com |
| ALLOWED_ORIGINS | 允许的前端域名（逗号分隔） | http://localhost:5173 |
| MAX_REQUEST_SIZE | 最大请求体大小 | 10mb |

## 安全建议

1. ✅ 永远不要将 `.env` 文件提交到 Git
2. ✅ 在生产环境使用 HTTPS
3. ✅ 配置正确的 CORS 白名单
4. ✅ 定期更换 API Key
5. ✅ 添加请求频率限制（可选）
6. ✅ 使用环境变量管理敏感信息

## 故障排查

### 问题：CORS 错误

确保前端域名在 `ALLOWED_ORIGINS` 中。

### 问题：API Key 无效

检查 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确。

### 问题：端口被占用

修改 `.env` 中的 `PORT` 为其他端口。

## 开发

```bash
# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 技术栈

- Node.js 20+
- Express 4
- TypeScript 5
- node-fetch 3
- CORS
- dotenv
