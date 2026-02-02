-- ============================================
-- AI 内容日历功能 - Supabase 数据库迁移
-- ============================================

-- 1. 扩展 usage_logs.action_type 增加 generate_calendar
ALTER TABLE public.usage_logs
  DROP CONSTRAINT IF EXISTS usage_logs_action_type_check;

ALTER TABLE public.usage_logs
  ADD CONSTRAINT usage_logs_action_type_check
  CHECK (action_type IN ('generate_guide', 'export_html', 'view_history', 'generate_calendar'));

-- 2. 品牌声配置表
CREATE TABLE IF NOT EXISTS public.brand_voice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '默认品牌声',
  style TEXT,
  keywords TEXT[] DEFAULT '{}',
  forbidden_words TEXT[] DEFAULT '{}',
  emoji_list TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 日历历史表
CREATE TABLE IF NOT EXISTS public.calendar_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_voice_id UUID REFERENCES public.brand_voice(id) ON DELETE SET NULL,
  input_params JSONB NOT NULL DEFAULT '{}',
  calendar_data JSONB NOT NULL DEFAULT '{}',
  days_count INTEGER NOT NULL CHECK (days_count IN (7, 30)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 索引
CREATE INDEX IF NOT EXISTS idx_brand_voice_user_id ON public.brand_voice(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_history_user_id ON public.calendar_history(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_history_created_at ON public.calendar_history(created_at DESC);

-- 5. RLS 策略
ALTER TABLE public.brand_voice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_history ENABLE ROW LEVEL SECURITY;

-- brand_voice 策略
CREATE POLICY "用户可以查看自己的品牌声" ON public.brand_voice
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的品牌声" ON public.brand_voice
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的品牌声" ON public.brand_voice
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的品牌声" ON public.brand_voice
  FOR DELETE USING (auth.uid() = user_id);

-- calendar_history 策略
CREATE POLICY "用户可以查看自己的日历历史" ON public.calendar_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的日历历史" ON public.calendar_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的日历历史" ON public.calendar_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的日历历史" ON public.calendar_history
  FOR DELETE USING (auth.uid() = user_id);
