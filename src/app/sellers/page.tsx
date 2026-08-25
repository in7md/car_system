"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SellersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sellers, setSellers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/sellers?search=${encodeURIComponent(search)}`);
        if (!res.ok) {
          if (res.status === 403) throw new Error("Forbidden: You don't have permission.");
          throw new Error("Failed to fetch sellers");
        }
        const json = await res.json();
        setSellers(json.data);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, [search]);

  if (error) return <div className="p-8 text-red-600 bg-red-50" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدارة البائعين</h1>
        <Link href="/sellers/new" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow">إضافة بائع جديد</Link>
      </div>

      <div className="mb-6">
        <input 
          type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." 
          className="px-4 py-2 border rounded-md w-full max-w-md"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <div className="text-gray-500 py-8">جاري التحميل...</div> : sellers.length === 0 ? (
        <div className="text-gray-500 py-8">لا يوجد بائعين.</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عمليات الشراء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellers.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 text-sm font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s._count?.purchases || 0}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">
                    <Link href={`/sellers/${s.id}`}>التفاصيل</Link>
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
