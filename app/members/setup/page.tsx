"use client";

import { useEffect, useState } from "react";
import EmergencyInfoSetup from "@/components/EmergencyInfoSetup";
import RoleSelection from "@/components/RoleSelection";
import Navigation from "@/components/Navigation";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";

export default function MembersSetupPage() {
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
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4">
        <div className="sketch-box p-8 bg-white max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-[#e74c3c]">
            ⚠️ Supabase 未配置
          </h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
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
          {user && <UserProfile />}
        </div>
      </div>

      <div className="py-6 px-4">
        <div className="max-w-md mx-auto space-y-8">
          {!user ? (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-[#2c3e50] text-center">
                請先登入
              </h2>
              <Auth />
            </section>
          ) : (
            <>
              <section>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[#2c3e50] text-center transform rotate-1">
                  ⚙️ 設定成員資訊
                </h2>
                
                {/* 填寫緊急資訊 */}
                <div className="mb-8">
                  <EmergencyInfoSetup />
                </div>

                {/* 選擇角色 */}
                <div className="mb-8">
                  <RoleSelection />
                </div>

                {/* 返回查看頁面 */}
                <div className="text-center">
                  <a
                    href="/members"
                    className="washi-tape-button inline-block px-6 py-3 bg-[#3498db] text-white font-semibold hover:bg-[#2980b9] transition-colors"
                  >
                    返回查看頁面
                  </a>
                </div>
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

