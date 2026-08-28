"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { Plus, Wallet, TrendingUp, TrendingDown, Car, Activity, Receipt, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ['#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#3B82F6'];

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl text-white">
        <p className="font-bold text-slate-200 mb-2">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
            {entry.name}: {entry.value.toLocaleString()} BHD
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [kpis, setKpis] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    if (status === "loading") return;

    const fetchDashboard = async () => {
      try {
        const [kpiRes, chartRes] = await Promise.all([
          fetch("/api/dashboard/kpis"),
          fetch("/api/dashboard/charts")
        ]);

        if (kpiRes.status === 401 || kpiRes.status === 403 || chartRes.status === 401 || chartRes.status === 403) {
          router.replace("/auth/signin");
          return;
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
  }, [status, router]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 max-w-7xl mx-auto" dir="rtl">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-xl max-w-2xl mx-auto mt-10">
        <Activity className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-700">{error}</h2>
      </div>
    );
  }

  if (!kpis || !charts) {
    return null; // or empty state if we wanted
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8" dir="rtl">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">نظرة عامة على الأداء</h1>
          <p className="text-slate-500 text-sm mt-1">مؤشرات الأداء المالي وحالة المخزون</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link href="/vehicles/new" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 group">
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" /> سيارة جديدة
          </Link>
          <Link href="/expenses/new" className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 group">
            <Receipt className="w-4 h-4 transition-transform group-hover:scale-110" /> إضافة مصروف
          </Link>
          <Link href="/purchases/new" className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 group">
            <Wallet className="w-4 h-4 text-emerald-600 transition-transform group-hover:scale-110" /> عملية شراء
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Capital */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">رأس المال النشط</p>
              <h2 className="text-3xl font-black text-slate-900">{(kpis?.totalActiveCapital || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400">BHD</span></h2>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
            قيمة السيارات المتاحة حالياً
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">إجمالي المصروفات</p>
              <h2 className="text-3xl font-black text-slate-900">{(kpis?.totalExpenses || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400">BHD</span></h2>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-rose-600">
            <TrendingDown className="w-3 h-3" /> تم احتساب المصروفات المعتمدة فقط
          </div>
        </div>

        {/* Card 3: Total Sales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">إجمالي المبيعات</p>
              <h2 className="text-3xl font-black text-slate-900">{(kpis?.totalSalesRevenue || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400">BHD</span></h2>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">صافي الأرباح</p>
              <h2 className="text-3xl font-black text-slate-900">{(kpis?.totalNetProfit || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400">BHD</span></h2>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 5: Inventory Count */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">السيارات المتاحة</p>
            <h2 className="text-2xl font-black text-slate-900">{kpis?.readyForSale || 0} سيارة</h2>
          </div>
        </div>

        {/* Card 6: Sold Count */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">السيارات المباعة</p>
            <h2 className="text-2xl font-black text-slate-900">{kpis?.soldCount || 0} سيارة</h2>
          </div>
        </div>
        
        {/* Card 7: Maintenance Count */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">تحت الإصلاح</p>
            <h2 className="text-2xl font-black text-slate-900">{kpis?.underRepair || 0} سيارة</h2>
          </div>
        </div>

        {/* Card 8: Average Profit */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">متوسط الربح للسيارة</p>
            <h2 className="text-2xl font-black text-slate-900">{(kpis?.averageProfitPerCar || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm">BHD</span></h2>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Flow Area Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> التدفق المالي (مبيعات مقابل أرباح)
          </h3>
          <div className="h-80 w-full" dir="ltr">
            {charts?.monthlySalesTrend && charts.monthlySalesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlySalesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" name="الأرباح" dataKey="profit" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  <Area type="monotone" name="المبيعات" dataKey="sales" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">لا توجد بيانات مبيعات</div>
            )}
          </div>
        </div>

        {/* Expenses by Category Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-500" /> المصروفات حسب الفئة
          </h3>
          <div className="h-80 w-full" dir="ltr">
            {charts?.expensesByCategory && charts.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.expensesByCategory} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={13} fontWeight="bold" tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="المبلغ" radius={[0, 4, 4, 0]} barSize={24}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {charts.expensesByCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">لا توجد مصاريف معتمدة</div>
            )}
          </div>
        </div>

        {/* Vehicles by Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 max-w-2xl mx-auto w-full">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 justify-center">
            <PieChartIcon className="w-5 h-5 text-amber-500" /> حالة الأسطول
          </h3>
          <div className="h-80 w-full flex justify-center" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { status: "جاهزة للبيع", count: kpis?.readyForSale || 0 },
                    { status: "تحت الإصلاح", count: kpis?.underRepair || 0 },
                    { status: "تم بيعها", count: kpis?.soldCount || 0 },
                  ].filter(v => v.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {[
                    { status: "جاهزة للبيع", count: kpis?.readyForSale || 0 },
                    { status: "تحت الإصلاح", count: kpis?.underRepair || 0 },
                    { status: "تم بيعها", count: kpis?.soldCount || 0 },
                  ].filter(v => v.count > 0).map((entry: { status: string; count: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
