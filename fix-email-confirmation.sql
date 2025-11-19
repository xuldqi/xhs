-- ============================================
-- 修复邮箱确认问题
-- 在 Supabase SQL Editor 中运行
-- ============================================

-- 1. 确认所有现有用户的邮箱
-- 注意: confirmed_at 是生成列，会自动更新
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. 查看所有用户及其确认状态
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ 已确认'
    ELSE '❌ 未确认'
  END as status
FROM auth.users 
ORDER BY created_at DESC;

-- 3. 查看用户数量统计
SELECT 
  COUNT(*) as total_users,
  COUNT(email_confirmed_at) as confirmed_users,
  COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

-- 4. 如果需要确认特定用户（替换邮箱地址）
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE email = 'your-email@example.com';

-- 5. 查看最近的登录尝试
SELECT 
  id,
  email,
  last_sign_in_at,
  created_at
FROM auth.users 
WHERE last_sign_in_at IS NOT NULL
ORDER BY last_sign_in_at DESC
LIMIT 10;
