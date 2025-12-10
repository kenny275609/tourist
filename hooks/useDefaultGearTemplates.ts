"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GearTemplate {
  id: string;
  name: string;
  category: "clothing" | "gear";
  display_order: number;
  is_active: boolean;
}

/**
 * 管理預設裝備模板的 Hook（管理者使用）
 */
export function useDefaultGearTemplates() {
  const [templates, setTemplates] = useState<GearTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 讀取所有模板（包括非活躍的，供管理者查看）
  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("default_gear_templates")
        .select("*")
        .order("category", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      } else {
        setTemplates(
          (data || []).map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category as "clothing" | "gear",
            display_order: item.display_order,
            is_active: item.is_active,
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 新增模板
  const addTemplate = useCallback(
    async (template: Omit<GearTemplate, "id">) => {
      try {
        const { data, error } = await supabase
          .from("default_gear_templates")
          .insert({
            name: template.name,
            category: template.category,
            display_order: template.display_order,
            is_active: template.is_active,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding template:", error);
          throw error;
        }

        if (data) {
          setTemplates((prev) => [
            ...prev,
            {
              id: data.id,
              name: data.name,
              category: data.category as "clothing" | "gear",
              display_order: data.display_order,
              is_active: data.is_active,
            },
          ]);
        }
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [supabase]
  );

  // 更新模板
  const updateTemplate = useCallback(
    async (id: string, updates: Partial<Omit<GearTemplate, "id">>) => {
      try {
        const { error } = await supabase
          .from("default_gear_templates")
          .update(updates)
          .eq("id", id);

        if (error) {
          console.error("Error updating template:", error);
          throw error;
        }

        await fetchTemplates();
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [supabase, fetchTemplates]
  );

  // 刪除模板
  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("default_gear_templates")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting template:", error);
          throw error;
        }

        setTemplates((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    },
    [supabase]
  );

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: fetchTemplates,
  };
}

/**
 * 讀取活躍的預設裝備模板（新成員使用）
 */
export function useActiveGearTemplates() {
  const [templates, setTemplates] = useState<GearTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from("default_gear_templates")
          .select("*")
          .eq("is_active", true)
          .order("category", { ascending: true })
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching active templates:", error);
          setTemplates([]);
        } else {
          setTemplates(
            (data || []).map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category as "clothing" | "gear",
              display_order: item.display_order,
              is_active: item.is_active,
            }))
          );
        }
      } catch (error) {
        console.error("Error:", error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [supabase]);

  return { templates, loading };
}

