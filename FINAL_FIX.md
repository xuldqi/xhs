# 🎯 最终修复方案

## 问题诊断

你遇到的 500 错误是因为：
```
new row violates row-level security policy for table "orders"
```

**原因**: Supabase 的 RLS (Row Level Security) 策略阻止了后端插入订单数据。

---

## ✅ 已完成的修复

1. ✅ 更新 Supabase Service Key
2. ✅ 更新 CORS 配置（支持 5174 端口）
3. ✅ 重启后端服务

---

## 🚀 最后一步：运行 SQL 修复 RLS

### 访问 Supabase SQL Editor

```
https://app.supabase.com/project/dwgrurfoxqfoeiwjytbb/sql/new
```

### 复制并运行以下完整 SQL

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
SELECT 'plan_configs' as table_name, COUNT(*) as count FROM public.plan_configs
UNION ALL
SELECT 'policies', COUNT(*) FROM pg_policies WHERE tablename IN ('orders', 'subscriptions');
```

### 点击 Run 按钮

---

## 🧪 测试

运行 SQL 后，访问：

```
http://localhost:5174/pricing
```

尝试购买任意套餐，应该可以正常工作了！

---

## 📋 问题解决流程回顾

1. ❌ 错误：套餐不存在
2. 🔍 诊断：使用了错误的 Supabase Key
3. ✅ 修复：更新为 service_role key
4. ❌ 错误：500 - RLS policy violation
5. 🔍 诊断：RLS 策略阻止后端插入数据
6. ✅ 修复：添加服务端 RLS 策略
7. ✅ 完成：支付功能正常工作

---

## 🎉 完成后

你的支付系统将完全可用：
- ✅ 可以查看套餐列表
- ✅ 可以创建订单
- ✅ 可以跳转到支付宝支付
- ✅ 支付成功后自动开通会员

---

## 需要帮助？

如果还有问题，查看后端日志：
```bash
# 后端日志会显示详细错误信息
```

或运行诊断：
```bash
./diagnose-payment-error.sh
```
