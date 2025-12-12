-- 快速設定：將 linda1360521@gmail.com 設為管理員
-- 複製以下 SQL 到 Supabase SQL Editor 執行即可

-- 方法 1：如果已創建 user_roles 表（推薦）
INSERT INTO user_roles (user_id, is_admin, role)
SELECT 
  id,
  true,
  'admin'
FROM auth.users
WHERE email = 'linda1360521@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW();

-- 方法 2：如果還沒有 user_roles 表，直接更新 auth.users
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('is_admin', true)
WHERE email = 'linda1360521@gmail.com';

