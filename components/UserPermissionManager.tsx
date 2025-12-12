"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { Shield, User, Check, X, Loader2, Trash2 } from "lucide-react";

interface UserPermission {
  user_id: string;
  email: string;
  name?: string;
  is_admin: boolean;
  role?: string;
  notes?: string;
}

export default function UserPermissionManager() {
  const { isAdmin } = useAdmin();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        setLoading(true);

        // 1. 嘗試使用 get_members_list RPC 函數獲取所有用戶（推薦方法）
        let membersList: any[] = [];
        try {
          const { data: membersData, error: membersError } = await supabase.rpc('get_members_list');
          
          if (!membersError && membersData) {
            membersList = membersData;
          } else {
            // 如果 RPC 函數不存在或失敗，使用備用方法
            console.log("RPC 函數不可用，使用備用方法獲取用戶列表");
            throw new Error("RPC function not available");
          }
        } catch (rpcError) {
          // 備用方法：從其他表獲取用戶
          console.log("使用備用方法獲取用戶列表");
          
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("user_id, display_name, created_at");

          const { data: gearData } = await supabase
            .from("user_gear_items")
            .select("user_id")
            .order("created_at", { ascending: false });

          const { data: userData } = await supabase
            .from("user_data")
            .select("user_id")
            .order("updated_at", { ascending: false });

          // 合併所有用戶 ID
          const allUserIds = new Set<string>();
          if (profiles) {
            profiles.forEach((p) => allUserIds.add(p.user_id));
          }
          if (gearData) {
            gearData.forEach((d) => allUserIds.add(d.user_id));
          }
          if (userData) {
            userData.forEach((d) => allUserIds.add(d.user_id));
          }

          // 獲取當前用戶信息
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            allUserIds.add(authUser.id);
          }

          // 構建備用列表
          for (const userId of Array.from(allUserIds)) {
            const profile = profiles?.find((p) => p.user_id === userId);
            let email = userId.substring(0, 8) + "...";
            let name: string | undefined = undefined;

            if (authUser && userId === authUser.id) {
              email = authUser.email || email;
              name = authUser.user_metadata?.name || profile?.display_name || undefined;
            } else {
              name = profile?.display_name || undefined;
            }

            membersList.push({
              user_id: userId,
              email: email,
              display_name: name || email.split('@')[0],
              is_admin: authUser && userId === authUser.id 
                ? (authUser.user_metadata?.is_admin === true) 
                : false,
              created_at: profile?.created_at || new Date().toISOString(),
              gear_count: 0,
            });
          }
        }

        // 2. 獲取所有用戶的角色信息（從 user_roles 表）
        let rolesData: any[] | null = null;
        try {
          const { data: rolesDataResult, error: rolesError } = await supabase
            .from("user_roles")
            .select("user_id, is_admin, role, notes");

          if (rolesError) {
            // 檢查各種可能的錯誤情況
            const errorCode = rolesError.code;
            const errorMessage = rolesError.message || "";
            const errorDetails = rolesError.details || "";
            const errorHint = rolesError.hint || "";
            
            // 表不存在的錯誤代碼（PostgreSQL 錯誤代碼）
            const isTableNotExist = 
              errorCode === "42P01" || 
              errorMessage.toLowerCase().includes("does not exist") ||
              errorMessage.toLowerCase().includes("relation") && errorMessage.toLowerCase().includes("does not exist") ||
              errorDetails.toLowerCase().includes("does not exist") ||
              errorHint.toLowerCase().includes("does not exist");

            if (isTableNotExist) {
              // 表不存在，靜默處理，使用 user_metadata
              rolesData = null;
            } else {
              // 其他錯誤（如權限問題等），記錄但不中斷流程
              console.warn("無法獲取 user_roles 數據，將使用 user_metadata:", {
                code: errorCode,
                message: errorMessage,
                details: errorDetails
              });
              rolesData = null;
            }
          } else {
            rolesData = rolesDataResult;
          }
        } catch (err: any) {
          // 捕獲任何未預期的錯誤
          console.warn("查詢 user_roles 時發生錯誤，將使用 user_metadata:", err);
          rolesData = null;
        }

        // 3. 構建最終的用戶列表
        const usersList: UserPermission[] = [];

        for (const member of membersList) {
          const roleData = rolesData?.find((r) => r.user_id === member.user_id);
          
          // 優先使用 roleData 的 is_admin，如果沒有則使用 member 的 is_admin
          const isAdmin = roleData?.is_admin !== undefined 
            ? roleData.is_admin 
            : (member.is_admin || false);

          usersList.push({
            user_id: member.user_id,
            email: member.email || member.user_id.substring(0, 8) + "...",
            name: member.display_name || member.email?.split('@')[0] || undefined,
            is_admin: isAdmin,
            role: roleData?.role || (isAdmin ? "admin" : "user"),
            notes: roleData?.notes || undefined,
          });
        }

        // 按管理員狀態和名稱排序
        usersList.sort((a, b) => {
          if (a.is_admin !== b.is_admin) {
            return a.is_admin ? -1 : 1;
          }
          const nameA = a.name || a.email;
          const nameB = b.name || b.email;
          return nameA.localeCompare(nameB, 'zh-TW');
        });

        setUsers(usersList);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();

    // 訂閱 user_roles 表的變化（如果表存在）
    // 使用一個變量來追蹤 channel
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    // 異步檢查表是否存在並訂閱
    const setupSubscription = async () => {
      try {
        // 先測試查詢，確認表存在
        const { error: testError } = await supabase
          .from("user_roles")
          .select("user_id")
          .limit(1);
        
        // 如果查詢成功（表存在），則訂閱
        if (!testError) {
          channel = supabase
            .channel("user_roles_changes")
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "user_roles",
              },
              () => {
                loadUsers();
              }
            )
            .subscribe();
        }
      } catch (err) {
        // 表不存在或其他錯誤，不訂閱
        // 靜默處理，不顯示錯誤
      }
    };
    
    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAdmin, supabase, currentUser]);

  const toggleAdminPermission = async (userId: string, currentStatus: boolean) => {
    if (!currentUser || userId === currentUser.id) {
      alert("無法修改自己的權限！");
      return;
    }

    const newStatus = !currentStatus;
    setUpdating(userId);

    try {
      // 使用 upsert 來更新或創建 user_roles 記錄
      const { error } = await supabase
        .from("user_roles")
        .upsert(
          {
            user_id: userId,
            is_admin: newStatus,
            role: newStatus ? "admin" : "user",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        // 詳細記錄錯誤信息以便調試
        console.error("Error updating permission:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        });

        // 檢查各種可能的錯誤情況
        const errorCode = error.code || "";
        const errorMessage = error.message || "";
        const errorDetails = error.details || "";
        const errorHint = error.hint || "";

        // 表不存在的錯誤
        const isTableNotExist = 
          errorCode === "42P01" || 
          errorMessage.toLowerCase().includes("does not exist") ||
          errorMessage.toLowerCase().includes("relation") && errorMessage.toLowerCase().includes("does not exist") ||
          errorDetails.toLowerCase().includes("does not exist") ||
          errorHint.toLowerCase().includes("does not exist");

        // RLS 遞迴錯誤
        const isRecursionError = 
          errorCode === "42P17" ||
          errorMessage.toLowerCase().includes("infinite recursion") ||
          errorMessage.toLowerCase().includes("recursion detected");

        // RLS 權限錯誤
        const isPermissionDenied = 
          errorCode === "42501" ||
          errorCode === "PGRST301" ||
          errorMessage.toLowerCase().includes("permission denied") ||
          errorMessage.toLowerCase().includes("row-level security") ||
          errorMessage.toLowerCase().includes("new row violates row-level security");

        if (isTableNotExist) {
          alert(
            "❌ user_roles 表不存在！\n\n請先在 Supabase Dashboard > SQL Editor 中執行：\n\nsupabase/migration_add_user_roles.sql\n\n以創建用戶角色表。"
          );
        } else if (isRecursionError) {
          alert(
            "❌ RLS 政策遞迴錯誤！\n\n請在 Supabase Dashboard > SQL Editor 中執行修復腳本：\n\nsupabase/fix_user_roles_rls_recursion.sql\n\n這會修復 user_roles 表的 RLS 政策遞迴問題。"
          );
        } else if (isPermissionDenied) {
          alert(
            "❌ 權限不足！\n\n請確認：\n1. 您已經以管理員身份登入\n2. user_roles 表的 RLS 政策已正確設置\n3. 您的管理員權限已同步到 user_metadata"
          );
        } else {
          // 其他錯誤，顯示詳細信息
          const errorText = errorMessage || errorDetails || errorHint || "未知錯誤";
          alert(`❌ 更新失敗：${errorText}\n\n錯誤代碼：${errorCode || "無"}`);
        }
        setUpdating(null);
        return;
      }

      // 更新本地狀態
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId
            ? { ...u, is_admin: newStatus, role: newStatus ? "admin" : "user" }
            : u
        )
      );

      alert(`已${newStatus ? "授予" : "移除"}管理員權限！`);
    } catch (error: any) {
      // 捕獲任何未預期的錯誤
      console.error("Unexpected error updating permission:", {
        error,
        errorType: typeof error,
        errorString: String(error),
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorStack: error?.stack
      });

      // 提供友好的錯誤訊息
      let errorMessage = "請稍後再試";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details) {
        errorMessage = error.details;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        errorMessage = JSON.stringify(error);
      }

      alert(`❌ 更新失敗：${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    // 確認對話框
    const confirmed = window.confirm(
      `⚠️ 確定要刪除用戶「${userName}」的帳號嗎？\n\n此操作無法復原，將刪除：\n- 該用戶的所有個人數據\n- 該用戶的裝備清單\n- 該用戶的帳號資訊\n\n確定要繼續嗎？`
    );

    if (!confirmed) {
      return;
    }

    // 二次確認
    const doubleConfirmed = window.confirm(
      `最後確認：您真的要刪除用戶「${userName}」的帳號嗎？\n\n此操作無法復原！`
    );

    if (!doubleConfirmed) {
      return;
    }

    setDeleting(userId);

    try {
      // 調用管理員專用的刪除用戶 RPC 函數
      const { error } = await supabase.rpc('delete_user_by_admin', {
        target_user_id: userId
      });

      if (error) {
        // 如果 RPC 函數不存在，使用備用方法
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.warn("RPC 函數 delete_user_by_admin 不存在，使用備用方法");
          
          // 備用方法：直接刪除用戶數據（但無法刪除 auth.users）
          await supabase.from("user_gear_items").delete().eq("user_id", userId);
          await supabase.from("user_data").delete().eq("user_id", userId);
          await supabase.from("user_roles").delete().eq("user_id", userId);
          await supabase.from("user_profiles").delete().eq("user_id", userId);
          
          alert(`✅ 用戶「${userName}」的所有數據已刪除！\n\n請在 Supabase Dashboard > Authentication > Users 中手動刪除該用戶的認證帳號。\n\n或者執行 supabase/delete_user_by_admin.sql 腳本來創建 RPC 函數。`);
        } else {
          throw error;
        }
      } else {
        alert(`✅ 用戶「${userName}」的帳號及所有數據已成功刪除！`);
      }

      // 重新載入用戶列表
      window.location.reload();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(`刪除用戶失敗：${error?.message || "請稍後再試"}`);
    } finally {
      setDeleting(null);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="sketch-box p-6 bg-white text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3498db]" />
        <p className="mt-2 text-[#5a6c7d]">載入中...</p>
      </div>
    );
  }

  return (
    <div className="sketch-box p-6 bg-white">
      <h3 className="text-xl font-bold mb-4 text-[#2c3e50] transform rotate-1">
        🔐 用戶權限管理
      </h3>
      <p className="text-sm text-[#5a6c7d] mb-4">
        點擊切換按鈕來授予或移除用戶的管理員權限
      </p>

      {users.length === 0 ? (
        <div className="text-center py-8 text-[#5a6c7d]">
          <p>目前還沒有用戶</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const isCurrentUser = currentUser?.id === user.user_id;
            const isUpdating = updating === user.user_id;

            return (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-4 border-2 border-[#ecf0f1] rounded-lg hover:bg-[#f8f9fa] transition-colors"
                style={{
                  borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                      user.is_admin ? "bg-[#e74c3c]" : "bg-[#3498db]"
                    }`}
                    style={{
                      borderRadius: "50%",
                      transform: "rotate(2deg)",
                    }}
                  >
                    {user.is_admin ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#2c3e50] truncate">
                        {user.name || user.email.split("@")[0] || "未知用戶"}
                      </p>
                      {user.is_admin && (
                        <span
                          className="px-2 py-0.5 bg-[#e74c3c] text-white text-xs font-bold rounded flex-shrink-0"
                          style={{
                            borderRadius:
                              "255px 15px 225px 15px / 15px 225px 15px 255px",
                          }}
                        >
                          管理員
                        </span>
                      )}
                      {isCurrentUser && (
                        <span
                          className="px-2 py-0.5 bg-[#95a5a6] text-white text-xs font-bold rounded flex-shrink-0"
                          style={{
                            borderRadius:
                              "255px 15px 225px 15px / 15px 225px 15px 255px",
                          }}
                        >
                          您
                        </span>
                      )}
                    </div>
                    {user.email && user.email.includes("@") && (
                      <p className="text-sm text-[#95a5a6] truncate mt-1">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCurrentUser ? (
                    <span className="text-sm text-[#95a5a6] px-3 py-1">
                      無法修改
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          toggleAdminPermission(user.user_id, user.is_admin)
                        }
                        disabled={isUpdating || deleting === user.user_id}
                        className={`washi-tape-button px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
                          user.is_admin
                            ? "bg-[#e74c3c] text-white hover:bg-[#c0392b]"
                            : "bg-[#27ae60] text-white hover:bg-[#229954]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>處理中...</span>
                          </>
                        ) : user.is_admin ? (
                          <>
                            <X className="w-4 h-4" />
                            <span>移除管理員</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>設為管理員</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id, user.name || user.email.split("@")[0] || "用戶")}
                        disabled={deleting === user.user_id || isUpdating}
                        className="washi-tape-button px-3 py-2 text-sm font-semibold bg-[#e74c3c] text-white hover:bg-[#c0392b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        title="刪除用戶帳號"
                      >
                        {deleting === user.user_id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>刪除中...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                            <span>刪除</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

