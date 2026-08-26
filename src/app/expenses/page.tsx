"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Receipt, ChevronLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function ExpensesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        // Note: The API doesn't support search yet, but keeping the pattern for future parity
        const res = await fetch(`/api/expenses`);
        if (!res.ok) {
          if (res.status === 403) throw new Error("لا تملك الصلاحية للوصول إلى هذه الصفحة.");
          throw new Error("فشل في جلب البيانات");
        }
        const json = await res.json();
        setExpenses(json.data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

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

  const filteredExpenses = expenses.filter(e => 
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.name.toLowerCase().includes(search.toLowerCase()) ||
    e.vehicle?.vehicleCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إدارة المصروفات</h1>
          <p className="text-slate-500 text-sm mt-1">تتبع وإدارة جميع المصروفات التشغيلية ومصروفات السيارات</p>
        </div>
        <Link 
          href="/expenses/new"
          className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-110" /> تسجيل مصروف جديد
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
            placeholder="ابحث في البيان، الفئة، أو كود السيارة..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 block pr-10 p-2.5 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">لا توجد مصروفات</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">لم يتم العثور على أي مصروفات تطابق معايير البحث.</p>
          <Link href="/expenses/new" className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
            أضف أول مصروف
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">التاريخ</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">البيان</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">الفئة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">المبلغ</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">السيارة المرتبطة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider">الحالة</th>
                  <th scope="col" className="px-6 py-4 font-bold tracking-wider text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredExpenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                      {e.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                        {e.category?.name || "غير محدد"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      {e.amount.toLocaleString()} <span className="text-xs text-rose-400">BHD</span>
                    </td>
                    <td className="px-6 py-4">
                      {e.vehicle ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-500">#{e.vehicle.vehicleCode}</span>
                          <span className="font-semibold text-slate-900">{e.vehicle.make} {e.vehicle.model}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs bg-slate-50 px-2 py-1 rounded">مصروف عام</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {e.status === 'PAID' 
                        ? <Badge variant="success">مدفوع</Badge> 
                        : e.status === 'PENDING' 
                        ? <Badge variant="warning">قيد الانتظار</Badge>
                        : <Badge variant="danger">مرفوض</Badge>
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/expenses/${e.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
