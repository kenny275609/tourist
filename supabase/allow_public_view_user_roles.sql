-- 允許所有用戶查看 user_role 數據（公開資訊）
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "Everyone can view user roles" ON user_data;

-- 創建新政策：所有人都可以查看 user_role 數據
CREATE POLICY "Everyone can view user roles"
  ON user_data FOR SELECT
  USING (key = 'user_role');

-- 驗證政策已創建
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'user_data' 
  AND policyname = 'Everyone can view user roles';

