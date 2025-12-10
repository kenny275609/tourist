"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 使用 Supabase 的共享狀態管理 Hook
 * 每個用戶都有自己獨立的數據
 */
export function useSupabaseState<T>(
  tableName: string,
  userId: string | null,
  initialValue: T,
  key: string = "data"
): [T | null, (value: T) => Promise<void>, boolean] {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 從 Supabase 讀取數據
  useEffect(() => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supabase
          .from(tableName)
          .select("*")
          .eq("user_id", userId)
          .eq("key", key)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 是 "not found" 錯誤，這是正常的
          console.error("Error fetching data:", error);
          setData(initialValue);
        } else {
          setData(fetchedData ? (fetchedData.value as T) : initialValue);
        }
      } catch (error) {
        console.error("Error:", error);
        setData(initialValue);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 設置即時訂閱
    const channel = supabase
      .channel(`${tableName}-${userId}-${key}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).key === key) {
            setData((payload.new as any).value as T);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, tableName, key, initialValue, supabase]);

  // 更新數據到 Supabase
  const updateData = useCallback(
    async (value: T) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from(tableName)
          .upsert({
            user_id: userId,
            key: key,
            value: value,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error updating data:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            table: tableName,
            userId: userId,
            key: key,
          });
          throw new Error(
            `無法更新數據: ${error.message || error.code || "未知錯誤"}。請確認數據表已建立且 RLS 政策已設定。`
          );
        }

        setData(value);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : String(error);
        console.error("Error updating data:", {
          error: errorMessage,
          table: tableName,
          userId: userId,
          key: key,
        });
        throw error;
      }
    },
    [userId, tableName, key, supabase]
  );

  return [data, updateData, loading];
}

