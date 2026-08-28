import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-8 w-auto", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        <rect width="100" height="100" rx="22" fill="#0F172A" />

        <path
          d="M20 62C25 45 42 38 58 38C75 38 82 48 84 62"
          stroke="url(#carGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <path
          d="M34 46C38 32 48 26 62 26C72 26 76 34 78 46"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <circle cx="36" cy="64" r="8" fill="#1E293B" stroke="#60A5FA" strokeWidth="4" />
        <circle cx="36" cy="64" r="3" fill="#60A5FA" />

        <circle cx="68" cy="64" r="8" fill="#1E293B" stroke="url(#accentGrad)" strokeWidth="4" />
        <circle cx="68" cy="64" r="3" fill="#10B981" />

        <circle cx="78" cy="30" r="3.5" fill="#10B981" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none text-right">
          <div className="flex items-center gap-0.5">
            <span className="text-lg font-black tracking-tight text-white">Car</span>
            <span className="text-lg font-black tracking-tight text-blue-500">Ops</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1 inline-block"></span>
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            نظام إدارة السيارات
          </span>
        </div>
      )}
    </div>
  );
}
