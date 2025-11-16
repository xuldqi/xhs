# 快速开始指南

## 🚀 5分钟快速启动

### 步骤 1：启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 编辑 .env 文件，填入你的 DeepSeek API Key
# DEEPSEEK_API_KEY=sk-your-api-key-here

# 启动后端服务
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

### 步骤 2：启动前端服务

打开新的终端窗口：

```bash
# 回到项目根目录
cd ..

# 启动前端（如果还没启动）
npm run dev
```

前端将在 `http://localhost:5173` 或 `http://localhost:5174` 启动。

### 步骤 3：测试

1. 打开浏览器访问前端地址
2. 上传一张小红书主页截图
3. 系统会自动调用后端 API 进行分析和生成

## 📋 完整流程

```
用户浏览器 → 前端(Vue) → 后端(Express) → DeepSeek API
     ↑                                            ↓
     └──────────────── 返回结果 ──────────────────┘
```

## 🔑 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 Key 到 `backend/.env` 文件中

## ⚙️ 配置说明

### 后端配置 (`backend/.env`)

```env
PORT=3001                                    # 后端端口
DEEPSEEK_API_KEY=sk-xxx                     # DeepSeek API Key
API_BASE_URL=https://api.deepseek.com       # API 地址
ALLOWED_ORIGINS=http://localhost:5173       # 允许的前端域名
```

### 前端配置 (`.env`)

```env
VITE_USE_PROXY=true                         # 使用代理模式
VITE_PROXY_URL=http://localhost:3001/api/ai # 后端地址
VITE_MAX_FILE_SIZE=10485760                 # 最大文件大小
```

## 🐛 常见问题

### 问题 1：CORS 错误

**症状**：浏览器控制台显示 CORS 错误

**解决**：
1. 检查后端 `.env` 中的 `ALLOWED_ORIGINS` 是否包含前端地址
2. 确保后端服务正在运行

### 问题 2：API Key 无效

**症状**：返回 401 或 403 错误

**解决**：
1. 检查 `backend/.env` 中的 `DEEPSEEK_API_KEY` 是否正确
2. 确认 API Key 是否有效且有余额

### 问题 3：连接被拒绝

**症状**：`ERR_CONNECTION_REFUSED`

**解决**：
1. 确认后端服务是否启动（`npm run dev` 在 backend 目录）
2. 检查端口是否被占用
3. 确认前端 `.env` 中的 `VITE_PROXY_URL` 地址正确

### 问题 4：图片上传失败

**症状**：上传后没有反应或报错

**解决**：
1. 检查图片大小是否超过 10MB
2. 确认图片格式为 PNG/JPG/JPEG
3. 查看浏览器控制台和后端日志

## 📊 测试 API

### 测试后端健康状态

```bash
curl http://localhost:3001/health
```

### 测试 AI 接口

```bash
curl http://localhost:3001/api/ai/test
```

## 🎯 下一步

- 查看 [部署文档](./DEPLOYMENT.md) 了解如何部署到生产环境
- 查看 [后端 README](./backend/README.md) 了解更多后端配置
- 查看 [主 README](./README.md) 了解项目详情

## 💡 提示

- 开发时可以同时打开两个终端，一个运行后端，一个运行前端
- 后端使用 `tsx watch` 支持热重载，修改代码会自动重启
- 前端使用 Vite HMR，修改代码会立即更新
- 建议使用 VS Code 的多终端功能方便管理
