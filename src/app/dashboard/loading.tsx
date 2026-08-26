export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8 max-w-[1400px] mx-auto p-4 md:p-8" dir="rtl">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-100 rounded w-32"></div>
        </div>
        <div className="flex gap-3">
          <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-32 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-20"></div>
                <div className="h-8 bg-slate-300 rounded w-32"></div>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-50 p-4 rounded-xl flex items-center gap-4 h-20">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-16"></div>
              <div className="h-5 bg-slate-300 rounded w-10"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 h-96"></div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-96"></div>
      </div>
    </div>
  );
}
