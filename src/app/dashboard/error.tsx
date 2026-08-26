"use client";

import { useEffect } from "react";
import { Activity, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error Boundaries Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center" dir="rtl">
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-lg w-full shadow-lg">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Activity className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">تعذر تحميل بيانات اللوحة</h2>
        <p className="text-slate-600 mb-8 font-medium leading-relaxed">
          نعتذر، حدث خطأ غير متوقع أثناء محاولة جلب الإحصائيات أو أن البيانات غير مكتملة حالياً. يمكنك إعادة المحاولة.
          <br />
          <span className="text-xs text-rose-400 mt-2 block font-mono bg-white p-2 rounded-lg border border-rose-100">
            {error.message}
          </span>
        </p>
        
        <button
          onClick={() => reset()}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCcw className="w-5 h-5" /> إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
