"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users } from "lucide-react";
import Image from "next/image";

interface Participant {
  user_id: string;
  name: string;
  email: string;
  role: string;
  role_name: string;
}

const roleNames: Record<string, { name: string; imagePath: string }> = {
  leader: {
    name: "領隊",
    imagePath: "/images/role-leader.png",
  },
  chef: {
    name: "廚師",
    imagePath: "/images/role-chef.png",
  },
  photographer: {
    name: "攝影師",
    imagePath: "/images/role-photographer.png",
  },
  traveler: {
    name: "旅行者",
    imagePath: "/images/role-traveler.png",
  },
};

export default function ParticipantList() {
  const supabase = createClient();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        // 優先使用 RPC 函數獲取參與者列表（推薦方法）
        // 這個函數會繞過 RLS 限制，因為它使用 SECURITY DEFINER
        let participantsList: Participant[] = [];
        
        try {
          const { data: participantsData, error: participantsError } = await supabase.rpc('get_participants_list');
          if (!participantsError && participantsData && participantsData.length > 0) {
            // 直接使用 RPC 函數返回的數據
            participantsData.forEach((participant: any) => {
              // 處理角色值（可能是字符串）
              const roleValue = typeof participant.role === 'string' 
                ? participant.role.replace(/"/g, '').trim() // 移除可能的引號和空白
                : participant.role;
              
              if (roleValue && roleNames[roleValue]) {
                const roleInfo = roleNames[roleValue];
                
                // 處理用戶名稱，確保正確顯示
                let displayName = '';
                if (participant.display_name) {
                  // 確保是字符串且去除空白
                  displayName = String(participant.display_name).trim();
                }
                
                // 如果 display_name 為空或只有空白，使用 email 前綴
                if (!displayName || displayName.length === 0) {
                  displayName = participant.email?.split('@')[0] || '未知用戶';
                }
                
                participantsList.push({
                  user_id: participant.user_id,
                  name: displayName || '未知用戶',
                  email: participant.email || '',
                  role: roleValue,
                  role_name: roleInfo.name,
                });
              }
            });
            
            // 按角色排序
            const roleOrder = ["leader", "chef", "photographer", "traveler"];
            participantsList.sort((a, b) => {
              const aIndex = roleOrder.indexOf(a.role);
              const bIndex = roleOrder.indexOf(b.role);
              if (aIndex === -1 && bIndex === -1) return 0;
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            });
            
            setParticipants(participantsList);
            setLoading(false);
            return;
          } else if (participantsError) {
            console.log("get_participants_list 函數錯誤:", participantsError);
          }
        } catch (rpcError) {
          console.log("get_participants_list 不可用，使用備用方法", rpcError);
        }
        
        // 備用方法：從 user_data 表查詢（需要 RLS 政策允許查看 user_role）
        // 1. 獲取所有已選擇角色的用戶
        const { data: roleData, error: roleError } = await supabase
          .from("user_data")
          .select("user_id, value")
          .eq("key", "user_role");

        if (roleError) {
          console.error("Error loading roles:", roleError);
          // 如果 RLS 政策不允許，提示用戶
          if (roleError.message?.includes('permission') || roleError.message?.includes('policy')) {
            console.error("RLS 政策可能不允許查看其他用戶的角色數據。請執行 supabase/allow_public_view_user_roles.sql");
          }
          setLoading(false);
          return;
        }

        if (!roleData || roleData.length === 0) {
          setParticipants([]);
          setLoading(false);
          return;
        }

        // 2. 獲取用戶信息（備用方法）
        participantsList = [];
        
        // 嘗試使用 get_participants_list 函數獲取所有參與者信息（推薦方法）
        // 這個函數不需要管理員權限，所有用戶都可以使用
        let membersMap = new Map<string, { name: string; email: string }>();
        try {
          const { data: participantsData, error: participantsError } = await supabase.rpc('get_participants_list');
          if (!participantsError && participantsData) {
            participantsData.forEach((participant: any) => {
              membersMap.set(participant.user_id, {
                name: participant.display_name || participant.email?.split('@')[0] || '未知用戶',
                email: participant.email || '',
              });
            });
          } else if (participantsError) {
            console.log("get_participants_list 函數錯誤:", participantsError);
          }
        } catch (rpcError) {
          // 如果 RPC 函數不可用，嘗試使用 get_members_list（需要管理員權限）
          console.log("get_participants_list 不可用，嘗試使用 get_members_list");
          try {
            const { data: membersData } = await supabase.rpc('get_members_list');
            if (membersData) {
              membersData.forEach((member: any) => {
                membersMap.set(member.user_id, {
                  name: member.display_name || member.email?.split('@')[0] || '未知用戶',
                  email: member.email || '',
                });
              });
            }
          } catch (membersError) {
            console.log("get_members_list 也不可用，使用備用方法獲取用戶信息");
          }
        }

        // 獲取當前登入用戶信息（作為備用）
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        for (const item of roleData) {
          // 處理 JSONB 值
          const roleValue = typeof item.value === 'string'
            ? item.value
            : (item.value as any)?.toString() || item.value;

          if (!roleValue || !roleNames[roleValue as string]) {
            continue;
          }

          const role = roleValue as string;
          const roleInfo = roleNames[role];

          let name = "";
          let email = "";

          // 優先從 membersMap 獲取（使用 get_members_list）
          const memberInfo = membersMap.get(item.user_id);
          if (memberInfo) {
            name = memberInfo.name;
            email = memberInfo.email;
          } else if (currentUser && item.user_id === currentUser.id) {
            // 如果是當前用戶，從 auth 獲取
            email = currentUser.email || "";
            name = currentUser.user_metadata?.name || email.split('@')[0] || "未知用戶";
          } else {
            // 備用方法：從 user_profiles 獲取
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("display_name")
              .eq("user_id", item.user_id)
              .single();
            
            name = profile?.display_name || item.user_id.substring(0, 8) + "...";
            email = item.user_id.substring(0, 8) + "...";
          }

          participantsList.push({
            user_id: item.user_id,
            name: name || "未知用戶",
            email: email,
            role: role,
            role_name: roleInfo.name,
          });
        }

        // 3. 按角色排序（領隊、廚師、攝影師、旅行者）
        const roleOrder = ["leader", "chef", "photographer", "traveler"];
        participantsList.sort((a, b) => {
          const aIndex = roleOrder.indexOf(a.role);
          const bIndex = roleOrder.indexOf(b.role);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });

        setParticipants(participantsList);
      } catch (error) {
        console.error("Error loading participants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();

    // 設置實時訂閱，監聽 user_data 表的變化
    const channel = supabase
      .channel("participants-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_data",
          filter: "key=eq.user_role",
        },
        () => {
          // 當有角色變化時，重新載入
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="sketch-box p-6 bg-white text-center">
        <p className="text-[#5a6c7d]">目前還沒有成員選擇角色</p>
        <p className="text-sm text-[#95a5a6] mt-2">請前往設定頁面選擇您的角色</p>
      </div>
    );
  }

  return (
    <div className="sketch-box p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-[#3498db]" />
        <h3
          className="text-2xl font-bold text-[#2c3e50] transform rotate-1"
          style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
        >
          活動參與者 ({participants.length})
        </h3>
      </div>

      <div className="space-y-3">
        {participants.map((participant) => {
          const roleInfo = roleNames[participant.role];
          return (
            <div
              key={participant.user_id}
              className="flex items-center gap-3 p-3 border-2 border-[#ecf0f1] rounded-lg hover:bg-[#f8f9fa] transition-colors"
              style={{
                borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
              }}
            >
              {/* 角色圖標 */}
              <div className="flex-shrink-0 w-16 h-16 relative">
                <Image
                  src={roleInfo.imagePath}
                  alt={roleInfo.name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>

              {/* 用戶信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[#2c3e50] truncate">
                    {participant.name}
                  </p>
                  <span className="px-2 py-0.5 bg-[#3498db] text-white text-xs font-bold rounded" style={{
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  }}>
                    {participant.role_name}
                  </span>
                </div>
                {participant.email && participant.email.includes('@') && (
                  <p className="text-sm text-[#95a5a6] truncate">
                    {participant.email}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

