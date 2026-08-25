"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SalesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`/api/sales`);
        if (!res.ok) throw new Error("Failed to fetch sales");
        const json = await res.json();
        setSales(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (error) return <div className="p-8 text-red-600 bg-red-50" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">سجل المبيعات (المقاصة)</h1>
        <Link href="/sales/new" className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700">
          + إنشاء فاتورة بيع جديدة
        </Link>
      </div>

      {loading ? <div className="text-gray-500 py-8">جاري التحميل...</div> : sales.length === 0 ? (
        <div className="text-gray-500 py-8">لا يوجد مبيعات مسجلة.</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السيارة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ البيع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قيمة البيع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدفوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتبقي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sales.map((s: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalPaid = s.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
                const remaining = s.salePrice - totalPaid;
                
                return (
                  <tr key={s.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.vehicle?.make} {s.vehicle?.model} <span className="text-gray-400 text-xs block">{s.vehicle?.vehicleCode}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.customer?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.saleDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">{s.salePrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{totalPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">{remaining.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      <Link href={`/sales/${s.id}`}>التفاصيل والدفع</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
