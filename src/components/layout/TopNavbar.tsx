"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Session } from "next-auth";
import Logo from "@/components/Logo";

export default function TopNavbar({ session, role }: { session: Session | null; role: string }) {
  const userName = session?.user?.name || "مستخدم";

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button (mock) & Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
            <Menu className="w-6 h-6" />
          </button>
          <Logo className="h-6 w-auto" showText={true} />
        </div>
        
        {/* Search Bar - Hidden on small screens */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث (Ctrl+K)..." 
            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-sm font-bold text-slate-700">{userName}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
