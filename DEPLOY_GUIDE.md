# 🚀 部署指南 - 完整步骤

## 📋 部署前准备

### 1. 检查环境变量

确保以下环境变量已配置：

```bash
# 前端 (.env)
VITE_SUPABASE_URL=你的Supabase URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_OPENAI_API_KEY=你的OpenAI API密钥
VITE_GA_MEASUREMENT_ID=G-K0X9LM3VPZ
VITE_BACKEND_URL=https://你的后端域名

# 后端 (backend/.env)
SUPABASE_URL=你的Supabase URL
SUPABASE_SERVICE_KEY=你的Supabase服务密钥
OPENAI_API_KEY=你的OpenAI API密钥
ALIPAY_APP_ID=你的支付宝应用ID
ALIPAY_PRIVATE_KEY=你的支付宝私钥
ALIPAY_PUBLIC_KEY=支付宝公钥
PORT=3000
```

### 2. 构建测试

```bash
cd xiaohongshu-guide-generator
npm run build
```

如果构建成功，继续下一步。

## 🌐 方式一：部署到 Vercel（推荐）

### 前端部署

1. **安装 Vercel CLI**（如果还没安装）
```bash
npm i -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署前端**
```bash
cd xiaohongshu-guide-generator
vercel --prod
```

4. **配置环境变量**
   - 访问 Vercel Dashboard
   - 选择你的项目
   - 进入 Settings > Environment Variables
   - 添加所有前端环境变量

### 后端部署

1. **部署后端**
```bash
cd xiaohongshu-guide-generator/backend
vercel --prod
```

2. **配置环境变量**
   - 在 Vercel Dashboard 中添加所有后端环境变量

3. **更新前端环境变量**
   - 将后端部署的 URL 更新到前端的 `VITE_BACKEND_URL`
   - 重新部署前端

## 🐳 方式二：使用 Docker 部署

### 1. 创建 Docker 配置

前端 Dockerfile:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

后端 Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 2. 构建和运行

```bash
# 构建前端
docker build -t xiaohongshu-frontend .

# 构建后端
cd backend
docker build -t xiaohongshu-backend .

# 运行
docker run -d -p 80:80 xiaohongshu-frontend
docker run -d -p 3000:3000 xiaohongshu-backend
```

## ☁️ 方式三：部署到云服务器

### 1. 准备服务器

```bash
# 连接到服务器
ssh user@your-server-ip

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install nginx
```

### 2. 上传代码

```bash
# 在本地打包
cd xiaohongshu-guide-generator
npm run build
tar -czf dist.tar.gz dist

# 上传到服务器
scp dist.tar.gz user@your-server-ip:/var/www/
scp -r backend user@your-server-ip:/var/www/
```

### 3. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 启动后端

```bash
cd /var/www/backend
npm install
pm2 start dist/index.js --name xiaohongshu-backend
pm2 save
pm2 startup
```

### 5. 配置 SSL（可选但推荐）

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## ✅ 部署后验证

### 1. 检查前端

访问你的域名，检查：
- [ ] 页面正常加载
- [ ] 面包屑导航显示正常
- [ ] 所有页面可以访问

### 2. 检查后端

```bash
curl https://your-backend-url/api/health
```

应该返回健康状态。

### 3. 检查数据分析

- [ ] 打开浏览器开发者工具
- [ ] 查看 Console，确认 GA 初始化成功
- [ ] 查看 Network，确认 analytics 请求发送

### 4. 检查功能

- [ ] 用户注册/登录
- [ ] 上传图片
- [ ] 生成指南
- [ ] 导出 PDF
- [ ] 支付功能

## 🔧 常见问题

### 1. 构建失败

```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. 环境变量不生效

- Vercel: 需要在 Dashboard 中配置，然后重新部署
- 服务器: 检查 .env 文件是否存在且格式正确

### 3. CORS 错误

确保后端配置了正确的 CORS：

```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}))
```

### 4. 支付回调失败

确保支付宝配置中的回调 URL 正确：
- 同步回调: `https://your-domain.com/payment/return`
- 异步回调: `https://your-backend-url/api/payment/notify`

## 📊 监控和维护

### 1. 设置监控

- **Vercel Analytics**: 自动启用
- **Google Analytics**: 访问 https://analytics.google.com
- **错误监控**: 考虑使用 Sentry

### 2. 日志查看

Vercel:
```bash
vercel logs
```

PM2:
```bash
pm2 logs xiaohongshu-backend
```

### 3. 性能优化

- 启用 CDN
- 配置缓存策略
- 压缩静态资源
- 使用 HTTP/2

## 🎯 部署检查清单

### 部署前
- [ ] 所有环境变量已配置
- [ ] 本地构建成功
- [ ] 所有测试通过
- [ ] 代码已提交到 Git

### 部署中
- [ ] 前端部署成功
- [ ] 后端部署成功
- [ ] 环境变量已配置
- [ ] DNS 已配置（如果使用自定义域名）

### 部署后
- [ ] 网站可以访问
- [ ] 所有功能正常
- [ ] Analytics 正常工作
- [ ] 支付功能正常
- [ ] SSL 证书有效

## 🚀 快速部署命令

如果你已经配置好所有环境变量，可以使用这个一键部署脚本：

```bash
#!/bin/bash

echo "🚀 开始部署..."

# 构建前端
echo "📦 构建前端..."
cd xiaohongshu-guide-generator
npm run build

# 部署前端到 Vercel
echo "🌐 部署前端..."
vercel --prod

# 部署后端到 Vercel
echo "🔧 部署后端..."
cd backend
vercel --prod

echo "✅ 部署完成！"
echo "📝 请记得在 Vercel Dashboard 中配置环境变量"
```

保存为 `deploy.sh`，然后运行：

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📞 需要帮助？

如果遇到问题：
1. 检查日志文件
2. 查看 Vercel Dashboard 的部署日志
3. 确认所有环境变量正确配置
4. 检查网络和防火墙设置

---

**部署成功后，你的应用就上线了！** 🎉

记得：
- 定期备份数据库
- 监控应用性能
- 收集用户反馈
- 持续优化改进
