"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "./useAdmin";

export interface Member {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
  gear_count?: number;
}

/**
 * 獲取所有成員列表的 Hook（只有管理員可以使用）
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();
  const supabase = createClient();

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        // 方法 1：嘗試使用 get_members_list 函數（如果已創建）
        try {
          const { data: membersData, error: functionError } = await supabase.rpc('get_members_list');
          
          if (!functionError && membersData) {
            const membersList: Member[] = membersData.map((m: any) => ({
              id: m.user_id,
              email: m.email || '未知',
              name: m.display_name || undefined,
              is_admin: m.is_admin || false,
              created_at: m.created_at || new Date().toISOString(),
              gear_count: m.gear_count || 0,
            }));
            setMembers(membersList);
            setLoading(false);
            return;
          }
        } catch (rpcError) {
          // 如果函數不存在，繼續使用備用方法
          console.log("RPC function not available, using fallback method");
        }

        // 方法 2：備用方法 - 通過查詢 user_gear_items 和 user_data 來獲取所有用戶
        // 1. 獲取所有有裝備的用戶
        const { data: gearData } = await supabase
          .from("user_gear_items")
          .select("user_id")
          .order("created_at", { ascending: false });

        // 2. 獲取所有有數據的用戶
        const { data: userData } = await supabase
          .from("user_data")
          .select("user_id")
          .order("updated_at", { ascending: false });

        // 3. 合併所有用戶 ID
        const allUserIds = new Set<string>();
        if (gearData) {
          gearData.forEach((d) => allUserIds.add(d.user_id));
        }
        if (userData) {
          userData.forEach((d) => allUserIds.add(d.user_id));
        }

        // 4. 獲取當前登入用戶的信息
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          allUserIds.add(currentUser.id);
        }

        // 5. 為每個用戶獲取詳細信息
        const membersList: Member[] = [];
        
        // 獲取所有用戶的認證信息（通過批量查詢）
        // 由於無法直接查詢 auth.users，我們需要通過其他方式獲取
        // 這裡我們嘗試通過 user_data 或其他表來獲取用戶信息
        
        for (const userId of Array.from(allUserIds)) {
          // 獲取用戶資料（從 user_profiles 表）
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("display_name, created_at")
            .eq("user_id", userId)
            .single();

          // 獲取用戶裝備數量
          const { count: gearCount } = await supabase
            .from("user_gear_items")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

          // 判斷是否為管理員和獲取 email
          let isAdmin = false;
          let email = userId.substring(0, 8) + "...";
          let name: string | undefined = undefined;
          
          // 如果是當前用戶，可以從 auth 獲取完整信息
          if (currentUser && userId === currentUser.id) {
            email = currentUser.email || email;
            isAdmin = currentUser.user_metadata?.is_admin === true;
            name = currentUser.user_metadata?.name || profile?.display_name || undefined;
          } else {
            // 對於其他用戶，優先使用 profile 的 display_name
            // 如果沒有，則使用 user_id 的部分作為臨時顯示
            name = profile?.display_name || undefined;
          }

          membersList.push({
            id: userId,
            email: email,
            name: name,
            is_admin: isAdmin,
            created_at: profile?.created_at || new Date().toISOString(),
            gear_count: gearCount || 0,
          });
        }

        // 按創建時間排序
        membersList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setMembers(membersList);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isAdmin, supabase]);

  return { members, loading };
}

