"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PlusCircle, Wrench, FileText, ChevronLeft, CarFront } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const json = await res.json();
          setVehicles(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE": return <Badge variant="success" pulse>متاح</Badge>;
      case "UNDER_MAINTENANCE": return <Badge variant="warning">صيانة</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 p-4 md:p-8" dir="rtl">
      
      {/* Mobile Welcome Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-semibold mb-1">أهلاً بك مجدداً</p>
          <h1 className="text-2xl font-black mb-6">
            {session?.user?.name || "الموظف"}
          </h1>
          
          {/* Main Action Button - Massive for Touch */}
          <Link 
            href="/expenses/new" 
            className="w-full bg-white text-indigo-700 hover:bg-slate-50 text-lg font-black py-4 px-6 rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            تسجيل مصروف / صيانة جديد
          </Link>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/vehicles" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 active:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <CarFront className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-700 text-sm">تصفح السيارات</span>
        </Link>
        <Link href="/expenses" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 active:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-700 text-sm">سجل المصروفات</span>
        </Link>
      </div>
      
      {/* Mobile-Friendly Vehicle List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-black text-slate-900">المركبات المتاحة</h2>
          <span className="text-xs font-bold text-slate-500">{vehicles.length} سيارة</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white p-5 rounded-2xl border border-slate-100 h-24"></div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center">
            <CarFront className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-600">لا توجد سيارات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {vehicles.map((v: any) => (
              <div key={v.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-700">
                    {v.vehicleCode}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{v.make} {v.model}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(v.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link 
                    href={`/expenses/new?vehicleId=${v.id}`}
                    className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center active:bg-indigo-100"
                  >
                    <Wrench className="w-5 h-5" />
                  </Link>
                  <Link 
                    href={`/vehicles/${v.id}`}
                    className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center active:bg-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
