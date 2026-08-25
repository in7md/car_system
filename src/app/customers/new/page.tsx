"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create customer");
      }
      router.push("/customers");
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
        <h1 className="text-3xl font-bold text-gray-900">إضافة عميل جديد</h1>
        <Link href="/customers" className="text-gray-500 hover:text-gray-700">العودة</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white p-8 shadow-md rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-1">اسم العميل *</label>
            <input type="text" name="name" required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">رقم الهاتف</label>
            <input type="text" name="phone" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">رقم الهوية / الإقامة / الجواز</label>
            <input type="text" name="idNumber" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">العنوان</label>
            <input type="text" name="address" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">ملاحظات إضافية</label>
            <textarea name="notes" rows={3} className="w-full px-4 py-2 border rounded-md"></textarea>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50 mt-4">
            {loading ? "جاري الحفظ..." : "حفظ العميل"}
          </button>
        </form>
      </div>
    </div>
  );
}
