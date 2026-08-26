"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VehicleStatus } from "@prisma/client";
import { Plus, Search, CarFront, AlertCircle, FileText, ChevronLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Vehicle {
  id: string;
  vehicleCode: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles?search=${encodeURIComponent(search)}`);
        if (!res.ok) {
          if (res.status === 403) throw new Error("لا تملك الصلاحية للوصول إلى هذه الصفحة.");
          throw new Error("فشل في جلب البيانات");
        }
        const json = await res.json();
        setVehicles(json.data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto mt-10">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-12 h-12 mb-4 text-rose-500" />
          <h2 className="text-xl font-bold">{error}</h2>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE": return <Badge variant="success" pulse>متاح</Badge>;
      case "UNDER_MAINTENANCE": return <Badge variant="warning">صيانة</Badge>;
      case "SOLD": return <Badge variant="neutral">مباع</Badge>;
      case "READY_FOR_SALE": return <Badge variant="info" pulse>جاهز للبيع</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إدارة السيارات (المخزون)</h1>
          <p className="text-slate-500 text-sm mt-1">تتبع وإدارة أسطول السيارات وحالتها الحالية</p>
        </div>
        <Link 
          href="/vehicles/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-110" /> إضافة سيارة
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="ابحث برقم اللوحة، الماركة، أو الموديل..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block pr-10 p-2.5 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="hidden md:flex gap-2 text-sm text-slate-500 font-bold">
          العدد الإجمالي: <span className="text-indigo-600">{vehicles.length}</span>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
          <div className="animate-pulse flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-b border-slate-100 bg-slate-50/50"></div>
            ))}
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <CarFront className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">لا توجد سيارات</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">لم يتم العثور على أي سيارات تطابق معايير البحث الخاصة بك، أو أن المخزون فارغ.</p>
          <Link href="/vehicles/new" className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
            أضف سيارتك الأولى
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">كود السيارة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">الماركة والموديل</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">رقم اللوحة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">السنة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">الحالة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">
                      #{vehicle.vehicleCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{vehicle.make}</div>
                      <div className="text-xs text-slate-500">{vehicle.model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold tracking-widest text-xs">
                        {vehicle.plateNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/vehicles/${vehicle.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
