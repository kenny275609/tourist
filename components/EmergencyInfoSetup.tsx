"use client";

import { useState, useEffect } from "react";
import { Phone, FileText, Building2, Save, Lock, Unlock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

interface EmergencyInfo {
  contact_name: string;
  contact_phone: string;
  insurance_policy: string;
  police_station: string;
}

export default function EmergencyInfoSetup() {
  const { user } = useAuth();
  const supabase = createClient();
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>({
    contact_name: "",
    contact_phone: "",
    insurance_policy: "",
    police_station: "武陵農場小隊 (04-25901350)",
  });
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
        // 載入緊急資訊
        const { data: infoData } = await supabase
          .from("user_data")
          .select("value")
          .eq("user_id", user.id)
          .eq("key", "emergency_info")
          .single();

        if (infoData) {
          // JSONB 欄位可能直接返回對象或字符串，需要處理兩種情況
          let info;
          if (typeof infoData.value === 'string') {
            info = JSON.parse(infoData.value);
          } else {
            info = infoData.value; // 已經是對象
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
        
        console.log("Emergency info data loaded:", {
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
      .channel(`emergency-info-data-${user.id}`)
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
              (payload.new as any).key === "emergency_info_can_edit")
          ) {
            console.log("Emergency info data changed, reloading...", payload);
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
    // 如果已鎖定但管理員不允許編輯，則不能儲存
    if (!user || (isLocked && !canEdit)) {
      console.log("Cannot save:", { user: !!user, isLocked, canEdit });
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

      console.log("Saving emergency info:", { user_id: currentUser.id, info: emergencyInfo });

      // 儲存緊急資訊 - 對於 JSONB 欄位，直接傳遞對象
      const { error: infoError, data: infoData } = await supabase
        .from("user_data")
        .upsert({
          user_id: currentUser.id,
          key: "emergency_info",
          value: emergencyInfo, // 直接傳遞對象，Supabase 會自動轉換為 JSONB
        }, {
          onConflict: 'user_id,key'
        });

      if (infoError) {
        console.error("Error saving emergency info:", infoError);
        console.error("Error details:", {
          message: infoError.message,
          details: infoError.details,
          hint: infoError.hint,
          code: infoError.code
        });
        throw infoError;
      }

      console.log("Emergency info saved:", infoData);

      // 只有在未鎖定時才鎖定（如果已經鎖定但管理員允許編輯，保持鎖定狀態）
      if (!isLocked) {
        const { error: lockError } = await supabase
          .from("user_data")
          .upsert({
            user_id: currentUser.id,
            key: "emergency_info_locked",
            value: "true", // 字符串值，Supabase 會自動轉換為 JSONB
          }, {
            onConflict: 'user_id,key'
          });

        if (lockError) {
          console.error("Error locking emergency info:", lockError);
          throw lockError;
        }
        setIsLocked(true);
      }

      alert(isLocked && canEdit ? "緊急資訊已更新！" : "資料已儲存並鎖定！");
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
          📝 填寫緊急資訊
        </h3>
        <div className="flex items-center gap-2">
          {isLocked && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              canEdit ? "bg-[#f39c12] text-white" : "bg-[#e74c3c] text-white"
            }`}>
              <Lock className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {canEdit ? "已鎖定（可編輯）" : "已鎖定"}
              </span>
            </div>
          )}
          {!isLocked && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#27ae60] text-white rounded-full">
              <Unlock className="w-4 h-4" />
              <span className="text-sm font-semibold">未鎖定</span>
            </div>
          )}
        </div>
      </div>

      {isLocked && !canEdit ? (
        <div className="text-center py-8">
          <p className="text-lg text-[#5a6c7d] mb-4">
            ✅ 您的緊急資訊已填寫並鎖定
          </p>
          <p className="text-sm text-[#95a5a6]">
            如需修改，請聯繫管理員
          </p>
        </div>
      ) : (
        // 如果未鎖定，或已鎖定但管理員允許編輯，則顯示表單
        <>
          <div className="space-y-4 mb-6">
            {/* 緊急聯絡人 */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                  緊急聯絡人 <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  value={emergencyInfo.contact_name}
                  onChange={(e) =>
                    setEmergencyInfo({ ...emergencyInfo, contact_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                  placeholder="請輸入緊急聯絡人姓名"
                  required
                  disabled={isLocked && !canEdit}
                />
              </div>
            </div>

            {/* 電話 */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                  電話 <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="tel"
                  value={emergencyInfo.contact_phone}
                  onChange={(e) =>
                    setEmergencyInfo({ ...emergencyInfo, contact_phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                  placeholder="請輸入電話號碼"
                  required
                  disabled={isLocked && !canEdit}
                />
              </div>
            </div>

            {/* 保險單號 */}
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                  保險單號
                </label>
                <input
                  type="text"
                  value={emergencyInfo.insurance_policy}
                  onChange={(e) =>
                    setEmergencyInfo({ ...emergencyInfo, insurance_policy: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                  placeholder="請輸入保險單號碼（選填）"
                  disabled={isLocked && !canEdit}
                />
              </div>
            </div>

            {/* 轄區警局 */}
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#3498db] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[#2c3e50] mb-2">
                  轄區警局
                </label>
                <input
                  type="text"
                  value={emergencyInfo.police_station}
                  onChange={(e) =>
                    setEmergencyInfo({ ...emergencyInfo, police_station: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db]"
                  placeholder="警局名稱與電話"
                  disabled={isLocked && !canEdit}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#fff3cd] border-2 border-[#ffc107] rounded-lg p-4 mb-4">
            <p className="text-sm text-[#856404]">
              ⚠️ <strong>注意：</strong>儲存後資料將被鎖定，無法再修改。請確認資訊正確後再儲存。
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !emergencyInfo.contact_name || !emergencyInfo.contact_phone || (isLocked && !canEdit)}
            className="washi-tape-button w-full py-3 bg-[#27ae60] text-white font-semibold hover:bg-[#229954] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "儲存中..." : isLocked && canEdit ? "更新資訊" : "儲存並鎖定"}
          </button>
        </>
      )}
    </div>
  );
}

