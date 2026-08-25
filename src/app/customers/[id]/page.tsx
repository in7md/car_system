"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error("Failed to fetch customer");
        const json = await res.json();
        setCustomer(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error || !customer) return <div className="p-8 text-center text-red-600" dir="rtl">{error || "Customer not found"}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ملف العميل: {customer.name}</h1>
        <Link href="/customers" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">المعلومات الشخصية</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="block text-gray-500 mb-1">رقم الهاتف</span><span className="font-medium">{customer.phone || "-"}</span></div>
          <div><span className="block text-gray-500 mb-1">رقم الهوية / الإقامة</span><span className="font-medium">{customer.idNumber || "-"}</span></div>
          <div className="col-span-2"><span className="block text-gray-500 mb-1">العنوان</span><span className="font-medium">{customer.address || "-"}</span></div>
          <div className="col-span-2"><span className="block text-gray-500 mb-1">ملاحظات</span><span className="font-medium">{customer.notes || "-"}</span></div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold">تاريخ مشتريات العميل (المبيعات)</h2>
          <Link href={`/sales/new?customerId=${customer.id}`} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
            + إنشاء فاتورة بيع
          </Link>
        </div>
        
        {customer.sales && customer.sales.length > 0 ? (
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {customer.sales.map((sale: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const totalPaid = sale.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
              const remaining = sale.salePrice - totalPaid;
              
              return (
                <div key={sale.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        {sale.vehicle?.make} {sale.vehicle?.model} ({sale.vehicle?.vehicleCode})
                      </h3>
                      <p className="text-sm text-gray-500">تاريخ البيع: {new Date(sale.saleDate).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/sales/${sale.id}`} className="text-blue-600 hover:underline text-sm">تفاصيل الفاتورة</Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4 bg-gray-50 p-3 rounded text-sm">
                    <div>
                      <span className="block text-gray-500">إجمالي قيمة البيع</span>
                      <span className="font-bold text-green-600">{sale.salePrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">المدفوع</span>
                      <span className="font-bold text-blue-600">{totalPaid.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">المتبقي</span>
                      <span className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-gray-600'}`}>{remaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">لم يقم هذا العميل بشراء أي سيارة بعد.</p>
        )}
      </div>
    </div>
  );
}
