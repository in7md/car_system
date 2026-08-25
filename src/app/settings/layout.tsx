"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "الإعدادات العامة", href: "/settings/general" },
    { name: "إدارة المستخدمين", href: "/settings/users" },
    { name: "سجل العمليات والرقابة", href: "/settings/audit-logs" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8" dir="rtl">
      
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-4 py-3 rounded-md font-semibold transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white p-6 shadow-md rounded-lg border border-gray-200">
        {children}
      </div>

    </div>
  );
}
