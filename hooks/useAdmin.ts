"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

/**
 * 檢查當前用戶是否為管理者
 */
export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // 從 user_metadata 檢查是否為管理者
    const adminStatus = user.user_metadata?.is_admin === true;
    setIsAdmin(adminStatus);
    setLoading(false);
  }, [user]);

  return { isAdmin, loading };
}

/**
 * 設定用戶為管理者（需要在 Supabase Dashboard 中手動設定，或使用服務端函數）
 */
export async function setUserAsAdmin(userId: string) {
  // 注意：這個操作通常需要在服務端或 Supabase Dashboard 中執行
  // 因為修改 user_metadata 需要服務端權限
  const supabase = createClient();
  
  // 這個操作可能需要服務端函數或直接在 Supabase Dashboard 中執行
  // 這裡只是提供一個參考
  console.warn("設定管理者權限需要在 Supabase Dashboard 中手動執行，或使用服務端函數");
}

