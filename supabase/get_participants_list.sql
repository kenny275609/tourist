-- 創建函數：獲取活動參與者列表（所有用戶都可以查看）
-- 這個函數返回所有已選擇角色的用戶信息
-- 不需要管理員權限，因為參與者信息是公開的

CREATE OR REPLACE FUNCTION get_participants_list()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    u.id as user_id,
    u.email::TEXT as email,
    -- 優先順序：user_profiles.display_name > user_metadata.name > email 前綴
    -- 確保正確處理 UTF-8 字符編碼
    -- 使用 COALESCE 和 NULLIF 來處理空值和空白字符串
    COALESCE(
      NULLIF(TRIM(COALESCE(up.display_name, '')), ''), 
      NULLIF(TRIM(COALESCE(u.raw_user_meta_data->>'name', '')), ''),
      split_part(COALESCE(u.email, ''), '@', 1)
    )::TEXT as display_name,
    -- 從 user_data 獲取角色，處理 JSONB 值（可能是字符串或對象）
    CASE 
      WHEN jsonb_typeof(ud.value) = 'string' THEN ud.value::TEXT
      WHEN jsonb_typeof(ud.value) = 'object' THEN ud.value::TEXT
      ELSE ud.value::TEXT
    END as role
  FROM auth.users u
  LEFT JOIN user_profiles up ON up.user_id = u.id
  INNER JOIN user_data ud ON ud.user_id = u.id AND ud.key = 'user_role'
  WHERE ud.value IS NOT NULL
  ORDER BY u.created_at DESC;
END;
$$;

-- 注意：此函數使用 SECURITY DEFINER 權限來訪問 auth.users 表
-- 所有已登入的用戶都可以調用此函數來查看參與者列表
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

