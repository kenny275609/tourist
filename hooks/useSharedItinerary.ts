"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "./useAdmin";

export interface Checkpoint {
  id: string;
  name: string;
  day: number;
}

/**
 * 管理共享行程的 Hook
 * 所有用戶看到相同的行程，只有管理員可以編輯
 */
export function useSharedItinerary() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();
  const supabase = createClient();

  const defaultCheckpoints: Checkpoint[] = [
    { id: "1", name: "武陵山莊", day: 1 },
    { id: "2", name: "池有山", day: 1 },
    { id: "3", name: "新達山屋", day: 1 },
    { id: "4", name: "新達山屋", day: 2 },
    { id: "5", name: "品田山 (V-Cliff)", day: 2 },
    { id: "6", name: "桃山山屋", day: 2 },
    { id: "7", name: "桃山山屋", day: 3 },
    { id: "8", name: "喀拉業山", day: 3 },
    { id: "9", name: "武陵山莊", day: 3 },
  ];

  // 從 Supabase 讀取共享行程
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const { data, error } = await supabase
          .from("trip_settings")
          .select("value")
          .eq("key", "shared_itinerary")
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching shared itinerary:", error);
          setCheckpoints(defaultCheckpoints);
        } else {
          const value = data?.value || "[]";
          try {
            const parsed = JSON.parse(value as string);
            setCheckpoints(Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCheckpoints);
          } catch {
            setCheckpoints(defaultCheckpoints);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setCheckpoints(defaultCheckpoints);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();

    // 設置即時訂閱
    const channel = supabase
      .channel("shared_itinerary_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_settings",
          filter: "key=eq.shared_itinerary",
        },
        () => {
          fetchItinerary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 更新共享行程（只有管理員可以）
  const updateItinerary = useCallback(
    async (newCheckpoints: Checkpoint[]) => {
      if (!isAdmin) {
        throw new Error("只有管理員可以編輯共享行程");
      }

      try {
        const { error } = await supabase
          .from("trip_settings")
          .update({
            value: JSON.stringify(newCheckpoints),
            updated_at: new Date().toISOString(),
          })
          .eq("key", "shared_itinerary");

        if (error) {
          console.error("Error updating shared itinerary:", error);
          throw error;
        }

        setCheckpoints(newCheckpoints);
      } catch (error) {
        console.error("Error updating shared itinerary:", error);
        throw error;
      }
    },
    [isAdmin, supabase]
  );

  return { checkpoints, updateItinerary, loading, isAdmin };
}

