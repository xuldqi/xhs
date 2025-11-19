-- ============================================
-- 数据库迁移脚本 - 添加分享功能字段
-- 执行时间：2025-11-19
-- ============================================

-- 1. 添加新字段到 guide_history 表
ALTER TABLE public.guide_history
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. 为已存在的记录生成 share_id（如果为空）
UPDATE public.guide_history
SET share_id = substring(md5(random()::text || id::text) from 1 for 8)
WHERE share_id IS NULL;

-- 3. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_guide_history_share_id ON public.guide_history(share_id);
CREATE INDEX IF NOT EXISTS idx_guide_history_is_public ON public.guide_history(is_public);

-- 4. 添加 RLS 策略：允许所有人查看公开的指南
DROP POLICY IF EXISTS "所有人可以查看公开的指南" ON public.guide_history;
CREATE POLICY "所有人可以查看公开的指南" ON public.guide_history
  FOR SELECT USING (is_public = TRUE);

-- 5. 添加 RLS 策略：用户可以更新自己的历史记录
DROP POLICY IF EXISTS "用户可以更新自己的历史记录" ON public.guide_history;
CREATE POLICY "用户可以更新自己的历史记录" ON public.guide_history
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_guide_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_guide_history_updated_at_trigger ON public.guide_history;
CREATE TRIGGER update_guide_history_updated_at_trigger
  BEFORE UPDATE ON public.guide_history
  FOR EACH ROW
  EXECUTE FUNCTION update_guide_history_updated_at();

-- 7. 创建函数：增加浏览次数
CREATE OR REPLACE FUNCTION increment_guide_view_count(p_share_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.guide_history
  SET view_count = view_count + 1
  WHERE share_id = p_share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 验证迁移
-- ============================================

-- 检查新字段是否存在
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guide_history' 
    AND column_name = 'share_id'
  ) THEN
    RAISE NOTICE '✅ share_id 字段已添加';
  ELSE
    RAISE EXCEPTION '❌ share_id 字段添加失败';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guide_history' 
    AND column_name = 'is_public'
  ) THEN
    RAISE NOTICE '✅ is_public 字段已添加';
  ELSE
    RAISE EXCEPTION '❌ is_public 字段添加失败';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guide_history' 
    AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE '✅ view_count 字段已添加';
  ELSE
    RAISE EXCEPTION '❌ view_count 字段添加失败';
  END IF;

  RAISE NOTICE '✅ 数据库迁移完成！';
END $$;
