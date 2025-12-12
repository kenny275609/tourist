-- 創建函數：當新用戶註冊時，自動在 user_roles 表中創建記錄
-- 這樣新用戶註冊後就會自動出現在 user_roles 表中

CREATE OR REPLACE FUNCTION auto_create_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- 當新用戶註冊時，自動在 user_roles 表中創建記錄
  INSERT INTO user_roles (user_id, is_admin, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'is_admin')::boolean = true THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器：當 auth.users 有新用戶時自動創建 user_roles 記錄
-- 注意：Supabase 的 auth.users 表可能無法直接創建觸發器
-- 如果無法創建，可以定期執行 sync_auth_to_user_roles() 函數

-- 嘗試創建觸發器（如果失敗，請使用定期同步的方式）
DO $$
BEGIN
  -- 檢查是否可以創建觸發器
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    -- 創建觸發器
    DROP TRIGGER IF EXISTS auto_create_user_role_trigger ON auth.users;
    CREATE TRIGGER auto_create_user_role_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION auto_create_user_role();
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果無法創建觸發器，記錄錯誤但不中斷
    RAISE NOTICE '無法在 auth.users 上創建觸發器，請使用定期同步方式';
END $$;

-- 替代方案：定期同步函數（如果觸發器無法創建）
-- 可以設置為定時任務（Cron Job）或手動執行
-- 在 Supabase Dashboard > Database > Cron Jobs 中設置：
-- SELECT sync_auth_to_user_roles();

