-- 設定管理者帳號的 SQL 腳本
-- 使用方式：將 'your-email@example.com' 替換為您的實際 email

-- 方法 1: 使用 email 設定（推薦）
-- 將下面的 'your-email@example.com' 替換為您的 email，然後執行

UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('is_admin', true)
WHERE email = 'your-email@example.com';

-- 驗證設定是否成功
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin,
  created_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- ============================================
-- 方法 2: 查看所有用戶，找到要設定的用戶 ID
-- ============================================

-- 先查看所有用戶
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 然後使用用戶 ID 設定（將 'USER_ID_HERE' 替換為實際的 UUID）
/*
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('is_admin', true)
WHERE id = 'USER_ID_HERE';
*/

-- ============================================
-- 方法 3: 批量設定多個管理者
-- ============================================

/*
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email IN ('admin1@example.com', 'admin2@example.com');
*/

-- ============================================
-- 驗證所有管理者
-- ============================================

-- 查看所有管理者
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'is_admin' = 'true';

-- ============================================
-- 移除管理者權限（如果需要）
-- ============================================

/*
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'is_admin'
WHERE email = 'user@example.com';
*/

