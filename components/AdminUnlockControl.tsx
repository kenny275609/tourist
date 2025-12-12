"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { createClient } from "@/lib/supabase/client";
import { Lock, Unlock, Users } from "lucide-react";

interface UserLockStatus {
  user_id: string;
  email: string;
  name: string;
  emergency_locked: boolean;
  role_locked: boolean;
  can_edit_emergency: boolean;
  can_edit_role: boolean;
}

export default function AdminUnlockControl() {
  const { isAdmin } = useAdmin();
  const supabase = createClient();
  const [users, setUsers] = useState<UserLockStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        // 嘗試使用 get_members_list 函數獲取用戶列表
        let membersList: any[] = [];
        try {
          const { data: membersData } = await supabase.rpc('get_members_list');
          if (membersData) {
            membersList = membersData;
          }
        } catch (rpcError) {
          // 如果函數不存在，使用備用方法
          const { data: gearUsers } = await supabase
            .from("user_gear_items")
            .select("user_id")
            .limit(100);

          if (gearUsers) {
            membersList = gearUsers.map((g) => ({
              user_id: g.user_id,
              email: g.user_id.substring(0, 8) + "...",
              display_name: "",
            }));
          }
        }

        // 獲取所有用戶的鎖定狀態
        const { data: allUsers } = await supabase
          .from("user_data")
          .select("user_id, key, value")
          .in("key", [
            "emergency_info_locked",
            "user_role_locked",
            "emergency_info_can_edit",
            "user_role_can_edit",
          ]);

        // 組織數據
        const userMap = new Map<string, UserLockStatus>();

        // 初始化用戶
        membersList.forEach((member: any) => {
          const userId = member.user_id || member.id;
          userMap.set(userId, {
            user_id: userId,
            email: member.email || userId.substring(0, 8) + "...",
            name: member.display_name || member.name || "",
            emergency_locked: false,
            role_locked: false,
            can_edit_emergency: false,
            can_edit_role: false,
          });
        });

        // 填充鎖定狀態
        if (allUsers) {
          allUsers.forEach((item) => {
            const userId = item.user_id;
            if (!userMap.has(userId)) {
              userMap.set(userId, {
                user_id: userId,
                email: userId.substring(0, 8) + "...",
                name: "",
                emergency_locked: false,
                role_locked: false,
                can_edit_emergency: false,
                can_edit_role: false,
              });
            }

            const user = userMap.get(userId)!;
            // 處理 JSONB 值（可能是字符串或對象）
            const value = typeof item.value === 'string' 
              ? item.value 
              : (item.value as any)?.toString() || item.value;
            const boolValue = value === "true" || value === true;

            if (item.key === "emergency_info_locked") {
              user.emergency_locked = boolValue;
            } else if (item.key === "user_role_locked") {
              user.role_locked = boolValue;
            } else if (item.key === "emergency_info_can_edit") {
              user.can_edit_emergency = boolValue;
            } else if (item.key === "user_role_can_edit") {
              user.can_edit_role = boolValue;
            }
          });
        }

        setUsers(Array.from(userMap.values()));
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin, supabase]);

  const toggleEditPermission = async (
    userId: string,
    type: "emergency" | "role",
    canEdit: boolean
  ) => {
    try {
      // 檢查管理員是否已登入
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("管理員未登入");
      }

      const key = type === "emergency" ? "emergency_info_can_edit" : "user_role_can_edit";
      const value = canEdit ? "true" : "false";

      console.log("Toggling permission:", { 
        admin_id: currentUser.id, 
        target_user_id: userId, 
        key, 
        value 
      });

      const { error, data } = await supabase
        .from("user_data")
        .upsert({
          user_id: userId, // 目標用戶的 ID（不是管理員的 ID）
          key: key,
          value: value, // 字符串值，Supabase 會自動轉換為 JSONB
        }, {
          onConflict: 'user_id,key'
        });

      if (error) {
        console.error("Error updating permission:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log("Permission updated successfully:", data);

      // 更新本地狀態
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId
            ? {
                ...u,
                [type === "emergency" ? "can_edit_emergency" : "can_edit_role"]: canEdit,
              }
            : u
        )
      );

      alert(`已${canEdit ? '允許' : '禁止'}用戶編輯${type === "emergency" ? "緊急資訊" : "角色"}！`);
    } catch (error: any) {
      console.error("Error updating permission:", error);
      const errorMessage = error?.message || error?.details || "更新失敗，請稍後再試";
      alert(`更新失敗：${errorMessage}`);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  return (
    <div className="sketch-box p-6 bg-white">
      <h3
        className="text-2xl font-bold mb-6 text-[#2c3e50] transform rotate-1"
        style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
      >
        🔓 管理員解鎖控制
      </h3>

      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-[#5a6c7d]">目前沒有用戶資料</p>
        ) : (
          users.map((user) => (
            <div
              key={user.user_id}
              className="p-4 border-2 border-[#ecf0f1] rounded-lg"
              style={{
                borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#2c3e50]">{user.name || user.email}</p>
                  <p className="text-sm text-[#95a5a6]">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                {/* 緊急資訊編輯權限 */}
                <div className="flex items-center justify-between p-2 bg-[#f8f9fa] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2c3e50]">緊急資訊編輯權限</span>
                    {user.emergency_locked && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        user.can_edit_emergency 
                          ? "bg-[#f39c12] text-white" 
                          : "bg-[#e74c3c] text-white"
                      }`}>
                        {user.can_edit_emergency ? "已鎖定（可編輯）" : "已鎖定"}
                      </span>
                    )}
                    {!user.emergency_locked && (
                      <span className="text-xs px-2 py-0.5 bg-[#27ae60] text-white rounded">
                        未鎖定
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      toggleEditPermission(user.user_id, "emergency", !user.can_edit_emergency)
                    }
                    disabled={!user.emergency_locked}
                    className={`p-2 rounded transition-colors ${
                      !user.emergency_locked
                        ? "bg-[#ecf0f1] text-[#95a5a6] cursor-not-allowed"
                        : user.can_edit_emergency
                        ? "bg-[#27ae60] text-white hover:bg-[#229954]"
                        : "bg-[#95a5a6] text-white hover:bg-[#7f8c8d]"
                    }`}
                    title={
                      !user.emergency_locked 
                        ? "用戶尚未鎖定，無需解鎖" 
                        : user.can_edit_emergency 
                        ? "點擊禁止編輯" 
                        : "點擊允許編輯"
                    }
                  >
                    {user.can_edit_emergency ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 角色編輯權限 */}
                <div className="flex items-center justify-between p-2 bg-[#f8f9fa] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#2c3e50]">角色編輯權限</span>
                    {user.role_locked && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        user.can_edit_role 
                          ? "bg-[#f39c12] text-white" 
                          : "bg-[#e74c3c] text-white"
                      }`}>
                        {user.can_edit_role ? "已鎖定（可編輯）" : "已鎖定"}
                      </span>
                    )}
                    {!user.role_locked && (
                      <span className="text-xs px-2 py-0.5 bg-[#27ae60] text-white rounded">
                        未鎖定
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      toggleEditPermission(user.user_id, "role", !user.can_edit_role)
                    }
                    disabled={!user.role_locked}
                    className={`p-2 rounded transition-colors ${
                      !user.role_locked
                        ? "bg-[#ecf0f1] text-[#95a5a6] cursor-not-allowed"
                        : user.can_edit_role
                        ? "bg-[#27ae60] text-white hover:bg-[#229954]"
                        : "bg-[#95a5a6] text-white hover:bg-[#7f8c8d]"
                    }`}
                    title={
                      !user.role_locked 
                        ? "用戶尚未鎖定，無需解鎖" 
                        : user.can_edit_role 
                        ? "點擊禁止編輯" 
                        : "點擊允許編輯"
                    }
                  >
                    {user.can_edit_role ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

