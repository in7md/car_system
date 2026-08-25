"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PrintReportContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const query = new URLSearchParams();
        if (type) query.set("type", type);
        if (startDate) query.set("startDate", startDate);
        if (endDate) query.set("endDate", endDate);

        const res = await fetch(`/api/reports?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to load report");
        const json = await res.json();
        setData(json.data);

        // Wait a tiny bit for render, then open print dialog
        setTimeout(() => {
          window.print();
        }, 1000);

      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [type, startDate, endDate]);

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري تجهيز التقرير للطباعة...</div>;
  if (error) return <div className="p-8 text-center text-red-600" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white" dir="rtl">
      
      {/* Header - Looks official for print */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === "sales" ? "تقرير المبيعات والأرباح" : "تقرير المصروفات"}
          </h1>
          <p className="text-gray-600">
            الفترة: {startDate ? new Date(startDate).toLocaleDateString() : "البداية"} 
            {" "}إلى{" "} 
            {endDate ? new Date(endDate).toLocaleDateString() : "النهاية"}
          </p>
        </div>
        <div className="text-left">
          <h2 className="text-xl font-bold text-blue-800">نظام إدارة السيارات</h2>
          <p className="text-gray-500 text-sm">تاريخ الطباعة: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      {data && data.length > 0 ? (
        <table className="min-w-full divide-y border border-gray-300 print:border-collapse">
          <thead className="bg-gray-100">
            {type === "sales" ? (
              <tr>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">التاريخ</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">العميل</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">السيارة</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">سعر البيع</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">التكلفة</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">الربح</th>
              </tr>
            ) : (
              <tr>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">التاريخ</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">التصنيف</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">الوصف / السيارة</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">الورشة / المورد</th>
                <th className="px-4 py-2 border text-right text-xs font-bold text-gray-800 uppercase">المبلغ</th>
              </tr>
            )}
          </thead>
          <tbody>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.map((row: any) => {
              if (type === "sales") {
                const purchaseCost = row.vehicle?.purchases?.[0]?.purchasePrice || 0;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const expCost = row.vehicle?.expenses?.reduce((a: number, e: any) => a + e.amount, 0) || 0;
                const totalCost = purchaseCost + expCost;
                const profit = row.salePrice - totalCost;

                return (
                  <tr key={row.id}>
                    <td className="px-4 py-2 border text-sm">{new Date(row.saleDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border text-sm">{row.customer?.name}</td>
                    <td className="px-4 py-2 border text-sm">{row.vehicle?.make} {row.vehicle?.model}</td>
                    <td className="px-4 py-2 border text-sm font-bold text-gray-900">{row.salePrice.toLocaleString()}</td>
                    <td className="px-4 py-2 border text-sm text-gray-700">{totalCost.toLocaleString()}</td>
                    <td className="px-4 py-2 border text-sm font-bold">{profit.toLocaleString()}</td>
                  </tr>
                );
              } else {
                return (
                  <tr key={row.id}>
                    <td className="px-4 py-2 border text-sm">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border text-sm">{row.category?.name}</td>
                    <td className="px-4 py-2 border text-sm text-gray-700">{row.description || "-"} {row.vehicle && `[${row.vehicle.vehicleCode}]`}</td>
                    <td className="px-4 py-2 border text-sm">{row.vendorName || "-"}</td>
                    <td className="px-4 py-2 border text-sm font-bold text-gray-900">{row.amount.toLocaleString()}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500 py-8 border">لا توجد بيانات متاحة.</p>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-xs border-t pt-4">
        تم إنشاء هذا التقرير آلياً بواسطة نظام إدارة السيارات.
      </div>

    </div>
  );
}

export default function PrintReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" dir="rtl">جاري التحميل...</div>}>
      <PrintReportContent />
    </Suspense>
  );
}
