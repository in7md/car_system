"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExpensesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/expenses`);
        if (!res.ok) {
          if (res.status === 403) throw new Error("Forbidden: You don't have permission.");
          throw new Error("Failed to fetch expenses");
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

  if (error) return <div className="p-8 text-red-600 bg-red-50" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المصروفات</h1>
        <Link href="/expenses/new" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2">
          <span className="text-xl">+</span> إضافة مصروف جديد
        </Link>
      </div>

      {loading ? <div className="text-gray-500 py-8">جاري التحميل...</div> : expenses.length === 0 ? (
        <div className="text-gray-500 py-8">لا يوجد مصروفات مسجلة.</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البيان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السيارة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حالة الدفع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {expenses.map((e: any) => (
                <tr key={e.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{e.description || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{e.category?.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{e.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {e.vehicle ? `${e.vehicle.make} ${e.vehicle.model} (${e.vehicle.vehicleCode})` : <span className="text-gray-400 italic">مصروف عام</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      e.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600">
                    <Link href={`/expenses/${e.id}`}>التفاصيل</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
