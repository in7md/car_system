"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kpis, setKpis] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [kpiRes, chartRes] = await Promise.all([
          fetch("/api/dashboard/kpis"),
          fetch("/api/dashboard/charts")
        ]);

        if (kpiRes.status === 403 || chartRes.status === 403) {
          throw new Error("لا تملك صلاحية الوصول إلى هذه الصفحة.");
        }
        
        if (!kpiRes.ok || !chartRes.ok) throw new Error("Failed to load dashboard data");

        const kpiJson = await kpiRes.json();
        const chartJson = await chartRes.json();

        setKpis(kpiJson.data);
        setCharts(chartJson.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  if (error) return <div className="p-8 text-center text-red-600" dir="rtl">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">لوحة القيادة (Owner Dashboard)</h1>
        
        {/* شريط الإجراءات السريعة */}
        <div className="flex gap-4">
          <Link href="/vehicles/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-colors flex items-center gap-2">
            <span>+</span> إضافة سيارة جديدة
          </Link>
          <Link href="/expenses/new" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow transition-colors flex items-center gap-2">
            <span>+</span> إضافة مصروف جديد
          </Link>
          <Link href="/purchases/new" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow transition-colors flex items-center gap-2">
            <span>+</span> تسجيل عملية شراء
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي رأس المال النشط</p>
          <h2 className="text-2xl font-bold text-gray-900">{kpis.totalActiveCapital.toLocaleString()} د.ك</h2>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي المصروفات</p>
          <h2 className="text-2xl font-bold text-gray-900">{kpis.totalExpenses.toLocaleString()} د.ك</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-semibold mb-1">إجمالي المبيعات (الإيرادات)</p>
          <h2 className="text-2xl font-bold text-gray-900">{kpis.totalSalesRevenue.toLocaleString()} د.ك</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm font-semibold mb-1">صافي الأرباح المحققة</p>
          <h2 className={`text-2xl font-bold ${kpis.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {kpis.totalNetProfit > 0 ? '+' : ''}{kpis.totalNetProfit.toLocaleString()} د.ك
          </h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <p className="text-gray-500 text-sm font-semibold mb-1">متوسط الربح للسيارة المباعة</p>
          <h2 className="text-xl font-bold text-gray-900">{kpis.averageProfitPerCar.toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ك</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-semibold mb-1">الذمم المدينة (متبقي للتحصيل)</p>
          <h2 className="text-xl font-bold text-red-600">{kpis.outstandingReceivables.toLocaleString()} د.ك</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500 col-span-1 md:col-span-2">
          <p className="text-gray-500 text-sm font-semibold mb-2">مؤشرات الأسطول (Vehicles)</p>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="bg-gray-100 px-3 py-1 rounded text-gray-700">إجمالي: {kpis.totalVehicles}</span>
            <span className="bg-green-100 px-3 py-1 rounded text-green-700">جاهز للبيع: {kpis.readyForSale}</span>
            <span className="bg-red-100 px-3 py-1 rounded text-red-700">تحت الإصلاح: {kpis.underRepair}</span>
            <span className="bg-blue-100 px-3 py-1 rounded text-blue-700">تم بيعه: {kpis.soldCount}</span>
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">اتجاه المبيعات والأرباح شهرياً</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlySalesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" name="المبيعات" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" name="الأرباح" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">توزيع المصروفات حسب التصنيف</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {charts.expensesByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit by Make */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 lg:col-span-2">
          <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">الأرباح حسب نوع السيارة (Make)</h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.profitByMake}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="value" name="إجمالي الأرباح المحققة" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
