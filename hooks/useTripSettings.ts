"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface TripSetting {
  key: string;
  value: string;
  description?: string;
}

export function useTripSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("trip_settings")
          .select("key, value");

        if (error) throw error;

        const settingsMap: Record<string, string> = {};
        data?.forEach((setting) => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings(settingsMap);
      } catch (error) {
        console.error("Error fetching trip settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // 訂閱設定變更
    const channel = supabase
      .channel("trip_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_settings",
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateSetting = async (key: string, value: string) => {
    try {
      // 先嘗試更新
      const { data: updateData, error: updateError } = await supabase
        .from("trip_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select();

      // 如果更新失敗或沒有影響任何行，嘗試插入
      if (updateError || !updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from("trip_settings")
          .insert({ key, value, updated_at: new Date().toISOString() })
          .select();

        if (insertError) {
          // 如果插入也失敗，可能是因為記錄已存在（競態條件），再次嘗試更新
          const { error: retryError } = await supabase
            .from("trip_settings")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("key", key);

          if (retryError) {
            console.error("Error updating trip setting:", retryError);
            throw retryError;
          }
        }
      } else if (updateError) {
        console.error("Error updating trip setting:", updateError);
        throw updateError;
      }

      // 更新本地狀態
      setSettings((prev) => ({ ...prev, [key]: value }));
      return true;
    } catch (error: any) {
      console.error("Error updating trip setting:", error);
      const errorMessage = error?.message || error?.toString() || "未知錯誤";
      console.error("Error details:", errorMessage);
      return false;
    }
  };

  return { settings, loading, updateSetting };
}

