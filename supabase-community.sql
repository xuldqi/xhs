-- ============================================
-- 社区问答：问题表与回答表
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 社区问题表
CREATE TABLE IF NOT EXISTS public.community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '匿名用户',
  author_avatar TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 社区回答表
CREATE TABLE IF NOT EXISTS public.community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.community_questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '匿名用户',
  author_avatar TEXT,
  is_accepted BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_community_questions_category ON public.community_questions(category);
CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON public.community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_is_resolved ON public.community_questions(is_resolved);
CREATE INDEX IF NOT EXISTS idx_community_answers_question_id ON public.community_answers(question_id);

-- RLS：允许匿名读取与插入（登录用户可带 author_id）
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "社区问题允许所有人读取" ON public.community_questions;
CREATE POLICY "社区问题允许所有人读取" ON public.community_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "社区问题允许所有人插入" ON public.community_questions;
CREATE POLICY "社区问题允许所有人插入" ON public.community_questions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "社区问题允许所有人更新" ON public.community_questions;
CREATE POLICY "社区问题允许所有人更新" ON public.community_questions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "社区回答允许所有人读取" ON public.community_answers;
CREATE POLICY "社区回答允许所有人读取" ON public.community_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "社区回答允许所有人插入" ON public.community_answers;
CREATE POLICY "社区回答允许所有人插入" ON public.community_answers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "社区回答允许所有人更新" ON public.community_answers;
CREATE POLICY "社区回答允许所有人更新" ON public.community_answers FOR UPDATE USING (true);
