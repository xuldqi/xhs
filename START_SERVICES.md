# 🚀 启动服务指南

## 当前运行状态

✅ **后端服务**: http://localhost:3001 (运行中)
✅ **前端服务**: http://localhost:5174 (运行中)

## 访问应用

### 主页
```
http://localhost:5174
```

### 定价页面（测试支付）
```
http://localhost:5174/pricing
```

### 后端 API
```
http://localhost:3001/api
```

## 如果服务没有运行

### 启动前端
```bash
cd xiaohongshu-guide-generator
npm run dev
```

### 启动后端
```bash
cd xiaohongshu-guide-generator/backend
npm run dev
```

## 端口说明

- **5174** - 前端 Vite 开发服务器
- **3001** - 后端 Express 服务器
- **8080** - 静态文件服务器（如果需要）

## 下一步

1. ✅ 前端和后端都已启动
2. ⏳ 需要初始化数据库（参考 INIT_DATABASE.md）
3. 🧪 测试支付功能

## 快速测试

访问定价页面测试支付：
```
http://localhost:5174/pricing
```

如果看到"套餐不存在"错误，说明还需要初始化数据库。
