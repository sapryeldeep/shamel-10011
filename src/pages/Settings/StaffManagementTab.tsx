import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import { Users, Edit3, Plus, Trash2 } from 'lucide-react';

const PERMISSION_GROUPS = [
  {
    title: '💰 المحاسبة، الماليات والحسابات العامة',
    bgColor: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
    permissions: [
      { id: 'accounting', label: 'الاطلاع على الحسابات وشجرة الحسابات' },
      { id: 'accounting_create', label: 'إصدار القيود وسندات القبض والصرف' },
      { id: 'accounting_edit', label: 'تعديل وإلغاء القيود والسندات المالية' },
      { id: 'accounting_delete', label: 'حذف البيانات والحسابات المالية' },
      { id: 'accounting_print', label: 'طباعة الفواتير والتقارير المالية' },
      { id: 'accounting_export', label: 'تصدير البيانات المالية (إكسيل / PDF)' }
    ]
  },
  {
    title: '👥 الاستقبال، المواعيد وخدمات المرضى',
    bgColor: 'bg-blue-50/80 border-blue-200 text-blue-900',
    permissions: [
      { id: 'queue', label: 'إدارة طابور الانتظار وتذاكر الدخول' },
      { id: 'appointments', label: 'حجز وتعديل المواعيد والزيارات' },
      { id: 'patients', label: 'إنشاء وتعديل سجلات المرضى' },
      { id: 'prescription', label: 'إصدار الروشتات والبروتوكولات' }
    ]
  },
  {
    title: '🏥 أقسام المستشفى (الطوارئ / العمليات / التنويم)',
    bgColor: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
    permissions: [
      { id: 'operations', label: 'إدارة غرف العمليات الجراحية (OR)' },
      { id: 'emergency', label: 'قسم الطوارئ والاستقبال الحرِج (ER)' },
      { id: 'inpatient', label: 'القسم الداخلي وتذاكر الإقامة والتنويم' },
      { id: 'lab_rad', label: 'إدارة واستلام نتائج التحاليل والأشعة' }
    ]
  },
  {
    title: '🧪 الصيدلية، المخزون وفواتير الموردين',
    bgColor: 'bg-purple-50/80 border-purple-200 text-purple-900',
    permissions: [
      { id: 'pharmacy', label: 'إدارة الصيدلية ومبيعات الدواء' },
      { id: 'suppliers', label: 'فواتير وحسابات الشركات والموردين' }
    ]
  },
  {
    title: '🛡️ التأمين الصحي والتقارير الطبية',
    bgColor: 'bg-amber-50/80 border-amber-200 text-amber-900',
    permissions: [
      { id: 'insurance', label: 'مطالبات وعقود شركات التأمين' },
      { id: 'reports', label: 'طباعة واستخراج التقارير الإحصائية والسريرية' }
    ]
  }
];

export default function StaffManagementTab() {
  const { state, updateState, currentUser, logAction, checkPasswordUniqueness } = useAppContext();
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);

  // Staff Management for Clinic Admin
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [staffRole, setStaffRole] = useState<'doctor' | 'staff'>('staff');
  const [staffJobTitle, setStaffJobTitle] = useState('موظف استقبال');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffCommission, setStaffCommission] = useState<number | ''>('');
  const [staffPerms, setStaffPerms] = useState<string[]>(['queue', 'appointments']);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const toggleStaffPerm = (p: string) => {
    setStaffPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const resetStaffForm = () => {
    setEditingStaffId(null);
    setStaffName(''); 
    setStaffUsername(''); 
    setStaffPass(''); 
    setStaffRole('staff'); 
    setStaffJobTitle('موظف استقبال'); 
    setStaffPhone(''); 
    setStaffCommission('');
    setStaffPerms(['queue', 'appointments']);
  };

  const editStaff = (u: User) => {
    if (u.role === 'master_admin') {
      return alert('غير مسموح بتعديل حساب المطور الرئيسي من إعدادات المنشأة الفرعية!');
    }
    setEditingStaffId(u.id);
    setStaffName(u.name);
    setStaffUsername(u.username);
    setStaffPass(u.pass);
    setStaffRole(u.role);
    setStaffJobTitle(u.jobTitle || (u.role === 'doctor' ? 'طبيب مختص' : 'موظف'));
    setStaffPhone(u.phone || '');
    setStaffCommission(u.commissionRate || '');
    setStaffPerms(u.perms || ['queue', 'appointments']);
  };

  const saveStaff = () => {
    if (!staffName.trim() || !staffUsername.trim() || !staffPass.trim() || !currentClinic) {
      return alert('يرجى ملء كافة الحقول الأساسية المطلوبة (الاسم، اسم المستخدم، وكلمة المرور)');
    }

    const trimmedUser = staffUsername.trim().toLowerCase();
    const enforcedClinicId = String(currentClinic.id);

    // Audit check for unique password
    const pwCheck = checkPasswordUniqueness(staffPass, editingStaffId || undefined);
    if (!pwCheck.isUnique) {
      return alert(`عفواً، تم اكتشاف تطابق/تشابه في كلمة المرور المحددة مع حساب آخر بالمنظومة («${pwCheck.conflictUser?.name}»)! لأمان الخصوصية التامة ومنع تداخل الحسابات، يرجى كتابة كلمة مرور فريدة وقوية!`);
    }

    if (editingStaffId) {
      const targetUser = state.users.find(u => String(u.id) === String(editingStaffId));
      if (!targetUser) return alert('تعذر العثور على الموظف المراد تعديله');

      if (targetUser.role === 'master_admin') {
        return alert('غير مسموح بتعديل حساب المطور الرئيسي من هذه اللوحة!');
      }

      if (String(targetUser.clinicId) !== enforcedClinicId && currentUser?.role !== 'master_admin') {
        return alert('لا تملك صلاحية تعديل موظف تابع لمنشأة أخرى!');
      }

      const conflict = state.users.find(u => 
        (u.username || '').trim().toLowerCase() === trimmedUser && 
        String(u.id) !== String(editingStaffId)
      );
      if (conflict) {
        return alert(`اسم المستخدم "${staffUsername}" مستخدم بالفعل لحساب آخر! يرجى اختيار اسم مستخدم مختلف لعدم تداخل الحسابات.`);
      }

      updateState({
        users: state.users.map(u => String(u.id) === String(editingStaffId) ? {
          ...u,
          name: staffName.trim(),
          username: staffUsername.trim(),
          pass: staffPass.trim(),
          role: staffRole === 'master_admin' ? 'doctor' : staffRole,
          jobTitle: staffJobTitle,
          phone: staffPhone,
          clinicId: enforcedClinicId,
          commissionRate: staffRole === 'doctor' ? (Number(staffCommission) || 0) : undefined,
          perms: staffRole === 'staff' ? staffPerms : undefined
        } : u)
      });
      logAction('تعديل موظف', `تم تعديل بيانات الموظف: ${staffName}`);
      resetStaffForm();
    } else {
      const existingUser = state.users.find(u => (u.username || '').trim().toLowerCase() === trimmedUser);
      if (existingUser) return alert('اسم المستخدم موجود بالفعل! يرجى اختيار اسم مستخدم آخر لعدم تداخل الحسابات.');

      const newUser: User = {
        id: Date.now().toString(),
        name: staffName.trim(),
        username: staffUsername.trim(),
        pass: staffPass.trim(),
        role: staffRole === 'master_admin' ? 'doctor' : staffRole,
        jobTitle: staffJobTitle,
        phone: staffPhone || '--',
        clinicId: enforcedClinicId,
        commissionRate: staffRole === 'doctor' ? (Number(staffCommission) || 0) : undefined,
        perms: staffRole === 'staff' ? staffPerms : undefined
      };
      updateState({ users: [...state.users, newUser] });
      logAction('إضافة موظف للمنشأة', `تم إضافة موظف جديد: ${staffName} (${staffJobTitle})`);
      resetStaffForm();
    }
  };

  const removeStaff = (id: string) => {
    const targetUser = state.users.find(u => String(u.id) === String(id));
    if (!targetUser) return;

    if (targetUser.role === 'master_admin') {
      return alert('لا يمكن حذف حساب المطور الرئيسي للنظام!');
    }
    if (String(targetUser.clinicId) !== String(currentClinic?.id) && currentUser?.role !== 'master_admin') {
      return alert('لا تملك صلاحية حذف موظف تابع لمنشأة أخرى!');
    }
    if (String(targetUser.id) === String(currentUser?.id)) {
      return alert('لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول منه!');
    }

    updateState({ users: state.users.filter(u => String(u.id) !== String(id)) });
    logAction('حذف موظف', `تم حذف الموظف: ${targetUser.name} (${targetUser.username})`);
  };

  const clinicStaff = state.users.filter(
    u => String(u.clinicId) === String(currentClinic?.id) && String(u.id) !== String(currentUser?.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="font-bold text-teal-700 text-base flex items-center gap-2">
            <Users size={20} /> إدارة حسابات موظفي المنشأة والصلاحيات (Staff & Roles)
          </h6>
          <p className="text-xs text-slate-500 mt-0.5">
            بصفتك مدير المنشأة، يمكنك إنشاء وتعديل حسابات موظفيك (استقبال، تمريض، أطباء، صيدلي) وتحديد صلاحيات كل موظف
          </p>
        </div>
        <span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-lg text-xs border border-teal-200">
          {clinicStaff.length} موظف مسجل
        </span>
      </div>
      
      {/* Staff Form */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <h6 className="font-bold text-xs text-slate-700 mb-3 flex items-center gap-1.5">
          {editingStaffId ? <Edit3 size={15} className="text-amber-600" /> : <Plus size={15} className="text-teal-600" />}
          {editingStaffId ? 'تعديل بيانات الموظف والصلاحيات' : 'إضافة موظف جديد للمنشأة'}
        </h6>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">الاسم الكامل</label>
            <input 
              type="text" 
              placeholder="مثال: سارة أحمد..."
              value={staffName} 
              onChange={e => setStaffName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع الدور</label>
            <select 
              value={staffRole} 
              onChange={e => setStaffRole(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-teal-500 outline-none font-semibold"
            >
              <option value="staff">موظف (استقبال / تمريض / صيدلي)</option>
              <option value="doctor">طبيب معالج / مختص</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">المسمى الوظيفي</label>
            <input 
              type="text" 
              placeholder="استقبال، تمريض، صيدلي..."
              value={staffJobTitle} 
              onChange={e => setStaffJobTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم الهاتف (اختياري)</label>
            <input 
              type="text" 
              placeholder="010XXXXXXXX"
              value={staffPhone} 
              onChange={e => setStaffPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الدخول (Username للدخول) <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="sara.reception"
              value={staffUsername} 
              onChange={e => setStaffUsername(e.target.value)}
              dir="ltr"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-teal-700 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">كلمة المرور (Password) <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="pass1234"
              value={staffPass} 
              onChange={e => setStaffPass(e.target.value)}
              dir="ltr"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">عمولة الطبيب % (إن وجد)</label>
            <input 
              type="number" 
              placeholder="مثال: 20%"
              value={staffCommission} 
              onChange={e => setStaffCommission(e.target.value ? Number(e.target.value) : '')}
              disabled={staffRole !== 'doctor'}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-teal-500 outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Staff Permissions Matrix with Presets */}
        <div className="mb-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h6 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Users size={16} className="text-teal-600" /> مصفوفة صلاحيات الحساب والوحدات (Staff Permission Matrix)
              </h6>
              <p className="text-[11px] text-slate-500">
                حدد الصلاحيات المسموح بها لهذا الحساب بدقة، أو استخدم قوالب الأدوار الجاهزة بنقرة واحدة
              </p>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400">قوالب سريعة:</span>
              <button
                type="button"
                onClick={() => setStaffPerms(['accounting', 'accounting_create', 'accounting_edit', 'accounting_print', 'accounting_export', 'suppliers'])}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                💳 محاسب مالي
              </button>
              <button
                type="button"
                onClick={() => setStaffPerms(['queue', 'appointments', 'patients', 'prescription'])}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                🏢 موظف استقبال
              </button>
              <button
                type="button"
                onClick={() => setStaffPerms(['pharmacy', 'suppliers'])}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                🧪 صيدلي ومخزن
              </button>
              <button
                type="button"
                onClick={() => setStaffPerms(['patients', 'prescription', 'operations', 'reports'])}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                🩺 طبيب معالج
              </button>
              <button
                type="button"
                onClick={() => setStaffPerms([])}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                تفريغ الكل
              </button>
            </div>
          </div>

          {/* Grouped Permission Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PERMISSION_GROUPS.map((group, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border ${group.bgColor}`}>
                <div className="font-black text-xs mb-2.5 pb-1.5 border-b border-black/10 flex items-center justify-between">
                  <span>{group.title}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const groupIds = group.permissions.map(p => p.id);
                      const allChecked = groupIds.every(id => staffPerms.includes(id));
                      if (allChecked) {
                        setStaffPerms(prev => prev.filter(x => !groupIds.includes(x)));
                      } else {
                        setStaffPerms(prev => Array.from(new Set([...prev, ...groupIds])));
                      }
                    }}
                    className="text-[10px] font-bold underline cursor-pointer opacity-80 hover:opacity-100"
                  >
                    تحديد/إلغاء المجموعة
                  </button>
                </div>

                <div className="space-y-1.5">
                  {group.permissions.map(p => {
                    const isChecked = staffPerms.includes(p.id);
                    return (
                      <label 
                        key={p.id} 
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-white border-teal-500 shadow-2xs font-bold text-slate-800' 
                            : 'bg-white/60 border-black/5 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span className="text-[11px]">{p.label}</span>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => toggleStaffPerm(p.id)} 
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={saveStaff}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {editingStaffId ? <Edit3 size={16} /> : <Plus size={16} />}
            {editingStaffId ? 'حفظ تعديلات الموظف' : 'إضافة الموظف واعتماد الحساب'}
          </button>
          {editingStaffId && (
            <button 
              onClick={resetStaffForm}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* Staff List Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden custom-scrollbar bg-white">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">اسم الموظف</th>
              <th className="px-4 py-3">بيانات الدخول</th>
              <th className="px-4 py-3">الوظيفة والدور</th>
              <th className="px-4 py-3">الصلاحيات</th>
              <th className="px-4 py-3 text-center w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clinicStaff.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-slate-400">لم تقم بإضافة أي موظفين بعد. استخدم النموذج أعلاه لإنشاء حساب لموظفي الاستقبال والتمريض!</td></tr>
            ) : clinicStaff.map((u, i) => (
              <tr key={u.id || `staff-${i}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                <td className="px-4 py-2.5">
                  <strong className="block text-slate-800 font-bold">{u.name}</strong>
                  {u.phone && <span className="text-[11px] text-slate-400" dir="ltr">{u.phone}</span>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  <span className="text-teal-700 font-bold">{u.username}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-600">{u.pass}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                    u.role === 'doctor' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.jobTitle || (u.role === 'doctor' ? 'طبيب' : 'موظف')}
                  </span>
                  {u.role === 'doctor' && u.commissionRate ? (
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">عمولة: {u.commissionRate}%</div>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-600">
                  {u.role === 'doctor' ? (
                    <span className="text-blue-600 font-bold">صلاحيات الطبيب الكاملة</span>
                  ) : (
                    u.perms?.length ? u.perms.map(p => {
                      for (const group of PERMISSION_GROUPS) {
                        const found = group.permissions.find(x => x.id === p);
                        if (found) return found.label;
                      }
                      return p;
                    }).join('، ') : 'بدون صلاحيات'
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => editStaff(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer" title="تعديل">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => removeStaff(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer" title="حذف">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
