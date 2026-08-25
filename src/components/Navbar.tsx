"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = ((session.user as any)?.role || "").toUpperCase();
  const userName = session.user?.name || "مستخدم";

  return (
    <nav className="bg-slate-900 text-slate-100 shadow-md p-4 flex justify-between items-center" dir="rtl">
      <div className="flex gap-6 items-center">
        <Link href="/" className="font-bold text-xl text-white">Car System</Link>
        <div className="flex gap-4">
          {(role === "OWNER" || role === "MANAGER" || role === "ACCOUNTANT") && (
            <>
              <Link href="/dashboard" className="hover:text-blue-400 transition-colors">الرئيسية</Link>
              <Link href="/vehicles" className="hover:text-blue-400 transition-colors">السيارات</Link>
              <Link href="/expenses" className="hover:text-blue-400 transition-colors">المصروفات</Link>
              <Link href="/purchases" className="hover:text-blue-400 transition-colors">المشتريات</Link>
              <Link href="/sales" className="hover:text-blue-400 transition-colors">المبيعات</Link>
              <Link href="/sellers" className="hover:text-blue-400 transition-colors">الموردين</Link>
              <Link href="/expenses/pending" className="hover:text-blue-400 transition-colors">الموافقات المعلقة</Link>
              <Link href="/settings/general" className="hover:text-blue-400 transition-colors">الإعدادات</Link>
            </>
          )}
          {role === "EMPLOYEE" && (
            <>
              <Link href="/employee" className="hover:text-blue-400 transition-colors">الرئيسية</Link>
              <Link href="/expenses/new" className="hover:text-blue-400 transition-colors">تسجيل مصروف جديد</Link>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="font-semibold text-white">{userName}</span>
          <span className="text-slate-400 mx-2">|</span>
          <span className="text-slate-300 text-xs bg-slate-800 px-2 py-1 rounded">{role}</span>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </nav>
  );
}
