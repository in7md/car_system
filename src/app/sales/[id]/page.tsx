"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SaleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await fetch(`/api/sales/${id}`);
        if (!res.ok) throw new Error("Failed to fetch sale");
        const json = await res.json();
        setSale(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  const refreshSaleData = async () => {
    try {
      const res = await fetch(`/api/sales/${id}`);
      if (!res.ok) throw new Error("Failed to fetch sale");
      const json = await res.json();
      setSale(json.data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch(`/api/sales/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          paidAt: paymentDate,
          method: paymentMethod,
          receiptNumber: paymentReceipt,
          notes: paymentNotes
        })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to add payment");
      }
      
      // Reset form and refresh data
      setPaymentAmount("");
      setPaymentReceipt("");
      setPaymentNotes("");
      await refreshSaleData();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setPaymentError(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error || !sale) return <div className="p-8 text-center text-red-600" dir="rtl">{error || "Sale not found"}</div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPaid = sale.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
  const remaining = sale.salePrice - totalPaid;
  const isFullyPaid = remaining <= 0;

  return (
    <div className="p-8 max-w-6xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">فاتورة بيع سيارة</h1>
        <div className="flex gap-4">
          <Link href={`/vehicles/${sale.vehicleId}`} className="text-blue-600 hover:underline">عرض ملف السيارة</Link>
          <Link href="/sales" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">تفاصيل الفاتورة</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div><span className="block text-gray-500 mb-1">العميل (المشتري)</span><Link href={`/customers/${sale.customerId}`} className="font-bold text-blue-600">{sale.customer?.name}</Link></div>
              <div><span className="block text-gray-500 mb-1">رقم التواصل</span><span className="font-medium">{sale.customer?.phone || "-"}</span></div>
              
              <div className="col-span-2 border-t pt-4 mt-2"></div>
              
              <div><span className="block text-gray-500 mb-1">السيارة المباعة</span><span className="font-bold">{sale.vehicle?.make} {sale.vehicle?.model}</span></div>
              <div><span className="block text-gray-500 mb-1">الكود / الشاصي</span><span className="font-medium">{sale.vehicle?.vehicleCode} / {sale.vehicle?.vin}</span></div>
              
              <div className="col-span-2 border-t pt-4 mt-2"></div>

              <div><span className="block text-gray-500 mb-1">تاريخ البيع</span><span className="font-medium">{new Date(sale.saleDate).toLocaleDateString()}</span></div>
              <div><span className="block text-gray-500 mb-1">بواسطة</span><span className="font-medium">{sale.createdBy?.name || sale.createdBy?.email}</span></div>
              
              <div className="col-span-2">
                <span className="block text-gray-500 mb-1">ملاحظات الفاتورة</span>
                <span className="font-medium text-gray-700">{sale.notes || "لا توجد ملاحظات"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">سجل الدفعات المقبوضة</h2>
            {sale.payments && sale.payments.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {sale.payments.map((payment: any) => (
                  <div key={payment.id} className="border p-3 rounded-md flex justify-between items-center bg-gray-50">
                    <div>
                      <div className="font-bold text-blue-600">{payment.amount.toLocaleString()} د.ك</div>
                      <div className="text-xs text-gray-500 mt-1">
                        تاريخ القبض: {new Date(payment.paidAt).toLocaleDateString()} | 
                        الطريقة: {payment.method || "-"} | 
                        رقم الإيصال: {payment.receiptNumber || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2">لم يتم تسجيل أي دفعات مقبوضة بعد.</p>
            )}
          </div>
        </div>

        {/* Right Column: Financial Summary & Payment Form */}
        <div className="space-y-6">
          <div className="bg-gray-800 text-white shadow rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-300 border-b border-gray-600 pb-2">الملخص المالي</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">قيمة البيع الإجمالية</span>
                <span className="text-xl font-bold text-green-400">{sale.salePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">إجمالي المقبوض</span>
                <span className="text-lg font-bold text-blue-400">{totalPaid.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-600 pt-4 flex justify-between items-center">
                <span className="text-gray-300 font-bold">المتبقي للتحصيل</span>
                <span className={`text-2xl font-bold ${remaining > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                  {remaining.toLocaleString()}
                </span>
              </div>
              {isFullyPaid && (
                <div className="mt-4 bg-green-900/50 text-green-400 p-2 text-center rounded border border-green-800 font-bold">
                  تم سداد الفاتورة بالكامل
                </div>
              )}
            </div>
          </div>

          {!isFullyPaid && (
            <div className="bg-white shadow rounded-lg p-6 border border-blue-100">
              <h2 className="text-lg font-semibold mb-4 text-blue-800">تسجيل دفعة جديدة مقبوضة</h2>
              {paymentError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{paymentError}</div>}
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-700">المبلغ * (المتبقي: {remaining})</label>
                  <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} max={remaining} min="0.01" step="0.01" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">تاريخ القبض *</label>
                  <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">طريقة الدفع</label>
                  <input type="text" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="كاش، تحويل..." className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">رقم الإيصال / الحوالة</label>
                  <input type="text" value={paymentReceipt} onChange={e => setPaymentReceipt(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700">ملاحظات</label>
                  <input type="text" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <button type="submit" disabled={submittingPayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:opacity-50 font-bold transition-colors">
                  {submittingPayment ? "جاري الحفظ..." : "حفظ الدفعة المقبوضة"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
