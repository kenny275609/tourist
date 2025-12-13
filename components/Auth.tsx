"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, LogIn, Mail, Lock, UserPlus } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // 將錯誤訊息轉換為友善的中文說明
  const translateError = (errorMessage: string, isSignUp: boolean): string => {
    const lowerMessage = errorMessage.toLowerCase();

    // 註冊相關錯誤
    if (isSignUp) {
      if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("email_not_confirmed")) {
        return "註冊成功！請檢查您的 Email 收件匣，點擊確認連結後即可登入。";
      }
      if (lowerMessage.includes("user already registered") || lowerMessage.includes("already registered")) {
        return "此 Email 已經註冊過了，請直接登入。";
      }
      if (lowerMessage.includes("password") && lowerMessage.includes("weak")) {
        return "密碼強度不足，請使用更複雜的密碼。";
      }
      if (lowerMessage.includes("invalid email")) {
        return "Email 格式不正確，請檢查後再試。";
      }
    }

    // 登入相關錯誤
    if (!isSignUp) {
      if (lowerMessage.includes("invalid login credentials") || lowerMessage.includes("invalid credentials")) {
        return "Email 或密碼錯誤，請檢查後再試。";
      }
      if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("email_not_confirmed")) {
        return "請先確認您的 Email。請檢查收件匣中的確認郵件，點擊連結後即可登入。";
      }
      if (lowerMessage.includes("too many requests")) {
        return "登入嘗試次數過多，請稍後再試。";
      }
    }

    // 通用錯誤
    if (lowerMessage.includes("database error")) {
      return "資料庫錯誤，請稍後再試或聯繫管理員。";
    }
    if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
      return "網路連線問題，請檢查網路後再試。";
    }
    if (lowerMessage.includes("timeout")) {
      return "連線逾時，請稍後再試。";
    }

    // 如果沒有匹配的錯誤，返回原始訊息（但如果是英文，嘗試翻譯常見詞彙）
    return errorMessage;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(translateError(error.message, false));
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (signUpError) {
      // 檢查是否是 "Database error" 相關的錯誤
      if (signUpError.message.toLowerCase().includes("database error")) {
        // 可能是觸發器問題，但用戶可能已經創建成功
        // 嘗試繼續流程，並手動創建 user_profiles
        console.warn("Database error during signup, but user might be created:", signUpError);
        
        // 如果用戶已創建，嘗試手動創建 user_profiles
        if (data?.user) {
          try {
            await supabase.from("user_profiles").upsert({
              user_id: data.user.id,
              display_name: name || null,
            }, {
              onConflict: 'user_id'
            });
          } catch (profileError) {
            console.error("Error creating user profile:", profileError);
          }
        }
        
        // 顯示友善的錯誤訊息
        setError("註冊過程中發生資料庫錯誤，但帳號可能已創建。請嘗試登入，或聯繫管理員。");
      } else {
        setError(translateError(signUpError.message, true));
      }
    } else if (data.user) {
      // 註冊成功後，手動創建 user_profiles 記錄
      try {
        await supabase.from("user_profiles").upsert({
          user_id: data.user.id,
          display_name: name || null,
        }, {
          onConflict: 'user_id'
        });
      } catch (profileError) {
        // 如果創建 user_profiles 失敗，記錄錯誤但不阻止註冊流程
        console.error("Error creating user profile:", profileError);
      }
      
      // 註冊成功後自動登入
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // 如果是 Email 未確認的錯誤，顯示友善訊息
        if (signInError.message.toLowerCase().includes("email not confirmed") || 
            signInError.message.toLowerCase().includes("email_not_confirmed")) {
          setError("註冊成功！請檢查您的 Email 收件匣，點擊確認連結後即可登入。");
        } else {
          setError(translateError(signInError.message, false));
        }
      } else {
        // 登入成功，清除錯誤訊息
        setError(null);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="sketch-box p-6 bg-white">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">
            {isSignUp ? "註冊帳號" : "登入帳號"}
          </h3>
          <p className="text-sm text-[#5a6c7d]">
            {isSignUp
              ? "建立新帳號以開始規劃您的行程"
              : "登入以查看和編輯您的行程"}
          </p>
        </div>

        <form
          onSubmit={isSignUp ? handleSignUp : handleSignIn}
          className="space-y-4"
        >
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-[#34495e] mb-2">
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#95a5a6]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="輸入您的姓名"
                  className="w-full pl-10 pr-4 py-2 border-2 border-[#ecf0f1] rounded-lg focus:outline-none focus:border-[#3498db]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#34495e] mb-2">
              電子郵件
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#95a5a6]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2 border-2 border-[#ecf0f1] rounded-lg focus:outline-none focus:border-[#3498db]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#34495e] mb-2">
              密碼
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#95a5a6]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 個字元"
                className="w-full pl-10 pr-4 py-2 border-2 border-[#ecf0f1] rounded-lg focus:outline-none focus:border-[#3498db]"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#fee] border-2 border-[#e74c3c] rounded-lg text-sm text-[#e74c3c]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="washi-tape-button w-full py-3 bg-[#3498db] text-white font-semibold hover:bg-[#2980b9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              "處理中..."
            ) : isSignUp ? (
              <>
                <UserPlus className="w-5 h-5" />
                註冊
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                登入
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-sm text-[#3498db] hover:underline"
          >
            {isSignUp
              ? "已有帳號？點此登入"
              : "還沒有帳號？點此註冊"}
          </button>
        </div>
      </div>
    </div>
  );
}

