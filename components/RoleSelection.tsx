"use client";

import { useState, useEffect } from "react";
import { Save, Lock, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Role {
  id: string;
  name: string;
  description: string;
  imagePath: string;
}

const roles: Role[] = [
  {
    id: "leader",
    name: "領隊",
    description: "Leader",
    imagePath: "/images/role-leader.png",
  },
  {
    id: "chef",
    name: "廚師",
    description: "Chef",
    imagePath: "/images/role-chef.png",
  },
  {
    id: "photographer",
    name: "攝影師",
    description: "Photographer",
    imagePath: "/images/role-photographer.png",
  },
  {
    id: "traveler",
    name: "旅行者",
    description: "Traveler",
    imagePath: "/images/role-traveler.png",
  },
];

export default function RoleSelection() {
  const { user } = useAuth();
  const supabase = createClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // 載入已選擇的角色
        const { data: roleData } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "user_role")
          .single();

        if (roleData) {
          // 處理 JSONB 值
          const roleValue = typeof roleData.value === 'string' 
            ? roleData.value 
            : (roleData.value as any)?.toString() || roleData.value;
          setSelectedRole(roleValue as string);
        }

        // 檢查是否已鎖定
        const { data: lockData } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "user_role_locked")
          .single();

        // 處理 JSONB 值（可能是字符串或對象）
        const lockValue = typeof lockData?.value === 'string'
          ? lockData.value
          : (lockData?.value as any)?.toString() || lockData?.value;
        setIsLocked(lockValue === "true" || lockValue === true);

        // 檢查管理員是否允許編輯
        const { data: editData } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "user_role_can_edit")
          .single();

        // 處理 JSONB 值（可能是字符串或對象）
        const editValue = typeof editData?.value === 'string'
          ? editData.value
          : (editData?.value as any)?.toString() || editData?.value;
        setCanEdit(editValue === "true" || editValue === true);
        
        console.log("Role selection data loaded:", {
          isLocked: lockValue === "true" || lockValue === true,
          canEdit: editValue === "true" || editValue === true,
          lockValue,
          editValue
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 設置實時訂閱，監聽 user_data 表的變化
    const channel = supabase
      .channel(`user-role-data-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_data",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // 當 user_role_locked 或 user_role_can_edit 變化時，重新載入數據
          if (
            payload.new &&
            ((payload.new as any).key === "user_role_locked" ||
              (payload.new as any).key === "user_role_can_edit")
          ) {
            console.log("User role data changed, reloading...", payload);
            loadData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const handleSave = async () => {
    const canSelect = !isLocked || canEdit; // 如果未鎖定，或管理員允許編輯，則可以儲存
    if (!user || !canSelect || !selectedRole) {
      console.log("Cannot save:", { user: !!user, user_id: user?.id, canSelect, selectedRole });
      if (!user) {
        alert("請先登入");
      }
      return;
    }

    setSaving(true);
    try {
      // 直接使用 useAuth 提供的 user，不需要重新獲取
      const currentUser = user;
      if (!currentUser || !currentUser.id) {
        throw new Error("用戶未登入，請重新整理頁面後再試");
      }

      console.log("Saving role:", { user_id: currentUser.id, role: selectedRole });

      // 儲存角色 - 注意：value 需要是 JSONB 格式
      // 對於字符串值，Supabase 會自動轉換，但我們明確指定
      const { error: roleError, data: roleData } = await supabase
        .from("user_data")
        .upsert({
          user_id: currentUser.id,
          key: "user_role",
          value: selectedRole, // Supabase 會自動將字符串轉換為 JSONB
        }, {
          onConflict: 'user_id,key'
        });

      if (roleError) {
        console.error("Role save error:", roleError);
        console.error("Error details:", {
          message: roleError.message,
          details: roleError.details,
          hint: roleError.hint,
          code: roleError.code
        });
        throw roleError;
      }

      console.log("Role saved successfully:", roleData);

      // 只有在未鎖定時才鎖定（如果已經鎖定但管理員允許編輯，保持鎖定狀態）
      if (!isLocked) {
        const { error: lockError } = await supabase
          .from("user_data")
          .upsert({
            user_id: currentUser.id,
            key: "user_role_locked",
            value: "true",
          }, {
            onConflict: 'user_id,key'
          });

        if (lockError) {
          console.error("Lock error:", lockError);
          throw lockError;
        }
        setIsLocked(true);
      }

      alert(isLocked && canEdit ? "角色已更新！" : "角色已選擇並鎖定！");
    } catch (error: any) {
      console.error("Error saving data:", error);
      const errorMessage = error?.message || error?.details || "儲存失敗，請稍後再試";
      alert(`儲存失敗：${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        {loading ? "載入中..." : "請先登入"}
      </div>
    );
  }

  return (
    <div className="sketch-box p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-2xl font-bold text-[#2c3e50] transform rotate-1"
          style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
        >
          👤 選擇您的角色
        </h3>
        {isLocked && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#27ae60] text-white rounded-full">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-semibold">已鎖定</span>
          </div>
        )}
      </div>

      {isLocked && !canEdit ? (
        <div className="text-center py-8">
          <p className="text-lg text-[#5a6c7d] mb-4">
            ✅ 您的角色已選擇並鎖定
          </p>
          {selectedRole && (
            <div className="inline-block p-4 bg-[#ecf0f1] rounded-lg">
              <p className="text-xl font-bold text-[#2c3e50]">
                {roles.find((r) => r.id === selectedRole)?.name || selectedRole}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {roles.map((role) => {
              const canSelect = !isLocked || canEdit; // 如果未鎖定，或管理員允許編輯，則可以選擇
              return (
                <div
                  key={role.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (canSelect) {
                      setSelectedRole(role.id);
                    }
                  }}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  } ${
                    selectedRole === role.id
                      ? "border-[#3498db] bg-blue-50 shadow-md"
                      : "border-[#ecf0f1] hover:border-[#bdc3c7] hover:bg-[#f8f9fa]"
                  }`}
                  style={{
                    borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
                  }}
                >
                  {selectedRole === role.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#27ae60] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* 角色圖標 */}
                  <div className="flex justify-center mb-3 h-24 relative">
                    <Image
                      src={role.imagePath}
                      alt={role.name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>

                  {/* 角色資訊 */}
                  <div className="text-center">
                    <h4
                      className="text-lg font-bold text-[#2c3e50] mb-1"
                      style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
                    >
                      {role.name}
                    </h4>
                    <p className="text-sm text-[#95a5a6] italic">{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#fff3cd] border-2 border-[#ffc107] rounded-lg p-4 mb-4">
            <p className="text-sm text-[#856404]">
              ⚠️ <strong>注意：</strong>選擇後角色將被鎖定，無法再修改。請確認選擇正確後再儲存。
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !selectedRole || (isLocked && !canEdit)}
            className="washi-tape-button w-full py-3 bg-[#27ae60] text-white font-semibold hover:bg-[#229954] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "儲存中..." : isLocked && canEdit ? "更新角色" : "儲存並鎖定"}
          </button>
        </>
      )}
    </div>
  );
}

