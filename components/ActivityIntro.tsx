"use client";

import CountdownSticky from "./CountdownSticky";
import ElevationProfile from "./ElevationProfile";
import TeamInviteTicket from "./TeamInviteTicket";
import { useTripSettings } from "@/hooks/useTripSettings";

export default function ActivityIntro() {
  const { settings, loading } = useTripSettings();
  // 從數據庫讀取出發日期，如果沒有則使用預設值
  const departureDate = settings.departure_date || "2025-10-10";
  const inviteCode = settings.invite_code || "WL4SHOW";
  
  // 從數據庫讀取活動介紹和交通資訊
  const activityIntro = settings.activity_intro || `武陵四秀是台灣中部著名的百岳路線，包含四座美麗的高山：池有山、品田山、桃山和喀拉業山。

這條路線穿越武陵農場周邊的原始森林，沿途可以欣賞到壯麗的山景、雲海和豐富的生態環境。品田山的 V 型斷崖更是這條路線的經典地標，吸引無數登山愛好者前來挑戰。

行程規劃為3天2夜，適合有基本登山經驗的山友。沿途設有山屋可供住宿，讓您可以在舒適的環境中享受高山之美。`;
  
  const transportationDrive = settings.transportation_drive || "前往武陵農場（武陵山莊）";
  const transportationPublic = settings.transportation_public || "可搭乘國光客運 1751 或 1764 路線";
  
  // 將換行符號轉換為段落
  const introParagraphs = activityIntro.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="space-y-6">
      {/* 右上角便利貼 */}
      <div className="flex justify-end mb-4">
        <CountdownSticky targetDate={departureDate} />
      </div>

      {/* 海拔剖面圖（主要視覺） */}
      <div className="mb-6">
        <ElevationProfile />
      </div>

      {/* 團隊邀請票券 */}
      <div className="mb-6">
        <TeamInviteTicket inviteCode={inviteCode} />
      </div>

      {/* 活動介紹文字 */}
      <div className="sketch-box p-6 bg-white">
        <div className="space-y-4 text-base text-[#34495e] leading-relaxed">
          {introParagraphs.map((paragraph, index) => (
            <p key={index}>
              {paragraph.split(/(武陵四秀|池有山|品田山|桃山|喀拉業山|3天2夜)/).map((part, i) => {
                if (part === '武陵四秀') {
                  return <strong key={i} className="text-[#2c3e50]">{part}</strong>;
                } else if (['池有山', '品田山', '桃山', '喀拉業山'].includes(part)) {
                  return <strong key={i} className="text-[#3498db]">{part}</strong>;
                } else if (part === '3天2夜') {
                  return <strong key={i} className="text-[#e74c3c]">{part}</strong>;
                }
                return <span key={i}>{part}</span>;
              })}
            </p>
          ))}
        </div>

        {/* 交通資訊整合到介紹中 */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#ecf0f1]">
          <h3 className="text-lg font-bold mb-3 text-[#34495e] transform rotate-1">📍 交通資訊</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="sketch-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="2.5">
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                  <path d="M12 15l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 9h6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-[#2c3e50]">開車前往</p>
                <p className="text-sm text-[#5a6c7d]">{transportationDrive}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="sketch-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="2.5">
                  <rect x="4" y="6" width="16" height="12" rx="2" />
                  <path d="M4 12h16" />
                  <circle cx="7" cy="12" r="1.5" fill="#3498db" />
                  <circle cx="17" cy="12" r="1.5" fill="#3498db" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-[#2c3e50]">大眾運輸</p>
                <p className="text-sm text-[#5a6c7d]">{transportationPublic}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

