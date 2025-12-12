-- 創建一個視圖來方便查看所有用戶（不需要管理員權限）
-- 這個視圖會顯示用戶的基本資訊和統計數據

CREATE OR REPLACE VIEW public.users_overview AS
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ) as display_name,
  u.raw_user_meta_data->>'name' as registered_name,
  COALESCE(
    (u.raw_user_meta_data->>'is_admin')::boolean,
    false
  ) as is_admin,
  u.created_at as registered_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  COUNT(DISTINCT ugi.id) as gear_count,
  COUNT(DISTINCT CASE WHEN ugi.checked = true THEN ugi.id END) as checked_gear_count,
  COUNT(DISTINCT sg.id) as shared_gear_claimed_count
FROM auth.users u
LEFT JOIN user_gear_items ugi ON ugi.user_id = u.id
LEFT JOIN shared_gear sg ON sg.claimed_by = u.id::text
GROUP BY u.id, u.email, u.raw_user_meta_data, u.created_at, u.last_sign_in_at, u.email_confirmed_at;

-- 啟用 RLS（所有人都可以查看，但只顯示公開資訊）
ALTER VIEW public.users_overview SET (security_invoker = true);

-- 使用方式：
-- SELECT * FROM users_overview ORDER BY registered_at DESC;

