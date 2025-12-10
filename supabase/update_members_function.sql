-- 更新 get_members_list 函數，確保正確顯示註冊時填寫的名字
-- 這個函數會從 user_metadata.name 獲取註冊時填寫的名字

CREATE OR REPLACE FUNCTION get_members_list()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  is_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  gear_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 檢查是否為管理員
  IF NOT ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true') THEN
    RAISE EXCEPTION '只有管理員可以查看成員列表';
  END IF;

  RETURN QUERY
  SELECT DISTINCT
    u.id as user_id,
    u.email::TEXT as email,
    -- 優先順序：user_profiles.display_name > user_metadata.name（註冊時填寫）> email 前綴
    COALESCE(
      up.display_name, 
      u.raw_user_meta_data->>'name',  -- 這是註冊時填寫的名字
      split_part(u.email, '@', 1)
    ) as display_name,
    COALESCE((u.raw_user_meta_data->>'is_admin')::boolean, false) as is_admin,
    u.created_at,
    COUNT(ugi.id)::BIGINT as gear_count
  FROM auth.users u
  LEFT JOIN user_profiles up ON up.user_id = u.id
  LEFT JOIN user_gear_items ugi ON ugi.user_id = u.id
  GROUP BY u.id, u.email, up.display_name, u.raw_user_meta_data, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

-- 注意：此函數需要 SECURITY DEFINER 權限才能訪問 auth.users 表
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

