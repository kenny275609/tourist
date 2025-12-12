# 修復 RLS 遞迴錯誤

## 🔴 錯誤訊息

```
更新失敗: infinite recursion detected in policy for relation "user_roles"
錯誤代碼: 42P17
```

## 🔍 問題原因

`user_roles` 表的 RLS 政策中包含了 `EXISTS` 子查詢，當嘗試更新 `user_roles` 表時：

1. RLS 政策檢查：`EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)`
2. 這個子查詢本身也會觸發 RLS 政策檢查
3. 導致無限遞迴循環

## ✅ 解決方法

### 步驟 1：執行修復腳本

1. 打開 Supabase Dashboard
2. 點擊左側選單的 **"SQL Editor"**
3. 點擊 **"New query"**
4. 複製並執行以下 SQL 腳本：

```sql
-- 修復 user_roles 表的 RLS 政策遞迴問題
DROP POLICY IF EXISTS "只有管理員可以管理用戶角色" ON user_roles;

-- 創建新的政策：只使用 user_metadata 檢查，避免遞迴
CREATE POLICY "只有管理員可以管理用戶角色"
  ON user_roles FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  );
```

5. 點擊 **"Run"** 執行腳本

### 步驟 2：確認管理員權限已同步

執行修復腳本後，確保您的管理員權限已同步到 `user_metadata`：

```sql
-- 檢查您的管理員狀態
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin_in_metadata,
  (SELECT is_admin FROM user_roles WHERE user_id = auth.uid()) as is_admin_in_table
FROM auth.users
WHERE id = auth.uid();
```

如果 `is_admin_in_metadata` 不是 `true`，執行同步：

```sql
-- 同步所有用戶的權限到 user_metadata
SELECT sync_auth_to_user_roles();
```

### 步驟 3：重新整理頁面

1. 回到應用程式
2. 重新整理頁面（按 F5 或 Cmd+R）
3. 再次嘗試授予管理員權限

## 📋 修復腳本位置

修復腳本已保存在：`supabase/fix_user_roles_rls_recursion.sql`

## 🔍 技術說明

### 為什麼會發生遞迴？

原始政策：
```sql
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
)
```

當執行 `UPDATE user_roles` 時：
1. RLS 檢查觸發 → 執行 `EXISTS` 子查詢
2. `EXISTS` 子查詢需要讀取 `user_roles` 表 → 再次觸發 RLS 檢查
3. 無限循環 → 錯誤 42P17

### 修復後的政策

```sql
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true'
)
```

這個政策：
- ✅ 只檢查 JWT token 中的 `user_metadata`，不會查詢資料庫
- ✅ 不會觸發遞迴
- ✅ 性能更好（不需要查詢資料庫）

### 重要注意事項

1. **管理員權限必須在 user_metadata 中**
   - 修復後的政策只檢查 `user_metadata.is_admin`
   - 如果管理員權限只在 `user_roles` 表中，需要先同步到 `user_metadata`

2. **自動同步機制**
   - `sync_user_role_trigger` 觸發器會自動將 `user_roles` 的變更同步到 `user_metadata`
   - 但首次設定管理員時，可能需要手動執行 `sync_auth_to_user_roles()`

3. **雙重檢查機制**
   - 雖然移除了 `EXISTS` 檢查，但 `sync_user_role_trigger` 會確保 `user_roles` 和 `user_metadata` 保持同步
   - 因此不會有安全問題

## 🆘 如果修復後仍然有問題

### 檢查 1：確認政策已更新

```sql
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'user_roles'
  AND policyname = '只有管理員可以管理用戶角色';
```

確認 `using_expression` 中**沒有** `EXISTS` 子查詢。

### 檢查 2：確認管理員權限

```sql
-- 檢查當前用戶的管理員狀態
SELECT 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' as is_admin
FROM auth.users
WHERE id = auth.uid();
```

如果返回 `null` 或 `false`，執行：

```sql
-- 同步權限
SELECT sync_auth_to_user_roles();

-- 重新登入以刷新 JWT token
```

### 檢查 3：清除快取

如果問題仍然存在：
1. 登出應用程式
2. 清除瀏覽器快取
3. 重新登入
4. 再次嘗試

## 📚 相關文件

- `supabase/migration_add_user_roles.sql` - 原始 migration 腳本（已更新）
- `supabase/fix_user_roles_rls_recursion.sql` - 修復腳本

