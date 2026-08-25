"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SellerDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch(`/api/sellers/${id}`);
        if (!res.ok) throw new Error("Failed to fetch seller");
        const json = await res.json();
        setSeller(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error || !seller) return <div className="p-8 text-center text-red-600" dir="rtl">{error || "Seller not found"}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">البائع: {seller.name}</h1>
        <Link href="/sellers" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">معلومات البائع</h2>
            <div className="space-y-4 text-sm">
              <div><span className="block text-gray-500">الهاتف</span><span className="font-medium">{seller.phone || "-"}</span></div>
              <div><span className="block text-gray-500">العنوان</span><span className="font-medium">{seller.address || "-"}</span></div>
              <div><span className="block text-gray-500">ملاحظات</span><span className="font-medium">{seller.notes || "-"}</span></div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">ملخص مالي</h2>
            <div className="space-y-4 text-sm">
              <div><span className="block text-gray-500">عدد السيارات المشتراة</span><span className="font-medium">{seller.purchases?.length || 0}</span></div>
              <div><span className="block text-gray-500">إجمالي قيمة المشتريات</span><span className="font-medium text-blue-600 font-bold">{seller.totalValue?.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">السيارات المرتبطة وسجل الشراء</h2>
            {seller.purchases && seller.purchases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">السيارة</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">تاريخ الشراء</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {seller.purchases.map((p: any) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/vehicles/${p.vehicleId}`} className="text-blue-600 hover:underline">
                            {p.vehicle?.make} {p.vehicle?.model} ({p.vehicle?.year}) - {p.vehicle?.vehicleCode}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-medium">{p.purchasePrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">لا يوجد سجل شراء لهذا البائع.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
