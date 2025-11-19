-- 手动确认用户邮箱
-- 将 'your-email@example.com' 替换为你的邮箱地址

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'your-email@example.com';

-- 查看结果
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';
