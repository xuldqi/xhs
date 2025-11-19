# ✅ 完整修复指南

## 当前状态

### ✅ 已完成
1. **Supabase Service Key** - 已更新为正确的 service_role key
2. **后端服务** - 运行在 http://localhost:3001
3. **前端服务** - 运行在 http://localhost:5174

### ⏳ 待完成
1. **初始化数据库** - 需要在 Supabase 中运行 SQL 脚本

---

## 🎯 最后一步：初始化数据库

### 方法 1: 使用 Supabase Dashboard（推荐）

1. **访问 SQL Editor**
   ```
   https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/sql/new
   ```

2. **复制并运行以下 SQL**（一次性运行所有）

```sql
-- ============================================
-- 1. 创建套餐配置表
-- ============================================
CREATE TABLE IF NOT EXISTS public.plan_configs (
  plan_type TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER,
  daily_generate_limit INTEGER NOT NULL,
  daily_export_limit INTEGER NOT NULL,
  history_limit INTEGER NOT NULL,
  priority BOOLEAN DEFAULT FALSE,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入套餐数据
INSERT INTO public.plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit, priority, features) VALUES
  ('free', '免费体验', 0, NULL, 1, 1, 3, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('basic', '基础会员', 29.9, 30, 10, 999, 50, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('pro', '专业会员', 99, 30, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": false}'::jsonb),
  ('lifetime', '终身会员', 299, NULL, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": true}'::jsonb)
ON CONFLICT (plan_type) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price;

-- 设置权限
ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "所有人可以查看套餐配置" ON public.plan_configs;
CREATE POLICY "所有人可以查看套餐配置" ON public.plan_configs FOR SELECT USING (TRUE);

-- ============================================
-- 2. 修复 RLS 策略 - 允许后端服务操作订单
-- ============================================

-- 为 orders 表添加服务端策略
DROP POLICY IF EXISTS "服务端可以创建订单" ON public.orders;
CREATE POLICY "服务端可以创建订单" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "服务端可以更新订单" ON public.orders;
CREATE POLICY "服务端可以更新订单" ON public.orders
  FOR UPDATE USING (true);

-- 为 subscriptions 表添加服务端策略
DROP POLICY IF EXISTS "服务端可以创建订阅" ON public.subscriptions;
CREATE POLICY "服务端可以创建订阅" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "服务端可以更新订阅" ON public.subscriptions;
CREATE POLICY "服务端可以更新订阅" ON public.subscriptions
  FOR UPDATE USING (true);

-- ============================================
-- 3. 验证
-- ============================================
SELECT plan_type, name, price FROM public.plan_configs ORDER BY price;
```

3. **点击 Run 按钮**

4. **验证结果** - 应该看到 4 条记录

---

## 🧪 测试支付功能

### 1. 访问定价页面
```
http://localhost:5174/pricing
```

### 2. 尝试购买套餐

如果一切正常，你应该能够：
- 看到 4 个套餐选项
- 点击"立即购买"按钮
- 跳转到支付宝支付页面

### 3. 如果还有问题

运行诊断脚本：
```bash
cd xiaohongshu-guide-generator
./diagnose-payment-error.sh
```

---

## 📋 快速参考

### 服务地址
- **前端**: http://localhost:5174
- **后端**: http://localhost:3001
- **定价页**: http://localhost:5174/pricing

### 重启服务

**前端**:
```bash
cd xiaohongshu-guide-generator
npm run dev
```

**后端**:
```bash
cd xiaohongshu-guide-generator/backend
npm run dev
```

### 诊断工具
```bash
./diagnose-payment-error.sh  # 诊断配置问题
./test-plan-configs.sh        # 测试套餐配置
```

---

## 📚 相关文档

- `INIT_DATABASE.md` - 数据库初始化详细步骤
- `START_SERVICES.md` - 服务启动指南
- `FIXED_SUMMARY.md` - 修复总结
- `fix-plan-configs.sql` - 完整的 SQL 脚本

---

## ✅ 完成检查清单

- [x] 更新 Supabase Service Key
- [x] 启动后端服务 (3001)
- [x] 启动前端服务 (5174)
- [ ] 初始化数据库套餐配置
- [ ] 测试支付功能

**完成数据库初始化后，你的支付系统就完全可用了！** 🎉
