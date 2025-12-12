-- 創建函數：管理員刪除指定用戶的帳號及其所有數據
-- ⚠️ 警告：此操作無法復原！
-- 只有管理員可以執行此函數

CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 檢查是否為管理員
  IF NOT ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true') THEN
    RAISE EXCEPTION '只有管理員可以刪除用戶帳號';
  END IF;

  -- 檢查目標用戶是否存在
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION '用戶不存在';
  END IF;

  -- 刪除用戶的所有數據
  DELETE FROM user_gear_items WHERE user_id = target_user_id;
  DELETE FROM user_data WHERE user_id = target_user_id;
  DELETE FROM user_roles WHERE user_id = target_user_id;
  DELETE FROM user_profiles WHERE user_id = target_user_id;
  
  -- 刪除用戶認證記錄（這會觸發 CASCADE 刪除所有相關數據）
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RAISE NOTICE '用戶帳號及所有數據已成功刪除';
END;
$$;

-- 注意：
-- 1. 這個函數使用 SECURITY DEFINER，以獲得刪除 auth.users 的權限
-- 2. 函數會檢查當前用戶是否為管理員
-- 3. 刪除操作會自動 CASCADE 到所有相關表（由於外鍵約束）

-- 使用方式：
-- SELECT delete_user_by_admin('USER_ID_HERE');

