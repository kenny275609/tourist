# 管理者設定指南

## 功能說明

管理者可以設定新成員加入時的預設裝備清單。新成員註冊後會自動獲得這些預設物品，之後可以自行調整。

## 設定管理者角色

### 方法 1: 在 Supabase Dashboard 中設定（推薦）

1. 登入 Supabase Dashboard
2. 點擊左側選單的 **"Authentication"** > **"Users"**
3. 找到要設定為管理者的用戶
4. 點擊用戶右側的 **"..."** 選單，選擇 **"Edit user"**
5. 在 **"User Metadata"** 區域，點擊 **"Add row"**
6. 新增：
   - **Key**: `is_admin`
   - **Value**: `true` (選擇 Boolean 類型)
7. 點擊 **"Save"**

### 方法 2: 使用 SQL 設定

在 Supabase SQL Editor 中執行：

```sql
-- 將 'your-email@example.com' 替換為管理者的 email
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('is_admin', true)
WHERE email = 'your-email@example.com';
```

### 方法 3: 批量設定多個管理者

```sql
-- 設定多個用戶為管理者
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email IN ('admin1@example.com', 'admin2@example.com');
```

## 驗證管理者設定

執行以下 SQL 查詢來確認管理者設定：

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE raw_user_meta_data->>'is_admin' = 'true';
```

## 使用管理者功能

1. 以管理者身份登入應用程式
2. 在頁面頂部會看到 **"⚙️ 管理者設定"** 區塊
3. 在管理者設定中：
   - 新增預設裝備模板
   - 編輯模板名稱
   - 啟用/停用模板（停用的模板不會加入新成員的清單）
   - 刪除模板
   - 設定顯示順序

## 新成員流程

1. 新成員註冊帳號
2. 系統自動從活躍的模板中讀取預設裝備
3. 將這些裝備加入到新成員的個人裝備清單中
4. 新成員可以：
   - 新增自己的物品
   - 編輯物品名稱
   - 刪除不需要的物品
   - 勾選已準備的物品

## 注意事項

- 只有標記為 `is_admin: true` 的用戶才能看到管理者設定介面
- 停用的模板不會加入新成員的清單，但已存在的成員不受影響
- 管理者設定的模板只影響**新註冊**的成員，不會修改現有成員的裝備清單
- 如果沒有設定任何模板，新成員的裝備清單會是空的

## 移除管理者權限

```sql
-- 移除特定用戶的管理者權限
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'is_admin'
WHERE email = 'user@example.com';
```

## 疑難排解

### 問題：看不到管理者設定介面

1. 確認用戶的 `user_metadata` 中 `is_admin` 設為 `true`
2. 重新整理頁面或重新登入
3. 檢查瀏覽器控制台是否有錯誤訊息

### 問題：新成員沒有獲得預設裝備

1. 確認有設定活躍的模板（`is_active = true`）
2. 確認模板表已正確建立
3. 檢查 RLS 政策是否正確設定

