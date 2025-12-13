# 修復註冊錯誤指南

## 🔍 問題診斷

從控制台錯誤可以看到：
- **錯誤訊息**: "Database error saving new user"
- **HTTP 狀態碼**: 500
- **錯誤來源**: Supabase `/auth/v1/signup` 端點

從 SQL 查詢結果可以看到：
- 觸發器 `auto_create_user_profile_trigger` 存在於 `auth.users` 表上
- 這個觸發器在用戶註冊時執行，但可能因為權限或 RLS 政策問題導致失敗

## ✅ 解決方案

### 步驟 1：移除有問題的觸發器

在 **Supabase Dashboard > SQL Editor** 中執行以下 SQL：

```sql
-- 移除 auto_create_user_profile 觸發器
DROP TRIGGER IF EXISTS auto_create_user_profile_trigger ON auth.users;

-- 移除 auto_create_user_role 觸發器（如果存在）
DROP TRIGGER IF EXISTS auto_create_user_role_trigger ON auth.users;
```

或者直接執行 `supabase/remove_trigger_if_exists.sql` 文件。

### 步驟 2：驗證觸發器已移除

執行以下查詢確認觸發器已移除：

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

**預期結果**：應該返回空結果（沒有觸發器）。

### 步驟 3：測試註冊

移除觸發器後，嘗試註冊新帳號。註冊應該可以正常運作。

## 📝 替代方案

移除觸發器後，`user_profiles` 記錄會通過以下方式創建：

1. **客戶端創建**：用戶登入後，前端代碼會自動創建 `user_profiles` 記錄
2. **登入觸發器**：可以執行 `supabase/create_user_profile_on_login.sql` 來設置登入時自動創建（可選）

## 🆘 如果問題仍然存在

如果移除觸發器後仍然無法註冊，請檢查：

1. **Supabase 日誌**：
   - 前往 Supabase Dashboard > Logs > Postgres Logs
   - 查看註冊時的詳細錯誤訊息

2. **RLS 政策**：
   - 確認 `user_profiles` 表的 RLS 政策是否正確
   - 執行 `supabase/migration_add_user_profiles.sql` 來確保政策正確

3. **表結構**：
   - 確認 `user_profiles` 表存在
   - 確認表結構正確

## 📋 檢查清單

- [ ] 執行移除觸發器的 SQL
- [ ] 驗證觸發器已移除
- [ ] 測試註冊功能
- [ ] 確認用戶可以成功註冊
- [ ] 確認 `user_profiles` 記錄在登入後自動創建

