"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PurchaseDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await fetch(`/api/purchases/${id}`);
        if (!res.ok) throw new Error("Failed to fetch purchase");
        const json = await res.json();
        setPurchase(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const payload = {
        amount: Number(paymentAmount),
        paidAt: paymentDate,
        method: paymentMethod
      };
      const res = await fetch(`/api/purchases/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || "Failed to add payment");
      }
      setShowPaymentForm(false);
      setPaymentAmount("");
      setPaymentDate("");
      
      const refetchRes = await fetch(`/api/purchases/${id}`);
      if (refetchRes.ok) {
        const json = await refetchRes.json();
        setPurchase(json.data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error || !purchase) return <div className="p-8 text-center text-red-600" dir="rtl">{error || "Purchase not found"}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">تفاصيل عملية الشراء</h1>
        <Link href="/purchases" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Purchase Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">ملخص الشراء</h2>
            <div className="space-y-4 text-sm">
              <div><span className="block text-gray-500">سعر الشراء</span><span className="font-bold text-gray-900">{purchase.purchasePrice.toLocaleString()}</span></div>
              <div><span className="block text-gray-500">إجمالي المدفوع</span><span className="font-bold text-green-600">{purchase.totalPaid.toLocaleString()}</span></div>
              <div><span className="block text-gray-500">المتبقي</span><span className="font-bold text-red-500">{purchase.remaining.toLocaleString()}</span></div>
              <div>
                <span className="block text-gray-500">حالة الدفع</span>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                  purchase.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  purchase.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {purchase.paymentStatus}
                </span>
              </div>
              <div><span className="block text-gray-500">تاريخ الشراء</span><span className="font-medium">{new Date(purchase.purchaseDate).toLocaleDateString()}</span></div>
              <div><span className="block text-gray-500">بواسطة</span><span className="font-medium">{purchase.createdBy?.name || purchase.createdBy?.email}</span></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white shadow rounded-lg p-6 border flex gap-6">
             <div className="flex-1">
               <h3 className="font-semibold text-gray-700 mb-2">معلومات السيارة</h3>
               <p className="text-sm">الشركة المصنعة: {purchase.vehicle?.make}</p>
               <p className="text-sm">الموديل: {purchase.vehicle?.model} ({purchase.vehicle?.year})</p>
               <p className="text-sm">كود السيارة: {purchase.vehicle?.vehicleCode}</p>
               <Link href={`/vehicles/${purchase.vehicleId}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">عرض السيارة</Link>
             </div>
             <div className="flex-1 border-r pr-6">
               <h3 className="font-semibold text-gray-700 mb-2">معلومات البائع</h3>
               <p className="text-sm">الاسم: {purchase.seller?.name}</p>
               <p className="text-sm">الهاتف: {purchase.seller?.phone || "-"}</p>
               <Link href={`/sellers/${purchase.sellerId}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">عرض البائع</Link>
             </div>
          </div>

          {/* Payments Section */}
          <div className="bg-white shadow rounded-lg p-6 border">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">سجل المدفوعات</h2>
              {purchase.remaining > 0 && (
                <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
                  + إضافة دفعة
                </button>
              )}
            </div>

            {showPaymentForm && (
              <form onSubmit={handleAddPayment} className="mb-6 p-4 border rounded bg-gray-50 flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs mb-1">المبلغ (الحد الأقصى {purchase.remaining})</label>
                  <input type="number" required max={purchase.remaining} step="0.01" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} className="px-3 py-1 border rounded w-32 text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1">التاريخ</label>
                  <input type="date" required value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} className="px-3 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1">طريقة الدفع</label>
                  <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="px-3 py-1 border rounded text-sm">
                    <option value="CASH">نقدي</option>
                    <option value="BANK_TRANSFER">تحويل بنكي</option>
                    <option value="CHECK">شيك</option>
                  </select>
                </div>
                <button type="submit" disabled={paymentLoading} className="bg-green-600 text-white px-4 py-1.5 text-sm rounded">
                  {paymentLoading ? "جاري الحفظ..." : "حفظ الدفعة"}
                </button>
              </form>
            )}

            {purchase.payments && purchase.payments.length > 0 ? (
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">التاريخ</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">المبلغ</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">الطريقة</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">المستخدم</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {purchase.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{p.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.method}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.createdBy?.name || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm">لا يوجد مدفوعات مسجلة.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
