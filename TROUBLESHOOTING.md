# 故障排除指南

## "Invalid API key" 錯誤

### 可能原因

1. **API Key 已過期或無效**
2. **環境變數未正確載入**
3. **Supabase 專案設定問題**

### 解決步驟

#### 步驟 1：確認環境變數

檢查 `.env.local` 文件是否存在且內容正確：

```bash
# 在專案根目錄執行
cat .env.local
```

應該看到：
```
NEXT_PUBLIC_SUPABASE_URL=https://ahtwmunbgfzzawwweggo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 步驟 2：重新取得 API Key

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 點擊 **Settings** > **API**
4. 在 **"Legacy anon, service_role API keys"** 標籤中：
   - 複製 **Project URL**
   - 複製 **anon public key**
5. 更新 `.env.local` 文件

#### 步驟 3：確認 API Key 格式

- **URL** 應該以 `https://` 開頭，以 `.supabase.co` 結尾
- **Anon Key** 應該很長（通常 200+ 字元），以 `eyJ` 開頭

#### 步驟 4：重新啟動開發伺服器

```bash
# 停止目前的伺服器（Ctrl + C）
# 然後重新啟動
npm run dev
```

#### 步驟 5：清除瀏覽器快取

- 按 `Ctrl + Shift + R` (Windows/Linux) 或 `Cmd + Shift + R` (Mac) 強制重新載入
- 或清除瀏覽器快取後重新載入

#### 步驟 6：檢查 Supabase 專案狀態

1. 前往 Supabase Dashboard
2. 確認專案狀態為 **Active**
3. 檢查是否有任何警告或錯誤訊息

### 驗證 API Key 是否有效

在瀏覽器控制台（F12）執行：

```javascript
// 檢查環境變數是否載入
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### 如果問題仍然存在

1. **檢查 Supabase 專案的 API 設定**
   - 確認 API 功能已啟用
   - 檢查是否有 IP 限制或防火牆設定

2. **嘗試使用新的 API Key**
   - 在 Supabase Dashboard 中重新生成 API Key（如果可能）

3. **檢查網路連線**
   - 確認可以訪問 Supabase 服務

