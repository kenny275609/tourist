# 環境變數設定指南

## 快速設定

### 方法 1：使用提供的範例文件

1. 複製 `env.example` 文件為 `.env.local`：
   ```bash
   cp env.example .env.local
   ```

2. 編輯 `.env.local`，填入您的 Supabase 資訊：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ahtwmunbgfzzawwweggo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHdtdW5iZ2fzzawwweWdnbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1MzY3MzcxLCJleHAiOjIwODA5NDMzNzF9.WFAjhjhMdBuwFizC6lIUJpQswzB3F_ef6TWbcz8X0sg
   ```

### 方法 2：手動創建

在專案根目錄創建 `.env.local` 文件，內容如下：

```env
# Supabase 專案 URL
NEXT_PUBLIC_SUPABASE_URL=https://ahtwmunbgfzzawwweggo.supabase.co

# Supabase Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHdtdW5iZ2fzzawwweWdnbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1MzY3MzcxLCJleHAiOjIwODA5NDMzNzF9.WFAjhjhMdBuwFizC6lIUJpQswzB3F_ef6TWbcz8X0sg
```

## 取得 Supabase 資訊

### 1. 登入 Supabase Dashboard
前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)

### 2. 選擇您的專案
點擊專案名稱進入專案儀表板

### 3. 取得 API 資訊
- 點擊左側選單的 **"Settings"** (設定)
- 點擊 **"API"** 選項
- 在 **"Legacy anon, service_role API keys"** 標籤中：
  - **Project URL**: 這是 `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public key**: 這是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 驗證設定

設定完成後，重新啟動開發伺服器：

```bash
npm run dev
```

如果設定正確，應用程式應該可以正常連接到 Supabase。

## 注意事項

- ⚠️ `.env.local` 文件包含敏感資訊，**不會**被推送到 Git
- ✅ `env.example` 文件是範例，可以推送到 Git
- 🔒 請勿在公開場所分享您的 `.env.local` 文件內容

## Vercel 部署設定

在 Vercel 部署時，需要在 Vercel Dashboard 中設定環境變數：

1. 前往 Vercel 專案設定
2. 點擊 **"Environment Variables"**
3. 添加以下變數：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ahtwmunbgfzzawwweggo.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHdtdW5iZ2fzzawwweWdnbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1MzY3MzcxLCJleHAiOjIwODA5NDMzNzF9.WFAjhjhMdBuwFizC6lIUJpQswzB3F_ef6TWbcz8X0sg`
4. 點擊 **"Save"**
5. 重新部署專案

