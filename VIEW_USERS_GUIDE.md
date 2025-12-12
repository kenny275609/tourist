# 查看使用者列表指南

除了 Supabase Dashboard 的 Authentication 頁面，還有以下方法可以查看使用者：

## 方法 1：使用 SQL Editor（最靈活）⭐

### 步驟：
1. 在 Supabase Dashboard 中，點擊左側選單的 **"SQL Editor"**
2. 點擊 **"New Query"**
3. 複製並執行以下查詢：

#### 查看所有用戶
```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'is_admin' as is_admin,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

#### 查看用戶及其裝備統計
```sql
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'is_admin' as is_admin,
  u.created_at,
  COUNT(ugi.id) as gear_count
FROM auth.users u
LEFT JOIN user_gear_items ugi ON ugi.user_id = u.id
GROUP BY u.id, u.email, u.raw_user_meta_data, u.created_at
ORDER BY u.created_at DESC;
```

#### 只查看管理員
```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'is_admin' = 'true'
ORDER BY created_at DESC;
```

### 優點：
- ✅ 可以自訂查詢條件
- ✅ 可以查看統計數據（裝備數量等）
- ✅ 可以匯出結果

---

## 方法 2：創建視圖（一次設定，永久使用）

### 步驟：
1. 在 Supabase Dashboard 中，點擊 **"SQL Editor"**
2. 執行 `supabase/create_users_view.sql` 腳本
3. 之後就可以在任何時候查詢：

```sql
SELECT * FROM users_overview ORDER BY registered_at DESC;
```

### 視圖包含的資訊：
- 用戶 ID 和 email
- 顯示名稱（註冊時填寫的名字或 email 前綴）
- 是否為管理員
- 註冊時間
- 最後登入時間
- 裝備數量
- 已勾選的裝備數量
- 認領的共同裝備數量

### 優點：
- ✅ 一次設定，永久使用
- ✅ 包含豐富的統計資訊
- ✅ 查詢簡單快速

---

## 方法 3：使用應用程式的管理員頁面

### 步驟：
1. 以管理員身份登入應用程式
2. 前往 **"設定"** 頁面（底部導航欄）
3. 在 **"團隊成員"** 區塊中查看所有成員

### 顯示的資訊：
- 用戶名稱（註冊時填寫的名字）
- Email
- 是否為管理員
- 裝備數量

### 優點：
- ✅ 不需要進入 Supabase Dashboard
- ✅ 視覺化介面，容易閱讀
- ✅ 即時更新

### 注意：
- 需要先執行 `supabase/create_members_view.sql` 創建函數
- 或使用備用方法（自動切換）

---

## 方法 4：通過其他表間接查看

### 查看有裝備的用戶：
```sql
SELECT DISTINCT 
  user_id,
  COUNT(*) as gear_count
FROM user_gear_items
GROUP BY user_id
ORDER BY gear_count DESC;
```

### 查看有資料的用戶：
```sql
SELECT DISTINCT user_id
FROM user_data
ORDER BY user_id;
```

---

## 比較表

| 方法 | 需要權限 | 資訊豐富度 | 使用難度 | 推薦度 |
|------|---------|-----------|---------|--------|
| SQL Editor | 專案擁有者 | ⭐⭐⭐⭐⭐ | 中等 | ⭐⭐⭐⭐⭐ |
| 創建視圖 | 專案擁有者 | ⭐⭐⭐⭐⭐ | 簡單 | ⭐⭐⭐⭐⭐ |
| 應用程式管理頁 | 管理員 | ⭐⭐⭐ | 簡單 | ⭐⭐⭐⭐ |
| 其他表查詢 | 專案擁有者 | ⭐⭐ | 簡單 | ⭐⭐⭐ |

---

## 推薦流程

1. **日常查看**：使用應用程式的管理員頁面
2. **詳細分析**：使用 SQL Editor 執行自訂查詢
3. **長期使用**：創建視圖，方便重複查詢

---

## 快速查詢範例

### 查看最近註冊的 10 個用戶
```sql
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### 查看活躍用戶（有裝備的）
```sql
SELECT 
  u.email,
  u.raw_user_meta_data->>'name' as name,
  COUNT(ugi.id) as gear_count
FROM auth.users u
INNER JOIN user_gear_items ugi ON ugi.user_id = u.id
GROUP BY u.id, u.email, u.raw_user_meta_data
HAVING COUNT(ugi.id) > 0
ORDER BY gear_count DESC;
```

### 查看從未登入的用戶
```sql
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE last_sign_in_at IS NULL
ORDER BY created_at DESC;
```

