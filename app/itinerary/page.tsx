"use client";

import { useEffect, useState } from "react";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import Navigation from "@/components/Navigation";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";

export default function ItineraryPage() {
  const { user, loading } = useAuth();
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      setSupabaseConfigured(false);
    }
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#fef9e7] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-md border-2 border-[#ecf0f1] max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-[#e74c3c]">
            ⚠️ Supabase 未配置
          </h2>
          <p className="text-lg text-[#34495e] mb-4">
            請先設定 Supabase 環境變數才能使用此應用程式。
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fef9e7] flex items-center justify-center">
        <div className="text-center text-[#5a6c7d]">
          <p className="text-xl">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] pb-20">
      {/* 頂部標題欄 */}
      <div className="bg-white border-b-4 border-[#2c3e50] sticky top-0 z-40" style={{
        borderImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #2c3e50 10px, #2c3e50 12px) 1',
      }}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2c3e50] transform -rotate-1">武陵四秀3日遊</h1>
          {user && (
            <UserProfile />
          )}
        </div>
      </div>

      <div className="py-6 px-4">
        <div className="max-w-md mx-auto space-y-8">
          {!user ? (
            <section>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[#2c3e50] text-center">
                請先登入
              </h2>
              <Auth />
            </section>
          ) : (
            <>
              <UserProfile />
              <section>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[#2c3e50] text-center">
                  旅遊行程
                </h2>
                <div className="bg-white rounded-lg p-6 shadow-md border-2 border-[#ecf0f1] mb-6">
                  <p className="text-xl text-[#34495e] text-center mb-2">
                    <strong className="text-[#e74c3c]">3天2夜</strong>的精彩行程
                  </p>
                  <p className="text-lg text-[#5a6c7d] text-center">
                    第一天：武陵山莊 → 池有山 → 新達山屋<br />
                    第二天：新達山屋 → 品田山 → 桃山山屋<br />
                    第三天：桃山山屋 → 喀拉業山 → 武陵山莊
                  </p>
                </div>
                <ItineraryTimeline />
              </section>
            </>
          )}
        </div>
      </div>

      {/* 底部導航欄 */}
      <Navigation />
    </div>
  );
}

