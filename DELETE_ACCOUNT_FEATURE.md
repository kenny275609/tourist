# 刪除帳號功能說明

## 📋 功能概述

現在您可以在網頁中直接刪除自己的帳號，方便重新註冊和測試。

## 🎯 功能位置

在頁面右上角的用戶頭像旁邊，有一個「刪除帳號」按鈕（紅色虛線邊框，垃圾桶圖標）。

## 🔐 如何使用

### 步驟 1：執行 SQL 腳本

在首次使用前，需要在 Supabase 中創建刪除帳號的函數：

1. 打開 Supabase Dashboard
2. 點擊左側選單的 **"SQL Editor"**
3. 點擊 **"New query"**
4. 複製並執行 `supabase/delete_user_function.sql` 的內容：

```sql
-- 創建函數：刪除當前用戶的帳號及其所有數據
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- 獲取當前用戶 ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION '用戶未登入';
  END IF;

  -- 刪除用戶的所有數據
  DELETE FROM user_gear_items WHERE user_id = current_user_id;
  DELETE FROM user_data WHERE user_id = current_user_id;
  DELETE FROM user_roles WHERE user_id = current_user_id;
  DELETE FROM user_profiles WHERE user_id = current_user_id;
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RAISE NOTICE '用戶帳號及所有數據已成功刪除';
END;
$$;
```

5. 點擊 **"Run"** 執行

### 步驟 2：使用刪除功能

1. 登入您的帳號
2. 點擊右上角的「刪除帳號」按鈕（紅色虛線邊框，垃圾桶圖標）
3. 第一次確認：系統會詢問「確定要刪除帳號嗎？」
4. 第二次確認：系統會再次確認「最後確認：您真的要刪除帳號嗎？」
5. 確認後，系統會：
   - 刪除您的所有個人數據
   - 刪除您的裝備清單
   - 刪除您的帳號資訊
   - 自動登出
   - 重新導向到首頁

## ⚠️ 重要警告

1. **無法復原**
   - 刪除帳號後，所有數據都會永久刪除
   - 無法恢復任何數據

2. **刪除的內容**
   - 個人裝備清單
   - 個人數據（緊急資訊、角色選擇等）
   - 用戶角色記錄
   - 用戶個人資料
   - 認證帳號

3. **安全保護**
   - 需要兩次確認才能刪除
   - 只能刪除自己的帳號（無法刪除其他用戶的帳號）
   - 函數會檢查 `auth.uid()`，確保安全

## 🔍 技術細節

### 刪除的數據表

函數會刪除以下表中的數據：
- `user_gear_items` - 個人裝備物品
- `user_data` - 個人數據（緊急資訊、角色等）
- `user_roles` - 用戶角色記錄
- `user_profiles` - 用戶個人資料
- `auth.users` - 認證帳號（會觸發 CASCADE 刪除）

### 安全機制

1. **SECURITY DEFINER**
   - 函數使用 `SECURITY DEFINER`，以獲得刪除 `auth.users` 的權限
   - 但函數內部會檢查 `auth.uid()`，確保用戶只能刪除自己的帳號

2. **雙重確認**
   - 前端會進行兩次確認對話框
   - 防止誤操作

3. **自動登出**
   - 刪除成功後會自動登出
   - 重新導向到首頁

## 🆘 常見問題

### Q: 刪除後可以重新註冊嗎？
A: 可以！刪除帳號後，您可以使用相同的 Email 重新註冊。

### Q: 刪除後數據會立即消失嗎？
A: 是的，刪除操作會立即執行，數據會永久刪除。

### Q: 如果刪除失敗怎麼辦？
A: 如果刪除失敗，會顯示錯誤訊息。請檢查：
1. 是否已執行 SQL 腳本創建函數
2. 是否已登入
3. 瀏覽器控制台是否有錯誤訊息

### Q: 可以刪除其他用戶的帳號嗎？
A: 不可以。此功能只能刪除自己的帳號。管理員需要通過 Supabase Dashboard 或 SQL 來刪除其他用戶的帳號。

### Q: 刪除帳號後，共同裝備會怎樣？
A: 如果您有認領共同裝備，刪除帳號後，這些裝備的 `claimed_by` 欄位會變為 `null`，其他用戶可以重新認領。

## 📝 測試建議

如果您想重新測試註冊流程：

1. 點擊「刪除帳號」按鈕
2. 確認刪除
3. 刪除成功後，系統會自動登出
4. 在首頁重新註冊（可以使用相同的 Email）
5. 開始新的測試

## 🔗 相關文件

- `supabase/delete_user_function.sql` - 刪除帳號的 SQL 函數
- `supabase/delete_user_account.sql` - 手動刪除帳號的 SQL 腳本（備用方法）
- `supabase/quick_delete_my_account.sql` - 快速刪除腳本（SQL Editor 使用）

