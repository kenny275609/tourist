"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut, User, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = useAdmin();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.name) {
        setUserName(session.user.user_metadata.name);
      } else if (session?.user?.email) {
        setUserName(session.user.email.split("@")[0]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    // 確認對話框
    const confirmed = window.confirm(
      "⚠️ 確定要刪除帳號嗎？\n\n此操作無法復原，將刪除：\n- 您的所有個人數據\n- 您的裝備清單\n- 您的帳號資訊\n\n確定要繼續嗎？"
    );

    if (!confirmed) {
      return;
    }

    // 二次確認
    const doubleConfirmed = window.confirm(
      "最後確認：您真的要刪除帳號嗎？\n\n此操作無法復原！"
    );

    if (!doubleConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      // 調用刪除帳號的 RPC 函數
      const { error } = await supabase.rpc("delete_my_account");

      if (error) {
        console.error("Error deleting account:", error);
        alert(`刪除帳號失敗：${error.message || "請稍後再試"}`);
        setIsDeleting(false);
        return;
      }

      // 刪除成功，登出並重新導向
      alert("✅ 帳號已成功刪除！");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(`刪除帳號失敗：${error?.message || "請稍後再試"}`);
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-[#3498db] flex items-center justify-center" style={{
        borderRadius: '50%',
        transform: 'rotate(2deg)',
      }}>
        <User className="w-5 h-5 text-white" />
      </div>
      {/* 只有管理員才顯示刪除帳號按鈕 */}
      {isAdmin && (
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="px-3 py-1 bg-white text-[#e74c3c] hover:bg-[#fee] transition-colors flex items-center gap-1 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: '2px dashed #e74c3c',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
            transform: 'rotate(1deg)',
          }}
          title="刪除帳號（僅管理員）"
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">{isDeleting ? "刪除中..." : "刪除帳號"}</span>
        </button>
      )}
      <button
        onClick={handleSignOut}
        className="px-3 py-1 bg-white text-[#2c3e50] hover:bg-[#f5f5f5] transition-colors flex items-center gap-1 text-xs font-semibold"
        style={{
          border: '2px dashed #e74c3c',
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          transform: 'rotate(-1deg)',
        }}
      >
        <LogOut className="w-3 h-3" />
        <span className="hidden sm:inline">登出</span>
      </button>
    </div>
  );
}

