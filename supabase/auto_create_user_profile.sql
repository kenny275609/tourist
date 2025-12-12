-- 創建函數：當新用戶註冊時，自動在 user_profiles 表中創建記錄
-- 這樣新用戶註冊後就會自動有 user_profiles 記錄，方便查詢顯示名稱

CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- 當新用戶註冊時，自動在 user_profiles 表中創建記錄
  -- 使用註冊時填寫的 name 作為 display_name
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET display_name = COALESCE(
    EXCLUDED.display_name,
    user_profiles.display_name,
    NEW.raw_user_meta_data->>'name'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注意：Supabase 的 auth.users 表可能無法直接創建觸發器
-- 如果無法創建觸發器，可以手動執行以下 SQL 來為現有用戶創建 user_profiles 記錄

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
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- 創建觸發器
    DROP TRIGGER IF EXISTS auto_create_user_profile_trigger ON auth.users;
    CREATE TRIGGER auto_create_user_profile_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION auto_create_user_profile();
    
    RAISE NOTICE '✅ 觸發器已創建';
  ELSE
    RAISE NOTICE '⚠️ 無法在 auth.users 上創建觸發器，請手動執行同步腳本';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果無法創建觸發器，記錄錯誤但不中斷
    RAISE NOTICE '⚠️ 無法在 auth.users 上創建觸發器：%', SQLERRM;
    RAISE NOTICE '請手動執行以下 SQL 來為新用戶創建 user_profiles 記錄';
END $$;

