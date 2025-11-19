-- ============================================
-- 更新套餐限制为更合理的数值
-- ============================================

-- 删除旧的套餐配置
DELETE FROM public.plan_configs;

-- 插入新的套餐配置（更合理的限制）
INSERT INTO public.plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit, priority, features) VALUES
  ('free', '免费体验', 0, NULL, 1, 1, 3, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('basic', '基础会员', 29.9, 30, 5, 10, 20, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('pro', '专业会员', 99, 30, 20, 50, 100, TRUE, '{"customTemplate": true, "earlyAccess": false}'::jsonb),
  ('lifetime', '终身会员', 299, NULL, 50, 100, 500, TRUE, '{"customTemplate": true, "earlyAccess": true}'::jsonb);

-- 查看更新后的配置
SELECT * FROM public.plan_configs ORDER BY price;
