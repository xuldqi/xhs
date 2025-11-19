-- ============================================
-- 修复 RLS 策略 - 允许后端服务插入订单
-- ============================================

-- 1. 为 orders 表添加服务端插入策略
DROP POLICY IF EXISTS "服务端可以创建订单" ON public.orders;
CREATE POLICY "服务端可以创建订单" ON public.orders
  FOR INSERT 
  WITH CHECK (true);

-- 2. 为 orders 表添加服务端更新策略
DROP POLICY IF EXISTS "服务端可以更新订单" ON public.orders;
CREATE POLICY "服务端可以更新订单" ON public.orders
  FOR UPDATE
  USING (true);

-- 3. 为 subscriptions 表添加服务端插入策略
DROP POLICY IF EXISTS "服务端可以创建订阅" ON public.subscriptions;
CREATE POLICY "服务端可以创建订阅" ON public.subscriptions
  FOR INSERT
  WITH CHECK (true);

-- 4. 为 subscriptions 表添加服务端更新策略  
DROP POLICY IF EXISTS "服务端可以更新订阅" ON public.subscriptions;
CREATE POLICY "服务端可以更新订阅" ON public.subscriptions
  FOR UPDATE
  USING (true);

-- 5. 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('orders', 'subscriptions')
ORDER BY tablename, policyname;
