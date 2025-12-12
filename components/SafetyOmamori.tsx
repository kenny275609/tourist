"use client";

import { useState, useEffect } from "react";
import { Phone, FileText, Building2, Edit2, Save, X, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface EmergencyInfo {
  contact_name: string;
  contact_phone: string;
  insurance_policy: string;
  police_station: string;
}

export default function SafetyOmamori() {
  const { user } = useAuth();
  const supabase = createClient();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>({
    contact_name: "",
    contact_phone: "",
    insurance_policy: "",
    police_station: "武陵農場小隊 (04-25901350)",
  });
  const [loading, setLoading] = useState(true);
  const [omamoriImage, setOmamoriImage] = useState<string | null>(null);
  const [infoCardImage, setInfoCardImage] = useState<string | null>(null);

  // 載入圖片（從 public 資料夾或 Supabase Storage）
  useEffect(() => {
    // 嘗試從 public 資料夾載入
    setOmamoriImage("/images/omamori.png");
    setInfoCardImage("/images/info-card.png");
  }, []);

  // 載入緊急資訊
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadEmergencyInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "emergency_info")
          .single();

        if (!error && data) {
          // JSONB 欄位可能直接返回對象或字符串，需要處理兩種情況
          let info;
          if (typeof data.value === 'string') {
            info = JSON.parse(data.value);
          } else {
            info = data.value; // 已經是對象
          }
          
          setEmergencyInfo({
            contact_name: info.contact_name || "",
            contact_phone: info.contact_phone || "",
            insurance_policy: info.insurance_policy || "",
            police_station: info.police_station || "武陵農場小隊 (04-25901350)",
          });
        }

        // 檢查是否已鎖定
        const { data: lockData } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "emergency_info_locked")
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
          .eq("key", "emergency_info_can_edit")
          .single();

        const editValue = typeof editData?.value === 'string'
          ? editData.value
          : (editData?.value as any)?.toString() || editData?.value;
        setCanEdit(editValue === "true" || editValue === true);
        
        console.log("Safety omamori data loaded:", {
          isLocked: lockValue === "true" || lockValue === true,
          canEdit: editValue === "true" || editValue === true,
          lockValue,
          editValue
        });
      } catch (error) {
        console.error("Error loading emergency info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmergencyInfo();

    // 設置實時訂閱，監聽 user_data 表的變化
    const channel = supabase
      .channel(`safety-omamori-data-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_data",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // 當 emergency_info_locked 或 emergency_info_can_edit 變化時，重新載入數據
          if (
            payload.new &&
            ((payload.new as any).key === "emergency_info_locked" ||
              (payload.new as any).key === "emergency_info_can_edit" ||
              (payload.new as any).key === "emergency_info")
          ) {
            console.log("Safety omamori data changed, reloading...", payload);
            loadEmergencyInfo();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const handleSave = async () => {
    if (!user || isLocked) return;

    try {
      // 檢查用戶是否已登入
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("用戶未登入");
      }

      console.log("Saving emergency info:", { user_id: currentUser.id, info: emergencyInfo });

      // 對於 JSONB 欄位，直接傳遞對象，Supabase 會自動轉換
      const { error, data } = await supabase
        .from("user_data")
        .upsert({
          user_id: currentUser.id,
          key: "emergency_info",
          value: emergencyInfo, // 直接傳遞對象，Supabase 會自動轉換為 JSONB
        }, {
          onConflict: 'user_id,key'
        });

      if (error) {
        console.error("Error saving emergency info:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log("Emergency info saved successfully:", data);
      setIsEditing(false);
      alert("緊急資訊已儲存！");
    } catch (error: any) {
      console.error("Error saving emergency info:", error);
      const errorMessage = error?.message || error?.details || "儲存失敗，請稍後再試";
      alert(`儲存失敗：${errorMessage}`);
    }
  };

  if (!user) return null;

  return (
    <div className="relative perspective-1000" style={{ minHeight: "400px" }}>
      {/* 翻轉容器 */}
      <div
        className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={() => !isEditing && setIsFlipped(!isFlipped)}
        style={{
          transformStyle: "preserve-3d",
          cursor: isEditing ? "default" : "pointer",
          minHeight: "400px",
        }}
      >
        {/* 正面：御守 */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            zIndex: isFlipped ? 1 : 2,
          }}
        >
          {omamoriImage ? (
            <div className="relative w-full h-full">
              <Image
                src={omamoriImage}
                alt="平安御守"
                fill
                className="object-contain"
                onError={() => setOmamoriImage(null)}
              />
            </div>
          ) : (
            // 備用：如果圖片載入失敗，顯示 SVG 版本
            <div
              className="relative w-full h-full bg-gradient-to-br from-red-200 to-red-300 rounded-lg p-6 flex flex-col items-center justify-center shadow-lg"
              style={{
                borderRadius: "20px 20px 8px 8px",
                backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px),
                  repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)
                `,
                border: "3px solid #8B0000",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.3)",
              }}
            >
              <div className="relative z-10 text-center">
                <div
                  className="text-3xl font-bold text-white mb-2 writing-vertical-rl"
                  style={{
                    fontFamily: "var(--font-zen-maru-gothic)",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    letterSpacing: "0.2em",
                  }}
                >
                  平安御守
                </div>
                <div
                  className="text-sm text-white/90 mt-2"
                  style={{
                    fontFamily: "var(--font-zen-maru-gothic)",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  點擊查看資訊
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 背面：資訊卡 */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            zIndex: isFlipped ? 2 : 1,
          }}
        >
          {infoCardImage ? (
            <div className="relative w-full h-full">
              <Image
                src={infoCardImage}
                alt="留守人資訊"
                fill
                className="object-contain"
                onError={() => setInfoCardImage(null)}
                priority
              />
              {/* 在圖片上疊加可編輯的資訊 - 使用半透明背景讓文字更清晰 */}
              <div className="absolute inset-0 p-6 flex flex-col">
                {/* 標題區域 */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <h3
                      className="text-2xl font-bold text-[#1e3a8a]"
                      style={{ 
                        fontFamily: "var(--font-zen-maru-gothic)",
                      }}
                    >
                      留守人資訊
                    </h3>
                  </div>
                  {(!isLocked || canEdit) && !isEditing ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="p-2 hover:bg-white/90 rounded-full transition-colors bg-white/80 shadow-md"
                      title="編輯"
                    >
                      <Edit2 className="w-5 h-5 text-[#3498db]" />
                    </button>
                  ) : isLocked ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#27ae60]/20 rounded-full">
                      <Lock className="w-3 h-3 text-[#27ae60]" />
                      <span className="text-xs text-[#27ae60] font-semibold">已鎖定</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave();
                        }}
                        className="p-2 hover:bg-[#27ae60] hover:text-white rounded-full transition-colors bg-white/90 shadow-md"
                        title="儲存"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(false);
                        }}
                        className="p-2 hover:bg-[#e74c3c] hover:text-white rounded-full transition-colors bg-white/90 shadow-md"
                        title="取消"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 資訊欄位區域 - 使用清晰的白色卡片 */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {/* 緊急聯絡人 */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-[#3498db] flex-shrink-0" />
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                          緊急聯絡人
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={emergencyInfo.contact_name}
                            onChange={(e) =>
                              setEmergencyInfo({ ...emergencyInfo, contact_name: e.target.value })
                            }
                            className="w-full px-3 py-2 border-2 border-[#3498db] rounded-lg focus:outline-none bg-white text-[#2c3e50] font-medium"
                            placeholder="姓名"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="text-base text-[#2c3e50] font-medium">
                            {emergencyInfo.contact_name || "未填寫"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 電話 */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6 text-[#3498db] flex-shrink-0" />
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                          電話
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={emergencyInfo.contact_phone}
                            onChange={(e) =>
                              setEmergencyInfo({ ...emergencyInfo, contact_phone: e.target.value })
                            }
                            className="w-full px-3 py-2 border-2 border-[#3498db] rounded-lg focus:outline-none bg-white text-[#2c3e50] font-medium"
                            placeholder="電話號碼"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="text-base text-[#2c3e50] font-medium">
                            {emergencyInfo.contact_phone || "未填寫"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 保險單號 */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-[#3498db] flex-shrink-0" />
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                          保險單號
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={emergencyInfo.insurance_policy}
                            onChange={(e) =>
                              setEmergencyInfo({ ...emergencyInfo, insurance_policy: e.target.value })
                            }
                            className="w-full px-3 py-2 border-2 border-[#3498db] rounded-lg focus:outline-none bg-white text-[#2c3e50] font-medium"
                            placeholder="保險單號碼"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="text-base text-[#2c3e50] font-medium">
                            {emergencyInfo.insurance_policy || "未填寫"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 轄區警局 */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-[#3498db] flex-shrink-0" />
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                          轄區警局
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={emergencyInfo.police_station}
                            onChange={(e) =>
                              setEmergencyInfo({ ...emergencyInfo, police_station: e.target.value })
                            }
                            className="w-full px-3 py-2 border-2 border-[#3498db] rounded-lg focus:outline-none bg-white text-[#2c3e50] font-medium"
                            placeholder="警局名稱與電話"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="text-base text-[#2c3e50] font-medium">
                            {emergencyInfo.police_station}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 備用：如果圖片載入失敗，顯示原本的樣式
            <div
              className="w-full h-full bg-[#fdfaf6] rounded-lg p-6 shadow-lg sketch-box"
              style={{
                border: "3px solid #2c3e50",
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)
                `,
              }}
            >
              {/* 原本的資訊卡內容 */}
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-xl font-bold text-[#2c3e50]"
                  style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
                >
                  留守人資訊
                </h3>
                {!isEditing ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                    title="編輯"
                  >
                    <Edit2 className="w-4 h-4 text-[#3498db]" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                      className="p-1.5 hover:bg-[#27ae60] hover:text-white rounded transition-colors"
                      title="儲存"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(false);
                      }}
                      className="p-1.5 hover:bg-[#e74c3c] hover:text-white rounded transition-colors"
                      title="取消"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#2c3e50] mb-1">
                      緊急聯絡人
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyInfo.contact_name}
                        onChange={(e) =>
                          setEmergencyInfo({ ...emergencyInfo, contact_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                        placeholder="姓名"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-[#5a6c7d]">
                        {emergencyInfo.contact_name || "未填寫"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#2c3e50] mb-1">
                      電話
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={emergencyInfo.contact_phone}
                        onChange={(e) =>
                          setEmergencyInfo({ ...emergencyInfo, contact_phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                        placeholder="電話號碼"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-[#5a6c7d]">
                        {emergencyInfo.contact_phone || "未填寫"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#2c3e50] mb-1">
                      保險單號
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyInfo.insurance_policy}
                        onChange={(e) =>
                          setEmergencyInfo({ ...emergencyInfo, insurance_policy: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                        placeholder="保險單號碼"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-[#5a6c7d]">
                        {emergencyInfo.insurance_policy || "未填寫"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#2c3e50] mb-1">
                      轄區警局
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyInfo.police_station}
                        onChange={(e) =>
                          setEmergencyInfo({ ...emergencyInfo, police_station: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                        placeholder="警局名稱與電話"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-[#5a6c7d]">{emergencyInfo.police_station}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提示文字 */}
      {!isFlipped && (
        <p className="text-center text-sm text-[#95a5a6] mt-2">
          點擊御守查看緊急資訊
        </p>
      )}
    </div>
  );
}
