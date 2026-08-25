"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PurchasesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/purchases`);
        if (!res.ok) {
          if (res.status === 403) throw new Error("Forbidden: You don't have permission.");
          throw new Error("Failed to fetch purchases");
        }
        const json = await res.json();
        setPurchases(json.data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  if (error) return <div className="p-8 text-red-600 bg-red-50" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المشتريات</h1>
        <Link href="/purchases/new" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow">إضافة عملية شراء</Link>
      </div>

      {loading ? <div className="text-gray-500 py-8">جاري التحميل...</div> : purchases.length === 0 ? (
        <div className="text-gray-500 py-8">لا يوجد مشتريات مسجلة.</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السيارة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البائع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر الشراء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدفوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتبقي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {purchases.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm font-medium">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {p.vehicle?.make} {p.vehicle?.model} ({p.vehicle?.vehicleCode})
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.seller?.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.purchasePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">{p.totalPaid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-red-500 font-medium">{p.remaining.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      p.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600">
                    <Link href={`/purchases/${p.id}`}>التفاصيل</Link>
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
