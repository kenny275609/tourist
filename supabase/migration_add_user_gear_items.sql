-- 遷移腳本：新增 user_gear_items 表
-- 如果已經執行過完整的 schema.sql，可以跳過此腳本

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

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_gear_items_user_id ON user_gear_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gear_items_category ON user_gear_items(category);

-- 啟用 Row Level Security (RLS)
ALTER TABLE user_gear_items ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶只能存取自己的裝備物品
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

-- 建立更新時間的觸發器
CREATE TRIGGER update_user_gear_items_updated_at
  BEFORE UPDATE ON user_gear_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

