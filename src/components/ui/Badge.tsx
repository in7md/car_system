import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  pulse?: boolean;
}

export function Badge({ children, variant = "neutral", pulse = false }: BadgeProps) {
  const baseStyles = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors";
  
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-indigo-50 text-indigo-700 border-indigo-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dots = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-indigo-500",
    neutral: "bg-slate-500",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]}`}>
      {pulse && (
        <span className="relative flex h-2 w-2 mr-2 ml-1">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dots[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dots[variant]}`}></span>
        </span>
      )}
      {children}
    </span>
  );
}
