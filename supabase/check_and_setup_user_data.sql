-- 檢查並設置 user_data 表
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本

-- 1. 檢查表是否存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_data'
  ) THEN
    RAISE NOTICE '❌ user_data 表不存在，正在創建...';
    
    -- 創建表
    CREATE TABLE user_data (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, key)
    );
    
    RAISE NOTICE '✅ user_data 表已創建';
  ELSE
    RAISE NOTICE '✅ user_data 表已存在';
  END IF;
END $$;

-- 2. 檢查並創建索引
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_key ON user_data(key);

-- 3. 啟用 RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 4. 刪除舊政策（如果存在）
DROP POLICY IF EXISTS "Users can view their own data" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own data" ON user_data;
DROP POLICY IF EXISTS "Users can delete their own data" ON user_data;

-- 5. 創建 RLS 政策
CREATE POLICY "Users can view their own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);

-- 6. 檢查並創建更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 創建更新時間觸發器
DROP TRIGGER IF EXISTS update_user_data_updated_at ON user_data;
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 驗證設置
DO $$
BEGIN
  -- 檢查表結構
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_data'
    AND column_name = 'value'
  ) THEN
    RAISE NOTICE '✅ user_data 表結構正確';
  ELSE
    RAISE NOTICE '❌ user_data 表結構有問題';
  END IF;
  
  -- 檢查 RLS 是否啟用
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_data'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS 已啟用';
  ELSE
    RAISE NOTICE '⚠️ RLS 未啟用';
  END IF;
  
  -- 檢查政策數量
  DECLARE
    policy_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_data';
    
    IF policy_count >= 4 THEN
      RAISE NOTICE '✅ RLS 政策已設置（% 個政策）', policy_count;
    ELSE
      RAISE NOTICE '⚠️ RLS 政策可能不完整（只有 % 個政策）', policy_count;
    END IF;
  END;
END $$;

-- 9. 顯示當前設置摘要
SELECT 
  'user_data 表設置摘要' as summary,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_data') as table_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_data') as policy_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'user_data') as index_count;

