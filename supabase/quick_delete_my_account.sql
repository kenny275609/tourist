-- 快速刪除當前用戶帳號的腳本
-- 使用方式：將 'your-email@example.com' 替換為您的實際 email

-- 查看所有用戶（找到您要刪除的用戶 ID）
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 方法 1: 使用 email 刪除（推薦）
-- 將下面的 'your-email@example.com' 替換為您的 email，然後執行

DO $$
DECLARE
  target_email TEXT := 'mjib850529@gmail.com';  -- ⬅️ 在這裡填入您的 email
  user_uuid UUID;
BEGIN
  -- 找到用戶 ID
  SELECT id INTO user_uuid FROM auth.users WHERE email = target_email;
  
  IF user_uuid IS NOT NULL THEN
    -- 刪除用戶的所有數據
    RAISE NOTICE '正在刪除用戶 % 的數據...', target_email;
    
    DELETE FROM user_gear_items WHERE user_id = user_uuid;
    DELETE FROM user_data WHERE user_id = user_uuid;
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RAISE NOTICE '✅ 用戶 % 及其所有數據已成功刪除', target_email;
  ELSE
    RAISE NOTICE '❌ 找不到 email 為 % 的用戶', target_email;
  END IF;
END $$;

-- 方法 2: 如果知道用戶 ID，直接使用這個（更快）
-- 將 'YOUR_USER_ID_HERE' 替換為實際的 UUID
/*
DELETE FROM user_gear_items WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM user_data WHERE user_id = 'YOUR_USER_ID_HERE';
DELETE FROM auth.users WHERE id = 'YOUR_USER_ID_HERE';
*/

