-- 移除可能有問題的觸發器
-- 如果觸發器導致註冊失敗，執行此腳本移除它

-- 移除 auto_create_user_profile 觸發器（如果存在）
DROP TRIGGER IF EXISTS auto_create_user_profile_trigger ON auth.users;

-- 移除 auto_create_user_role 觸發器（如果存在）
DROP TRIGGER IF EXISTS auto_create_user_role_trigger ON auth.users;

-- 驗證觸發器已移除
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND (trigger_name LIKE '%user_profile%' OR trigger_name LIKE '%user_role%');

-- 如果上面的查詢返回空結果，表示觸發器已成功移除

