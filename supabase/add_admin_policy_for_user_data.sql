-- 添加管理員權限政策，允許管理員更新任何用戶的 user_data
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 刪除舊的管理員政策（如果存在）
DROP POLICY IF EXISTS "Admins can manage all user data" ON user_data;

-- 創建新的管理員政策
-- 允許管理員查看、插入、更新和刪除任何用戶的數據
-- 注意：此政策只檢查 user_metadata 中的 is_admin 欄位
-- 如果您的系統使用 user_roles 表，請先執行 migration_add_user_roles.sql
CREATE POLICY "Admins can manage all user data"
  ON user_data FOR ALL
  USING (
    -- 檢查是否為管理員（從 user_metadata）
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  )
  WITH CHECK (
    -- 同樣的檢查用於 INSERT 和 UPDATE
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- 驗證政策已創建
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'user_data'
ORDER BY cmd, policyname;

