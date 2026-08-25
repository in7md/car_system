"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function NewExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVehicleId = searchParams.get("vehicleId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vehicles, setVehicles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles?limit=200").then(r => r.json()),
      fetch("/api/expenses/categories").then(r => r.json())
    ]).then(([vData, cData]) => {
      if (vData.data) setVehicles(vData.data);
      if (cData.data) setCategories(cData.data);
    }).catch(err => console.error("Error loading dropdown data:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value) {
        if (key === "amount") {
          payload[key] = Number(value as string);
        } else {
          payload[key] = value as string;
        }
      }
    }

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create expense");
      }
      router.push("/expenses");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إضافة مصروف جديد</h1>
        <Link href="/expenses" className="text-gray-500 hover:text-gray-700">العودة</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white p-8 shadow-md rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">الفئة *</label>
            <select name="categoryId" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">اختر فئة المصروف...</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">السيارة (اختياري)</label>
            <select name="vehicleId" defaultValue={preselectedVehicleId} className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">مصروف عام (بدون سيارة)</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.vehicleCode})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">اربط المصروف بسيارة محددة لحساب التكلفة الإجمالية لها.</p>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">المبلغ *</label>
            <input type="number" name="amount" min="0.01" step="0.01" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">تاريخ المصروف *</label>
            <input type="date" name="date" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">البيان / الوصف</label>
            <input type="text" name="description" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" placeholder="مثال: تغيير زيت، فحص فني..." />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">اسم المورد / الورشة (اختياري)</label>
            <input type="text" name="vendorName" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">رقم الفاتورة / المرجع (اختياري)</label>
            <input type="text" name="referenceNumber" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">حالة الدفع</label>
            <select name="status" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="PAID">مدفوع</option>
              <option value="UNPAID">غير مدفوع (آجل)</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white py-3 rounded-md disabled:opacity-50 mt-4 transition-colors">
            {loading ? "جاري الحفظ..." : "حفظ المصروف"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" dir="rtl">جاري التحميل...</div>}>
      <NewExpenseForm />
    </Suspense>
  );
}
