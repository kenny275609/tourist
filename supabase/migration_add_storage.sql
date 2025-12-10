-- 創建 Storage bucket 用於存儲行程圖片
-- 注意：這需要在 Supabase Dashboard 中手動執行，或使用 Supabase CLI

-- 創建 bucket（如果不存在）
-- 注意：這需要在 Supabase Dashboard > Storage 中手動創建
-- 或者使用 Supabase CLI: supabase storage create trip-images --public

-- 設定 bucket 為公開（允許所有人讀取）
-- 這需要在 Supabase Dashboard > Storage > trip-images > Settings 中設定為 Public

-- RLS 政策：所有人都可以讀取圖片
-- 注意：Storage 的 RLS 政策需要在 Supabase Dashboard 中設定
-- 或者使用 Supabase Management API

-- 以下是 Storage 政策的 SQL（需要在 Supabase Dashboard 的 SQL Editor 中執行）
-- 或者使用 Supabase CLI

-- 允許所有人讀取 bucket 中的文件
-- INSERT INTO storage.objects (bucket_id, name, owner, metadata)
-- VALUES ('trip-images', 'public', auth.uid(), '{"public": true}');

-- 實際上，Storage 的 RLS 政策需要在 Dashboard 中設定：
-- 1. 前往 Supabase Dashboard > Storage
-- 2. 創建 bucket 名為 "trip-images"
-- 3. 設定為 Public bucket
-- 4. 在 Policies 中設定：
--    - SELECT: 允許所有人 (true)
--    - INSERT: 只允許已認證用戶 (auth.role() = 'authenticated')
--    - UPDATE: 只允許已認證用戶 (auth.role() = 'authenticated')
--    - DELETE: 只允許已認證用戶 (auth.role() = 'authenticated')

-- 或者使用以下 SQL 在 Supabase Dashboard 的 SQL Editor 中執行：

-- 創建 Storage bucket（如果使用 Supabase CLI 或 Management API）
-- 注意：這通常需要在 Dashboard 中手動完成

