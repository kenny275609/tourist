# 修復用戶權限管理列表只顯示一個用戶的問題

## 🔍 問題說明

如果「用戶權限管理」區塊只顯示一個用戶（您自己），這是因為系統無法獲取所有已註冊的用戶列表。

## ✅ 解決方法

### 步驟 1：執行 SQL 腳本創建 RPC 函數

1. 打開 Supabase Dashboard
2. 點擊左側選單的 **"SQL Editor"**
3. 點擊 **"New query"**
4. 複製並執行以下 SQL 腳本：

```sql
-- 創建一個函數來獲取所有成員列表（只有管理員可以執行）
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
```

5. 點擊 **"Run"** 執行腳本

### 步驟 2：重新整理頁面

執行 SQL 腳本後：
1. 回到應用程式
2. 重新整理頁面（按 F5 或 Cmd+R）
3. 前往「設定」頁面
4. 查看「用戶權限管理」區塊

現在應該可以看到所有已註冊的用戶了！

## 📋 驗證

執行以下 SQL 來驗證函數是否創建成功：

```sql
-- 測試函數（需要以管理員身份登入）
SELECT * FROM get_members_list();
```

如果函數存在，應該會返回所有用戶的列表。

## 🔍 如果還是只顯示一個用戶

### 檢查 1：確認函數已創建

在 SQL Editor 中執行：

```sql
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_members_list';
```

如果沒有結果，表示函數還沒有創建，請重新執行步驟 1。

### 檢查 2：確認您是管理員

在 SQL Editor 中執行：

```sql
SELECT 
  email,
  raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE id = auth.uid();
```

確認 `is_admin` 為 `true`。

### 檢查 3：查看所有已註冊的用戶

在 SQL Editor 中執行：

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

這會顯示所有已註冊的用戶。如果這裡有多個用戶，但應用程式中只顯示一個，可能是函數權限問題。

## 🆘 如果遇到錯誤

### 錯誤：permission denied

如果執行函數時出現權限錯誤，請確認：
1. 您已經以管理員身份登入
2. 函數使用了 `SECURITY DEFINER`（應該已經包含在腳本中）

### 錯誤：function does not exist

如果出現「函數不存在」的錯誤：
1. 確認已經執行步驟 1 的 SQL 腳本
2. 確認腳本執行成功（沒有錯誤訊息）
3. 重新整理 Supabase Dashboard

## 📝 備註

- 這個函數會從 `auth.users` 表獲取**所有已註冊的用戶**，不管他們是否有任何活動記錄
- 函數需要管理員權限才能執行（安全保護）
- 函數會自動顯示用戶的註冊名稱（如果有的話）

## 🔗 相關文件

- `supabase/create_members_view.sql` - 創建 get_members_list 函數的原始腳本
- `supabase/update_members_function.sql` - 更新版本的函數腳本

