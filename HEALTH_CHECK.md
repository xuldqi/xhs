# 健康检查系统文档

## 概述

健康检查系统提供了完整的配置验证和服务状态监控功能，帮助快速诊断和解决 Supabase、支付宝、DeepSeek 和 Gemini 等服务的配置问题。

## API 端点

### 1. 基础健康检查

**端点**: `GET /api/health`

**描述**: 快速返回系统整体状态和各服务的基本状态信息。

**响应时间**: < 500ms

**响应示例**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "services": {
    "supabase": {
      "status": "ok",
      "message": "Supabase connection successful"
    },
    "alipay": {
      "status": "ok",
      "message": "Alipay configuration is valid"
    },
    "deepseek": {
      "status": "ok",
      "message": "DeepSeek configuration is valid"
    },
    "gemini": {
      "status": "ok",
      "message": "Gemini configuration is valid"
    }
  }
}
```

**状态码**:
- `200`: 所有服务正常
- `503`: 一个或多个服务异常

### 2. 详细健康检查

**端点**: `GET /api/health/detailed`

**描述**: 返回所有服务的详细诊断信息、配置状态和修复建议。

**响应时间**: < 2000ms

**响应示例**:

```json
{
  "status": "degraded",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "services": {
    "supabase": {
      "status": "ok",
      "message": "Supabase is healthy"
    },
    "alipay": {
      "status": "error",
      "message": "Alipay has issues"
    },
    "deepseek": {
      "status": "ok",
      "message": "DeepSeek is healthy"
    },
    "gemini": {
      "status": "ok",
      "message": "Gemini is healthy"
    }
  },
  "diagnostics": {
    "supabase": {
      "connected": true,
      "projectId": "dwgrurfoxqfoeiwjytbb",
      "region": "unknown",
      "latency": 123,
      "configStatus": {
        "urlConfigured": true,
        "keyConfigured": true,
        "urlValid": true,
        "keyValid": true
      }
    },
    "alipay": {
      "initialized": false,
      "appIdConfigured": true,
      "privateKeyConfigured": false,
      "publicKeyConfigured": true,
      "gatewayReachable": true,
      "keyFormat": {
        "privateKeyValid": false,
        "publicKeyValid": true
      }
    },
    "deepseek": {
      "available": true,
      "apiKeyConfigured": true,
      "baseUrlConfigured": true,
      "authenticated": true
    },
    "gemini": {
      "available": true,
      "apiKeyConfigured": true,
      "proxyConfigured": true,
      "authenticated": true
    }
  },
  "configuration": {
    "allRequired": false,
    "missing": ["ALIPAY_PRIVATE_KEY"],
    "invalid": [],
    "warnings": []
  },
  "recommendations": [
    {
      "severity": "critical",
      "service": "alipay",
      "issue": "ALIPAY_PRIVATE_KEY is not configured",
      "solution": "Add ALIPAY_PRIVATE_KEY to your .env file. Generate using Alipay key generation tool (PKCS8 format, without BEGIN/END markers)",
      "documentation": "https://opendocs.alipay.com/common/02kipl"
    }
  ]
}
```

### 3. 清除缓存

**端点**: `POST /api/health/clear-cache`

**描述**: 清除健康检查结果缓存，强制下次检查重新执行。

**响应示例**:

```json
{
  "success": true,
  "message": "Health check cache cleared"
}
```

## 启动时配置检查

应用启动时会自动执行配置检查，并在控制台输出详细信息：

```
🔍 Checking configuration...

❌ Configuration errors found:

  ✗ ALIPAY_PRIVATE_KEY: Alipay private key is required
    Expected: PKCS8 format RSA private key (without BEGIN/END markers)

💡 Fix suggestions:

ALIPAY_PRIVATE_KEY:
  1. Generate RSA key pair using Alipay tools
  2. Copy the private key content (PKCS8 format)
  3. Remove BEGIN/END markers
  4. Remove all line breaks
  5. Add to .env file: ALIPAY_PRIVATE_KEY=your-key
  Example: ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEF...

📋 Configuration Summary:
  Supabase:  ✓
  Alipay:    ✗
  DeepSeek:  ✓
  Gemini:    ✓
```

## 常见配置问题排查

### Supabase 连接失败

**症状**: `Supabase connection failed` 或 `Connection timeout`

**可能原因**:
1. SUPABASE_URL 或 SUPABASE_SERVICE_KEY 未配置
2. URL 或密钥格式错误
3. 网络连接问题
4. Supabase 项目未激活

**解决方案**:
1. 访问 https://supabase.com/
2. 登录并选择你的项目
3. 进入 Settings → API
4. 复制 Project URL 和 service_role key
5. 更新 .env 文件：
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 支付宝配置错误

**症状**: `Alipay key format is invalid` 或 `Alipay configuration is incomplete`

**可能原因**:
1. 密钥格式不正确（包含 BEGIN/END 标记或换行符）
2. 使用了错误的密钥格式（非 PKCS8）
3. APP ID 格式错误

**解决方案**:
1. 确保使用 PKCS8 格式的私钥
2. 移除所有 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----` 标记
3. 移除所有换行符，密钥应该是一行
4. APP ID 应该是 16-20 位数字
5. 更新 .env 文件：
   ```
   ALIPAY_APP_ID=9021000157676998
   ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEF...（一行，无空格）
   ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEF...（一行，无空格）
   ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
   ```

### DeepSeek API 配置错误

**症状**: `DeepSeek API key format may be invalid`

**可能原因**:
1. API 密钥格式不正确
2. 基础 URL 配置错误

**解决方案**:
1. 访问 https://platform.deepseek.com/
2. 登录并创建 API 密钥
3. 密钥应该以 `sk-` 开头
4. 更新 .env 文件：
   ```
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   API_BASE_URL=https://api.deepseek.com
   ```

### Gemini API 配置错误

**症状**: `Gemini API key format may be invalid`

**可能原因**:
1. API 密钥格式不正确
2. 代理配置缺失

**解决方案**:
1. 访问 https://makersuite.google.com/app/apikey
2. 使用 Google 账号登录
3. 创建新的 API 密钥
4. 密钥应该以 `AIzaSy` 开头
5. 更新 .env 文件：
   ```
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GEMINI_BASE_URL=https://generativelanguage.googleapis.com
   # 或使用代理
   GEMINI_BASE_URL=https://your-proxy.com
   GEMINI_PROXY_API_KEY=your-proxy-key
   ```

## 使用示例

### 在代码中调用健康检查

```typescript
// 基础健康检查
const response = await fetch('http://localhost:3001/api/health')
const health = await response.json()

if (health.status === 'healthy') {
  console.log('All services are healthy')
} else {
  console.warn('Some services have issues:', health.services)
}

// 详细健康检查
const detailedResponse = await fetch('http://localhost:3001/api/health/detailed')
const detailedHealth = await detailedResponse.json()

// 显示修复建议
detailedHealth.recommendations.forEach(rec => {
  if (rec.severity === 'critical') {
    console.error(`${rec.service}: ${rec.issue}`)
    console.log(`Solution: ${rec.solution}`)
  }
})
```

### 在前端显示健康状态

```javascript
async function checkHealth() {
  try {
    const response = await fetch('/api/health/detailed')
    const health = await response.json()
    
    // 更新 UI
    document.getElementById('status').textContent = health.status
    document.getElementById('supabase').className = 
      health.services.supabase.status === 'ok' ? 'healthy' : 'unhealthy'
    document.getElementById('alipay').className = 
      health.services.alipay.status === 'ok' ? 'healthy' : 'unhealthy'
    
    // 显示建议
    const suggestions = health.recommendations
      .filter(r => r.severity === 'critical')
      .map(r => `${r.service}: ${r.solution}`)
      .join('\n')
    
    if (suggestions) {
      document.getElementById('suggestions').textContent = suggestions
    }
  } catch (error) {
    console.error('Health check failed:', error)
  }
}

// 每 30 秒检查一次
setInterval(checkHealth, 30000)
```

## 缓存机制

健康检查结果会被缓存以提高性能：

- **基础健康检查**: 缓存 30 秒
- **详细健康检查**: 缓存 60 秒

如需强制刷新，可以调用清除缓存端点：

```bash
curl -X POST http://localhost:3001/api/health/clear-cache
```

## 性能考虑

- 基础健康检查设计为快速响应（< 500ms）
- 详细健康检查可能需要更长时间（< 2000ms）
- 所有服务检查并行执行以提高效率
- 使用缓存避免频繁的外部服务调用
- 超时控制防止长时间等待

## 监控和告警

建议设置定期健康检查监控：

```bash
# 使用 cron 每 5 分钟检查一次
*/5 * * * * curl -f http://localhost:3001/api/health || echo "Health check failed"
```

或使用专业的监控服务（如 UptimeRobot、Pingdom）监控健康检查端点。

## 故障排除

如果健康检查本身失败：

1. 检查后端服务是否正常运行
2. 检查端口 3001 是否被占用
3. 查看后端日志获取详细错误信息
4. 确保所有依赖包已正确安装
5. 尝试重启后端服务

## 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [支付宝开放平台](https://open.alipay.com/)
- [DeepSeek 平台](https://platform.deepseek.com/)
- [Google AI Studio](https://makersuite.google.com/)
