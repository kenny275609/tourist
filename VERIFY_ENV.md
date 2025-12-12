# 環境變數驗證

## 已設定的環境變數

### Supabase URL
```
https://ahtwmunbgfzzawwweggo.supabase.co
```

### Supabase Anon Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHdtdW5iZ2Z6emF3d3dlZ2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjczNzEsImV4cCI6MjA4MDk0MzM3MX0.WFAjhjhMdBuwFizC6lIUJpQswzB3F_ef6TWbcz8X0sg
```

## 驗證步驟

### 1. 確認文件已更新
```bash
cat .env.local
```

### 2. 重新啟動開發伺服器
```bash
# 停止目前的伺服器（Ctrl + C）
npm run dev
```

### 3. 測試連線
在瀏覽器中打開 `http://localhost:3000`，嘗試註冊或登入。

### 4. 檢查瀏覽器控制台
按 `F12` 打開開發者工具，查看 Console 標籤：
- 不應該有 "Invalid API key" 錯誤
- 不應該有 "Missing Supabase environment variables" 警告

## 如果仍有問題

1. **清除瀏覽器快取**
   - 按 `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows)

2. **檢查 Supabase 專案狀態**
   - 前往 [Supabase Dashboard](https://supabase.com/dashboard)
   - 確認專案狀態為 **Active**

3. **驗證 API Key 權限**
   - 在 Supabase Dashboard > Settings > API
   - 確認 anon key 有正確的權限

