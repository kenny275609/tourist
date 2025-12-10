"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

interface CountdownStickyProps {
  targetDate: string; // 格式: "2023-10-10"
}

export default function CountdownSticky({ targetDate }: CountdownStickyProps) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      const target = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      
      const diff = target.getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? days : 0);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // 每小時更新一次

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  return (
    <div className="sticky-note p-4 w-48 sm:w-56 transform rotate-3 relative">
      {/* 膠帶效果 */}
      <div className="absolute -top-2 left-4 w-12 h-3 bg-white/60 border border-gray-300 transform -rotate-6" style={{
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
      }} />
      <div className="absolute -top-2 right-4 w-12 h-3 bg-white/60 border border-gray-300 transform rotate-6" style={{
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
      }} />
      
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#e65100]" />
          <span className="text-sm font-semibold text-[#2c3e50]">
            {formatDate(targetDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#e65100]" />
          <div>
            <span className="text-sm text-[#5a6c7d]">還有 </span>
            <span className="text-2xl font-bold text-[#e65100]">{daysLeft}</span>
            <span className="text-sm text-[#5a6c7d]"> 天出發！</span>
          </div>
        </div>
      </div>
    </div>
  );
}

