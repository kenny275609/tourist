# 修復 Email 確認連結跳轉問題

## 🔍 問題說明

Email 確認連結只會跳轉到 `localhost:3000`，而不是生產環境的網站。這是因為 Supabase 的 Redirect URL 配置問題。

## ✅ 解決方案

### 步驟 1：找到您的 Vercel 部署 URL

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 在專案概覽頁面，您會看到 **"Domains"** 區塊
4. 找到您的生產環境 URL，格式通常是：
   - `https://your-project-name.vercel.app`
   - 或者您自訂的域名（如果有設定）

### 步驟 2：在 Supabase 中設定 Redirect URL

1. **登入 Supabase Dashboard**
   - 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 選擇您的專案

2. **前往 Authentication 設定**
   - 點擊左側選單的 **"Authentication"**
   - 點擊 **"URL Configuration"**

3. **設定 Site URL**
   - 在 **"Site URL"** 欄位中，輸入您的生產環境 URL：
     ```
     https://your-project-name.vercel.app
     ```
     或您的自訂域名：
     ```
     https://your-custom-domain.com
     ```
   - 點擊 **"Save"**

4. **添加 Redirect URLs**
   - 在 **"Redirect URLs"** 區塊中，點擊 **"Add URL"**
   - 添加以下 URL（每行一個）：
     ```
     http://localhost:3000/auth/callback
     https://your-project-name.vercel.app/auth/callback
     ```
     如果您有自訂域名，也要添加：
     ```
     https://your-custom-domain.com/auth/callback
     ```
   - 點擊 **"Save"**

### 步驟 3：確認 Email 模板設定

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

### 步驟 4：測試

1. 註冊一個新帳號
2. 檢查 Email 收件匣
3. 點擊確認連結
4. 應該會跳轉到您的生產環境網站（而不是 localhost:3000）
5. 應該會看到「🎉 恭喜您註冊成功！」的通知

## 📋 設定檢查清單

- [ ] 找到 Vercel 部署 URL
- [ ] 在 Supabase 設定 Site URL（生產環境 URL）
- [ ] 在 Supabase 添加 Redirect URLs（包含 localhost 和生產環境）
- [ ] 確認 Email 模板使用 `{{ .ConfirmationURL }}`
- [ ] 測試 Email 確認流程

## 🆘 如果問題仍然存在

### 檢查 1：確認 Site URL 設定

在 Supabase Dashboard > Authentication > URL Configuration 中：
- **Site URL** 應該是您的生產環境 URL（不是 localhost）
- 例如：`https://your-project.vercel.app`

### 檢查 2：確認 Redirect URLs

確保以下 URL 都已添加：
- `http://localhost:3000/auth/callback`（開發環境）
- `https://your-project.vercel.app/auth/callback`（生產環境）

### 檢查 3：清除快取

1. 清除瀏覽器快取
2. 或使用無痕模式測試

### 檢查 4：檢查 Email 連結

打開 Email 中的確認連結，檢查 URL：
- 如果連結是 `localhost:3000` → Site URL 設定錯誤
- 如果連結是生產環境 URL → 應該可以正常運作

## 💡 重要提示

- **Site URL** 決定 Email 確認連結的基礎 URL
- **Redirect URLs** 是允許的重定向目標列表
- 兩者都需要正確設定才能正常運作

## 🔗 相關文件

- `EMAIL_CONFIRMATION_SETUP.md` - Email 確認功能詳細說明
- `VERCEL_REDEPLOY.md` - Vercel 部署說明

