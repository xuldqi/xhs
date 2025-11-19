-- ============================================
-- 完整数据库初始化脚本
-- 包括：套餐配置 + RLS 策略修复
-- ============================================

-- 1. 创建套餐配置表
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

-- 2. 插入套餐数据
INSERT INTO public.plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit, priority, features) VALUES
  ('free', '免费体验', 0, NULL, 1, 1, 3, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('basic', '基础会员', 29.9, 30, 10, 999, 50, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('pro', '专业会员', 99, 30, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": false}'::jsonb),
  ('lifetime', '终身会员', 299, NULL, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": true}'::jsonb)
ON CONFLICT (plan_type) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price;

-- 3. 设置 plan_configs 表权限
ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "所有人可以查看套餐配置" ON public.plan_configs;
CREATE POLICY "所有人可以查看套餐配置" ON public.plan_configs FOR SELECT USING (TRUE);

-- 4. 修复 orders 表 RLS 策略
DROP POLICY IF EXISTS "服务端可以创建订单" ON public.orders;
CREATE POLICY "服务端可以创建订单" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "服务端可以更新订单" ON public.orders;
CREATE POLICY "服务端可以更新订单" ON public.orders
  FOR UPDATE USING (true);

-- 5. 修复 subscriptions 表 RLS 策略
DROP POLICY IF EXISTS "服务端可以创建订阅" ON public.subscriptions;
CREATE POLICY "服务端可以创建订阅" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "服务端可以更新订阅" ON public.subscriptions;
CREATE POLICY "服务端可以更新订阅" ON public.subscriptions
  FOR UPDATE USING (true);

-- 6. 验证结果
SELECT 'plan_configs' as table_name, COUNT(*) as count FROM public.plan_configs
UNION ALL
SELECT 'order_policies', COUNT(*) FROM pg_policies WHERE tablename = 'orders'
UNION ALL
SELECT 'subscription_policies', COUNT(*) FROM pg_policies WHERE tablename = 'subscriptions';
