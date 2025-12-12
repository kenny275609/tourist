-- 方法 1：直接在 user_roles 表中設定管理員（推薦）⭐
-- 在 Table Editor 中編輯 user_roles 表，將 is_admin 設為 true

-- 查看所有用戶及其角色
SELECT 
  ur.user_id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  ur.is_admin,
  ur.role,
  ur.updated_at
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.updated_at DESC;

-- 方法 2：使用 SQL 更新（如果知道 user_id）
-- 將 'USER_ID_HERE' 替換為實際的用戶 ID
/*
UPDATE user_roles
SET is_admin = true,
    role = 'admin',
    updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';
*/

-- 方法 3：使用 SQL 更新（如果知道 email）
-- 將 'user@example.com' 替換為實際的 email
/*
UPDATE user_roles
SET is_admin = true,
    role = 'admin',
    updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
*/

-- 方法 4：批量設定多個管理員
/*
UPDATE user_roles
SET is_admin = true,
    role = 'admin',
    updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin1@example.com', 'admin2@example.com')
);
*/

-- 驗證管理員設定
SELECT 
  u.email,
  u.raw_user_meta_data->>'name' as name,
  ur.is_admin as role_table_admin,
  (u.raw_user_meta_data->>'is_admin')::boolean as auth_metadata_admin,
  CASE 
    WHEN ur.is_admin = (u.raw_user_meta_data->>'is_admin')::boolean 
    THEN '✅ 已同步' 
    ELSE '⚠️ 未同步' 
  END as sync_status
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.is_admin = true
ORDER BY ur.updated_at DESC;

