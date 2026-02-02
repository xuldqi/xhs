-- 首页订阅（每日涨粉 Tips + 日历提醒）订阅者表
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  wechat TEXT,
  source TEXT DEFAULT 'homepage',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email),
  UNIQUE(wechat),
  CONSTRAINT at_least_one CHECK (email IS NOT NULL OR wechat IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_wechat ON public.newsletter_subscribers(wechat);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON public.newsletter_subscribers(created_at);

-- 允许匿名插入（服务端使用 service key）
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "服务端可插入订阅" ON public.newsletter_subscribers;
CREATE POLICY "服务端可插入订阅" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "服务端可读取订阅" ON public.newsletter_subscribers;
CREATE POLICY "服务端可读取订阅" ON public.newsletter_subscribers
  FOR SELECT
  USING (true);
