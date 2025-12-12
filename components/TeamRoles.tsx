"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

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

export default function TeamRoles() {
  const { user } = useAuth();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "user_role")
          .single();

        if (data) {
          setUserRole(data.value as string);
        }
      } catch (error) {
        console.error("Error loading user role:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, [user, supabase]);

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
        className="text-2xl font-bold mb-6 text-[#2c3e50] text-center transform rotate-1"
        style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
      >
        👥 團隊角色
      </h3>

      {userRole ? (
        <div className="text-center py-8">
          <p className="text-lg text-[#5a6c7d] mb-6">您的角色：</p>
          <div className="inline-block">
            {roles
              .filter((role) => role.id === userRole)
              .map((role) => (
                <div
                  key={role.id}
                  className="relative p-6 border-2 border-[#3498db] rounded-lg bg-blue-50"
                  style={{
                    borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
                  }}
                >
                  <div className="flex justify-center mb-4 h-32 relative">
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
                  <h4
                    className="text-2xl font-bold text-[#2c3e50] mb-2"
                    style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
                  >
                    {role.name}
                  </h4>
                  <p className="text-sm text-[#95a5a6] italic">{role.description}</p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-[#5a6c7d]">
            請先在上方選擇您的角色
          </p>
        </div>
      )}

      {/* 顯示所有角色（僅供參考） */}
      <div className="mt-8 pt-6 border-t-2 border-dashed border-[#ecf0f1]">
        <h4 className="text-lg font-bold text-[#2c3e50] mb-4 text-center">
          團隊角色總覽
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {roles.map((role) => {
            return (
              <div
                key={role.id}
                className={`relative p-4 border-2 rounded-lg ${
                  userRole === role.id
                    ? "border-[#27ae60] bg-green-50"
                    : "border-[#ecf0f1]"
                }`}
                style={{
                  borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
                }}
              >
                {userRole === role.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#27ae60] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
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
                      // 如果圖片載入失敗，顯示備用 SVG
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  {/* 備用 SVG（如果圖片不存在） */}
                  <div style={{ display: 'none' }}>
                    {role.id === "leader" && <LeaderIcon />}
                    {role.id === "chef" && <ChefIcon />}
                    {role.id === "photographer" && <PhotographerIcon />}
                    {role.id === "traveler" && <TravelerIcon />}
                  </div>
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
      </div>
    </div>
  );
}

// 備用 SVG 圖標（如果圖片不存在時使用）
function LeaderIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-md">
      <ellipse cx="40" cy="55" rx="20" ry="18" fill="#000000" />
      <ellipse cx="40" cy="30" rx="18" ry="22" fill="#000000" />
      <ellipse cx="40" cy="38" rx="15" ry="18" fill="#FFFFFF" />
      <circle cx="33" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="47" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="33" cy="28" r="2" fill="#000000" />
      <circle cx="47" cy="28" r="2" fill="#000000" />
      <ellipse cx="40" cy="35" rx="4" ry="3" fill="#FFA500" />
      <ellipse cx="32" cy="70" rx="6" ry="4" fill="#FFA500" />
      <ellipse cx="48" cy="70" rx="6" ry="4" fill="#FFA500" />
      <path
        d="M 30 15 L 35 8 L 40 12 L 45 8 L 50 15 L 50 20 L 30 20 Z"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="1.5"
      />
      <rect x="52" y="25" width="15" height="12" fill="#F5DEB3" stroke="#8B4513" strokeWidth="1" />
    </svg>
  );
}

function ChefIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-md">
      <ellipse cx="40" cy="55" rx="20" ry="18" fill="#000000" />
      <ellipse cx="40" cy="30" rx="18" ry="22" fill="#000000" />
      <ellipse cx="40" cy="38" rx="15" ry="18" fill="#FFFFFF" />
      <circle cx="33" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="47" cy="28" r="4" fill="#FFFFFF" />
      <ellipse cx="40" cy="18" rx="22" ry="8" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1.5" />
      <ellipse cx="55" cy="40" rx="8" ry="3" fill="#808080" stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
}

function PhotographerIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-md">
      <ellipse cx="40" cy="55" rx="20" ry="18" fill="#000000" />
      <ellipse cx="40" cy="30" rx="18" ry="22" fill="#FFFFFF" />
      <rect x="25" y="32" width="20" height="15" fill="#8B4513" stroke="#654321" strokeWidth="1.5" rx="2" />
      <circle cx="35" cy="39" r="4" fill="#000000" />
    </svg>
  );
}

function TravelerIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-md">
      <ellipse cx="40" cy="50" rx="25" ry="20" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
      <ellipse cx="40" cy="25" rx="18" ry="15" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
      <rect x="30" y="35" width="20" height="25" fill="#8B4513" stroke="#654321" strokeWidth="2" rx="3" />
    </svg>
  );
}
