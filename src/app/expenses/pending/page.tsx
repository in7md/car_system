"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PendingExpensesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (session?.user && ((session.user as any).role || "").toUpperCase() === "EMPLOYEE") {
      router.push("/employee");
      return;
    }

    const fetchPending = async () => {
      try {
        const res = await fetch("/api/expenses");
        if (res.ok) {
          const json = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pending = json.data.filter((e: any) => e.status === "PENDING");
          setExpenses(pending);
        } else {
          setError("Failed to fetch pending expenses.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchPending();
  }, [session, router]);

  const handleApprove = async (id: string) => {
    if (!confirm("هل أنت متأكد من اعتماد هذا المصروف؟")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      });
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setExpenses(expenses.filter((e: any) => e.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "فشل الاعتماد");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">اعتماد المصروفات المعلقة</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموظف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المركبة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {expenses.map((e: any) => (
                <tr key={e.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{e.amount} د.ك</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.description || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.createdBy?.name || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {e.vehicleId ? <Link href={`/vehicles/${e.vehicleId}`}>عرض السيارة</Link> : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleApprove(e.id)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded">
                      اعتماد
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">لا توجد مصروفات معلقة.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
