"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`/api/customers`);
        if (!res.ok) throw new Error("Failed to fetch customers");
        const json = await res.json();
        setCustomers(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (error) return <div className="p-8 text-red-600 bg-red-50" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
        <Link href="/customers/new" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow">إضافة عميل جديد</Link>
      </div>

      {loading ? <div className="text-gray-500 py-8">جاري التحميل...</div> : customers.length === 0 ? (
        <div className="text-gray-500 py-8">لا يوجد عملاء مسجلين.</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهوية/الإقامة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد المشتريات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {customers.map((c: any) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.idNumber || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c._count?.sales || 0}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">
                    <Link href={`/customers/${c.id}`}>التفاصيل</Link>
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
