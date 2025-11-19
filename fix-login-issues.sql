-- 快速修复登录问题的 SQL 脚本
-- 在 Supabase SQL Editor 中运行

-- 1. 确认所有现有用户的邮箱（临时解决方案）
-- 注意: confirmed_at 是生成列，会自动更新
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. 查看所有未确认的用户
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 3. 确认特定用户（替换邮箱地址）
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'your-email@example.com';
