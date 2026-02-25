import React from 'react';

export default function Logo({ size = 40, color = "white" }) {
  // Color logic
  const fill = color === "white" ? "#ffffff" : "var(--primary-color)";
  const text = color === "white" ? "#ffffff" : "#1e293b";

  return (
    <div className="flex items-center gap-2 select-none">
      {/* 🎨 ICON MARK */}
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" rx="20" fill={fill} fillOpacity="0.15" />
        <path d="M50 20L20 45V80H40V60H60V80H80V45L50 20Z" fill={fill} />
        <path d="M42 45L50 38L58 45" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {/* ✍️ TEXT MARK */}
      <div className="flex flex-col justify-center">
        <h1 style={{ fontSize: size * 0.5, color: text }} className="font-heading font-extrabold leading-none tracking-tight">
          ApnaHunar
        </h1>
        <span style={{ fontSize: size * 0.2, color: text }} className="opacity-60 font-medium tracking-widest uppercase">
          Services
        </span>
      </div>
    </div>
  );
}
