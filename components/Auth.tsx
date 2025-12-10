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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
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
      setError(signUpError.message);
    } else if (data.user) {
      // 註冊成功後自動登入
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
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

