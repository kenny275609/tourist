-- 創建一個視圖來方便查詢成員信息
-- 注意：由於 RLS 限制，我們無法直接查詢 auth.users
-- 這個視圖通過 user_gear_items 和 user_data 來獲取所有用戶

-- 創建一個函數來獲取成員列表（只有管理員可以執行）
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
    -- 優先順序：user_profiles.display_name > user_metadata.name > email 前綴
    COALESCE(
      up.display_name, 
      u.raw_user_meta_data->>'name', 
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

-- 注意：這個函數需要 SECURITY DEFINER 權限才能訪問 auth.users
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

