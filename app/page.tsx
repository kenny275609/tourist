"use client";

import { useEffect, useState } from "react";
import ActivityIntro from "@/components/ActivityIntro";
import Navigation from "@/components/Navigation";
import Auth from "@/components/Auth";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { User, CheckCircle, X } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // 檢查 Supabase 是否已配置（只在客戶端檢查）
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      setSupabaseConfigured(false);
    }
  }, []);

  useEffect(() => {
    // 檢查 URL 參數，如果有 confirmed=true，顯示成功訊息
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const confirmed = urlParams.get('confirmed');
      const loginRequired = urlParams.get('login_required');
      const type = urlParams.get('type');
      const token_hash = urlParams.get('token_hash');
      
      console.log('Checking URL params:', { 
        confirmed, 
        loginRequired,
        type,
        hasTokenHash: !!token_hash,
        fullUrl: window.location.href,
        search: window.location.search
      });
      
      // 如果 URL 中有 type=email 或 token_hash，表示這是 Email 確認連結
      // 但沒有經過 callback route，需要重定向到 callback route
      if ((type === 'email' || token_hash) && !confirmed) {
        console.log('Email confirmation link detected, redirecting to callback route');
        const callbackUrl = new URL('/auth/callback', window.location.origin);
        callbackUrl.search = window.location.search;
        window.location.href = callbackUrl.toString();
        return;
      }
      
      if (confirmed === 'true') {
        console.log('Confirmed is true, showing success message');
        setShowSuccessMessage(true);
        // 5 秒後自動隱藏
        const timer = setTimeout(() => {
          console.log('Hiding success message after 5 seconds');
          setShowSuccessMessage(false);
          // 清除 URL 參數
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('confirmed');
          newUrl.searchParams.delete('login_required');
          window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
        }, 5000);
        return () => clearTimeout(timer);
      } else {
        console.log('Confirmed is not true, value:', confirmed, 'type:', typeof confirmed);
      }
    }
  }, []);

  // 備用方案：檢查用戶的 Email 確認狀態
  // 如果用戶剛剛確認了 Email（在最近 30 秒內），顯示通知
  useEffect(() => {
    if (user && user.email_confirmed_at && !showSuccessMessage) {
      const confirmedAt = new Date(user.email_confirmed_at).getTime();
      const now = Date.now();
      const timeSinceConfirmation = now - confirmedAt;
      
      // 如果 Email 在最近 30 秒內確認，顯示通知
      if (timeSinceConfirmation < 30000) {
        console.log('User just confirmed email (within 30 seconds), showing success message');
        setShowSuccessMessage(true);
        const timer = setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, showSuccessMessage]);

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
          <div className="bg-[#f8f9fa] p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold text-[#2c3e50] mb-2">
              請執行以下步驟：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[#5a6c7d]">
              <li>在 Supabase 建立專案</li>
              <li>建立 <code className="bg-white px-2 py-1 rounded">.env.local</code> 檔案</li>
              <li>設定 <code className="bg-white px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> 和 <code className="bg-white px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              <li>執行 SQL 腳本建立數據表</li>
            </ol>
          </div>
          <p className="text-sm text-[#5a6c7d]">
            詳細說明請參考 <code className="bg-[#f8f9fa] px-2 py-1 rounded">SUPABASE_SETUP.md</code>
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
          {user && <UserProfile />}
        </div>
      </div>

      <div className="py-6 px-4">
        <div className="max-w-md mx-auto space-y-8">
          {/* 成功註冊通知 */}
          {showSuccessMessage && (
            <div className="sketch-box p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-[#27ae60] transform rotate-1 relative z-50">
              <button
                onClick={() => {
                  console.log('Closing success message manually');
                  setShowSuccessMessage(false);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="absolute top-2 right-2 text-[#27ae60] hover:text-[#229954] transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-3 pr-6">
                <CheckCircle className="w-6 h-6 text-[#27ae60] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-[#27ae60] mb-1">
                    🎉 恭喜您註冊成功！
                  </h3>
                  <p className="text-sm text-[#2c3e50]">
                    {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login_required') === 'true'
                      ? "您的 Email 已成功確認！請使用您的帳號密碼登入。"
                      : "您的 Email 已成功確認，現在可以開始使用所有功能了！"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 認證區 */}
          {!user ? (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-[#2c3e50] text-center">
                歡迎使用
              </h2>
              <Auth />
            </section>
          ) : (
            <>
              {/* 活動介紹 */}
              <section>
                <ActivityIntro />
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
