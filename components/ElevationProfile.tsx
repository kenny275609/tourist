"use client";

import { Flag } from "lucide-react";
import { useTripSettings } from "@/hooks/useTripSettings";

export default function ElevationProfile() {
  const { settings, loading } = useTripSettings();
  const customImageUrl = settings.elevation_profile_image;

  // 如果有自訂圖片，顯示圖片；否則顯示 SVG
  if (!loading && customImageUrl && customImageUrl.trim() !== '') {
    return (
      <div className="sketch-box p-4 bg-white">
        <div className="relative">
          <img
            src={customImageUrl}
            alt="海拔剖面圖"
            className="w-full h-auto rounded-lg"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onError={(e) => {
              // 如果圖片載入失敗，隱藏圖片容器，讓 SVG 顯示
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="mt-4 text-center text-sm text-[#5a6c7d] transform rotate-1">
          <p className="font-bold text-[#2c3e50]">
            總爬升 <span className="text-[#e74c3c] text-lg">1544m</span>
          </p>
        </div>
      </div>
    );
  }
  // 海拔數據點（簡化版，實際可以更詳細）
  const points = [
    { label: "武陵山莊", elevation: 1980, x: 0 },
    { label: "池有山", elevation: 3303, x: 25 },
    { label: "新達山屋", elevation: 3100, x: 35 },
    { label: "品田山", elevation: 3524, x: 50 }, // 最高點
    { label: "桃山山屋", elevation: 3200, x: 65 },
    { label: "桃山", elevation: 3325, x: 70 },
    { label: "喀拉業山", elevation: 3133, x: 85 },
    { label: "武陵山莊", elevation: 1980, x: 100 },
  ];

  const maxElevation = 3524;
  const minElevation = 1980;
  const elevationRange = maxElevation - minElevation;
  const svgHeight = 180;
  const svgWidth = 100;

  // 計算 SVG 路徑
  const pathData = points
    .map((point, index) => {
      const x = (point.x / 100) * svgWidth;
      const y = svgHeight - ((point.elevation - minElevation) / elevationRange) * (svgHeight - 40) - 20;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="sketch-box p-4 bg-white">
      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '300px' }}
        >
          {/* 天空背景（藍色漸層） */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E0F6FF" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B7355" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6B8E23" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#556B2F" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* 天空背景 */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#skyGradient)" />

          {/* 山脈填充（綠色/棕色） */}
          <path
            d={`${pathData} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
            fill="url(#mountainGradient)"
            opacity="0.9"
          />

          {/* 山脈輪廓線（手繪風格，粗線條，棕色） */}
          <path
            d={pathData}
            fill="none"
            stroke="#654321"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
            }}
          />
          
          {/* 山脈細節線（綠色） */}
          <path
            d={pathData}
            fill="none"
            stroke="#6B8E23"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* 標記點和標籤 */}
          {points.map((point, index) => {
            const x = (point.x / 100) * svgWidth;
            const y = svgHeight - ((point.elevation - minElevation) / elevationRange) * (svgHeight - 40) - 20;
            const isPeak = point.elevation === maxElevation;

            return (
              <g key={index}>
                {/* 點 */}
                <circle
                  cx={x}
                  cy={y}
                  r={isPeak ? "4" : "3"}
                  fill={isPeak ? "#e74c3c" : "#3498db"}
                  stroke="white"
                  strokeWidth="1"
                />
                {/* 房屋圖標（起點和終點） */}
                {(index === 0 || index === points.length - 1) && (
                  <g transform={`translate(${x - 4}, ${y - 4})`}>
                    <path
                      d="M 4 8 L 0 4 L 4 0 L 8 4 Z"
                      fill="#8B4513"
                      stroke="#654321"
                      strokeWidth="1"
                    />
                    <rect x="2" y="4" width="4" height="4" fill="#FFD700" stroke="#654321" strokeWidth="0.5" />
                  </g>
                )}
                
                {/* 旗幟（最高點 - 品田山） */}
                {isPeak && (
                  <g transform={`translate(${x}, ${y - 20})`}>
                    <rect x="-2" y="0" width="4" height="12" fill="#e74c3c" stroke="#c0392b" strokeWidth="1" />
                    <polygon points="-2,0 2,0 0,-4" fill="#e74c3c" stroke="#c0392b" strokeWidth="1" />
                    <text
                      x="0"
                      y="18"
                      textAnchor="middle"
                      className="text-[10px] fill-[#2c3e50] font-bold"
                      style={{ fontFamily: 'var(--font-handwritten)' }}
                    >
                      品田山!
                    </text>
                  </g>
                )}
                
                {/* 標籤 */}
                {(index === 0 || index === points.length - 1 || isPeak) && (
                  <text
                    x={x}
                    y={isPeak ? y - 35 : y + 20}
                    textAnchor="middle"
                    className="text-xs fill-[#2c3e50] font-semibold"
                    style={{ fontFamily: 'var(--font-handwritten)' }}
                  >
                    {index === 0 || index === points.length - 1 ? point.label : ''}
                    <tspan x={x} dy="12" className="text-[10px] fill-[#5a6c7d]">
                      {point.elevation}m
                    </tspan>
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 text-center text-sm text-[#5a6c7d] transform rotate-1">
        <p className="font-bold text-[#2c3e50]">
          總爬升 <span className="text-[#e74c3c] text-lg">1544m</span>
        </p>
      </div>
    </div>
  );
}

