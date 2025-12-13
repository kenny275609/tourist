-- 創建函數：當用戶登入時，自動創建 user_profiles 記錄（如果不存在）
-- 這個方法比在註冊時創建更可靠，因為用戶已經有有效的 session

CREATE OR REPLACE FUNCTION create_user_profile_on_login()
RETURNS TRIGGER AS $$
BEGIN
  -- 當用戶登入時（session 創建時），檢查並創建 user_profiles
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (
    NEW.user_id,
    COALESCE(
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = NEW.user_id),
      NULL
    )
  )
  ON CONFLICT (user_id) DO UPDATE
  SET display_name = COALESCE(
    EXCLUDED.display_name,
    user_profiles.display_name,
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = NEW.user_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器：當 auth.sessions 有新記錄時自動創建 user_profiles
-- 注意：這需要在 auth.sessions 表上創建觸發器
-- 如果無法創建，可以手動執行以下 SQL 來為現有用戶創建 user_profiles

-- 為所有現有用戶創建 user_profiles 記錄（如果不存在）
INSERT INTO user_profiles (user_id, display_name)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', NULL) as display_name
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = u.id
)
ON CONFLICT (user_id) DO UPDATE
SET display_name = COALESCE(
  EXCLUDED.display_name,
  user_profiles.display_name
);

-- 嘗試創建觸發器（如果失敗，請使用定期同步的方式）
DO $$
BEGIN
  -- 檢查是否可以創建觸發器
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'sessions'
  ) THEN
    -- 創建觸發器
    DROP TRIGGER IF EXISTS create_user_profile_on_login_trigger ON auth.sessions;
    CREATE TRIGGER create_user_profile_on_login_trigger
      AFTER INSERT ON auth.sessions
      FOR EACH ROW
      EXECUTE FUNCTION create_user_profile_on_login();
    
    RAISE NOTICE '✅ 觸發器已創建';
  ELSE
    RAISE NOTICE '⚠️ 無法在 auth.sessions 上創建觸發器，請手動執行同步腳本';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果無法創建觸發器，記錄錯誤但不中斷
    RAISE NOTICE '⚠️ 無法在 auth.sessions 上創建觸發器：%', SQLERRM;
    RAISE NOTICE '請手動執行以下 SQL 來為新用戶創建 user_profiles 記錄';
END $$;

