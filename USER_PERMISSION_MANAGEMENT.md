# 用戶權限管理功能說明

## 📋 功能概述

管理員現在可以在網頁中直接設定其他用戶的管理員權限，無需進入 Supabase Dashboard。

## 🎯 功能位置

在「設定」頁面（底部導航欄）中，有一個新的「用戶權限管理」區塊，位於「團隊成員」和「編輯權限管理」之間。

## 🔐 如何使用

### 1. 授予管理員權限

1. 以管理員身份登入
2. 前往「設定」頁面
3. 找到「用戶權限管理」區塊
4. 找到要設為管理員的用戶
5. 點擊該用戶右側的「設為管理員」按鈕（綠色按鈕）
6. 確認後，該用戶將獲得管理員權限

### 2. 移除管理員權限

1. 以管理員身份登入
2. 前往「設定」頁面
3. 找到「用戶權限管理」區塊
4. 找到要移除管理員權限的用戶
5. 點擊該用戶右側的「移除管理員」按鈕（紅色按鈕）
6. 確認後，該用戶將失去管理員權限

## ⚠️ 注意事項

1. **無法修改自己的權限**
   - 管理員無法修改自己的權限
   - 自己的帳號旁邊會顯示「無法修改」標籤

2. **即時同步**
   - 權限變更會立即同步到 `user_roles` 表
   - 同時會自動同步到 `auth.users.raw_user_meta_data`
   - 其他管理員的頁面會自動更新（通過 Realtime）

3. **權限檢查**
   - 系統會檢查當前用戶是否為管理員
   - 只有管理員才能看到和使用此功能

## 🔍 技術細節

### 資料庫結構

權限信息存儲在 `user_roles` 表中：

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT CHECK (role IN ('admin', 'user', 'viewer')),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### RLS 政策

- **查看權限**：所有人都可以查看用戶角色
- **管理權限**：只有管理員可以插入/更新/刪除用戶角色

### 自動同步

當 `user_roles` 表更新時，會自動觸發 `sync_user_role_to_auth()` 函數，將權限同步到 `auth.users.raw_user_meta_data`。

## 📊 用戶列表顯示

用戶列表會按照以下規則排序：
1. 管理員優先顯示
2. 然後按名稱（或 Email）排序

每個用戶會顯示：
- 頭像圖標（紅色 = 管理員，藍色 = 普通用戶）
- 用戶名稱（優先顯示註冊時的姓名）
- Email 地址
- 管理員標籤（如果是管理員）
- 「您」標籤（如果是當前登入用戶）
- 權限切換按鈕

## 🆘 常見問題

### Q: 為什麼看不到某些用戶？
A: 系統只會顯示已經在資料庫中有記錄的用戶（例如：有裝備、有數據、或已創建 profile）。如果用戶剛註冊但還沒有任何活動，可能需要等待一段時間才會出現在列表中。

### Q: 權限變更後多久生效？
A: 權限變更會立即生效。如果用戶正在使用系統，可能需要重新整理頁面才能看到權限變更。

### Q: 如果誤操作怎麼辦？
A: 可以立即再次點擊按鈕來恢復權限。建議在操作前確認用戶身份。

### Q: 可以有多個管理員嗎？
A: 可以！系統支援多個管理員同時存在。

## 🔧 資料庫設定

如果您的 Supabase 專案中還沒有 `user_roles` 表，請執行以下 SQL 腳本：

```sql
-- 執行 supabase/migration_add_user_roles.sql
```

這個腳本會：
1. 創建 `user_roles` 表
2. 設定 RLS 政策
3. 創建自動同步函數
4. 將現有用戶同步到 `user_roles` 表

## 📝 相關文件

- `supabase/migration_add_user_roles.sql` - 創建用戶角色表的 SQL 腳本
- `components/UserPermissionManager.tsx` - 用戶權限管理組件
- `hooks/useAdmin.ts` - 檢查管理員權限的 Hook

