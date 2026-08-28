"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Receipt, CreditCard, PieChart, Users, Settings, LogOut, CheckSquare, Sparkles, FileText } from "lucide-react";
import { signOut } from "next-auth/react";
import Logo from "@/components/Logo";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "السيارات", href: "/vehicles", icon: Car, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المصروفات", href: "/expenses", icon: Receipt, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المساعد الذكي", href: "/ai-assistant", icon: Sparkles, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "التقارير", href: "/reports", icon: FileText, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "موافقات معلقة", href: "/expenses/pending", icon: CheckSquare, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المشتريات", href: "/purchases", icon: CreditCard, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المبيعات", href: "/sales", icon: PieChart, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "الموردين", href: "/sellers", icon: Users, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "العملاء", href: "/customers", icon: Users, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "الإعدادات", href: "/settings/general", icon: Settings, roles: ["OWNER", "MANAGER"] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      window.location.href = "/auth/signin";
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#0F172A] text-slate-300 border-l border-slate-800 shadow-2xl transition-all duration-300 z-20">
      <div className="h-16 flex items-center justify-center border-b border-slate-800/60 px-6">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">القائمة الرئيسية</div>
        
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-semibold"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-r-md"></div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
