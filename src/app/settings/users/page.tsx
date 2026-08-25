"use client";

import { useEffect, useState } from "react";

export default function UsersSettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddMode, setIsAddMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", roleName: "Employee" });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/settings/users");
        if (res.status === 403) throw new Error("ليس لديك صلاحية لإدارة المستخدمين");
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        setUsers(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      const res = await fetch("/api/settings/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add user");
      
      setFormData({ name: "", email: "", password: "", roleName: "Employee" });
      setIsAddMode(false);
      await refreshUsers();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/settings/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      await refreshUsers();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div className="text-red-600 font-bold">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
        <button 
          onClick={() => setIsAddMode(!isAddMode)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          {isAddMode ? "إلغاء" : "إضافة مستخدم جديد"}
        </button>
      </div>

      {isAddMode && (
        <form onSubmit={handleAddUser} className="bg-gray-50 p-6 rounded-lg border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">الاسم</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">البريد الإلكتروني</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">كلمة المرور</label>
            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">الدور (Role)</label>
            <select value={formData.roleName} onChange={e => setFormData({...formData, roleName: e.target.value})} className="w-full border px-3 py-2 rounded">
              <option value="Owner">Owner (مالك)</option>
              <option value="Manager">Manager (مدير)</option>
              <option value="Accountant">Accountant (محاسب)</option>
              <option value="Employee">Employee (موظف)</option>
              <option value="Viewer">Viewer (للقراءة فقط)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700">
              حفظ المستخدم
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الاسم</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الدور</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الحالة</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {users.map((user: any) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm font-bold">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <td className="px-4 py-3 text-sm">{user.roles?.map((r: any) => r.role?.name).join(', ')}</td>
                <td className="px-4 py-3 text-sm">
                  {user.isActive ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">نشط</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">معطل</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button 
                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                    className={`px-3 py-1 rounded text-xs font-bold text-white shadow ${user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {user.isActive ? "تعطيل الحساب" : "تنشيط الحساب"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
