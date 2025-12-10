-- 行程設定表
-- 用於存儲行程的全局設定（出發日期、邀請碼等）
CREATE TABLE IF NOT EXISTS trip_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設設定
INSERT INTO trip_settings (key, value, description) 
VALUES 
  ('departure_date', '2025-10-10', '出發日期 (格式: YYYY-MM-DD)'),
  ('invite_code', 'WL4SHOW', '團隊邀請碼'),
  ('elevation_profile_image', 'https://ahtwmunbgfzzawwweggo.supabase.co/storage/v1/object/public/trip-images/elevation-profile/1765379345954-imd61lgqoas.png', '海拔剖面圖圖片 URL（企鵝家族武陵四秀大冒險地圖）'),
  ('shared_itinerary', '[]', '共享行程（JSON 格式，所有用戶共享，只有管理員可編輯）'),
  ('activity_intro', '武陵四秀是台灣中部著名的百岳路線，包含四座美麗的高山：池有山、品田山、桃山和喀拉業山。\n\n這條路線穿越武陵農場周邊的原始森林，沿途可以欣賞到壯麗的山景、雲海和豐富的生態環境。品田山的 V 型斷崖更是這條路線的經典地標，吸引無數登山愛好者前來挑戰。\n\n行程規劃為3天2夜，適合有基本登山經驗的山友。沿途設有山屋可供住宿，讓您可以在舒適的環境中享受高山之美。', '活動介紹文字（支援換行，使用 \\n 表示換行）'),
  ('transportation_drive', '前往武陵農場（武陵山莊）', '交通資訊 - 開車前往'),
  ('transportation_public', '可搭乘國光客運 1751 或 1764 路線', '交通資訊 - 大眾運輸')
ON CONFLICT (key) DO NOTHING;

-- RLS 政策：所有人都可以讀取設定
ALTER TABLE trip_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "任何人都可以讀取行程設定" ON trip_settings;
CREATE POLICY "任何人都可以讀取行程設定"
  ON trip_settings FOR SELECT
  USING (true);

-- 只有管理員可以更新設定
DROP POLICY IF EXISTS "只有管理員可以更新行程設定" ON trip_settings;
CREATE POLICY "只有管理員可以更新行程設定"
  ON trip_settings FOR UPDATE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

DROP POLICY IF EXISTS "只有管理員可以插入行程設定" ON trip_settings;
CREATE POLICY "只有管理員可以插入行程設定"
  ON trip_settings FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_trip_settings_key ON trip_settings(key);

