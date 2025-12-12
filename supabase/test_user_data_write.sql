-- 測試 user_data 表寫入權限
-- 注意：在 SQL Editor 中，auth.uid() 會返回 null
-- 這個腳本用於檢查表結構和 RLS 政策，不適用於實際測試寫入

-- 1. 檢查表結構
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_data'
ORDER BY ordinal_position;

-- 2. 檢查 RLS 是否啟用
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'user_data';

-- 3. 檢查 RLS 政策
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'user_data'
ORDER BY cmd;

-- 4. 檢查是否有測試數據（如果有用戶數據的話）
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT key) as unique_keys
FROM user_data;

-- 5. 查看所有用戶（需要管理員權限）
-- 注意：這會顯示所有用戶的 user_id，可以用於測試
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

