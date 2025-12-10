"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GearItem {
  id: string;
  name: string;
  category: "clothing" | "gear";
  checked: boolean;
}

/**
 * 管理用戶個人裝備物品的 Hook
 * 每個物品都是數據庫中的獨立記錄
 */
export function useGearItems(userId: string | null) {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const supabase = createClient();

  // 從 Supabase 讀取物品清單
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("user_gear_items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching gear items:", error);
          setItems([]);
        } else {
          setItems(
            (data || []).map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category as "clothing" | "gear",
              checked: item.checked,
            }))
          );
        }
      } catch (error) {
        console.error("Error:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // 設置即時訂閱
    const channel = supabase
      .channel(`user-gear-items-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_gear_items",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // 新增物品
  const addItem = useCallback(
    async (item: Omit<GearItem, "id">) => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("user_gear_items")
          .insert({
            user_id: userId,
            name: item.name,
            category: item.category,
            checked: item.checked,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding gear item:", error);
          throw error;
        }

        if (data) {
          setItems((prev) => [
            ...prev,
            {
              id: data.id,
              name: data.name,
              category: data.category as "clothing" | "gear",
              checked: data.checked,
            },
          ]);
        }
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [userId, supabase]
  );

  // 更新物品
  const updateItem = useCallback(
    async (id: string, updates: Partial<Omit<GearItem, "id">>) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from("user_gear_items")
          .update(updates)
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating gear item:", error);
          throw error;
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        );
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [userId, supabase]
  );

  // 刪除物品
  const deleteItem = useCallback(
    async (id: string) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from("user_gear_items")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Error deleting gear item:", error);
          throw error;
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [userId, supabase]
  );

  // 從模板初始化物品（如果清單為空）
  const initializeFromTemplates = useCallback(async () => {
    // 防止重複初始化
    if (!userId || isInitializing || items.length > 0) return;

    // 先檢查數據庫中是否已經有數據
    const { data: existingData } = await supabase
      .from("user_gear_items")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    // 如果已經有數據，不需要初始化
    if (existingData && existingData.length > 0) {
      return;
    }

    setIsInitializing(true);

    try {
      // 從模板表讀取活躍的預設裝備
      const { data: templates, error: templateError } = await supabase
        .from("default_gear_templates")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("display_order", { ascending: true });

      if (templateError) {
        console.error("Error fetching templates:", templateError);
        setIsInitializing(false);
        return;
      }

      // 如果沒有模板，就不初始化（保持空清單）
      if (!templates || templates.length === 0) {
        setIsInitializing(false);
        return;
      }

      // 批量插入模板物品
      const { data, error } = await supabase
        .from("user_gear_items")
        .insert(
          templates.map((template) => ({
            user_id: userId,
            name: template.name,
            category: template.category,
            checked: false,
          }))
        )
        .select();

      if (error) {
        console.error("Error initializing from templates:", error);
        setIsInitializing(false);
        return;
      }

      if (data) {
        setItems(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category as "clothing" | "gear",
            checked: item.checked,
          }))
        );
      }
    } catch (error) {
      console.error("Error initializing from templates:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [userId, isInitializing, items.length, supabase]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    initializeFromTemplates,
  };
}

