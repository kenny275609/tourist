"use client";

import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface TeamInviteTicketProps {
  inviteCode?: string;
}

export default function TeamInviteTicket({ inviteCode = "WL4SHOW" }: TeamInviteTicketProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const getInviteLink = () => {
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin;
      return `${baseUrl}/invite/${inviteCode}`;
    }
    return `#${inviteCode}`;
  };

  // 獲取使用者名字
  const getUserName = () => {
    if (!user) return "朋友";
    return user.user_metadata?.name || user.email?.split("@")[0] || "朋友";
  };

  const handleCopyLink = async () => {
    const link = getInviteLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShare = async () => {
    const link = getInviteLink();
    const userName = getUserName();
    const text = `${userName} 邀請你加入武陵四秀3日遊！\n${link}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "武陵四秀3日遊 - 邀請",
          text: text,
          url: link,
        });
      } catch (error) {
        // 用戶取消分享
        console.log("Share cancelled");
      }
    } else {
      // 降級到複製鏈接
      handleCopyLink();
    }
  };

  if (!user) {
    return null;
  }

  const userName = getUserName();

  return (
    <div className="sketch-box p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-[#3498db] transform -rotate-1">
      <div className="space-y-3">
        {/* 歡迎訊息 */}
        <div className="text-center">
          <p className="text-lg font-bold text-[#2c3e50] mb-1">
            歡迎，<span className="text-[#3498db]">{userName}</span>！
          </p>
          <p className="text-sm text-[#5a6c7d]">
            邀請你的朋友一起加入武陵四秀3日遊
          </p>
        </div>

        {/* 邀請鏈接 */}
        <div className="pt-2 border-t border-dashed border-[#bdc3c7]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#5a6c7d]">邀請鏈接：</span>
            <code className="px-2 py-1 bg-white border border-[#bdc3c7] text-xs text-[#2c3e50] font-mono flex-1 min-w-0 truncate">
              {getInviteLink()}
            </code>
            <button
              onClick={handleCopyLink}
              className="washi-tape-button px-3 py-1 flex items-center gap-1 text-xs font-semibold text-[#2c3e50] bg-white border border-[#bdc3c7] hover:bg-[#ecf0f1]"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>複製</span>
                </>
              )}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={handleShare}
                className="washi-tape-button px-3 py-1 flex items-center gap-1 text-xs font-semibold text-[#2c3e50] bg-white border border-[#bdc3c7] hover:bg-[#ecf0f1]"
              >
                <Share2 className="w-3 h-3" />
                <span>分享</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

