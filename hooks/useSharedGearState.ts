"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface SharedGearItem {
  id: string;
  name: string;
  claimed_by: string | null;
  created_at?: string;
}

/**
 * 共同裝備的共享狀態管理
 * 所有用戶共享同一份數據（使用固定的 team_id）
 */
export function useSharedGearState(
  teamId: string = "default-team"
): [
  SharedGearItem[],
  (items: SharedGearItem[]) => Promise<void>,
  boolean
] {
  const [items, setItems] = useState<SharedGearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 從 Supabase 讀取數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supabase
          .from("shared_gear")
          .select("*")
          .eq("team_id", teamId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching shared gear:", error);
          setItems([]);
        } else {
          setItems(
            fetchedData?.map((item) => ({
              id: item.id,
              name: item.name,
              claimed_by: item.claimed_by,
              created_at: item.created_at,
            })) || []
          );
        }
      } catch (error) {
        console.error("Error:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 設置即時訂閱
    const channel = supabase
      .channel(`shared-gear-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shared_gear",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, supabase]);

  // 更新數據到 Supabase
  const updateItems = useCallback(
    async (newItems: SharedGearItem[]) => {
      try {
        // 獲取現有項目
        const { data: existingItems } = await supabase
          .from("shared_gear")
          .select("id")
          .eq("team_id", teamId);

        const existingIds = new Set(existingItems?.map((item) => item.id) || []);

        // 刪除不存在的項目
        const itemsToDelete = Array.from(existingIds).filter(
          (id) => !newItems.find((item) => item.id === id)
        );

        if (itemsToDelete.length > 0) {
          await supabase
            .from("shared_gear")
            .delete()
            .in("id", itemsToDelete);
        }

        // 更新或插入項目
        const upsertData = newItems.map((item) => ({
          id: item.id,
          team_id: teamId,
          name: item.name,
          claimed_by: item.claimed_by,
        }));

        if (upsertData.length > 0) {
          const { error } = await supabase
            .from("shared_gear")
            .upsert(upsertData, { onConflict: "id" });

          if (error) {
            console.error("Error updating shared gear:", error);
            throw error;
          }
        }

        setItems(newItems);
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [teamId, supabase]
  );

  return [items, updateItems, loading];
}

