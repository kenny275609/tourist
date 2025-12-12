-- 修復 user_roles 表的 RLS 政策遞迴問題
-- 錯誤：infinite recursion detected in policy for relation "user_roles"
-- 錯誤代碼：42P17
-- 
-- 問題原因：RLS 政策中的 EXISTS 子查詢會觸發另一個 RLS 檢查，導致無限遞迴
-- 解決方法：移除 EXISTS 子查詢，只使用 user_metadata 檢查

-- 刪除舊的政策（如果存在）
DROP POLICY IF EXISTS "只有管理員可以管理用戶角色" ON user_roles;

-- 創建新的政策：只使用 user_metadata 檢查，避免遞迴
-- 注意：這要求管理員的 is_admin 標記必須在 user_metadata 中
CREATE POLICY "只有管理員可以管理用戶角色"
  ON user_roles FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- 驗證政策已創建
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'user_roles'
  AND policyname = '只有管理員可以管理用戶角色';

-- 注意：
-- 1. 這個政策只檢查 user_metadata.is_admin，不會查詢 user_roles 表本身
-- 2. 確保管理員的 is_admin 標記已同步到 user_metadata
-- 3. 如果管理員權限只在 user_roles 表中，需要先執行 sync_auth_to_user_roles() 來同步

