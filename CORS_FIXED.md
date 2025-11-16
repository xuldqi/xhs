# CORS 问题已修复 ✅

## 问题描述
前端在调用后端 API 时遇到 CORS 错误：
```
Access to fetch at 'http://localhost:3001/api/ai/generate' from origin 'http://localhost:5176' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check
```

## 解决方案

### 1. 更新后端 CORS 配置
在 `backend/src/index.ts` 中添加了完整的 CORS 选项：

```typescript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24小时
}))
```

### 2. 更新允许的源
在 `backend/.env` 中添加了所有可能的前端端口：

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
```

### 3. 验证修复
使用 curl 测试 OPTIONS 预检请求：

```bash
curl -X OPTIONS http://localhost:3001/api/ai/generate \
  -H "Origin: http://localhost:5176" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

响应包含正确的 CORS 头：
```
Access-Control-Allow-Origin: http://localhost:5176
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 86400
```

## 当前运行状态

✅ **后端服务：** http://localhost:3001/ (运行中)  
✅ **前端应用：** http://localhost:5176/ (运行中)  
✅ **CORS 配置：** 已正确配置  
✅ **API Key：** 已配置并可用

## 测试步骤

1. 访问前端：http://localhost:5176/
2. 上传小红书主页截图
3. 确认账号信息
4. 生成指南（应该可以正常调用 API）

## 注意事项

如果前端端口再次改变（例如变成 5177），需要：

1. 更新 `backend/.env` 文件，添加新端口到 `ALLOWED_ORIGINS`
2. 重启后端服务：
   ```bash
   cd backend
   npm run dev
   ```

或者，可以使用通配符配置（不推荐用于生产环境）：
```typescript
app.use(cors({
  origin: true, // 允许所有源（仅开发环境）
  credentials: true
}))
```

---

**修复时间：** 2024年11月17日  
**状态：** ✅ 已解决
