# Email 確認問題診斷指南

## 🔍 需要收集的資訊

請提供以下資訊以幫助診斷問題：

### 1. Email 確認連結的完整 URL
- 請複製 Email 中確認連結的完整 URL
- 格式應該類似：`https://tourist-lake-one.vercel.app/auth/callback?token_hash=xxx&type=email`

### 2. 點擊連結後的瀏覽器地址欄 URL
- 點擊確認連結後，瀏覽器地址欄顯示的完整 URL 是什麼？
- 是否有重定向到 `/auth/callback`？

### 3. 控制台日誌
- 打開瀏覽器開發者工具（F12）> Console 標籤
- 點擊確認連結後，請複製所有控制台輸出
- 特別注意是否有以下訊息：
  - "Email confirmation link detected"
  - "Email verification successful"
  - "Redirecting to:"
  - "Checking URL params:"

### 4. Supabase Email 模板設定
- 前往 Supabase Dashboard > Authentication > Email Templates
- 找到 "Confirm signup" 模板
- 請複製模板中的確認連結部分（通常是 `{{ .ConfirmationURL }}` 或類似的內容）

### 5. Supabase Redirect URLs 設定
- 前往 Supabase Dashboard > Authentication > URL Configuration
- 請截圖或複製 "Redirect URLs" 區塊中的所有 URL

## 🛠️ 臨時解決方案

如果問題持續，我們可以改用另一種方法：在首頁檢查用戶的 Email 確認狀態，如果剛剛確認就顯示通知。

