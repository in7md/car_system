"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    crNumber: "",
    currency: "BHD",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/system");
        if (!res.ok) throw new Error("Failed to load settings");
        const json = await res.json();
        
        setSettings({
          businessName: json.data.businessName || "",
          businessPhone: json.data.businessPhone || "",
          businessAddress: json.data.businessAddress || "",
          crNumber: json.data.crNumber || "",
          currency: json.data.currency || "BHD",
        });
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch("/api/settings/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">الإعدادات العامة للنظام</h1>
      
      {error && <div className="p-4 bg-red-50 text-red-600 rounded mb-4">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 rounded mb-4 font-bold">تم حفظ الإعدادات بنجاح.</div>}

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        
        <div className="bg-gray-50 p-6 rounded border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">هوية النظام (الشعار)</h2>
            <p className="text-sm text-slate-500 mb-4">هذا هو الشعار الافتراضي للنظام والمستخدم في كافة الواجهات والتقارير.</p>
          </div>
          <div className="p-4 bg-[#0F172A] rounded-xl shadow-inner">
            <Logo />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded border">
          <h2 className="text-lg font-bold mb-4">بيانات المعرض / الشركة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">الاسم التجاري</label>
              <input 
                type="text" 
                value={settings.businessName} 
                onChange={e => setSettings({...settings, businessName: e.target.value})} 
                className="w-full border px-3 py-2 rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">رقم السجل التجاري (CR)</label>
              <input 
                type="text" 
                value={settings.crNumber} 
                onChange={e => setSettings({...settings, crNumber: e.target.value})} 
                className="w-full border px-3 py-2 rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">رقم الهاتف</label>
              <input 
                type="text" 
                value={settings.businessPhone} 
                onChange={e => setSettings({...settings, businessPhone: e.target.value})} 
                className="w-full border px-3 py-2 rounded" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">العنوان</label>
              <textarea 
                value={settings.businessAddress} 
                onChange={e => setSettings({...settings, businessAddress: e.target.value})} 
                className="w-full border px-3 py-2 rounded" 
                rows={2}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded border">
          <h2 className="text-lg font-bold mb-4">الإعدادات المالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">العملة الافتراضية</label>
              <select 
                value={settings.currency} 
                onChange={e => setSettings({...settings, currency: e.target.value})} 
                className="w-full border px-3 py-2 rounded"
              >
                <option value="BHD">دينار بحريني (BHD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-blue-600 text-white font-bold px-8 py-3 rounded hover:bg-blue-700 shadow disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>

      </form>
    </div>
  );
}
