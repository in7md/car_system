"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value) payload[key] = value as string;
    }

    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create seller");
      }
      router.push("/sellers");
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
        <h1 className="text-3xl font-bold text-gray-900">إضافة بائع</h1>
        <Link href="/sellers" className="text-gray-500 hover:text-gray-700">العودة</Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

      <div className="bg-white p-8 shadow-md rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-1">الاسم *</label>
            <input name="name" required className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">الهاتف</label>
            <input name="phone" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">العنوان</label>
            <input name="address" className="w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm mb-1">ملاحظات</label>
            <textarea name="notes" rows={3} className="w-full px-4 py-2 border rounded-md"></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50">
            {loading ? "جاري الحفظ..." : "حفظ البائع"}
          </button>
        </form>
      </div>
    </div>
  );
}
