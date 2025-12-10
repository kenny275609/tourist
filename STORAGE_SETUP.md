# Supabase Storage 設定指南

## 設定步驟

### 1. 創建 Storage Bucket

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 前往 **Storage** 頁面（左側選單）
4. 點擊 **New bucket** 按鈕
5. 設定以下資訊：
   - **Name**: `trip-images`
   - **Public bucket**: ✅ 勾選（讓圖片可以公開訪問）
6. 點擊 **Create bucket**

### 2. 設定 Storage 政策（RLS）

1. 在 Storage 頁面，點擊 `trip-images` bucket
2. 前往 **Policies** 標籤
3. 點擊 **New policy** 或使用以下 SQL 在 SQL Editor 中執行：

#### 允許所有人讀取（SELECT）

```sql
-- 允許所有人讀取 bucket 中的文件
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-images');
```

#### 允許已認證用戶上傳（INSERT）

```sql
-- 允許已認證用戶上傳文件
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trip-images' 
  AND auth.role() = 'authenticated'
);
```

#### 允許已認證用戶更新（UPDATE）

```sql
-- 允許已認證用戶更新文件
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'trip-images' 
  AND auth.role() = 'authenticated'
);
```

#### 允許已認證用戶刪除（DELETE）

```sql
-- 允許已認證用戶刪除文件
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trip-images' 
  AND auth.role() = 'authenticated'
);
```

### 3. 驗證設定

完成設定後，管理員就可以在應用程式中上傳圖片了。

## 注意事項

- **Bucket 名稱**：必須是 `trip-images`（與程式碼中的設定一致）
- **公開訪問**：bucket 必須設定為公開，否則圖片無法顯示
- **文件大小限制**：目前設定為 5MB，可以在程式碼中調整
- **支援格式**：支援所有常見圖片格式（JPG、PNG、WebP、GIF 等）

## 故障排除

### 問題：上傳失敗，顯示權限錯誤

**解決方案**：
1. 確認 bucket 已創建且名稱正確
2. 確認已設定正確的 RLS 政策
3. 確認用戶已登入（已認證）

### 問題：圖片無法顯示

**解決方案**：
1. 確認 bucket 已設定為公開（Public bucket）
2. 檢查圖片 URL 是否正確
3. 確認 Storage 政策允許 SELECT 操作

### 問題：上傳的文件太大

**解決方案**：
- 目前限制為 5MB
- 可以在 `TripSettingsManager.tsx` 中修改 `file.size > 5 * 1024 * 1024` 這一行來調整限制

## 使用 Supabase CLI（可選）

如果您使用 Supabase CLI，也可以通過命令行創建 bucket：

```bash
supabase storage create trip-images --public
```

然後使用 SQL Editor 設定政策。

