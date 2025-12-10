-- 遷移腳本：新增管理者系統和預設裝備模板表
-- 如果已經執行過完整的 schema.sql，可以跳過此腳本

-- 預設裝備模板表（管理者設定）
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

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_default_gear_templates_active ON default_gear_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_default_gear_templates_order ON default_gear_templates(display_order);

-- 啟用 RLS
ALTER TABLE default_gear_templates ENABLE ROW LEVEL SECURITY;

-- RLS 政策
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

-- 建立更新時間觸發器
CREATE TRIGGER update_default_gear_templates_updated_at
  BEFORE UPDATE ON default_gear_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 設定第一個用戶為管理者的範例（請替換為實際的用戶 email）
-- 在 Supabase Dashboard > Authentication > Users 中手動設定 user_metadata
-- 或使用以下 SQL（需要替換 email）：
/*
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('is_admin', true)
WHERE email = 'admin@example.com';
*/

