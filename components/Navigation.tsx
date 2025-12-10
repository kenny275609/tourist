"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Package, Settings, FolderOpen } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

export default function Navigation() {
  const pathname = usePathname();
  const { isAdmin } = useAdmin();

  const navItems = [
    { href: "/", label: "介紹", icon: FolderOpen },
    { href: "/itinerary", label: "行程", icon: Calendar },
    { href: "/gear", label: "裝備", icon: Package },
    ...(isAdmin ? [{ href: "/admin", label: "設定", icon: Settings }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-[#2c3e50] z-50" style={{
      borderImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #2c3e50 10px, #2c3e50 12px) 1',
      boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all ${
                  isActive
                    ? "text-[#3498db]"
                    : "text-[#5a6c7d]"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-semibold">{item.label}</span>
                {isActive && (
                  <div className="w-8 h-1 bg-[#3498db] rounded-full transform rotate-1" style={{
                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

