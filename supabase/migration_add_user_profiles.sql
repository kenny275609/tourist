-- 用戶資料表
-- 用於存儲用戶的公開資料（名稱、頭像等）
-- 注意：email 和基本資訊可以從 auth.users 獲取，但為了方便查詢，我們創建這個表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 啟用 Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 政策：所有人都可以查看用戶資料
DROP POLICY IF EXISTS "任何人都可以查看用戶資料" ON user_profiles;
CREATE POLICY "任何人都可以查看用戶資料"
  ON user_profiles FOR SELECT
  USING (true);

-- RLS 政策：用戶可以更新自己的資料
DROP POLICY IF EXISTS "用戶可以更新自己的資料" ON user_profiles;
CREATE POLICY "用戶可以更新自己的資料"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 政策：用戶可以插入自己的資料
DROP POLICY IF EXISTS "用戶可以插入自己的資料" ON user_profiles;
CREATE POLICY "用戶可以插入自己的資料"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 建立更新時間的觸發器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

