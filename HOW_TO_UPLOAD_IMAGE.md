# 如何將本地圖片轉換為 URL

有幾種方法可以將您電腦上的圖片轉換為可用的 URL：

## 方法 1：使用 Supabase Storage（推薦）⭐

這是最推薦的方法，因為您已經在使用 Supabase。

### 步驟：

1. **準備 Supabase Storage**
   - 登入 [Supabase Dashboard](https://app.supabase.com)
   - 選擇您的專案
   - 前往 **Storage** 頁面
   - 如果還沒有 `trip-images` bucket，請創建一個（參考 `STORAGE_SETUP.md`）

2. **上傳圖片**
   - 在 Storage 頁面，點擊 `trip-images` bucket
   - 點擊 **Upload file** 按鈕
   - 選擇您的企鵝家族地圖圖片
   - 上傳完成後，點擊圖片名稱

3. **取得公開 URL**
   - 上傳後，點擊圖片名稱
   - 在右側面板中，您會看到 **Public URL**
   - 複製這個 URL（格式類似：`https://xxxxx.supabase.co/storage/v1/object/public/trip-images/your-image.jpg`）

4. **使用 URL**
   - 將這個 URL 貼到應用程式的「海拔剖面圖圖片」欄位
   - 或執行 SQL 腳本更新預設值

## 方法 2：使用 Imgur（免費圖床）

### 步驟：

1. **前往 Imgur**
   - 打開 [https://imgur.com](https://imgur.com)
   - 不需要註冊（但註冊後可以管理圖片）

2. **上傳圖片**
   - 點擊頁面頂部的 **New post** 或直接拖放圖片到頁面
   - 選擇您的企鵝家族地圖圖片
   - 等待上傳完成

3. **取得 URL**
   - 上傳完成後，右鍵點擊圖片
   - 選擇 **Copy image address** 或 **Copy image link**
   - 或點擊圖片，在右側找到 **Direct link**，複製它

4. **使用 URL**
   - 將 URL 貼到應用程式中

## 方法 3：使用 Cloudinary（專業圖床）

### 步驟：

1. **註冊帳號**
   - 前往 [https://cloudinary.com](https://cloudinary.com)
   - 註冊免費帳號

2. **上傳圖片**
   - 登入後，點擊 **Media Library**
   - 點擊 **Upload** 按鈕
   - 選擇您的圖片上傳

3. **取得 URL**
   - 上傳後，點擊圖片
   - 在右側面板中找到 **URL** 或 **Secure URL**
   - 複製 URL

4. **使用 URL**
   - 將 URL 貼到應用程式中

## 方法 4：使用 GitHub（如果您有 GitHub 帳號）

### 步驟：

1. **創建儲存庫或使用現有儲存庫**
   - 在 GitHub 上創建一個新的 public repository（例如：`tourist-images`）
   - 或使用現有的 repository

2. **上傳圖片**
   - 在 repository 中，點擊 **Add file** > **Upload files**
   - 拖放您的圖片
   - 填寫 commit message
   - 點擊 **Commit changes**

3. **取得 URL**
   - 上傳後，點擊圖片檔案
   - 點擊 **Download** 按鈕旁邊的 **Raw** 按鈕
   - 複製瀏覽器地址欄中的 URL
   - URL 格式：`https://raw.githubusercontent.com/username/repo-name/branch/image.jpg`

4. **使用 URL**
   - 將 URL 貼到應用程式中

## 方法 5：直接在應用程式中上傳（最簡單）✨

如果您已經設定好 Supabase Storage，這是最簡單的方法：

1. **以管理員身份登入應用程式**
2. **前往「設定」頁面**
3. **在「行程設定」中找到「海拔剖面圖圖片」**
4. **點擊「上傳圖片」按鈕**
5. **選擇您的企鵝家族地圖圖片**
6. **系統會自動上傳並設定**

## 推薦順序

1. **方法 5（應用程式內上傳）** - 最簡單，一鍵完成
2. **方法 1（Supabase Storage）** - 與您的系統整合最好
3. **方法 2（Imgur）** - 免費且快速
4. **方法 3（Cloudinary）** - 專業功能多
5. **方法 4（GitHub）** - 適合開發者

## 注意事項

- 確保圖片是公開可訪問的
- 建議圖片大小不超過 5MB
- 支援的格式：JPG、PNG、WebP、GIF 等
- 如果使用 Supabase Storage，確保 bucket 設定為公開（Public）

## 取得 URL 後

取得圖片 URL 後，您可以：

1. **在應用程式中設定**：
   - 以管理員身份登入
   - 前往「設定」>「行程設定」
   - 在「海拔剖面圖圖片」的 URL 欄位中貼上 URL
   - 點擊「儲存設定」

2. **或使用 SQL 腳本**：
   - 執行 `supabase/update_default_elevation_image.sql`
   - 將 `YOUR_IMAGE_URL_HERE` 替換為實際的 URL

