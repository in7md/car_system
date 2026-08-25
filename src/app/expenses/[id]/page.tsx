"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ExpenseDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/expenses/${id}`);
        if (!res.ok) throw new Error("Failed to fetch expense");
        const json = await res.json();
        setExpense(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error || !expense) return <div className="p-8 text-center text-red-600" dir="rtl">{error || "Expense not found"}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">تفاصيل المصروف</h1>
        <Link href="/expenses" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border space-y-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
          <div><span className="block text-gray-500 mb-1">المبلغ</span><span className="font-bold text-lg text-red-600">{expense.amount.toLocaleString()}</span></div>
          <div><span className="block text-gray-500 mb-1">تاريخ المصروف</span><span className="font-medium">{new Date(expense.date).toLocaleDateString()}</span></div>
          
          <div><span className="block text-gray-500 mb-1">الفئة</span><span className="font-medium">{expense.category?.name}</span></div>
          <div><span className="block text-gray-500 mb-1">البيان / الوصف</span><span className="font-medium">{expense.description || "-"}</span></div>
          
          <div>
            <span className="block text-gray-500 mb-1">حالة الدفع</span>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              expense.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {expense.status}
            </span>
          </div>
          <div>
            <span className="block text-gray-500 mb-1">السيارة المرتبطة</span>
            {expense.vehicle ? (
              <Link href={`/vehicles/${expense.vehicleId}`} className="text-blue-600 hover:underline">
                {expense.vehicle.make} {expense.vehicle.model} ({expense.vehicle.vehicleCode})
              </Link>
            ) : (
              <span className="text-gray-500 italic">مصروف عام</span>
            )}
          </div>
          
          <div className="col-span-2 border-t pt-4 mt-2">
            <h3 className="font-semibold text-gray-700 mb-4">بيانات إضافية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="block text-gray-500 mb-1">اسم المورد / الورشة</span><span className="font-medium">{expense.vendorName || "-"}</span></div>
              <div><span className="block text-gray-500 mb-1">رقم الفاتورة / المرجع</span><span className="font-medium">{expense.referenceNumber || "-"}</span></div>
              <div><span className="block text-gray-500 mb-1">بواسطة</span><span className="font-medium">{expense.createdBy?.name || expense.createdBy?.email}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
