"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set("type", reportType);
      if (startDate) query.set("startDate", startDate);
      if (endDate) query.set("endDate", endDate);

      const res = await fetch(`/api/reports?${query.toString()}`);
      if (res.status === 403) throw new Error("لا تملك الصلاحية الكافية لإنشاء التقارير.");
      if (!res.ok) throw new Error("Failed to load report");
      
      const json = await res.json();
      setData(json.data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    let csvContent = "\uFEFF"; // BOM for Arabic support in Excel

    if (reportType === "sales") {
      csvContent += "رقم الفاتورة,تاريخ البيع,العميل,السيارة,سعر البيع,تكلفة الشراء,المصروفات,الربح\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((row: any) => {
        const date = new Date(row.saleDate).toLocaleDateString();
        const purchaseCost = row.vehicle?.purchases?.[0]?.purchasePrice || 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const expCost = row.vehicle?.expenses?.reduce((a: number, e: any) => a + e.amount, 0) || 0;
        const profit = row.salePrice - (purchaseCost + expCost);
        
        csvContent += `"${row.id}","${date}","${row.customer?.name}","${row.vehicle?.make} ${row.vehicle?.model}","${row.salePrice}","${purchaseCost}","${expCost}","${profit}"\n`;
      });
    } else if (reportType === "expenses") {
      csvContent += "رقم المصروف,التاريخ,التصنيف,الوصف,المبلغ,المورد/الورشة,السيارة\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((row: any) => {
        const date = new Date(row.date).toLocaleDateString();
        const vehicle = row.vehicle ? `${row.vehicle.make} ${row.vehicle.model}` : "مصروف عام";
        csvContent += `"${row.id}","${date}","${row.category?.name}","${row.description || ""}","${row.amount}","${row.vendorName || ""}","${vehicle}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">مركز التقارير (Reports Center)</h1>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md mb-6">{error}</div>}

      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">خيارات وفلاتر التقرير</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          
          <div>
            <label className="block text-sm font-semibold mb-1">نوع التقرير</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="sales">تقرير المبيعات والأرباح (Sales & Profit)</option>
              <option value="expenses">تقرير المصروفات الشامل (Expenses)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">من تاريخ</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">إلى تاريخ</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div>
            <button onClick={fetchReport} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? "جاري الإنشاء..." : "إنشاء التقرير"}
            </button>
          </div>

        </div>
      </div>

      {data && data.length > 0 && (
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 flex justify-between items-center border-b">
            <h3 className="font-bold text-gray-800">
              النتائج ({data.length} سجل)
            </h3>
            <div className="flex gap-3">
              <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-green-700">
                تصدير Excel (CSV)
              </button>
              <Link 
                href={`/reports/print?type=${reportType}&startDate=${startDate}&endDate=${endDate}`} 
                target="_blank"
                className="bg-gray-800 text-white px-4 py-2 text-sm rounded shadow hover:bg-gray-900"
              >
                طباعة / تصدير PDF
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            {reportType === "sales" ? (
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السيارة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر البيع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة الإجمالية</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الربح</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data.map((row: any) => {
                    const purchaseCost = row.vehicle?.purchases?.[0]?.purchasePrice || 0;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const expCost = row.vehicle?.expenses?.reduce((a: number, e: any) => a + e.amount, 0) || 0;
                    const totalCost = purchaseCost + expCost;
                    const profit = row.salePrice - totalCost;

                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-sm">{new Date(row.saleDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{row.customer?.name}</td>
                        <td className="px-4 py-3 text-sm">{row.vehicle?.make} {row.vehicle?.model}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{row.salePrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{totalCost.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-sm font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{profit.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الورشة / المورد</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data.map((row: any) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-sm">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{row.category?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.description || "-"} {row.vehicle && <span className="block text-xs text-blue-500">[{row.vehicle.vehicleCode}]</span>}</td>
                      <td className="px-4 py-3 text-sm">{row.vendorName || "-"}</td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">{row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border">
          لا توجد بيانات مطابقة لمعايير البحث المطلوبة.
        </div>
      )}

    </div>
  );
}
