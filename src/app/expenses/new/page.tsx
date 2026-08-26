"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Camera, ScanSearch, CheckCircle2, AlertCircle } from "lucide-react";

function NewExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVehicleId = searchParams.get("vehicleId") || "";

  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vehicles, setVehicles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: "",
    vehicleId: preselectedVehicleId,
    amount: "",
    date: "",
    description: "",
    vendorName: "",
    referenceNumber: "",
    status: "PENDING" // Default to pending for approval
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles?limit=200").then(r => r.json()),
      fetch("/api/expenses/categories").then(r => r.json())
    ]).then(([vData, cData]) => {
      if (vData.data) setVehicles(vData.data);
      if (cData.data) setCategories(cData.data);
    }).catch(err => console.error("Error loading dropdown data:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setOcrLoading(true);
    setError(null);
    setOcrSuccess(null);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        body: uploadData,
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "فشل قراءة الفاتورة");

      const extracted = result.data;
      
      // Attempt to auto-match category
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchedCategory = categories.find((c: any) => c.name.includes(extracted.suggestedCategory));

      setFormData(prev => ({
        ...prev,
        vendorName: extracted.vendorName || prev.vendorName,
        date: extracted.date || prev.date,
        amount: extracted.amount ? String(extracted.amount) : prev.amount,
        referenceNumber: extracted.invoiceNumber || prev.referenceNumber,
        categoryId: matchedCategory ? matchedCategory.id : prev.categoryId,
        description: prev.description || "مصروف مستخرج آلياً"
      }));

      setOcrSuccess("تم قراءة الفاتورة بنجاح. يرجى مراجعة البيانات وتأكيدها.");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { ...formData };
    payload.amount = Number(payload.amount);
    
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create expense");
      }
      router.push("/expenses");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">تسجيل مصروف أو فاتورة</h1>
        <Link href="/expenses" className="text-slate-500 font-bold hover:text-slate-700">العودة</Link>
      </div>

      {/* AI OCR Section */}
      <div className="mb-6 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <ScanSearch className="w-6 h-6" />
        </div>
        <h3 className="text-indigo-900 font-bold mb-2">الاستخراج الذكي للفواتير (AI OCR)</h3>
        <p className="text-indigo-600 text-sm mb-4">التقط أو ارفع صورة الفاتورة ليقوم الذكاء الاصطناعي بتعبئة الحقول تلقائياً.</p>
        
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef}
          onChange={handleOcrUpload} 
          className="hidden" 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={ocrLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {ocrLoading ? (
            <span className="animate-pulse">جاري قراءة الفاتورة...</span>
          ) : (
            <><Camera className="w-5 h-5" /> التقاط أو رفع فاتورة</>
          )}
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>}
      {ocrSuccess && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> {ocrSuccess}</div>}

      <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">الفئة *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">اختر فئة المصروف...</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">السيارة (اختياري)</label>
            <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">مصروف عام (بدون سيارة)</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {vehicles.map((v: any) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.vehicleCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">المبلغ (BHD) *</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0.01" step="0.01" required className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">تاريخ الفاتورة *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">البيان / الوصف</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="تفاصيل الإصلاح أو الصرف..." />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">اسم المورد / الورشة</label>
            <input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-bold text-slate-800">رقم الفاتورة المرجعي</label>
            <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 bg-slate-50 text-slate-900 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          
          {/* Note on approval */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">
            <span className="text-amber-600 font-bold">ملاحظة:</span> سيتم إرسال هذا المصروف للمراجعة والاعتماد المالي من قبل الإدارة. ولن يدخل في التكاليف حتى يتم الموافقة عليه (حالة PENDING).
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 font-black text-white py-4 rounded-xl shadow-lg disabled:opacity-50 mt-4 transition-transform active:scale-95">
            {loading ? "جاري الإرسال للموافقة..." : "حفظ وإرسال للاعتماد"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" dir="rtl">جاري التحميل...</div>}>
      <NewExpenseForm />
    </Suspense>
  );
}
