-- 用戶數據表
-- 用於存儲每個用戶的個人數據（行程、個人裝備等）
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- 預設裝備模板表（管理者設定）
-- 用於存儲管理者為新成員設定的預設裝備清單
CREATE TABLE IF NOT EXISTS default_gear_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('clothing', 'gear')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用戶個人裝備物品表
-- 用於存儲每個用戶的個人裝備物品（每個物品是獨立記錄）
CREATE TABLE IF NOT EXISTS user_gear_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('clothing', 'gear')),
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 共同裝備表
-- 用於存儲團隊共同使用的裝備
CREATE TABLE IF NOT EXISTS shared_gear (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL DEFAULT 'default-team',
  name TEXT NOT NULL,
  claimed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_key ON user_data(key);
CREATE INDEX IF NOT EXISTS idx_default_gear_templates_active ON default_gear_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_default_gear_templates_order ON default_gear_templates(display_order);
CREATE INDEX IF NOT EXISTS idx_user_gear_items_user_id ON user_gear_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gear_items_category ON user_gear_items(category);
CREATE INDEX IF NOT EXISTS idx_shared_gear_team_id ON shared_gear(team_id);

-- 啟用 Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_gear_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gear_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_gear ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶只能存取自己的數據
-- 先刪除已存在的政策（如果有的話），然後重新創建
DROP POLICY IF EXISTS "Users can view their own data" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own data" ON user_data;
DROP POLICY IF EXISTS "Users can delete their own data" ON user_data;

CREATE POLICY "Users can view their own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);

-- RLS 政策：預設裝備模板（所有人都可以查看，只有管理者可以編輯）
-- 檢查是否為管理者的函數（可以通過 user_metadata 或專門的管理表來判斷）
-- 這裡我們使用 user_metadata 中的 is_admin 欄位來判斷

DROP POLICY IF EXISTS "Everyone can view active gear templates" ON default_gear_templates;
DROP POLICY IF EXISTS "Admins can manage gear templates" ON default_gear_templates;

CREATE POLICY "Everyone can view active gear templates"
  ON default_gear_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage gear templates"
  ON default_gear_templates FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- RLS 政策：用戶只能存取自己的裝備物品
DROP POLICY IF EXISTS "Users can view their own gear items" ON user_gear_items;
DROP POLICY IF EXISTS "Users can insert their own gear items" ON user_gear_items;
DROP POLICY IF EXISTS "Users can update their own gear items" ON user_gear_items;
DROP POLICY IF EXISTS "Users can delete their own gear items" ON user_gear_items;

CREATE POLICY "Users can view their own gear items"
  ON user_gear_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gear items"
  ON user_gear_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gear items"
  ON user_gear_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gear items"
  ON user_gear_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS 政策：所有人都可以查看和編輯共同裝備（已登入用戶）
DROP POLICY IF EXISTS "Authenticated users can view shared gear" ON shared_gear;
DROP POLICY IF EXISTS "Authenticated users can insert shared gear" ON shared_gear;
DROP POLICY IF EXISTS "Authenticated users can update shared gear" ON shared_gear;
DROP POLICY IF EXISTS "Authenticated users can delete shared gear" ON shared_gear;

CREATE POLICY "Authenticated users can view shared gear"
  ON shared_gear FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert shared gear"
  ON shared_gear FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update shared gear"
  ON shared_gear FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete shared gear"
  ON shared_gear FOR DELETE
  USING (auth.role() = 'authenticated');

-- 建立更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為表添加更新時間觸發器
-- 先刪除已存在的觸發器（如果有的話），然後重新創建
DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;
DROP TRIGGER IF EXISTS update_default_gear_templates_updated_at ON default_gear_templates;
DROP TRIGGER IF EXISTS update_user_gear_items_updated_at ON user_gear_items;
DROP TRIGGER IF EXISTS update_shared_gear_updated_at ON shared_gear;

CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_default_gear_templates_updated_at
  BEFORE UPDATE ON default_gear_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_gear_items_updated_at
  BEFORE UPDATE ON user_gear_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_gear_updated_at
  BEFORE UPDATE ON shared_gear
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

