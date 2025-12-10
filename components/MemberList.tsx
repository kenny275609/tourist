"use client";

import { useMembers } from "@/hooks/useMembers";
import { User, Shield, Package } from "lucide-react";

export default function MemberList() {
  const { members, loading } = useMembers();

  if (loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="sketch-box p-6 bg-white text-center">
        <p className="text-[#5a6c7d]">目前還沒有成員</p>
      </div>
    );
  }

  return (
    <div className="sketch-box p-6 bg-white">
      <h3 className="text-xl font-bold mb-4 text-[#2c3e50] transform rotate-1">
        👥 團隊成員 ({members.length})
      </h3>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border-2 border-[#ecf0f1] rounded-lg hover:bg-[#f8f9fa] transition-colors"
            style={{
              borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                member.is_admin ? 'bg-[#e74c3c]' : 'bg-[#3498db]'
              }`} style={{
                borderRadius: '50%',
                transform: 'rotate(2deg)',
              }}>
                {member.is_admin ? (
                  <Shield className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#2c3e50] truncate">
                    {member.name || member.email.split('@')[0] || '未知用戶'}
                  </p>
                  {member.is_admin && (
                    <span className="px-2 py-0.5 bg-[#e74c3c] text-white text-xs font-bold rounded" style={{
                      borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                    }}>
                      管理員
                    </span>
                  )}
                </div>
                {member.name && member.email && member.email.includes('@') && (
                  <p className="text-sm text-[#95a5a6] truncate">
                    {member.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-[#5a6c7d]">
                <Package className="w-4 h-4" />
                <span>{member.gear_count || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

