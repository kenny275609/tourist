-- 刪除用戶帳號及其所有數據的腳本
-- ⚠️ 警告：此操作無法復原！

-- 方法 1: 如果您知道用戶的 email，可以用這個查詢找到用戶 ID
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 方法 2: 查看所有用戶（選擇您要刪除的）
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- ============================================
-- 執行以下步驟來刪除用戶：
-- ============================================

-- 步驟 1: 先刪除用戶的所有個人數據（可選，因為 CASCADE 會自動刪除）
-- 將 'YOUR_USER_ID_HERE' 替換為實際的用戶 ID（UUID）
/*
DELETE FROM user_gear_items WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM user_data WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- 步驟 2: 刪除認證用戶（這會自動 CASCADE 刪除所有相關數據）
-- 將 'YOUR_USER_ID_HERE' 替換為實際的用戶 ID（UUID）
/*
DELETE FROM auth.users WHERE id = 'YOUR_USER_ID_HERE';
*/

-- ============================================
-- 或者，如果您想刪除所有用戶的數據（測試用）：
-- ============================================

-- 刪除所有用戶的裝備物品
-- DELETE FROM user_gear_items;

-- 刪除所有用戶的個人數據
-- DELETE FROM user_data;

-- 刪除所有認證用戶（⚠️ 這會刪除所有帳號！）
-- DELETE FROM auth.users;

-- ============================================
-- 快速清理腳本（刪除當前登入用戶的所有數據）
-- ============================================
-- 如果您在 Supabase Dashboard 中執行，可以手動選擇用戶 ID
-- 或者使用以下查詢來刪除特定 email 的用戶：

/*
DO $$
DECLARE
  target_email TEXT := 'your-email@example.com';  -- 替換為您的 email
  user_uuid UUID;
BEGIN
  -- 找到用戶 ID
  SELECT id INTO user_uuid FROM auth.users WHERE email = target_email;
  
  IF user_uuid IS NOT NULL THEN
    -- 刪除用戶的所有數據
    DELETE FROM user_gear_items WHERE user_id = user_uuid;
    DELETE FROM user_data WHERE user_id = user_uuid;
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RAISE NOTICE '用戶 % 及其所有數據已刪除', target_email;
  ELSE
    RAISE NOTICE '找不到 email 為 % 的用戶', target_email;
  END IF;
END $$;
*/

