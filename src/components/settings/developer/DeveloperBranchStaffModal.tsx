import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, Key, Shield, Check, Phone, UserCheck } from 'lucide-react';
import { Clinic, User } from '../../../types';

interface DeveloperBranchStaffModalProps {
  clinic: Clinic | null;
  users: User[];
  onClose: () => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export default function DeveloperBranchStaffModal({
  clinic,
  users,
  onClose,
  onAddUser,
  onDeleteUser
}: DeveloperBranchStaffModalProps) {
  if (!clinic) return null;

  const clinicStaff = users.filter(u => u.clinicId === clinic.id);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('مدير فرع');
  const [role, setRole] = useState<'doctor' | 'staff'>('staff');

  // Specific permissions
  const [selectedPerms, setSelectedPerms] = useState<string[]>([
    'queue', 'patients', 'appointments', 'rx', 'billing'
  ]);

  const togglePerm = (perm: string) => {
    if (selectedPerms.includes(perm)) {
      setSelectedPerms(selectedPerms.filter(p => p !== perm));
    } else {
      setSelectedPerms([...selectedPerms, perm]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !pass.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      pass: pass.trim(),
      role: jobTitle === 'طبيب / استشاري' ? 'doctor' : role,
      jobTitle,
      clinicId: clinic.id,
      phone: phone.trim(),
      perms: selectedPerms
    };

    onAddUser(newUser);
    setName('');
    setUsername('');
    setPass('');
    setPhone('');
    alert('تم إضافة الموظف وتسكينه بالمنشأة بنجاح!');
  };

  const generatePass = () => {
    const chars = '1234567890abcdefghjkmnpqrstuvwxyz';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPass(res);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm">تسكين وإدارة كوادر وموظفي المنشأة</h3>
              <span className="text-xs text-slate-400 font-bold">{clinic.name}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          
          {/* Add Staff Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" />
              إضافة موظف / كادر جديد للمنشأة
            </h4>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: د. أحمد فؤاد"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
                  <select
                    value={jobTitle}
                    onChange={e => {
                      setJobTitle(e.target.value);
                      if (e.target.value === 'طبيب / استشاري') setRole('doctor');
                      else setRole('staff');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="مدير فرع">مدير فرع (Branch Manager)</option>
                    <option value="موظف استقبال">موظف استقبال (Receptionist)</option>
                    <option value="محاسب وخزينة">محاسب وخزينة (Accountant)</option>
                    <option value="طبيب / استشاري">طبيب / استشاري (Doctor)</option>
                    <option value="صيدلي">صيدلي (Pharmacist)</option>
                    <option value="تمريض">طاقم تمريض (Nurse)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم (Username)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="dr_ahmed"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">كلمة المرور (Password)</label>
                    <button
                      type="button"
                      onClick={generatePass}
                      className="text-[11px] text-blue-600 font-bold hover:underline"
                    >
                      توليد كلمة سر
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">صلاحيات الوصول الأساسية:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'queue', label: 'طابور الانتظار' },
                    { id: 'patients', label: 'ملفات المرضى' },
                    { id: 'appointments', label: 'المواعيد والحجوزات' },
                    { id: 'rx', label: 'الروشتة الطبية' },
                    { id: 'billing', label: 'الفواتير والخزينة' },
                    { id: 'pharmacy', label: 'الصيدلية والمخزون' },
                    { id: 'operations', label: 'أقسام الطوارئ والعمليات' },
                    { id: 'reports', label: 'التقارير الطبية' }
                  ].map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(p.id)}
                        onChange={() => togglePerm(p.id)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="font-medium text-slate-700">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={16} />
                  <span>حفظ وتسكين الموظف</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                الكوادر والمستخدمين الحاليين بالمنشأة ({clinicStaff.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">المسمى الوظيفي</th>
                    <th className="p-3">اسم المستخدم</th>
                    <th className="p-3">كلمة المرور</th>
                    <th className="p-3">الهاتف</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clinicStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        لا يوجد موظفين إضافيين مسجلين لهذه المنشأة حالياً (فقط حساب المشرف الرئيسي).
                      </td>
                    </tr>
                  ) : (
                    clinicStaff.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{u.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[10px]">
                            {u.jobTitle || (u.role === 'doctor' ? 'طبيب' : 'طاقم عمل')}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-700 font-bold">{u.username}</td>
                        <td className="p-3 font-mono text-slate-500">{u.pass}</td>
                        <td className="p-3 font-mono text-slate-600">{u.phone || '-'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف الموظف (${u.name})؟`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الموظف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
