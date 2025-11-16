# 部署指南

本文档介绍如何将应用部署到生产环境。

## 🎯 部署架构

```
前端（Vercel/Netlify） → 后端（Railway/Render） → DeepSeek API
```

## 方案 1：Vercel + Railway（推荐）

### 部署后端到 Railway

1. **注册 Railway**
   - 访问 [railway.app](https://railway.app/)
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置环境变量**
   ```
   DEEPSEEK_API_KEY=sk-your-api-key
   API_BASE_URL=https://api.deepseek.com
   ALLOWED_ORIGINS=https://yourdomain.vercel.app
   PORT=3001
   NODE_ENV=production
   ```

4. **配置构建**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

5. **获取后端 URL**
   - 部署完成后，Railway 会提供一个 URL
   - 例如：`https://your-app.railway.app`

### 部署前端到 Vercel

1. **注册 Vercel**
   - 访问 [vercel.com](https://vercel.com/)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - Root Directory: 留空（项目根目录）

3. **配置环境变量**
   ```
   VITE_USE_PROXY=true
   VITE_PROXY_URL=https://your-app.railway.app/api/ai
   VITE_MAX_FILE_SIZE=10485760
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

5. **更新后端 CORS**
   - 回到 Railway，更新 `ALLOWED_ORIGINS`
   - 添加你的 Vercel 域名：`https://your-app.vercel.app`

## 方案 2：Netlify + Render

### 部署后端到 Render

1. **注册 Render**
   - 访问 [render.com](https://render.com/)
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 仓库

3. **配置服务**
   - Name: `xiaohongshu-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **添加环境变量**
   ```
   DEEPSEEK_API_KEY=sk-your-api-key
   API_BASE_URL=https://api.deepseek.com
   ALLOWED_ORIGINS=https://yourdomain.netlify.app
   NODE_ENV=production
   ```

5. **部署并获取 URL**

### 部署前端到 Netlify

1. **注册 Netlify**
   - 访问 [netlify.com](https://www.netlify.com/)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub 仓库

3. **配置构建**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **配置环境变量**
   ```
   VITE_USE_PROXY=true
   VITE_PROXY_URL=https://your-app.onrender.com/api/ai
   VITE_MAX_FILE_SIZE=10485760
   ```

5. **部署**

## 方案 3：使用 Docker

### 创建 Dockerfile（后端）

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 部署到任意支持 Docker 的平台

```bash
# 构建镜像
docker build -t xiaohongshu-backend ./backend

# 运行容器
docker run -p 3001:3001 \
  -e DEEPSEEK_API_KEY=sk-xxx \
  -e API_BASE_URL=https://api.deepseek.com \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  xiaohongshu-backend
```

## 方案 4：传统服务器部署

### 使用 PM2

```bash
# 在服务器上
cd backend
npm install
npm run build

# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/index.js --name xiaohongshu-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 安全检查清单

部署前请确认：

- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] API Key 通过环境变量配置，未硬编码
- [ ] CORS 白名单已正确配置
- [ ] 使用 HTTPS（生产环境必须）
- [ ] 后端日志不输出敏感信息
- [ ] 设置了合理的请求大小限制
- [ ] 考虑添加请求频率限制

## 📊 监控和日志

### Railway/Render

- 平台自带日志查看功能
- 可以查看实时日志和历史日志

### 自建服务器

使用 PM2 查看日志：

```bash
pm2 logs xiaohongshu-backend
pm2 monit
```

## 💰 成本估算

### 免费方案

- **前端**: Vercel/Netlify 免费套餐
- **后端**: Railway 免费 $5/月额度 或 Render 免费套餐
- **AI API**: DeepSeek 按使用量计费

### 预估成本

- 前端：$0（免费套餐足够）
- 后端：$0-5/月（取决于流量）
- AI API：约 $0.001/次请求（DeepSeek 很便宜）

**总计**：每月 $5-10 可以支持中等流量

## 🚀 持续部署

### 自动部署

Vercel/Netlify/Railway 都支持：
- Push 到 main 分支自动部署
- Pull Request 预览部署
- 回滚到历史版本

### 手动部署

```bash
# 前端
npm run build
# 上传 dist 目录到服务器

# 后端
cd backend
npm run build
pm2 restart xiaohongshu-backend
```

## 📝 部署后测试

1. **测试后端健康**
   ```bash
   curl https://your-backend.com/health
   ```

2. **测试 CORS**
   - 在浏览器打开前端
   - 打开开发者工具
   - 上传图片测试

3. **测试完整流程**
   - 上传 → 分析 → 生成 → 导出

## 🆘 故障排查

### 前端无法连接后端

1. 检查 `VITE_PROXY_URL` 是否正确
2. 检查后端是否正常运行
3. 检查 CORS 配置

### 后端 API 调用失败

1. 检查 `DEEPSEEK_API_KEY` 是否正确
2. 检查 API 余额
3. 查看后端日志

### 部署后性能问题

1. 检查服务器资源使用
2. 考虑添加 CDN
3. 优化图片大小
4. 添加请求缓存

## 📚 相关文档

- [Railway 文档](https://docs.railway.app/)
- [Vercel 文档](https://vercel.com/docs)
- [Render 文档](https://render.com/docs)
- [Netlify 文档](https://docs.netlify.com/)
