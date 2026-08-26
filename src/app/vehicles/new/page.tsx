"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Clean up empty strings and format numbers
    const payload: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value) {
        if (key === "year" || key === "mileage") {
          payload[key] = Number(value as string);
        } else {
          payload[key] = value as string;
        }
      }
    }

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json();
        let errorMsg = json.error || "حدث خطأ غير معروف أثناء الإضافة.";
        if (json.details) {
          // Flatten zod errors
          const fields = Object.keys(json.details).filter(k => k !== '_errors');
          if (fields.length > 0) {
            errorMsg += ` (الحقول المطلوبة: ${fields.join(', ')})`;
          }
        }
        throw new Error(errorMsg);
      }

      router.push("/vehicles");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إضافة سيارة جديدة</h1>
        <Link href="/vehicles" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <div className="bg-white p-8 shadow-md rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">الماركة (Make) *</label>
              <input name="make" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">الموديل (Model) *</label>
              <input name="model" required className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">سنة الصنع (Year)</label>
              <input name="year" type="number" min="1900" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">رقم اللوحة (Plate Number)</label>
              <input name="plateNumber" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">رقم الهيكل (VIN)</label>
              <input name="vin" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">اللون (Color)</label>
              <input name="color" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">الممشى (Mileage)</label>
              <input name="mileage" type="number" min="0" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">الحالة (Status)</label>
              <select name="status" defaultValue="PURCHASED" className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="PURCHASED">تم الشراء (Purchased)</option>
                <option value="INSPECTION">قيد الفحص (Inspection)</option>
                <option value="UNDER_REPAIR">تحت الإصلاح (Under Repair)</option>
                <option value="READY_FOR_SALE">جاهز للبيع (Ready for Sale)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">ملاحظات (Notes)</label>
            <textarea name="notes" rows={4} className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md disabled:opacity-50 transition-colors"
          >
            {loading ? "جاري الحفظ..." : "إضافة السيارة"}
          </button>
        </form>
      </div>
    </div>
  );
}
