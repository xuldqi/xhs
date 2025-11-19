# 🚀 发布检查清单

## 📋 发布前检查

### 1. 代码质量 ✅
- [x] 所有功能已完成
- [x] 认证持久化已修复
- [x] 定价页面布局已修复
- [ ] 代码已通过 ESLint 检查
- [ ] 没有 console.log 调试代码
- [ ] 没有 TODO 注释

### 2. 环境配置 ⚠️
- [ ] 生产环境变量已配置
- [ ] Supabase 生产数据库已设置
- [ ] 支付宝正式商户账号已申请
- [ ] AI API 密钥已配置
- [ ] 域名已购买和配置
- [ ] SSL 证书已配置

### 3. 数据库 ⚠️
- [ ] 生产数据库已初始化
- [ ] RLS 策略已正确配置
- [ ] 套餐配置已添加
- [ ] 数据库备份策略已设置

### 4. 测试 ⚠️
- [ ] 所有功能已手动测试
- [ ] 认证流程已测试
- [ ] 支付流程已测试
- [ ] 移动端适配已测试
- [ ] 跨浏览器兼容性已测试

### 5. 性能优化 ⚠️
- [ ] 图片已压缩
- [ ] 代码已打包优化
- [ ] CDN 已配置
- [ ] 缓存策略已设置

### 6. 安全性 ⚠️
- [ ] API 密钥已保护
- [ ] CORS 已正确配置
- [ ] XSS 防护已实现
- [ ] CSRF 防护已实现
- [ ] 敏感数据已加密

### 7. 监控和日志 ⚠️
- [ ] 错误监控已设置
- [ ] 性能监控已设置
- [ ] 日志系统已配置
- [ ] 告警机制已设置

---

## 🔧 发布步骤

### 步骤 1: 准备生产环境

#### 1.1 配置生产环境变量

**前端 (.env.production)**
```env
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的生产环境匿名密钥
VITE_BACKEND_URL=https://api.你的域名.com
```

**后端 (backend/.env.production)**
```env
# Supabase
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_KEY=你的生产环境服务密钥

# AI 服务
DASHSCOPE_API_KEY=你的通义千问API密钥

# 支付宝（正式环境）
ALIPAY_APP_ID=你的正式应用ID
ALIPAY_PRIVATE_KEY=你的正式私钥
ALIPAY_PUBLIC_KEY=支付宝正式公钥
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

# 服务器配置
NODE_ENV=production
PORT=3000
```

#### 1.2 初始化生产数据库

```bash
# 1. 访问 Supabase 控制台
https://app.supabase.com/project/你的项目ID/sql/new

# 2. 运行初始化 SQL
# 文件: init-database-complete.sql
```

---

### 步骤 2: 构建应用

#### 2.1 构建前端
```bash
cd xiaohongshu-guide-generator

# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建结果在 dist/ 目录
```

#### 2.2 构建后端
```bash
cd backend

# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 构建结果在 dist/ 目录
```

---

### 步骤 3: 部署

#### 选项 A: Vercel 部署（推荐前端）

**前端部署**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

**配置环境变量**
```bash
# 在 Vercel 控制台设置环境变量
# Settings > Environment Variables
```

#### 选项 B: 服务器部署

**前端部署（Nginx）**
```bash
# 1. 上传 dist/ 目录到服务器
scp -r dist/* user@server:/var/www/html/

# 2. 配置 Nginx
# 文件: /etc/nginx/sites-available/xiaohongshu
```

**Nginx 配置示例**
```nginx
server {
    listen 80;
    server_name 你的域名.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 你的域名.com;
    
    # SSL 证书
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 前端静态文件
    root /var/www/html;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
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

**后端部署（PM2）**
```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 上传后端代码到服务器
scp -r backend/* user@server:/var/www/backend/

# 3. 启动应用
cd /var/www/backend
pm2 start dist/index.js --name xiaohongshu-api

# 4. 设置开机自启
pm2 startup
pm2 save
```

#### 选项 C: Docker 部署

**Dockerfile (前端)**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Dockerfile (后端)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    restart: always

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    restart: always
```

---

### 步骤 4: 配置域名和 SSL

#### 4.1 配置域名
```bash
# 添加 DNS 记录
# A 记录: @ -> 你的服务器IP
# A 记录: www -> 你的服务器IP
# A 记录: api -> 你的服务器IP
```

#### 4.2 配置 SSL（Let's Encrypt）
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com

# 自动续期
sudo certbot renew --dry-run
```

---

### 步骤 5: 配置支付宝正式环境

#### 5.1 申请正式商户账号
1. 访问 https://open.alipay.com
2. 注册企业账号
3. 创建应用
4. 提交审核

#### 5.2 配置支付宝
```bash
# 1. 生成密钥对
# 2. 上传公钥到支付宝
# 3. 下载支付宝公钥
# 4. 配置到 backend/.env.production
```

---

### 步骤 6: 设置监控

#### 6.1 错误监控（Sentry）
```bash
# 安装 Sentry
npm install @sentry/vue @sentry/node

# 配置 Sentry
# 前端: src/main.ts
# 后端: backend/src/index.ts
```

#### 6.2 性能监控
```bash
# 使用 Google Analytics
# 或 Umami（开源）
```

#### 6.3 服务器监控
```bash
# 使用 PM2 监控
pm2 monit

# 或使用 Grafana + Prometheus
```

---

## 🧪 发布后测试

### 1. 功能测试
- [ ] 访问生产环境 URL
- [ ] 测试用户注册和登录
- [ ] 测试生成攻略功能
- [ ] 测试支付流程
- [ ] 测试会员功能

### 2. 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 图片加载优化

### 3. 安全测试
- [ ] HTTPS 正常工作
- [ ] API 密钥未泄露
- [ ] XSS 防护有效
- [ ] CSRF 防护有效

---

## 📊 监控指标

### 关键指标
- **可用性**: > 99.9%
- **响应时间**: < 500ms
- **错误率**: < 0.1%
- **并发用户**: 支持 1000+

### 监控工具
- **Uptime**: UptimeRobot
- **性能**: Google PageSpeed Insights
- **错误**: Sentry
- **日志**: PM2 / CloudWatch

---

## 🔄 回滚计划

### 如果发布失败
```bash
# 1. 回滚前端
vercel rollback

# 2. 回滚后端
pm2 restart xiaohongshu-api --update-env

# 3. 回滚数据库
# 使用备份恢复
```

---

## 📝 发布后任务

### 立即任务
- [ ] 监控错误日志
- [ ] 检查性能指标
- [ ] 测试关键功能
- [ ] 通知用户

### 24小时内
- [ ] 收集用户反馈
- [ ] 修复紧急问题
- [ ] 优化性能

### 一周内
- [ ] 分析用户行为
- [ ] 优化转化率
- [ ] 添加新功能

---

## 🎉 发布完成！

恭喜！你的应用已经成功发布。

### 下一步
1. 持续监控应用状态
2. 收集用户反馈
3. 迭代优化功能
4. 扩展用户群

### 需要帮助？
- 查看文档: `DEPLOYMENT.md`
- 查看状态: `STATUS.md`
- 查看问题: `ISSUES_TO_FIX.md`

---

**祝你的应用大获成功！** 🚀
