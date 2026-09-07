import React, { useState } from 'react';
import { Users, AlertTriangle , Search, Plus, Edit3, Trash2, Key, Shield } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';


export default function UsersManager() {
  const { state, updateState, logAction, currentUser, checkPasswordUniqueness } = useAppContext();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState<'doctor' | 'staff'>('staff');
  const [jobTitle, setJobTitle] = useState('موظف استقبال');
  const [clinicId, setClinicId] = useState('');
  const [perms, setPerms] = useState<string[]>(['queue', 'appointments']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);

  const togglePerm = (p: string) => {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const saveUser = () => {
    if (!name.trim() || !username.trim() || !pass.trim() || !clinicId) {
      return alert('يرجى ملء جميع الحقول المطلوبة (الاسم، المستخدم، كلمة المرور، والمنشأة)');
    }

    const trimmedUser = username.trim().toLowerCase();

    // Audit check for unique password
    const pwCheck = checkPasswordUniqueness(pass, editingId || undefined);
    if (!pwCheck.isUnique) {
      return alert(`عفواً، تم اكتشاف تطابق/تشابه في كلمة المرور المحددة مع حساب آخر بالمنظومة («${pwCheck.conflictUser?.name}»)! لأمان الخصوصية ومنع تداخل البيانات، يرجى كتابة كلمة مرور فريدة وقوية!`);
    }
    
    if (editingId) {
      const conflict = state.users.find(u => 
        (u.username || '').trim().toLowerCase() === trimmedUser && 
        String(u.id) !== String(editingId)
      );
      if (conflict) {
        return alert(`اسم المستخدم "${username}" مستخدم بالفعل لحساب آخر! يرجى اختيار اسم مستخدم مختلف.`);
      }

      updateState({
        users: state.users.map(u => u.id === editingId ? { 
          ...u, name: name.trim(), username: username.trim(), pass: pass.trim(), role, jobTitle, clinicId, perms 
        } : u)
      });
      logAction('تعديل مستخدم', `تم تعديل المستخدم: ${name}`);
    } else {
      const existing = state.users.find(u => (u.username || '').trim().toLowerCase() === trimmedUser);
      if (existing) return alert('اسم المستخدم موجود بالفعل! يرجى اختيار اسم آخر.');

      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        username: username.trim(),
        pass: pass.trim(),
        role,
        jobTitle,
        clinicId,
        perms
      };
      updateState({ users: [...state.users, newUser] });
      logAction('إضافة مستخدم جديد', `تم إضافة المستخدم: ${name} (${username})`);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setUsername(''); setPass(''); setRole('staff'); setJobTitle('موظف استقبال'); setClinicId(''); setPerms(['queue', 'appointments']);
  };

  const editUser = (u: User) => {
    setEditingId(u.id);
    setName(u.name); setUsername(u.username); setPass(u.pass);
    setRole(u.role); setJobTitle(u.jobTitle || 'موظف'); setClinicId(u.clinicId); setPerms(u.perms || []);
  };

  const confirmRemoveUser = (u: User) => {
    if (!u) return;
    if (u.role === 'master_admin') {
      return alert('لا يمكن حذف حساب المطور الرئيسي أو المدير العام للنظام!');
    }
    if (String(u.id) === String(currentUser?.id)) {
      return alert('لا يمكنك حذف حسابك الحالي المفتوح الآن!');
    }
    updateState({ users: state.users.filter(item => String(item.id) !== String(u.id)) });
    logAction('حذف مستخدم', `تم حذف المستخدم: ${u.name} (${u.username})`);
    setDeleteUserTarget(null);
  };

  const normalUsers = state.users.filter(u => u.role !== 'master_admin');

  return (
    <div>
      <h6 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
        <Users size={20} className="text-blue-600" /> إدارة جميع مستخدمي النظام والصلاحيات
      </h6>
      
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
        <h6 className="font-bold text-sm text-slate-700 mb-4">{editingId ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد إلى منشأة'}</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">المنشأة التابع لها</label>
            <select value={clinicId} onChange={e => setClinicId(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors">
              <option value="">اختر المنشأة...</option>
              {state.clinics.map((c, i) => <option key={c.id || `clinic-${i}`} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors" placeholder="اسم الموظف..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">نوع الحساب</label>
            <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors">
              <option value="doctor">طبيب / مدير منشأة</option>
              <option value="staff">موظف (استقبال / تمريض / معمل / صيدلية)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">المسمى الوظيفي</label>
            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors" placeholder="استقبال، تمريض، فني..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">اسم الدخول (Username)</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-colors" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">كلمة المرور (Password)</label>
            <input type="text" value={pass} onChange={e => setPass(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500 transition-colors" dir="ltr" />
          </div>
        </div>

        {role === 'staff' && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-2">الصلاحيات الممنوحة للموظف</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PERMISSIONS_LIST.map(p => (
                <label key={p.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                  <input type="checkbox" checked={perms.includes(p.id)} onChange={() => togglePerm(p.id)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="font-semibold text-slate-700">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={saveUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2">
            {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
            {editingId ? 'حفظ التعديلات' : 'إضافة المستخدم'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded-lg text-sm transition-colors">
              إلغاء
            </button>
          )}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">الاسم / الدخول</th>
              <th className="px-4 py-3">النوع والوظيفة</th>
              <th className="px-4 py-3">المنشأة</th>
              <th className="px-4 py-3">الصلاحيات</th>
              <th className="px-4 py-3 text-center w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {normalUsers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-slate-400">لا يوجد مستخدمين مسجلين حالياً</td></tr>
            ) : normalUsers.map((u, i) => {
              const c = state.clinics.find(cl => String(cl.id) === String(u.clinicId));
              return (
              <tr key={u.id || `user-${i}`} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                <td className="px-4 py-3">
                  <strong className="block text-slate-800">{u.name}</strong>
                  <span className="text-xs font-mono text-blue-600">{u.username} / {u.pass}</span>
                </td>
                <td className="px-4 py-3">
                  {u.role === 'doctor' ? (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold border border-blue-100">طبيب / مدير</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200">{u.jobTitle || 'موظف'}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{c?.name || 'مجهول'}</td>
                <td className="px-4 py-3 text-xs">
                  {u.role === 'doctor' ? (
                    <span className="text-emerald-600 font-bold">صلاحيات كاملة للمنشأة</span>
                  ) : (
                    u.perms?.length ? u.perms.map(p => PERMISSIONS_LIST.find(x => x.id === p)?.label).join('، ') : 'بلا صلاحيات'
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => editUser(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="تعديل">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setDeleteUserTarget(u)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {deleteUserTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h5 className="font-bold text-slate-800 text-base mb-2">تأكيد حذف المستخدم</h5>
            <p className="text-xs text-slate-500 mb-5">هل أنت متأكد من حذف المستخدم «{deleteUserTarget.name}»؟</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => confirmRemoveUser(deleteUserTarget)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs">
                حذف نهائي
              </button>
              <button onClick={() => setDeleteUserTarget(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export const PERMISSIONS_LIST = [
  { id: 'add_patient', label: 'إضافة مرضى' },
  { id: 'edit_patient', label: 'تعديل المرضى' },
  { id: 'view_reports', label: 'عرض التقارير' },
  { id: 'manage_inventory', label: 'إدارة المخزون' },
  { id: 'manage_billing', label: 'إدارة الفواتير' },
  { id: 'manage_appointments', label: 'إدارة المواعيد' },
  { id: 'manage_er', label: 'إدارة الطوارئ' },
  { id: 'manage_or', label: 'إدارة العمليات' },
  { id: 'manage_inpatient', label: 'إدارة التنويم' },
  { id: 'manage_settings', label: 'تعديل الإعدادات' }
];
