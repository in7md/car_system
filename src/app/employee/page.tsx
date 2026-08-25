"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const json = await res.json();
          setVehicles(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          مرحباً {session?.user?.name || "الموظف"}
        </h1>
        <Link 
          href="/expenses/new" 
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span> تسجيل مصروف / تصليح جديد
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">المركبات الخاصة بي</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المركبة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {vehicles.map((v: any) => (
                <tr key={v.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{v.vehicleCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.make} {v.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/vehicles/${v.id}`} className="text-blue-600 hover:text-blue-900 ml-4">
                      التفاصيل
                    </Link>
                    <Link href={`/expenses/new?vehicleId=${v.id}`} className="text-green-600 hover:text-green-900">
                      إضافة مصروف
                    </Link>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">لا توجد مركبات</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
