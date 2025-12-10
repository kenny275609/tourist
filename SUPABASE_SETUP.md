# Supabase 設定指南

本專案使用 Supabase 作為後端服務，提供認證和數據存儲功能。

## 步驟 1: 建立 Supabase 專案

1. 前往 [https://supabase.com](https://supabase.com)
2. 註冊或登入帳號
3. 點擊 "New Project" 建立新專案
4. 填寫專案資訊：
   - Project Name: `tourist` (或您喜歡的名稱)
   - Database Password: 設定一個強密碼（請記住它）
   - Region: 選擇最接近您的地區
5. 等待專案建立完成（約 2 分鐘）

## 步驟 2: 取得 API 金鑰

1. 在 Supabase 專案儀表板中，點擊左側選單的 "Settings" (設定)
2. 點擊 "API" 選項（或直接點擊 "API Keys"）
3. 您會看到兩個標籤：
   - **"Publishable and secret API keys"** (新格式)
   - **"Legacy anon, service_role API keys"** (舊格式，推薦使用)

### 方法 A: 使用 Legacy API Keys（推薦）

1. 點擊 **"Legacy anon, service_role API keys"** 標籤
2. 您會看到：
   - **Project URL**: 這是 `NEXT_PUBLIC_SUPABASE_URL`（例如：`https://xxxxx.supabase.co`）
   - **anon public key**: 這是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（很長的字串，以 `eyJ...` 開頭）

### 方法 B: 使用新的 Publishable Key

1. 在 **"Publishable and secret API keys"** 標籤中
2. 複製 **Publishable key**（例如：`sb_publishable_...`）
3. 這個可以作為 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 使用
4. **Project URL** 仍然需要從 Legacy 標籤或 Settings > API 頁面取得

## 步驟 3: 設定環境變數

1. 在專案根目錄建立 `.env.local` 檔案
2. 複製 `.env.local.example` 的內容
3. 填入您的 Supabase 資訊：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 步驟 4: 建立數據庫表

1. 在 Supabase 專案儀表板中，點擊左側選單的 "SQL Editor"
2. 點擊 "New Query"
3. 複製 `supabase/schema.sql` 檔案的內容
4. 貼上到 SQL Editor 中
5. 點擊 "Run" 執行 SQL 腳本
6. 確認表已成功建立：
   - 點擊左側選單的 "Table Editor"
   - 您應該看到 `user_data` 和 `shared_gear` 兩個表

## 步驟 5: 設定認證

1. 在 Supabase 專案儀表板中，點擊左側選單的 "Authentication"
2. 點擊 "Providers"
3. 確認 "Email" 提供者已啟用（預設已啟用）
4. 可選：設定 "Email Templates" 來自訂註冊和密碼重設郵件

## 步驟 6: 測試應用程式

1. 在專案目錄執行：
   ```bash
   npm run dev
   ```

2. 打開瀏覽器訪問 `http://localhost:3000`

3. 測試功能：
   - 註冊新帳號
   - 登入
   - 編輯行程
   - 編輯個人裝備
   - 認領共同裝備

## 數據庫結構說明

### `user_data` 表
- 存儲每個用戶的個人數據
- 包含行程檢查點和個人裝備清單
- 使用 `user_id` 和 `key` 作為唯一識別

### `shared_gear` 表
- 存儲團隊共同使用的裝備
- 所有用戶共享同一份數據（使用 `team_id`）
- 支援認領功能

## 安全性

- Row Level Security (RLS) 已啟用
- 用戶只能存取自己的數據
- 共同裝備需要認證才能存取

## 疑難排解

### 問題：無法登入/註冊
- 檢查環境變數是否正確設定
- 確認 Supabase 專案的認證功能已啟用
- 檢查瀏覽器控制台是否有錯誤訊息

### 問題：數據無法保存
- 確認 SQL 腳本已成功執行
- 檢查 RLS 政策是否正確設定
- 確認用戶已成功登入

### 問題：共同裝備無法同步
- 確認 `shared_gear` 表已建立
- 檢查 RLS 政策是否允許認證用戶存取
- 確認 Supabase 即時訂閱功能正常運作

## 進階設定

### 自訂團隊 ID
目前共同裝備使用 `default-team` 作為團隊 ID。如果您想要支援多個團隊：

1. 修改 `hooks/useSharedGearState.ts` 中的 `teamId` 參數
2. 可以從用戶資料中讀取團隊 ID，或讓用戶選擇團隊

### 添加更多認證方式
Supabase 支援多種認證方式（Google、GitHub 等）：

1. 在 Supabase 儀表板的 "Authentication" > "Providers" 中啟用
2. 更新 `components/Auth.tsx` 添加對應的登入按鈕

## 支援

如有問題，請參考：
- [Supabase 文件](https://supabase.com/docs)
- [Next.js + Supabase 指南](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

