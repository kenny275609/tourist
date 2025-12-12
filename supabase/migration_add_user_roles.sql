-- 創建用戶角色表
-- 這個表可以在 Table Editor 中直接編輯，方便管理用戶角色
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT CHECK (role IN ('admin', 'user', 'viewer')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_admin ON user_roles(is_admin);

-- 啟用 Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS 政策：所有人都可以查看
DROP POLICY IF EXISTS "任何人都可以查看用戶角色" ON user_roles;
CREATE POLICY "任何人都可以查看用戶角色"
  ON user_roles FOR SELECT
  USING (true);

-- RLS 政策：只有管理員可以插入/更新/刪除
-- 注意：只使用 user_metadata 檢查，避免遞迴（不要使用 EXISTS 查詢 user_roles 表本身）
DROP POLICY IF EXISTS "只有管理員可以管理用戶角色" ON user_roles;
CREATE POLICY "只有管理員可以管理用戶角色"
  ON user_roles FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- 建立更新時間的觸發器
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 創建函數：同步 user_roles 到 auth.users.raw_user_meta_data
CREATE OR REPLACE FUNCTION sync_user_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- 當 user_roles 更新時，同步到 auth.users
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('is_admin', NEW.is_admin)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建觸發器：當 user_roles 更新時自動同步
DROP TRIGGER IF EXISTS sync_user_role_trigger ON user_roles;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_to_auth();

-- 創建函數：從 auth.users 同步到 user_roles（初始化用）
CREATE OR REPLACE FUNCTION sync_auth_to_user_roles()
RETURNS void AS $$
BEGIN
  -- 將所有用戶從 auth.users 同步到 user_roles
  INSERT INTO user_roles (user_id, is_admin)
  SELECT 
    id,
    COALESCE((raw_user_meta_data->>'is_admin')::boolean, false) as is_admin
  FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM user_roles)
  ON CONFLICT (user_id) DO UPDATE
  SET is_admin = EXCLUDED.is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 執行初始同步（將現有用戶同步到 user_roles）
SELECT sync_auth_to_user_roles();

