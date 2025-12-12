# 檢查 Supabase 資料庫設置

如果遇到「儲存失敗」的問題，可能是因為 `user_data` 表還沒有在 Supabase 中創建。請按照以下步驟檢查和設置：

## 步驟 1: 檢查表是否存在

1. 打開 Supabase Dashboard
2. 進入您的專案
3. 點擊左側選單的 **"Table Editor"**
4. 查看是否有 `user_data` 表

## 步驟 2: 如果表不存在，執行設置腳本

1. 在 Supabase Dashboard 中，點擊左側選單的 **"SQL Editor"**
2. 點擊 **"New query"**
3. 打開專案中的 `supabase/check_and_setup_user_data.sql` 文件
4. 複製整個文件內容
5. 貼上到 SQL Editor 中
6. 點擊 **"Run"** 執行

## 步驟 3: 驗證設置

執行腳本後，您應該會看到類似以下的訊息：

```
✅ user_data 表已存在（或已創建）
✅ user_data 表結構正確
✅ RLS 已啟用
✅ RLS 政策已設置（4 個政策）
```

## 步驟 4: 測試寫入權限

執行以下 SQL 來測試（需要先登入）：

```sql
-- 測試插入數據（替換 YOUR_USER_ID 為實際的用戶 ID）
-- 可以在 Authentication > Users 中找到您的用戶 ID
INSERT INTO user_data (user_id, key, value)
VALUES (
  auth.uid(),  -- 當前登入用戶的 ID
  'test_key',
  '"test_value"'::jsonb
)
ON CONFLICT (user_id, key) 
DO UPDATE SET value = EXCLUDED.value;

-- 檢查是否成功
SELECT * FROM user_data WHERE user_id = auth.uid();
```

## 常見問題

### Q: 執行腳本時出現錯誤
A: 可能是因為某些對象已經存在。腳本使用了 `IF NOT EXISTS` 和 `DROP IF EXISTS`，應該可以安全地重複執行。

### Q: 仍然無法儲存
A: 請檢查：
1. 用戶是否已成功登入（`auth.uid()` 是否為 null）
2. RLS 政策是否正確設置
3. 瀏覽器控制台中的錯誤訊息

### Q: 如何查看當前用戶 ID
A: 在 SQL Editor 中執行：
```sql
SELECT auth.uid() as current_user_id;
```

## 手動檢查 RLS 政策

在 SQL Editor 中執行：

```sql
-- 查看所有 RLS 政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_data';
```

應該會看到 4 個政策：
- Users can view their own data (SELECT)
- Users can insert their own data (INSERT)
- Users can update their own data (UPDATE)
- Users can delete their own data (DELETE)

