# Email 確認功能設定說明

## 📋 功能概述

當用戶從 Email 點擊確認連結後，會自動跳轉到網站並顯示「恭喜您註冊成功！」的通知。

## 🔧 Supabase 設定

### 步驟 1：找到您的生產環境 URL

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 在專案概覽頁面找到 **"Domains"** 區塊
4. 記錄您的生產環境 URL（例如：`https://your-project.vercel.app`）

### 步驟 2：設定 Email 確認重定向 URL

1. 打開 Supabase Dashboard
2. 點擊左側選單的 **"Authentication"**
3. 點擊 **"URL Configuration"**

4. **設定 Site URL（重要！）**
   - 在 **"Site URL"** 欄位中，輸入您的**生產環境 URL**：
     ```
     https://your-project.vercel.app
     ```
     或您的自訂域名：
     ```
     https://your-custom-domain.com
     ```
   - ⚠️ **不要使用 localhost**，這會導致 Email 確認連結指向 localhost
   - 點擊 **"Save"**

5. **添加 Redirect URLs**
   - 在 **"Redirect URLs"** 區塊中，點擊 **"Add URL"**
   - 添加以下 URL（每行一個）：
     ```
     http://localhost:3000/auth/callback
     https://your-project.vercel.app/auth/callback
     ```
     如果您有自訂域名，也要添加：
     ```
     https://your-custom-domain.com/auth/callback
     ```
   - 點擊 **"Save"**

### 步驟 2：確認 Email 模板設定

1. 在 Supabase Dashboard 中，點擊 **"Authentication"** > **"Email Templates"**
2. 找到 **"Confirm signup"** 模板
3. 確認確認連結格式為：
   ```
   {{ .ConfirmationURL }}
   ```
   或
   ```
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
   ```

## 🎯 功能流程

1. **用戶註冊**
   - 填寫註冊表單
   - 系統發送確認 Email

2. **用戶點擊 Email 確認連結**
   - 連結格式：`https://your-domain.com/auth/callback?token_hash=xxx&type=email`
   - 系統自動驗證 token

3. **驗證成功**
   - 自動登入用戶
   - 重定向到首頁，URL 參數為 `?confirmed=true`

4. **顯示成功通知**
   - 首頁會顯示「🎉 恭喜您註冊成功！」的通知
   - 通知會在 5 秒後自動消失
   - 用戶可以手動關閉通知

## 📝 技術細節

### Callback 路由

`app/auth/callback/route.ts` 處理 Email 確認：
- 接收 `token_hash` 和 `type` 參數
- 使用 `supabase.auth.verifyOtp()` 驗證
- 驗證成功後重定向到首頁並添加 `confirmed=true` 參數

### 首頁通知

`app/page.tsx` 檢查 URL 參數：
- 如果 URL 包含 `confirmed=true`，顯示成功通知
- 通知使用手繪風格，與整體 UI 一致
- 5 秒後自動隱藏並清除 URL 參數

## 🆘 常見問題

### Q: 點擊確認連結後沒有顯示成功訊息？
A: 請檢查：
1. Supabase 的 Redirect URL 是否正確設定
2. Callback 路由是否正常工作
3. 瀏覽器控制台是否有錯誤訊息

### Q: 確認連結無效？
A: 請確認：
1. Email 模板中的連結格式是否正確
2. Supabase 的 Site URL 是否正確設定
3. Token 是否已過期（通常 24 小時有效）

### Q: 如何測試 Email 確認功能？
A: 
1. 註冊一個新帳號
2. 檢查 Email 收件匣
3. 點擊確認連結
4. 應該會看到成功通知

## 🔗 相關文件

- `app/auth/callback/route.ts` - Email 確認回調處理
- `app/page.tsx` - 首頁和成功通知顯示

