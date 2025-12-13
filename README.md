# 武陵四秀3日遊 - 登山活動協作平台

一個專為登山活動設計的協作平台，提供行程管理、裝備清單、成員資訊等功能，採用手繪風格 UI，支援多人即時協作。

🌐 **線上版本：** https://tourist-lake-one.vercel.app

---

## ✨ 主要功能

- 🎯 **活動介紹** - 倒數計時、海拔剖面圖、活動簡介
- 📅 **共享行程** - 團隊共享的行程時間軸（管理員可編輯）
- 🎒 **裝備管理** - 個人裝備清單、共享裝備認領、預設模板
- 👥 **成員管理** - 成員列表、參與者列表、安全御守、團隊角色
- 🔐 **權限系統** - 管理員權限、資料鎖定機制
- 📧 **團隊邀請** - 邀請碼系統、邀請連結分享
- 🎨 **手繪風格 UI** - 獨特的手繪風格介面設計

---

## 🚀 快速開始

### 1. 環境設定

```bash
# 複製環境變數範例
cp env.example .env.local

# 編輯 .env.local，填入 Supabase 資訊
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 資料庫設定

1. 在 Supabase Dashboard 執行 `supabase/schema.sql`
2. 執行相關的 migration 腳本
3. 設定 Storage bucket（參考 `STORAGE_SETUP.md`）

### 4. 設定管理員

參考 `ADMIN_SETUP.md` 或執行：

```sql
-- 設定管理員（替換為您的 Email）
INSERT INTO user_roles (user_id, is_admin)
SELECT id, true FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
```

### 5. Email 設定

修改 Supabase Email 模板（參考 `EMAIL_TEMPLATE_MODIFICATION_STEPS.md`）

### 6. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

---

## 📚 文件

### 📖 完整文檔
- **[系統總整理](SYSTEM_OVERVIEW.md)** - 完整的系統說明與功能介紹
- **[快速參考指南](QUICK_REFERENCE.md)** - 常用功能快速查找

### 🛠️ 設定指南
- [Supabase 設定](SUPABASE_SETUP.md) - 資料庫完整設定
- [環境變數設定](ENV_SETUP.md) - 環境變數說明
- [管理員設定](ADMIN_SETUP.md) - 如何設定管理員
- [Email 確認設定](EMAIL_CONFIRMATION_SETUP.md) - Email 確認流程
- [Vercel 部署](VERCEL_DEPLOYMENT.md) - 部署到 Vercel

### 📱 功能說明
- [邀請功能指南](INVITE_FEATURE_GUIDE.md) - 團隊邀請使用說明
- [權限管理](USER_PERMISSION_MANAGEMENT.md) - 用戶權限管理
- [帳號刪除功能](DELETE_ACCOUNT_FEATURE.md) - 帳號刪除說明

### 🔧 問題排除
- [常見問題](TROUBLESHOOTING.md) - 問題排除指南
- [註冊錯誤修復](FIX_REGISTRATION_ERROR.md)
- [Email 重定向修復](FIX_EMAIL_REDIRECT_URL.md)

---

## 🗂️ 專案結構

```
tourist/
├── app/                    # Next.js 頁面
├── components/             # React 組件
├── hooks/                  # 自訂 Hooks
├── lib/supabase/           # Supabase 客戶端
├── supabase/               # 資料庫腳本
└── public/                 # 靜態資源
```

詳細結構請參考 [系統總整理](SYSTEM_OVERVIEW.md)。

---

## 🛠️ 技術棧

- **前端：** Next.js 16, React 19, TypeScript
- **樣式：** Tailwind CSS
- **後端：** Supabase (PostgreSQL + Realtime + Storage + Auth)
- **部署：** Vercel
- **字體：** Google Fonts (Kiwi Maru, Zen Maru Gothic, Hachi Maru Pop)

---

## 📋 功能清單

### ✅ 已實現
- [x] 用戶認證（註冊、登入、Email 確認）
- [x] 活動介紹頁面（倒數計時、海拔圖、邀請票）
- [x] 共享行程管理（管理員可編輯）
- [x] 裝備管理（個人、共享、預設模板）
- [x] 成員資訊（安全御守、團隊角色、參與者列表）
- [x] 管理員功能（權限管理、設定管理、帳號刪除）
- [x] 團隊邀請功能
- [x] 即時同步（Supabase Realtime）
- [x] 手繪風格 UI

### 🚧 未來規劃
- [ ] 推播通知系統
- [ ] 團隊聊天功能
- [ ] 天氣資訊整合
- [ ] 地圖路線顯示
- [ ] 照片分享功能
- [ ] 費用分攤計算

---

## 🔐 權限說明

### 一般用戶
- 查看和編輯自己的資料
- 查看共享行程和裝備
- 認領共享裝備
- 填寫個人資訊和選擇角色

### 管理員
- 所有一般用戶權限
- 編輯共享行程
- 管理預設裝備模板
- 設定行程設定（出發日期、邀請碼等）
- 授予/撤銷管理員權限
- 刪除用戶帳號
- 解鎖用戶已鎖定的資訊

---

## 🚀 部署

### Vercel 部署

1. 連接 GitHub 倉庫到 Vercel
2. 設定環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 自動部署完成

詳細步驟請參考 [Vercel 部署指南](VERCEL_DEPLOYMENT.md)。

---

## 📝 開發指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# 檢查程式碼
npm run lint
```

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

---

## 📄 授權

此專案為私人專案。

---

## 📞 技術支援

如遇到問題，請參考：
- [系統總整理](SYSTEM_OVERVIEW.md)
- [快速參考指南](QUICK_REFERENCE.md)
- [問題排除](TROUBLESHOOTING.md)

---

**最後更新：** 2025-01-XX  
**版本：** 1.0.0
