# 成員列表功能說明

## 功能概述

管理員現在可以在「設定」頁面查看所有團隊成員的列表，包括成員的基本信息和裝備數量。

## 功能特點

- ✅ 顯示所有團隊成員
- ✅ 顯示成員的 email 和名稱
- ✅ 標示管理員身份
- ✅ 顯示每個成員的裝備數量
- ✅ 按加入時間排序（最新的在前）

## 設定步驟

### 方法 1：使用 PostgreSQL 函數（推薦）⭐

在 Supabase SQL Editor 中執行 `supabase/create_members_view.sql`：

```sql
-- 創建函數來獲取成員列表
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
    COALESCE(up.display_name, u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as display_name,
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
```

### 方法 2：使用備用方法（如果函數不可用）

如果無法創建函數，系統會自動使用備用方法：
- 通過查詢 `user_gear_items` 和 `user_data` 表來獲取所有用戶 ID
- 顯示用戶的基本信息和裝備數量
- 注意：email 可能無法完整顯示（會顯示部分 ID）

## 使用方式

1. 以管理員身份登入
2. 前往「設定」頁面
3. 在「團隊成員」區塊中查看所有成員
4. 每個成員卡片顯示：
   - 用戶頭像（管理員為紅色，普通用戶為藍色）
   - 用戶名稱或 email
   - 管理員標籤（如果是管理員）
   - 裝備數量

## 注意事項

- **權限**：只有管理員可以查看成員列表
- **隱私**：成員列表只顯示基本信息，不包含敏感數據
- **性能**：如果成員很多，列表可能需要一些時間載入
- **資料來源**：優先使用 PostgreSQL 函數，如果不可用則使用備用方法

## 故障排除

### 問題：成員列表為空

**可能原因**：
1. 還沒有用戶註冊
2. 用戶還沒有創建任何數據（裝備、行程等）

**解決方案**：
- 確認已有用戶註冊
- 確認用戶已登入並使用過應用程式

### 問題：無法看到用戶 email

**解決方案**：
- 執行 `supabase/create_members_view.sql` 創建函數
- 或創建 `user_profiles` 表（執行 `supabase/migration_add_user_profiles.sql`）

### 問題：函數執行失敗

**解決方案**：
- 確認您有足夠的權限執行 SECURITY DEFINER 函數
- 確認 RLS 政策已正確設定
- 使用備用方法（系統會自動切換）

