-- ============================================
-- 修复套餐配置数据
-- 执行此脚本以确保 plan_configs 表有正确的数据
-- ============================================

-- 1. 确保 plan_configs 表存在
CREATE TABLE IF NOT EXISTS public.plan_configs (
  plan_type TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER, -- NULL 表示永久
  daily_generate_limit INTEGER NOT NULL,
  daily_export_limit INTEGER NOT NULL,
  history_limit INTEGER NOT NULL,
  priority BOOLEAN DEFAULT FALSE,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 清空旧数据（如果需要重新初始化）
-- TRUNCATE TABLE public.plan_configs;

-- 3. 插入或更新套餐配置
INSERT INTO public.plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit, priority, features) VALUES
  ('free', '免费体验', 0, NULL, 1, 1, 3, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('basic', '基础会员', 29.9, 30, 10, 999, 50, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('pro', '专业会员', 99, 30, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": false}'::jsonb),
  ('lifetime', '终身会员', 299, NULL, 999, 999, 999, TRUE, '{"customTemplate": true, "earlyAccess": true}'::jsonb)
ON CONFLICT (plan_type) 
DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  daily_generate_limit = EXCLUDED.daily_generate_limit,
  daily_export_limit = EXCLUDED.daily_export_limit,
  history_limit = EXCLUDED.history_limit,
  priority = EXCLUDED.priority,
  features = EXCLUDED.features;

-- 4. 启用 RLS（如果还没启用）
ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "所有人可以查看套餐配置" ON public.plan_configs;

-- 6. 创建新策略：所有人可以查看套餐配置
CREATE POLICY "所有人可以查看套餐配置" ON public.plan_configs
  FOR SELECT USING (TRUE);

-- 7. 验证数据
DO $
DECLARE
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM public.plan_configs;
  
  IF plan_count = 4 THEN
    RAISE NOTICE '✅ 套餐配置已成功初始化，共 % 个套餐', plan_count;
  ELSE
    RAISE WARNING '⚠️  套餐数量不正确，当前有 % 个套餐', plan_count;
  END IF;
END $;

-- 8. 显示所有套餐
SELECT plan_type, name, price, duration_days FROM public.plan_configs ORDER BY price;
