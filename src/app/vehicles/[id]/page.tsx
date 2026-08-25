"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { QRCodeCanvas } from "qrcode.react";

export default function VehicleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [vehicle, setVehicle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/vehicles/${id}`);
        if (!res.ok) throw new Error("Failed to fetch vehicle");
        const json = await res.json();
        setVehicle(json.data);
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

    fetchVehicle();
  }, [id]);

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error || !vehicle) return <div className="p-8 text-center text-red-600" dir="rtl">{error || "Vehicle not found"}</div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role;
  const canViewFinancials = userRole === "Owner" || userRole === "Manager" || userRole === "Accountant";

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          السيارة: {vehicle.make} {vehicle.model} ({vehicle.year})
        </h1>
        <Link href="/vehicles" className="text-gray-500 hover:text-gray-700">العودة للقائمة</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">المعلومات الأساسية</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div><span className="text-gray-500 block text-sm">كود السيارة</span><span className="font-medium">{vehicle.vehicleCode}</span></div>
              <div><span className="text-gray-500 block text-sm">الحالة</span>
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {vehicle.status}
                </span>
              </div>
              <div><span className="text-gray-500 block text-sm">رقم اللوحة</span><span className="font-medium">{vehicle.plateNumber || "-"}</span></div>
              <div><span className="text-gray-500 block text-sm">رقم الهيكل (VIN)</span><span className="font-medium">{vehicle.vin || "-"}</span></div>
              <div><span className="text-gray-500 block text-sm">اللون</span><span className="font-medium">{vehicle.color || "-"}</span></div>
              <div><span className="text-gray-500 block text-sm">الممشى</span><span className="font-medium">{vehicle.mileage || "-"} كم</span></div>
              <div><span className="text-gray-500 block text-sm">نوع الوقود</span><span className="font-medium">{vehicle.fuelType || "-"}</span></div>
              <div><span className="text-gray-500 block text-sm">ناقل الحركة</span><span className="font-medium">{vehicle.transmission || "-"}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block text-sm">ملاحظات</span><span className="font-medium">{vehicle.notes || "-"}</span></div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">بيانات الشراء (Purchase)</h2>
            {vehicle.purchases && vehicle.purchases.length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {vehicle.purchases.map((p: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const totalPaid = p.payments?.reduce((acc: number, pay: any) => acc + pay.amount, 0) || 0;
                  const remaining = Math.max(0, p.purchasePrice - totalPaid);

                  return (
                    <div key={p.id} className="border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="block text-gray-500">البائع</span><Link href={`/sellers/${p.sellerId}`} className="font-medium text-blue-600 hover:underline">{p.seller?.name}</Link></div>
                        <div><span className="block text-gray-500">تاريخ الشراء</span><span className="font-medium">{new Date(p.purchaseDate).toLocaleDateString()}</span></div>
                        
                        {canViewFinancials && (
                          <>
                            <div><span className="block text-gray-500">سعر الشراء</span><span className="font-medium">{p.purchasePrice.toLocaleString()}</span></div>
                            <div><span className="block text-gray-500">طريقة الدفع</span><span className="font-medium">{p.paymentMethod || "-"}</span></div>
                            <div><span className="block text-gray-500">إجمالي المدفوع</span><span className="font-medium text-green-600">{totalPaid.toLocaleString()}</span></div>
                            <div><span className="block text-gray-500">المتبقي</span><span className="font-medium text-red-500">{remaining.toLocaleString()}</span></div>
                          </>
                        )}
                        <div className="col-span-2">
                          <Link href={`/purchases/${p.id}`} className="text-blue-600 hover:underline">عرض تفاصيل وإدارة الدفعات &rarr;</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لا يوجد عملية شراء مرتبطة نشطة.</p>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">المصروفات والإصلاحات (Expenses & Repairs)</h2>
              <Link href={`/expenses/new?vehicleId=${vehicle.id}`} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                + إضافة مصروف
              </Link>
            </div>
            
            {canViewFinancials && (
              <div className="mb-6 p-4 bg-gray-50 rounded border flex justify-between items-center">
                <span className="font-semibold text-gray-700">إجمالي المصروفات:</span>
                <span className="font-bold text-red-600">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {vehicle.expenses?.reduce((acc: number, exp: any) => acc + (exp.amount as number), 0).toLocaleString()}
                </span>
              </div>
            )}

            {vehicle.expenses && vehicle.expenses.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {vehicle.expenses.map((exp: any) => (
                  <div key={exp.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">{exp.description || exp.category?.name}</span>
                      {canViewFinancials && <span className="font-bold text-red-600">{exp.amount.toLocaleString()}</span>}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(exp.date).toLocaleDateString()} | {exp.category?.name}</span>
                      <Link href={`/expenses/${exp.id}`} className="text-blue-600 hover:underline">التفاصيل</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لا توجد مصروفات مسجلة لهذه السيارة.</p>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-700">بيانات البيع (Sales)</h2>
              {vehicle.status !== 'SOLD' && (
                <Link href={`/sales/new?vehicleId=${vehicle.id}`} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                  + بيع السيارة
                </Link>
              )}
            </div>

            {vehicle.sales && vehicle.sales.length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {vehicle.sales.map((sale: any) => {
                  const saleTotal = sale.salePrice;
                  const purchaseTotal = vehicle.purchases?.[0]?.purchasePrice || 0;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const expensesTotal = vehicle.expenses?.reduce((acc: number, exp: any) => acc + (exp.amount as number), 0) || 0;
                  const netProfit = saleTotal - (purchaseTotal + expensesTotal);
                  
                  return (
                    <div key={sale.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="block text-gray-500 text-xs mb-1">العميل (المشتري)</span>
                          <span className="font-bold">{sale.customer?.name}</span>
                        </div>
                        <div className="text-left">
                          <span className="block text-gray-500 text-xs mb-1">تاريخ البيع</span>
                          <span className="font-medium text-sm">{new Date(sale.saleDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Link href={`/sales/${sale.id}`} className="text-blue-600 hover:underline text-sm font-medium">عرض تفاصيل الفاتورة الدفعات &larr;</Link>
                      </div>

                      {canViewFinancials && (
                        <div className="mt-4 pt-4 border-t bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-md">
                          <h3 className="font-bold text-gray-700 mb-2">الملخص المالي والأرباح (P&L)</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">إجمالي البيع</span>
                              <span className="font-bold text-green-600">{saleTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">سعر الشراء</span>
                              <span className="font-bold text-red-600">{purchaseTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">إجمالي المصروفات</span>
                              <span className="font-bold text-red-600">{expensesTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 border-gray-300">
                              <span className="font-bold">صافي الربح</span>
                              <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {netProfit > 0 ? '+' : ''}{netProfit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">السيارة لم تُباع بعد.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 border border-gray-200 text-center print:shadow-none print:border-none">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-right print:hidden">رمز الاستجابة (QR)</h2>
            <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-md mb-4 border print:border-0 print:bg-white">
              <QRCodeCanvas 
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/vehicles/${vehicle.id}`} 
                size={160}
                includeMargin={true}
              />
              <span className="mt-2 font-mono text-xs text-gray-500 font-bold hidden print:block">{vehicle.vehicleCode}</span>
            </div>
            <button 
              onClick={() => window.print()}
              className="text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 w-full print:hidden"
            >
              طباعة رمز الـ QR
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-gray-200 print:hidden">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">سجل الحالة (Status History)</h2>
            {vehicle.statusHistory && vehicle.statusHistory.length > 0 ? (
              <ul className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {vehicle.statusHistory.map((h: any) => (
                  <li key={h.id} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{h.newStatus}</span>
                      <span className="text-gray-500 text-xs">{new Date(h.changedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-600 text-xs">بواسطة: {h.changedBy?.name || h.changedBy?.email || "Unknown"}</div>
                    {h.notes && <div className="text-gray-500 mt-1 italic">&quot;{h.notes}&quot;</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">لا يوجد سجل للحالة.</p>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 border border-gray-200 print:hidden">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">التعيينات (Assignments)</h2>
            {vehicle.assignments && vehicle.assignments.length > 0 ? (
              <ul className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {vehicle.assignments.map((a: any) => (
                  <li key={a.id} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{a.employee?.name || a.employee?.email}</span>
                      <span className="text-gray-500 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">لم يتم تعيين السيارة لأحد.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
