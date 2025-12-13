# 快速參考指南

## 🚀 快速開始

### 新專案設定
1. 複製環境變數：`cp env.example .env.local`
2. 設定 Supabase 環境變數
3. 執行資料庫腳本：`supabase/schema.sql`
4. 設定管理員：參考 `ADMIN_SETUP.md`
5. 修改 Email 模板：參考 `EMAIL_TEMPLATE_MODIFICATION_STEPS.md`
6. 部署到 Vercel：參考 `VERCEL_DEPLOYMENT.md`

## 📱 頁面路由

| 路由 | 功能 | 權限 |
|------|------|------|
| `/` | 活動介紹、倒數計時、海拔圖 | 所有人 |
| `/itinerary` | 共享行程時間軸 | 所有人（管理員可編輯） |
| `/gear` | 個人裝備、共享裝備 | 所有人 |
| `/members` | 成員資訊、安全御守、團隊角色 | 所有人 |
| `/members/setup` | 設定個人資訊和角色 | 所有人 |
| `/admin` | 管理員設定頁面 | 僅管理員 |
| `/invite/[code]` | 團隊邀請頁面 | 所有人 |

## 🔑 管理員功能快速入口

### 設定管理員
```sql
-- 方法 1：使用 user_metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'your-email@example.com';

-- 方法 2：使用 user_roles 表（推薦）
INSERT INTO user_roles (user_id, is_admin)
SELECT id, true FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
```

### 授予其他用戶管理員權限
1. 前往 `/admin` 頁面
2. 找到「用戶權限管理」區塊
3. 點擊用戶旁邊的「授予管理員權限」按鈕

## 📧 Email 確認設定

### Supabase Email 模板修改
將確認連結改為：
```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">確認 Email</a>
```

### Supabase Redirect URLs
```
http://localhost:3000/auth/callback
https://tourist-lake-one.vercel.app/auth/callback
```

## 🗄️ 常用 SQL 查詢

### 查看所有用戶
```sql
SELECT * FROM user_profiles;
```

### 查看管理員列表
```sql
SELECT u.email, ur.is_admin 
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE ur.is_admin = true OR (u.raw_user_meta_data->>'is_admin')::boolean = true;
```

### 查看參與者列表
```sql
SELECT * FROM get_participants_list();
```

### 刪除用戶（管理員專用）
```sql
SELECT delete_user_by_admin('user_id_here');
```

## 🛠️ 常見問題快速修復

### 註冊失敗
- 檢查 `user_profiles` 表是否存在
- 檢查 RLS 政策是否正確
- 參考：`FIX_REGISTRATION_ERROR.md`

### Email 確認連結無效
- 檢查 Supabase Site URL 設定
- 檢查 Email 模板格式
- 參考：`FIX_EMAIL_REDIRECT_URL.md`

### 權限管理列表只顯示一個用戶
- 檢查 `user_roles` 表是否存在
- 檢查 RLS 政策
- 參考：`FIX_USER_PERMISSION_LIST.md`

### 無限遞迴錯誤（RLS）
- 執行 `supabase/fix_user_roles_rls_recursion.sql`
- 參考：`FIX_RLS_RECURSION_ERROR.md`

## 📦 重要檔案位置

### 環境變數
- `.env.local` - 本地開發環境變數
- `env.example` - 環境變數範例

### 資料庫腳本
- `supabase/schema.sql` - 主要資料表結構
- `supabase/migration_*.sql` - 遷移腳本

### 核心組件
- `app/page.tsx` - 首頁
- `components/Navigation.tsx` - 底部導航
- `hooks/useAuth.ts` - 認證狀態

## 🔄 重新部署流程

1. 修改程式碼
2. 提交到 GitHub：`git add . && git commit -m "..." && git push`
3. Vercel 自動部署
4. 檢查環境變數是否正確
5. 測試功能是否正常

參考：`VERCEL_REDEPLOY.md`

## 📞 需要幫助？

1. 查看 `SYSTEM_OVERVIEW.md` - 完整系統說明
2. 查看 `TROUBLESHOOTING.md` - 問題排除
3. 查看各功能的詳細文件（見 `SYSTEM_OVERVIEW.md`）

