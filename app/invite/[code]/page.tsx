"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/components/Auth";
import { useTripSettings } from "@/hooks/useTripSettings";
import { CheckCircle, XCircle } from "lucide-react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useTripSettings();
  const [inviteCode, setInviteCode] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (params.code) {
      const code = Array.isArray(params.code) ? params.code[0] : params.code;
      setInviteCode(code.toUpperCase());
    }
  }, [params]);

  useEffect(() => {
    if (!settingsLoading && settings.invite_code && inviteCode) {
      setIsValid(settings.invite_code.toUpperCase() === inviteCode.toUpperCase());
    }
  }, [settings, inviteCode, settingsLoading]);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="text-center text-[#5a6c7d]">
          <p className="text-xl">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果已經登入且邀請碼有效，顯示成功訊息
  if (user && isValid) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4">
        <div className="sketch-box p-8 bg-white max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-[#27ae60] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-[#2c3e50]">
            歡迎加入！
          </h2>
          <p className="text-lg text-[#5a6c7d] mb-6">
            您已成功加入武陵四秀3日遊團隊
          </p>
          <button
            onClick={() => router.push("/")}
            className="washi-tape-button px-6 py-3 bg-[#3498db] text-white hover:bg-[#2980b9] transition-colors font-semibold"
          >
            開始使用
          </button>
        </div>
      </div>
    );
  }

  // 如果邀請碼無效
  if (isValid === false) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4">
        <div className="sketch-box p-8 bg-white max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-[#e74c3c] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-[#2c3e50]">
            邀請碼無效
          </h2>
          <p className="text-lg text-[#5a6c7d] mb-6">
            此邀請碼不存在或已過期
          </p>
          <button
            onClick={() => router.push("/")}
            className="washi-tape-button px-6 py-3 bg-[#95a5a6] text-white hover:bg-[#7f8c8d] transition-colors font-semibold"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 如果未登入，顯示登入/註冊介面
  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4">
      <div className="sketch-box p-8 bg-white max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-[#2c3e50]">
            加入武陵四秀3日遊
          </h2>
          <p className="text-sm text-[#5a6c7d]">
            邀請碼：<code className="px-2 py-1 bg-[#ecf0f1] rounded font-mono font-bold">#{inviteCode}</code>
          </p>
        </div>
        <Auth />
      </div>
    </div>
  );
}

