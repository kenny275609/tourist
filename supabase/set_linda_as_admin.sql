-- 將 linda1360521@gmail.com 設為管理員
-- 方法 1：如果已經創建了 user_roles 表（推薦）⭐

-- 先檢查用戶是否存在
SELECT id, email, raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'linda1360521@gmail.com';

-- 更新 user_roles 表（如果表已創建）
UPDATE user_roles
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'linda1360521@gmail.com'
);

-- 如果 user_roles 表中還沒有該用戶的記錄，先插入
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

-- 方法 2：直接更新 auth.users（如果還沒有創建 user_roles 表）

-- 更新 auth.users 的 raw_user_meta_data
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('is_admin', true)
WHERE email = 'linda1360521@gmail.com';

-- 驗證設定是否成功
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'is_admin' as is_admin,
  ur.is_admin as role_table_admin,
  ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'linda1360521@gmail.com';

