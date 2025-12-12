# 管理員角色管理指南

## 概述

現在有兩種方式可以設定管理員：
1. **在 Table Editor 中直接編輯**（推薦）⭐
2. 使用 SQL 更新

## 方法 1：在 Table Editor 中設定（最簡單）⭐

### 步驟：

1. **執行 SQL 腳本創建表**
   - 在 Supabase Dashboard > SQL Editor 中執行 `supabase/migration_add_user_roles.sql`
   - 這會創建 `user_roles` 表並自動同步現有用戶

2. **在 Table Editor 中編輯**
   - 點擊左側選單的 **"Table Editor"**
   - 找到並點擊 **"user_roles"** 表
   - 找到要設為管理員的用戶
   - 點擊該行的 **"is_admin"** 欄位
   - 將值改為 `true`（或勾選 checkbox）
   - 點擊 **"Save"** 或按 `Enter`

3. **自動同步**
   - 當您更新 `user_roles` 表時，系統會自動同步到 `auth.users.raw_user_meta_data`
   - 不需要手動執行其他操作

### 優點：
- ✅ 視覺化介面，容易操作
- ✅ 不需要寫 SQL
- ✅ 自動同步到 auth.users
- ✅ 可以添加備註（notes 欄位）

---

## 方法 2：使用 SQL 更新

### 通過 user_id 設定：

```sql
UPDATE user_roles
SET is_admin = true,
    role = 'admin',
    updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';
```

### 通過 email 設定：

```sql
UPDATE user_roles
SET is_admin = true,
    role = 'admin',
    updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### 批量設定：

```sql
UPDATE user_roles
SET is_admin = true,
    role = 'admin',
    updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin1@example.com', 'admin2@example.com')
);
```

---

## 查看所有管理員

### 在 Table Editor 中：
1. 打開 `user_roles` 表
2. 點擊 **"Filter"** 按鈕
3. 設定條件：`is_admin = true`
4. 點擊 **"Apply"**

### 使用 SQL：

```sql
SELECT 
  ur.user_id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  ur.is_admin,
  ur.role,
  ur.updated_at
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.is_admin = true
ORDER BY ur.updated_at DESC;
```

---

## 移除管理員權限

### 在 Table Editor 中：
1. 找到要移除管理員權限的用戶
2. 將 `is_admin` 改為 `false`
3. 將 `role` 改為 `user` 或留空
4. 點擊 **"Save"**

### 使用 SQL：

```sql
UPDATE user_roles
SET is_admin = false,
    role = 'user',
    updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

---

## 表結構說明

`user_roles` 表包含以下欄位：

- **id**: UUID，主鍵
- **user_id**: UUID，外鍵關聯到 `auth.users.id`
- **is_admin**: BOOLEAN，是否為管理員（可在 Table Editor 中編輯）
- **role**: TEXT，角色類型（'admin', 'user', 'viewer'）
- **notes**: TEXT，備註（可選）
- **created_at**: TIMESTAMP，創建時間
- **updated_at**: TIMESTAMP，更新時間

---

## 同步機制

### 自動同步：
- 當 `user_roles` 表更新時，會自動同步到 `auth.users.raw_user_meta_data`
- 使用觸發器 `sync_user_role_trigger` 實現

### 手動同步（如果需要）：
```sql
-- 從 auth.users 同步到 user_roles
SELECT sync_auth_to_user_roles();

-- 從 user_roles 同步到 auth.users（已自動執行）
-- 不需要手動執行
```

---

## 驗證設定

執行以下查詢確認管理員設定是否正確：

```sql
SELECT 
  u.email,
  u.raw_user_meta_data->>'name' as name,
  ur.is_admin as role_table_admin,
  (u.raw_user_meta_data->>'is_admin')::boolean as auth_metadata_admin,
  CASE 
    WHEN ur.is_admin = (u.raw_user_meta_data->>'is_admin')::boolean 
    THEN '✅ 已同步' 
    ELSE '⚠️ 未同步' 
  END as sync_status
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.is_admin = true
ORDER BY ur.updated_at DESC;
```

---

## 常見問題

### Q: 為什麼需要創建 user_roles 表？
A: 因為 `auth.users.raw_user_meta_data` 是 JSONB 欄位，無法在 Table Editor 中直接編輯。創建 `user_roles` 表後，就可以在 Table Editor 中直接編輯了。

### Q: 如果直接更新 auth.users 會怎樣？
A: 可以，但不會自動同步到 `user_roles` 表。建議使用 `user_roles` 表作為主要來源。

### Q: 如何確保兩邊同步？
A: 系統會自動同步。如果發現不同步，可以執行 `sync_auth_to_user_roles()` 函數。

### Q: 新用戶註冊時會自動創建 user_roles 記錄嗎？
A: 可以設定自動創建。執行 `supabase/auto_sync_new_users.sql` 腳本後，新用戶註冊時會自動在 `user_roles` 表中創建記錄。如果無法創建觸發器，可以定期執行 `sync_auth_to_user_roles()` 函數。

---

## 快速開始

1. **執行 SQL 腳本**：
   ```sql
   -- 在 SQL Editor 中執行
   -- 複製 supabase/migration_add_user_roles.sql 的內容並執行
   ```

2. **在 Table Editor 中設定**：
   - 打開 `user_roles` 表
   - 找到要設為管理員的用戶
   - 將 `is_admin` 設為 `true`
   - 保存

3. **完成！** 系統會自動同步到 `auth.users`

