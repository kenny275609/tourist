-- 更新預設海拔剖面圖為企鵝家族武陵四秀大冒險地圖

UPDATE trip_settings 
SET 
  value = 'https://ahtwmunbgfzzawwweggo.supabase.co/storage/v1/object/public/trip-images/elevation-profile/1765379345954-imd61lgqoas.png',
  updated_at = NOW()
WHERE key = 'elevation_profile_image';

-- 如果記錄不存在，則插入
INSERT INTO trip_settings (key, value, description)
VALUES 
  ('elevation_profile_image', 'https://ahtwmunbgfzzawwweggo.supabase.co/storage/v1/object/public/trip-images/elevation-profile/1765379345954-imd61lgqoas.png', '海拔剖面圖圖片 URL（企鵝家族武陵四秀大冒險地圖）')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

