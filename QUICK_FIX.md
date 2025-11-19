# 🚨 快速修复：套餐不存在错误

## 问题
```json
{ "error": "套餐不存在" }
```

## 原因
✅ **已确认**：你的 `backend/.env` 使用了错误的 Supabase Key（`anon` key 而不是 `service_role` key）

## 修复步骤（3分钟）

### 1️⃣ 获取正确的 Key

访问：https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/settings/api

找到 **Project API keys** 部分：
- ❌ `anon` `public` - 当前使用的（错误）
- ✅ `service_role` `secret` - 需要复制这个

### 2️⃣ 更新配置

打开 `backend/.env`，找到这一行：

```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ
```

替换为你从 Supabase Dashboard 复制的 `service_role` key。

### 3️⃣ 重启后端

```bash
cd backend
npm run dev
```

### 4️⃣ 测试

访问：http://localhost:5173/pricing

尝试购买任意套餐，应该可以正常工作了！

## 为什么会出现这个问题？

- `anon` key：受 RLS (Row Level Security) 限制，只能访问有权限的数据
- `service_role` key：绕过 RLS，可以访问所有数据（后端需要）

后端需要查询 `plan_configs` 表，但这个表的 RLS 策略只允许 SELECT，`anon` key 可能无法正确访问。

## 还是不行？

运行诊断脚本：
```bash
./diagnose-payment-error.sh
```

查看详细文档：
```bash
cat FIX_PLAN_ERROR.md
```

## 安全提示

⚠️ `service_role` key 是敏感信息：
- 不要提交到 Git
- 不要分享给他人
- 确保 `.gitignore` 包含 `backend/.env`
