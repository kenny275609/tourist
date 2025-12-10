"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
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

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-[#3498db] flex items-center justify-center" style={{
        borderRadius: '50%',
        transform: 'rotate(2deg)',
      }}>
        <User className="w-5 h-5 text-white" />
      </div>
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

