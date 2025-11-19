-- ============================================
-- 自动标记过期订阅的函数和定时任务
-- ============================================

-- 创建函数：标记过期的订阅
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- 更新所有已过期但状态仍为 active 的订阅
  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW()
    AND plan_type != 'lifetime'  -- 终身会员不过期
    AND plan_type != 'free';      -- 免费会员不过期
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RAISE NOTICE '已标记 % 个过期订阅', affected_rows;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 使用 pg_cron 创建定时任务（需要启用 pg_cron 扩展）
-- ============================================

-- 启用 pg_cron 扩展（如果还没启用）
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建定时任务：每小时执行一次
-- SELECT cron.schedule(
--   'expire-subscriptions',           -- 任务名称
--   '0 * * * *',                      -- 每小时的第0分钟执行
--   'SELECT expire_old_subscriptions();'
-- );

-- ============================================
-- 手动执行（用于测试）
-- ============================================

-- 立即执行一次
-- SELECT expire_old_subscriptions();

-- ============================================
-- 查看定时任务状态
-- ============================================

-- 查看所有定时任务
-- SELECT * FROM cron.job;

-- 查看定时任务执行历史
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================
-- 删除定时任务（如果需要）
-- ============================================

-- SELECT cron.unschedule('expire-subscriptions');
