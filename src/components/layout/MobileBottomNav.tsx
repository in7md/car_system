"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Receipt, PlusCircle, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileBottomNav({ role }: { role: string }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      window.location.href = "/auth/signin";
    }
  };

  // Employee bottom nav
  if (role === "EMPLOYEE") {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-2">
        <Link href="/employee" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname === '/employee' ? 'text-indigo-600' : 'text-slate-500'}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </Link>
        
        <Link href="/expenses/new" className="relative -top-5 flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white border-4 border-slate-50">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-indigo-700 mt-1">مصروف</span>
        </Link>
        
        <Link href="/settings/general" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname.startsWith('/settings') ? 'text-indigo-600' : 'text-slate-500'}`}>
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold">حسابي</span>
        </Link>

        <button onClick={handleLogout} className="flex flex-col items-center justify-center w-16 h-full gap-1 text-rose-500 hover:text-rose-600">
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>
    );
  }

  // Owner/Manager bottom nav
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-2">
      <Link href="/dashboard" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-500'}`}>
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-bold">الرئيسية</span>
      </Link>
      
      <Link href="/vehicles" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname.startsWith('/vehicles') ? 'text-indigo-600' : 'text-slate-500'}`}>
        <Car className="w-5 h-5" />
        <span className="text-[10px] font-bold">السيارات</span>
      </Link>
      
      <Link href="/expenses" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname.startsWith('/expenses') ? 'text-indigo-600' : 'text-slate-500'}`}>
        <Receipt className="w-5 h-5" />
        <span className="text-[10px] font-bold">المصروفات</span>
      </Link>

      <button onClick={handleLogout} className="flex flex-col items-center justify-center w-16 h-full gap-1 text-rose-500 hover:text-rose-600">
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-bold">خروج</span>
      </button>
    </div>
  );
}
