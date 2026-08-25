"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data for selects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vehicles, setVehicles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles?limit=100").then(r => r.json()),
      fetch("/api/sellers?limit=100").then(r => r.json())
    ]).then(([vData, sData]) => {
      if (vData.data) setVehicles(vData.data);
      if (sData.data) setSellers(sData.data);
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
        if (key === "purchasePrice") {
          payload[key] = Number(value as string);
        } else {
          payload[key] = value as string;
        }
      }
    }

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create purchase");
      }
      router.push("/purchases");
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
        <h1 className="text-3xl font-bold text-gray-900">إضافة عملية شراء جديدة</h1>
        <Link href="/purchases" className="text-gray-500 hover:text-gray-700">العودة</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white p-8 shadow-md rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">السيارة *</label>
            <select name="vehicleId" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">اختر السيارة...</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.vehicleCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">البائع *</label>
            <select name="sellerId" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">اختر البائع...</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sellers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} - {s.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">تاريخ الشراء *</label>
            <input type="date" name="purchaseDate" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">سعر الشراء *</label>
            <input type="number" name="purchasePrice" min="1" step="0.01" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">طريقة الدفع الأولية</label>
            <select name="paymentMethod" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="CASH">نقدي (Cash)</option>
              <option value="BANK_TRANSFER">تحويل بنكي (Bank Transfer)</option>
              <option value="CHECK">شيك (Check)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">ملاحظات</label>
            <textarea name="notes" rows={4} className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white py-3 rounded-md disabled:opacity-50 transition-colors">
            {loading ? "جاري الحفظ..." : "حفظ عملية الشراء"}
          </button>
        </form>
      </div>
    </div>
  );
}
