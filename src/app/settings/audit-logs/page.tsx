"use client";

import { useEffect, useState } from "react";

export default function AuditLogsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch("/api/settings/audit");
        if (res.status === 403) throw new Error("ليس لديك صلاحية لعرض سجل التدقيق والرقابة");
        if (!res.ok) throw new Error("Failed to load audit logs");
        const json = await res.json();
        setLogs(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const refreshLogs = async () => {
    try {
      const res = await fetch("/api/settings/audit");
      if (!res.ok) throw new Error("Failed to load audit logs");
      const json = await res.json();
      setLogs(json.data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div className="text-red-600 font-bold">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">سجل التدقيق والرقابة (Audit Logs)</h1>
        <button onClick={refreshLogs} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold text-sm">
          تحديث السجل
        </button>
      </div>

      <div className="bg-yellow-50 text-yellow-800 p-4 rounded mb-6 text-sm border border-yellow-200 font-bold">
        هذا السجل مخصص للقراءة فقط (Read-Only). لا يمكن لأي مستخدم تعديل أو حذف هذه السجلات لأسباب رقابية وأمنية.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y border border-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-bold">التاريخ والوقت</th>
              <th className="px-4 py-3 text-right text-sm font-bold">المستخدم</th>
              <th className="px-4 py-3 text-right text-sm font-bold">العملية (Action)</th>
              <th className="px-4 py-3 text-right text-sm font-bold">الكيان (Entity)</th>
              <th className="px-4 py-3 text-right text-sm font-bold">التفاصيل (Details)</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-semibold">{log.user?.name || log.user?.email || 'نظام (System)'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                  {log.entityType} [{log.entityId}]
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-xs truncate" title={JSON.stringify(log.details)}>
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="text-center p-8 text-gray-500">لا يوجد سجلات حتى الآن.</div>}
      </div>
    </div>
  );
}
