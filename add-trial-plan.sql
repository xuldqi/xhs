-- ============================================
-- 添加 9.9 元三天体验会员
-- ============================================

-- 更新所有套餐配置，确保价值梯度合理
INSERT INTO public.plan_configs (plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit, history_limit, priority, features) VALUES
  ('free', '免费体验', 0, NULL, 1, 1, 3, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
  ('trial', '三天体验', 9.9, 3, 3, 999, 20, FALSE, '{"customTemplate": false, "earlyAccess": false}'::jsonb),
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

-- 验证数据
SELECT plan_type, name, price, duration_days, daily_generate_limit, daily_export_limit 
FROM public.plan_configs 
ORDER BY 
  CASE 
    WHEN plan_type = 'free' THEN 1
    WHEN plan_type = 'trial' THEN 2
    WHEN plan_type = 'basic' THEN 3
    WHEN plan_type = 'pro' THEN 4
    WHEN plan_type = 'lifetime' THEN 5
  END;

-- 显示成功消息
DO $
BEGIN
  RAISE NOTICE '✅ 三天体验会员已添加！';
  RAISE NOTICE '   套餐名称：三天体验';
  RAISE NOTICE '   价格：9.9 元';
  RAISE NOTICE '   时长：3 天';
  RAISE NOTICE '   每日生成：5 次';
  RAISE NOTICE '   每日导出：10 次';
END $;
