-- 查看所有用戶的基本資訊
-- 在 Supabase Dashboard > SQL Editor 中執行此查詢

SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'is_admin' as is_admin,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 只查看有名字的用戶
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'is_admin' as is_admin,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'name' IS NOT NULL
ORDER BY created_at DESC;

-- 查看用戶及其裝備數量
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'is_admin' as is_admin,
  u.created_at,
  COUNT(ugi.id) as gear_count
FROM auth.users u
LEFT JOIN user_gear_items ugi ON ugi.user_id = u.id
GROUP BY u.id, u.email, u.raw_user_meta_data, u.created_at
ORDER BY u.created_at DESC;

-- 查看管理員列表
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'is_admin' = 'true'
ORDER BY created_at DESC;

