# 武陵四秀 - 登山行程規劃

一個具有可編輯行程和裝備清單功能的武陵四秀登陸頁面。

## 功能特色

- **詳細行程（3天）**：可編輯的垂直時間軸，顯示每天的行程檢查點
- **智能打包清單**：分類的裝備清單（衣物和必備裝備），支援新增、編輯、刪除和勾選功能
- **交通資訊**：前往武陵農場的交通方式說明
- **手繪風格設計**：使用 Patrick Hand 字體和手繪風格的圖標

## 技術棧

- **Next.js 16** - React 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式設計
- **Supabase** - 後端服務（認證和數據庫）
- **Lucide React** - 圖標庫
- **Patrick Hand** - 手繪風格字體

## 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Supabase

請參考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 的詳細說明。

快速步驟：
1. 在 [Supabase](https://supabase.com) 建立專案
2. 取得 API 金鑰（Project URL 和 anon key）
3. 建立 `.env.local` 檔案：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 在 Supabase SQL Editor 執行 `supabase/schema.sql` 建立數據表

### 3. 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 查看結果。

## 部署到 Vercel

### 方法 1：透過 GitHub 部署（推薦）

1. 將專案推送到 GitHub：
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. 在 [Vercel](https://vercel.com) 上：
   - 登入或註冊帳號
   - 點擊 "New Project"
   - 選擇你的 GitHub 儲存庫
   - Vercel 會自動偵測 Next.js 專案並設定部署
   - 點擊 "Deploy"

### 方法 2：使用 Vercel CLI

1. 安裝 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 在專案目錄中執行：
   ```bash
   vercel
   ```

3. 按照提示完成部署

## 專案結構

```
tourist/
├── app/
│   ├── layout.tsx      # 根布局（字體設定）
│   ├── page.tsx        # 主頁面
│   └── globals.css     # 全域樣式
├── components/
│   ├── ItineraryTimeline.tsx  # 行程時間軸組件
│   ├── GearList.tsx           # 裝備清單組件
│   └── Transportation.tsx     # 交通資訊組件
├── vercel.json         # Vercel 部署配置
└── package.json        # 專案依賴
```

## 功能說明

### 行程時間軸
- 顯示 3 天的行程檢查點
- 每個檢查點可以編輯（點擊鉛筆圖標）或刪除（點擊垃圾桶圖標）
- 使用垂直時間軸視覺化展示

### 裝備清單
- 分為兩個類別：衣物（分層系統）和必備裝備
- 每個項目可以：
  - 勾選/取消勾選（點擊圓圈）
  - 編輯名稱（點擊鉛筆圖標）
  - 刪除（點擊垃圾桶圖標）
- 底部有「新增物品」按鈕，可以添加新項目

## 授權

MIT License
