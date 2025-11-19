# 🔑 获取 Supabase Service Role Key

## 快速步骤

1. **访问 Supabase Dashboard**
   
   打开浏览器，访问：
   ```
   https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/settings/api
   ```

2. **找到 Project API keys 部分**
   
   在页面中找到 "Project API keys" 区域，你会看到两个 key：
   
   ```
   ┌─────────────────────────────────────────┐
   │ Project API keys                        │
   ├─────────────────────────────────────────┤
   │                                         │
   │ anon public                             │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
   │ [Copy]                                  │
   │                                         │
   │ service_role secret ⚠️                  │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
   │ [Copy]                                  │
   │                                         │
   └─────────────────────────────────────────┘
   ```

3. **复制 service_role key**
   
   点击 **service_role** 旁边的 **[Copy]** 按钮（不是 anon 的）

4. **更新 backend/.env**
   
   打开 `backend/.env` 文件，找到这一行：
   ```bash
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ
   ```
   
   替换为你刚才复制的 service_role key：
   ```bash
   SUPABASE_SERVICE_KEY=<粘贴你复制的 service_role key>
   ```

5. **保存并重启后端**
   ```bash
   cd backend
   npm run dev
   ```

6. **测试**
   访问 http://localhost:5173/pricing 并尝试购买套餐

## 如何识别正确的 key？

- ❌ **anon key** - 包含 `"role":"anon"`
- ✅ **service_role key** - 包含 `"role":"service_role"`

你可以在 https://jwt.io 解码 JWT token 来验证。

## 完成后

运行诊断脚本确认修复：
```bash
./diagnose-payment-error.sh
```

应该看到：
```
✅ SUPABASE_SERVICE_KEY 使用的是 service_role key（正确）
```
