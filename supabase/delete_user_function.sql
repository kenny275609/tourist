-- 創建函數：刪除當前用戶的帳號及其所有數據
-- 這個函數允許用戶刪除自己的帳號
-- ⚠️ 警告：此操作無法復原！

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- 獲取當前用戶 ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION '用戶未登入';
  END IF;

  -- 刪除用戶的所有數據（由於 CASCADE，大部分會自動刪除，但我們明確刪除以確保）
  -- 注意：由於外鍵約束使用 ON DELETE CASCADE，這些可能不需要，但為了明確性我們還是執行
  
  -- 刪除用戶的裝備物品
  DELETE FROM user_gear_items WHERE user_id = current_user_id;
  
  -- 刪除用戶的個人數據
  DELETE FROM user_data WHERE user_id = current_user_id;
  
  -- 刪除用戶的角色記錄
  DELETE FROM user_roles WHERE user_id = current_user_id;
  
  -- 刪除用戶的個人資料
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  
  -- 刪除用戶認證記錄（這會觸發 CASCADE 刪除所有相關數據）
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RAISE NOTICE '用戶帳號及所有數據已成功刪除';
END;
$$;

-- 注意：
-- 1. 這個函數使用 SECURITY DEFINER，以獲得刪除 auth.users 的權限
-- 2. 函數會檢查 auth.uid()，確保用戶只能刪除自己的帳號
-- 3. 刪除操作會自動 CASCADE 到所有相關表（由於外鍵約束）

