# Vercel 部署指南

## 部署前準備

### 1. 確認環境變數

確保您的 `.env.local` 文件包含以下變數：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 確認資料庫已設定

在 Supabase 中執行以下 SQL 腳本（按順序）：
1. `supabase/schema.sql` - 建立基本資料表
2. `supabase/migration_add_user_gear_items.sql` - 用戶裝備表
3. `supabase/migration_add_admin_system.sql` - 管理員系統
4. `supabase/migration_add_trip_settings.sql` - 行程設定表

### 3. 確認 Supabase Storage 已設定

參考 `STORAGE_SETUP.md` 設定 Storage bucket（如果要用圖片上傳功能）

## 部署步驟

### 方法 1：透過 GitHub 部署（推薦）⭐

1. **將代碼推送到 GitHub**
   ```bash
   git add .
   git commit -m "準備部署到 Vercel"
   git push origin main
   ```

2. **在 Vercel 上連接專案**
   - 前往 [Vercel](https://vercel.com)
   - 登入或註冊帳號
   - 點擊 **"New Project"** 或 **"Add New..."** > **"Project"**
   - 選擇您的 GitHub 儲存庫
   - 點擊 **"Import"**

3. **設定環境變數**
   - 在專案設定頁面，前往 **"Environment Variables"**
   - 添加以下變數：
     - `NEXT_PUBLIC_SUPABASE_URL` = 您的 Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 您的 Supabase Anon Key
   - 點擊 **"Save"**

4. **部署**
   - 點擊 **"Deploy"**
   - 等待部署完成（約 2-3 分鐘）

### 方法 2：使用 Vercel CLI

1. **安裝 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登入 Vercel**
   ```bash
   vercel login
   ```

3. **部署專案**
   ```bash
   cd /Users/linzongyi/Desktop/Code/tourist
   vercel
   ```

4. **設定環境變數**
   - 在 Vercel Dashboard 中，前往專案設定
   - 添加環境變數：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **重新部署**
   ```bash
   vercel --prod
   ```

## 部署後檢查

### 1. 檢查環境變數
- 確認 Vercel 專案設定中的環境變數已正確設定
- 確認變數名稱完全正確（大小寫敏感）

### 2. 檢查資料庫
- 確認 Supabase 資料庫已執行所有必要的 SQL 腳本
- 確認 RLS 政策已正確設定

### 3. 測試功能
- 訪問部署的網站
- 測試註冊/登入功能
- 測試管理員功能（如果已設定）
- 測試行程、裝備等功能

## 常見問題

### 問題：環境變數未生效

**解決方案**：
1. 確認環境變數名稱完全正確
2. 在 Vercel Dashboard 中重新設定環境變數
3. 重新部署專案

### 問題：資料庫連接失敗

**解決方案**：
1. 檢查 Supabase URL 和 Key 是否正確
2. 確認 Supabase 專案狀態正常
3. 檢查 RLS 政策是否正確設定

### 問題：圖片無法顯示

**解決方案**：
1. 確認 Supabase Storage bucket 已設定為公開
2. 確認 Storage 政策已正確設定
3. 檢查圖片 URL 是否正確

## 自動部署

部署到 Vercel 後，每次推送到 GitHub 的 main 分支都會自動觸發部署。

## 注意事項

- **環境變數**：`.env.local` 文件不會被推送到 GitHub，需要在 Vercel 中手動設定
- **資料庫遷移**：需要在 Supabase Dashboard 中手動執行 SQL 腳本
- **Storage 設定**：需要在 Supabase Dashboard 中手動設定 Storage bucket

## 部署檢查清單

- [ ] 代碼已推送到 GitHub
- [ ] Vercel 專案已連接 GitHub 儲存庫
- [ ] 環境變數已設定（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY）
- [ ] Supabase 資料庫已執行所有 SQL 腳本
- [ ] Supabase Storage 已設定（如果使用圖片上傳）
- [ ] 管理員帳號已設定（參考 ADMIN_SETUP.md）
- [ ] 測試部署後的網站功能

