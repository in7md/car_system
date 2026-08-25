"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { VehicleStatus } from "@prisma/client";

interface Vehicle {
  id: string;
  vehicleCode: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
}

export default function VehiclesPage() {
  // const { data: session } = useSession(); // unused
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles?search=${encodeURIComponent(search)}`);
        if (!res.ok) {
          if (res.status === 403) throw new Error("Forbidden: You don't have permission to view vehicles.");
          throw new Error("Failed to fetch vehicles");
        }
        const json = await res.json();
        setVehicles(json.data);
        setError(null);
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

    fetchVehicles();
  }, [search]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md shadow">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">إدارة السيارات</h1>
        <Link 
          href="/vehicles/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> إضافة سيارة جديدة
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="ابحث برقم اللوحة، الماركة، الموديل..." 
          className="px-4 py-2 border rounded-md w-full max-w-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Further filters can be added here */}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">لا توجد سيارات مطابقة لبحثك.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">كود السيارة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم اللوحة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الماركة والموديل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سنة الصنع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.vehicleCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.plateNumber || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.make} {v.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.year || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                    <Link href={`/vehicles/${v.id}`}>التفاصيل</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
