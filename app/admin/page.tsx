"use client";

import { useEffect, useState } from "react";
import AdminGearTemplateManager from "@/components/AdminGearTemplateManager";
import TripSettingsManager from "@/components/TripSettingsManager";
import MemberList from "@/components/MemberList";
import Navigation from "@/components/Navigation";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import Auth from "@/components/Auth";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
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

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-[#fef9e7] flex items-center justify-center">
        <div className="text-center text-[#5a6c7d]">
          <p className="text-xl">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fef9e7]">
        <Navigation />
        <div className="py-8 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <section>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[#2c3e50] text-center">
                請先登入
              </h2>
              <Auth />
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#fef9e7]">
        <Navigation />
        <div className="py-8 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-md border-2 border-[#ecf0f1] text-center">
              <h2 className="text-2xl font-bold mb-4 text-[#e74c3c]">
                ⚠️ 無權限存取
              </h2>
              <p className="text-lg text-[#34495e]">
                您沒有管理者權限。如需管理者權限，請聯繫系統管理員。
              </p>
            </div>
          </div>
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
          <UserProfile />
        </div>
      </div>

      <div className="py-6 px-4">
        <div className="max-w-md mx-auto space-y-8">
          {/* 團隊成員列表 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[#2c3e50] text-center">
              團隊成員
            </h2>
            <MemberList />
          </section>

          {/* 行程設定 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[#2c3e50] text-center">
              行程設定
            </h2>
            <TripSettingsManager />
          </section>

          {/* 預設裝備模板管理 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[#2c3e50] text-center">
              預設裝備模板管理
            </h2>
            <AdminGearTemplateManager />
          </section>
        </div>
      </div>

      {/* 底部導航欄 */}
      <Navigation />
    </div>
  );
}

