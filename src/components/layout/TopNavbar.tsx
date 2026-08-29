"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, X, LogOut, LayoutDashboard, Car, Receipt, CreditCard, PieChart, Users, Settings, CheckSquare, Sparkles, FileText, ChevronDown } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Logo from "@/components/Logo";

export default function TopNavbar({ session, role }: { session: Session | null; role: string }) {
  const userName = session?.user?.name || "مستخدم";
  const userEmail = session?.user?.email || "";
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      window.location.href = "/auth/signin";
    }
  };

  const allNavItems = [
    { name: "الرئيسية", href: role === "EMPLOYEE" ? "/employee" : "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER", "ACCOUNTANT", "EMPLOYEE"] },
    { name: "السيارات", href: "/vehicles", icon: Car, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "إضافة مصروف", href: "/expenses/new", icon: Receipt, roles: ["EMPLOYEE"] },
    { name: "المصروفات", href: "/expenses", icon: Receipt, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المساعد الذكي", href: "/ai-assistant", icon: Sparkles, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "التقارير", href: "/reports", icon: FileText, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "موافقات معلقة", href: "/expenses/pending", icon: CheckSquare, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المشتريات", href: "/purchases", icon: CreditCard, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "المبيعات", href: "/sales", icon: PieChart, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "الموردين", href: "/sellers", icon: Users, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "العملاء", href: "/customers", icon: Users, roles: ["OWNER", "MANAGER", "ACCOUNTANT"] },
    { name: "الإعدادات", href: "/settings/general", icon: Settings, roles: ["OWNER", "MANAGER", "EMPLOYEE"] },
  ];

  const mobileNavItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          {/* Mobile menu button & Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo className="h-10 w-auto min-w-[100px]" showText={true} />
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

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-sm font-bold text-slate-700">{userName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 origin-top-left animate-in fade-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                    {role}
                  </div>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-72 max-w-[80%] bg-[#0F172A] h-full shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <Logo className="h-10 w-auto min-w-[100px]" showText={true} />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">القائمة الرئيسية</div>
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/employee" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm group ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-300"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-[#0B1121]">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 rounded-xl transition-colors font-bold text-sm border border-rose-500/20"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
