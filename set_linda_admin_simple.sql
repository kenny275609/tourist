-- 將 linda1360521@gmail.com 設為管理員（簡單版本，不需要 user_roles 表）

-- 步驟 1：更新 auth.users
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('is_admin', true)
WHERE email = 'linda1360521@gmail.com';

-- 步驟 2：驗證設定（不需要 user_roles 表）
SELECT 
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'is_admin' as is_admin,
  u.created_at
FROM auth.users u
WHERE u.email = 'linda1360521@gmail.com';

