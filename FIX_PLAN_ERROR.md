# 修复"套餐不存在"错误 ❌ → ✅

## 问题描述

当用户尝试购买套餐时，后端返回错误：
```json
{
  "error": "套餐不存在"
}
```

## 🔍 根本原因（已找到！）

**你的 `backend/.env` 文件中使用了错误的 Supabase Key！**

当前配置：
```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 这是 anon key，不是 service_role key！
```

**问题**：`anon` key 受 RLS (Row Level Security) 策略限制，无法访问某些表。后端需要使用 `service_role` key 来绕过 RLS 策略。

## 原因分析

这个错误发生在 `backend/src/routes/payment.ts` 的 `/create-order` 接口中，可能的原因：

1. ✅ **使用了错误的 Supabase Key（最可能）**
2. **数据库中 `plan_configs` 表没有数据**
3. **RLS (Row Level Security) 策略阻止了查询**

## 🚀 快速修复步骤

### 步骤 1: 获取正确的 Supabase Service Role Key

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目：`dwgrurfoxqfoeiwjytbb`
3. 点击左侧菜单的 **Settings** → **API**
4. 在 **Project API keys** 部分找到：
   - ❌ `anon` `public` - 这是你当前使用的（错误）
   - ✅ `service_role` `secret` - 这是你需要的（正确）
5. 点击 `service_role` key 旁边的 **Copy** 按钮

### 步骤 2: 更新 backend/.env 文件

打开 `backend/.env` 文件，替换 `SUPABASE_SERVICE_KEY` 的值：

```bash
# 修改前（错误）
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDY3MTUsImV4cCI6MjA3ODk4MjcxNX0.mnxt7CxyLCudn8awQfqzqmUKNmXQMlfF8LGwmmxOZpQ

# 修改后（正确）
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3J1cmZveHFmb2Vpd2p5dGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQwNjcxNSwiZXhwIjoyMDc4OTgyNzE1fQ.YOUR_ACTUAL_SERVICE_ROLE_KEY
```

**重要**: 
- 必须使用 `service_role` key，因为它可以绕过 RLS 策略
- `service_role` key 是敏感信息，不要提交到 Git
- 确保 `.gitignore` 包含 `backend/.env`

### 步骤 3: 重启后端服务

```bash
cd backend
npm run dev
```

### 步骤 4: 初始化套餐配置数据（如果还没有）

有两种方法：

#### 方法 A: 使用 Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query**
5. 复制 `fix-plan-configs.sql` 的内容并粘贴
6. 点击 **Run** 执行

#### 方法 B: 使用命令行

如果你有数据库连接字符串：

```bash
psql $DATABASE_URL -f fix-plan-configs.sql
```

### 步骤 5: 验证修复

运行检查脚本：

```bash
./check-plan-configs.sh
```

或手动验证：

1. 在 Supabase Dashboard 中打开 **Table Editor**
2. 选择 `plan_configs` 表
3. 确认有 4 条记录：
   - `free` - 免费体验 (¥0)
   - `basic` - 基础会员 (¥29.9)
   - `pro` - 专业会员 (¥99)
   - `lifetime` - 终身会员 (¥299)

### 步骤 6: 测试支付流程

1. 重启后端服务：
   ```bash
   cd backend
   npm run dev
   ```

2. 访问前端定价页面：
   ```
   http://localhost:5173/pricing
   ```

3. 尝试购买任意套餐

## 常见问题

### Q1: 执行 SQL 后仍然报错

**检查项**:
- 确认使用的是 `service_role` key，不是 `anon` key
- 检查 RLS 策略是否正确设置
- 查看后端日志中的详细错误信息

### Q2: Supabase 连接失败

**检查项**:
```bash
# 测试 Supabase 连接
curl -H "apikey: YOUR_SERVICE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_KEY" \
     "https://your-project.supabase.co/rest/v1/plan_configs"
```

### Q3: 如何查看详细错误日志

在后端代码中，错误会被记录到控制台：

```bash
cd backend
npm run dev
# 查看控制台输出
```

## 预防措施

为了避免将来出现类似问题：

1. **在部署前运行初始化脚本**
   - 将 `fix-plan-configs.sql` 添加到部署流程中

2. **添加健康检查**
   - 后端已经有 `/api/payment/check-config` 接口
   - 可以在启动时自动检查配置

3. **使用环境变量验证**
   - 在 `backend/src/index.ts` 启动时验证必要的环境变量

## 相关文件

- `fix-plan-configs.sql` - 修复脚本
- `check-plan-configs.sh` - 检查脚本
- `backend/src/routes/payment.ts` - 支付路由
- `supabase-schema.sql` - 完整数据库架构

## 需要帮助？

如果问题仍然存在，请检查：

1. 后端日志输出
2. Supabase Dashboard 中的日志
3. 浏览器开发者工具的网络请求

提供这些信息可以帮助更快地定位问题。
