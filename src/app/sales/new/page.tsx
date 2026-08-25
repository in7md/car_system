"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NewSaleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vehicles, setVehicles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      // Only fetch vehicles that are READY_FOR_SALE
      fetch("/api/vehicles?status=READY_FOR_SALE").then(r => r.json()),
      fetch("/api/customers").then(r => r.json())
    ]).then(([vData, cData]) => {
      if (vData.data) setVehicles(vData.data);
      if (cData.data) setCustomers(cData.data);
    }).catch(err => console.error("Error fetching dependencies:", err));
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
        if (key === "salePrice") payload[key] = Number(value as string);
        else payload[key] = value as string;
      }
    }

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create sale");
      }
      
      const resJson = await res.json();
      router.push(`/sales/${resJson.data.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إنشاء فاتورة بيع جديدة</h1>
        <Link href="/sales" className="text-gray-500 hover:text-gray-700">العودة</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white p-8 shadow-md rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm mb-1 font-semibold text-gray-700">السيارة المباعة *</label>
            <select name="vehicleId" required className="w-full px-4 py-2 border rounded-md">
              <option value="">اختر السيارة...</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.vehicleCode}) - {v.vin}</option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="text-sm text-red-500 mt-1">لا توجد سيارات بحالة (جاهز للبيع). قم بتغيير حالة إحدى السيارات من لوحة التحكم لتظهر هنا.</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 font-semibold text-gray-700">العميل (المشتري) *</label>
            <div className="flex gap-2">
              <select name="customerId" defaultValue={preselectedCustomerId} required className="w-full px-4 py-2 border rounded-md">
                <option value="">اختر العميل...</option>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone || c.idNumber})</option>
                ))}
              </select>
              <Link href="/customers/new" target="_blank" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 whitespace-nowrap">
                + عميل جديد
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-1 font-semibold text-gray-700">سعر البيع الإجمالي *</label>
              <input type="number" name="salePrice" min="0" step="0.01" required className="w-full px-4 py-2 border rounded-md font-bold text-green-700" />
            </div>
            <div>
              <label className="block text-sm mb-1 font-semibold text-gray-700">تاريخ البيع *</label>
              <input type="date" name="saleDate" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-4 py-2 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 font-semibold text-gray-700">طريقة الدفع المتفق عليها</label>
            <input type="text" name="paymentMethod" placeholder="مثال: نقدي، تحويل بنكي، أقساط..." className="w-full px-4 py-2 border rounded-md" />
          </div>

          <div>
            <label className="block text-sm mb-1 font-semibold text-gray-700">شروط البيع / ملاحظات</label>
            <textarea name="notes" rows={3} className="w-full px-4 py-2 border rounded-md" placeholder="اكتب أي ملاحظات أو شروط خاصة بعملية البيع..."></textarea>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200 mt-4">
            <span className="font-bold block mb-1">تنبيه تلقائي:</span>
            مجرد حفظ هذه الفاتورة، سيتم تغيير حالة السيارة تلقائياً إلى <strong>&quot;مباعة (SOLD)&quot;</strong> في النظام.
          </div>

          <button type="submit" disabled={loading || vehicles.length === 0} className="w-full bg-green-600 text-white py-3 font-bold rounded-md disabled:opacity-50 mt-4 text-lg">
            {loading ? "جاري الحفظ..." : "تأكيد البيع وإنشاء الفاتورة"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewSalePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" dir="rtl">جاري التحميل...</div>}>
      <NewSaleForm />
    </Suspense>
  );
}
