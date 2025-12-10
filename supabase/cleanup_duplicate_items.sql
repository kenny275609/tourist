-- 清理重複的物品腳本
-- 如果發現有重複的物品，可以執行此腳本清理

-- 刪除重複的物品，只保留每個用戶每種物品的第一個（按創建時間最早的）
-- 使用 ROW_NUMBER() 窗口函數來標記重複項

DELETE FROM user_gear_items
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, name, category 
        ORDER BY created_at ASC
      ) as rn
    FROM user_gear_items
  ) t
  WHERE rn > 1
);

-- 查看清理後的結果
SELECT 
  user_id,
  name,
  category,
  COUNT(*) as count
FROM user_gear_items
GROUP BY user_id, name, category
HAVING COUNT(*) > 1;

-- 如果上面的查詢沒有返回任何結果，表示沒有重複項了

