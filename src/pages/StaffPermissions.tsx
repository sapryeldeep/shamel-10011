import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Role } from '../types';
import { 
  Users, Plus, Edit3, Trash2, ShieldAlert, Key, 
  Check, Lock, Unlock, Search, UserCheck, 
  Eye, EyeOff, UserPlus, Settings, CheckSquare, Square
} from 'lucide-react';

export const STAFF_PERMISSIONS = [
  { id: 'queue', label: 'طابور الانتظار والاستقبال', desc: 'إدارة حركة المرضى في الطابور والنداء الصوتي الذكي' },
  { id: 'appointments', label: 'المواعيد والحجوزات', desc: 'جدولة مواعيد المرضى والعمليات والاستشارات' },
  { id: 'patients', label: 'ملفات وسجلات المرضى', desc: 'استعراض وتعديل السجلات الطبية والملفات والتقارير' },
  { id: 'prescription', label: 'الوصفات والروشتات الطبية', desc: 'كتابة الروشتات الإلكترونية والجرعات والطباعة المباشرة' },
  { id: 'operations', label: 'أقسام الطوارئ والعمليات والتنويم', desc: 'التحكم في حجز العمليات والأسرة وحالات الطوارئ (ER/OR)' },
  { id: 'pharmacy', label: 'المخزون والصيدلية', desc: 'إدارة جرد الأدوية والمستلزمات الطبية والتحذير من نفاذ المخزون' },
  { id: 'reports', label: 'التقارير الطبية والسريرية', desc: 'إصدار تقارير المرضى وإضافة الفحوصات الطبية للمعمل والأشعة' },
  { id: 'insurance', label: 'التأمين الطبي ومطالبات TPA', desc: 'إدارة شركات التأمين ونسب تحمل المريض وإرسال المطالبات المباشرة' },
  { id: 'accounting', label: 'الاطلاع على النظام المالي والحسابات', desc: 'صلاحية عرض شجرة الحسابات العامة ودفاتر اليومية والميزانية' },
  { id: 'accounting_edit', label: 'تعديل وإضافة السندات المالية والقيود', desc: 'إضافة القيود اليومية يدوياً وصرف السندات والتسويات' },
  { id: 'accounting_print', label: 'صلاحية طباعة التقارير والبيانات المالية', desc: 'تمكين أزرار طباعة الدفاتر والسجلات المالية وتقارير الأرباح' },
  { id: 'accounting_export', label: 'صلاحية تصدير البيانات المالية (إكسل/PDF)', desc: 'تنزيل القيود والأرصدة كملفات خارجية مشفرة للحاسب الشخصي' }
];

export default function StaffPermissions() {
  const { state, updateState, currentUser, logAction, checkPasswordUniqueness } = useAppContext();
  
  // Enforce clinic-level security. Only doctors (clinic owners/admins) and master developers can access.
  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const isClinicAdmin = currentUser?.role === 'doctor';
  const hasAccess = isMaster || isClinicAdmin;

  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const allowStaffRoleCreation = isMaster || (currentClinic?.allowStaffRoleCreation !== false);

  // Filter staff to ensure STRICT separation. A clinic can ONLY see its own staff.
  const clinicStaff = useMemo(() => {
    if (!currentClinic && !isMaster) return [];
    if (isMaster) {
      // In master mode, show all users except master accounts, or group them beautifully
      return state.users.filter(u => u.role !== 'master_admin');
    }
    return state.users.filter(
      u => String(u.clinicId) === String(currentClinic?.id) && String(u.id) !== String(currentUser?.id)
    );
  }, [state.users, currentClinic, currentUser, isMaster]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const filteredStaff = useMemo(() => {
    return clinicStaff.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clinicStaff, searchTerm]);

  // Form State
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [staffRole, setStaffRole] = useState<'doctor' | 'staff'>('staff');
  const [staffJobTitle, setStaffJobTitle] = useState('موظف استقبال');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffCommission, setStaffCommission] = useState<number | ''>('');
  const [staffPerms, setStaffPerms] = useState<string[]>(['queue', 'appointments']);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Extra UI helpers
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto my-12 space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-800">عفواً، صلاحية غير كافية!</h4>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
            هذا القسم مخصص حصرياً لمدير العيادة، المستشفى، أو المركز الطبي الرئيسي لإدارة وتعديل صلاحيات وحسابات طاقم العمل والموظفين.
          </p>
        </div>
      </div>
    );
  }

  const toggleStaffPerm = (p: string) => {
    setStaffPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const selectAllPerms = () => {
    setStaffPerms(STAFF_PERMISSIONS.map(p => p.id));
  };

  const clearAllPerms = () => {
    setStaffPerms([]);
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
    setFormError(null);
    setFormSuccess(null);
  };

  const editStaff = (u: User) => {
    setEditingStaffId(u.id);
    setStaffName(u.name);
    setStaffUsername(u.username);
    setStaffPass(u.pass);
    setStaffRole(u.role === 'master_admin' ? 'doctor' : u.role);
    setStaffJobTitle(u.jobTitle || (u.role === 'doctor' ? 'طبيب مختص' : 'موظف'));
    setStaffPhone(u.phone || '');
    setStaffCommission(u.commissionRate || '');
    setStaffPerms(u.perms || ['queue', 'appointments']);
    setFormError(null);
    setFormSuccess(null);
  };

  const saveStaff = () => {
    setFormError(null);
    setFormSuccess(null);

    if (!allowStaffRoleCreation) {
      setFormError('عذراً، قام المطور بإيقاف صلاحية إنشاء وتعديل أداور وحسابات الكادر لهذه المنشأة.');
      return;
    }

    if (!staffName.trim() || !staffUsername.trim() || !staffPass.trim()) {
      setFormError('يرجى ملء كافة الحقول الأساسية المطلوبة: (الاسم الكامل، اسم المستخدم، كلمة المرور)');
      return;
    }

    if (staffPass.length < 4) {
      setFormError('يجب أن لا تقل كلمة المرور الخاصة بالموظف عن 4 خانات لضمان أمان النظام.');
      return;
    }

    const trimmedUser = staffUsername.trim().toLowerCase();
    
    // Auto assign current clinic Id or let master admin choose (if in master view)
    let enforcedClinicId = currentClinic?.id || '';
    if (isMaster) {
      // In master developer view, default to first clinic or master
      enforcedClinicId = state.clinics[0]?.id || 'master';
    }

    if (!enforcedClinicId) {
      setFormError('يرجى التأكد من انتسابك لعيادة أو منشأة صحية مسجلة.');
      return;
    }

    // Check unique password to completely prevent crosstalk & data leakage
    const pwCheck = checkPasswordUniqueness(staffPass, editingStaffId || undefined);
    if (!pwCheck.isUnique) {
      setFormError(`عفواً، تم اكتشاف تطابق/تشابه في كلمة المرور مع حساب آخر («${pwCheck.conflictUser?.name}»)! لأمان الخصوصية والبيانات، يرجى كتابة كلمة مرور فريدة وقوية لضمان الفصل التام.`);
      return;
    }

    // Check username conflict
    const conflict = state.users.find(u => 
      (u.username || '').trim().toLowerCase() === trimmedUser && 
      String(u.id) !== String(editingStaffId)
    );
    if (conflict) {
      setFormError(`اسم الدخول "${staffUsername}" محجوز مسبقاً لموظف آخر! يرجى اختيار اسم مستخدم مختلف.`);
      return;
    }

    if (editingStaffId) {
      // Editing Mode
      const targetUser = state.users.find(u => String(u.id) === String(editingStaffId));
      if (!targetUser) {
        setFormError('تعذر العثور على الموظف المراد تعديله في النظام.');
        return;
      }

      if (targetUser.role === 'master_admin') {
        setFormError('غير مسموح بتعديل حساب المطور الرئيسي للمنظومة من هذه الشاشة!');
        return;
      }

      const updatedUsers = state.users.map(u => String(u.id) === String(editingStaffId) ? {
        ...u,
        name: staffName.trim(),
        username: staffUsername.trim(),
        pass: staffPass.trim(),
        role: staffRole,
        jobTitle: staffJobTitle.trim(),
        phone: staffPhone.trim(),
        clinicId: enforcedClinicId,
        commissionRate: staffRole === 'doctor' ? (Number(staffCommission) || 0) : undefined,
        perms: staffRole === 'staff' ? staffPerms : undefined
      } : u);

      updateState({ users: updatedUsers });
      logAction(
        'تعديل صلاحيات الموظف', 
        `تم تعديل بيانات وصلاحيات الموظف «${staffName}» بنجاح وتحديث صلاحيات الوصول.`,
        'staff',
        { operationType: 'update', targetName: staffName, targetId: editingStaffId }
      );
      setFormSuccess('تم تحديث بيانات وصلاحيات الموظف بنجاح في سجلات العيادة!');
      setTimeout(() => resetStaffForm(), 1500);
    } else {
      // Create Mode
      const newUser: User = {
        id: Date.now().toString(),
        name: staffName.trim(),
        username: staffUsername.trim(),
        pass: staffPass.trim(),
        role: staffRole,
        jobTitle: staffJobTitle.trim(),
        phone: staffPhone.trim() || '--',
        clinicId: enforcedClinicId,
        commissionRate: staffRole === 'doctor' ? (Number(staffCommission) || 0) : undefined,
        perms: staffRole === 'staff' ? staffPerms : undefined
      };

      updateState({ users: [...state.users, newUser] });
      logAction(
        'إضافة موظف جديد وصلاحيات', 
        `تم إنشاء حساب الموظف الجديد «${staffName}» بمسمى «${staffJobTitle}» وربطه بالقسم بنجاح.`,
        'staff',
        { operationType: 'create', targetName: staffName, targetId: newUser.id }
      );
      setFormSuccess('تهانينا، تم إنشاء حساب الموظف الجديد وتحديد صلاحياته بدقة متناهية!');
      setTimeout(() => resetStaffForm(), 1500);
    }
  };

  const removeStaff = (id: string) => {
    const targetUser = state.users.find(u => String(u.id) === String(id));
    if (!targetUser) return;

    if (targetUser.role === 'master_admin') {
      return alert('لا يمكن حذف حساب المطور الرئيسي للنظام!');
    }

    if (window.confirm(`هل أنت متأكد من رغبتك في حذف الموظف «${targetUser.name}» نهائياً من العيادة؟ سيؤدي ذلك لإيقاف وصوله فوراً.`)) {
      updateState({ users: state.users.filter(u => String(u.id) !== String(id)) });
      logAction(
        'إيقاف وحذف موظف', 
        `تم إيقاف وحذف حساب الموظف «${targetUser.name}» من لوحة الإدارة.`,
        'staff',
        { operationType: 'delete', targetName: targetUser.name, targetId: id }
      );
      alert('تم حذف الموظف وإلغاء صلاحية دخوله تماماً.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Users size={16} />
            <span>نظام الأمان وإدارة الكوادر البشرية (RBAC)</span>
          </div>
          <h4 className="text-xl md:text-2xl font-black text-white m-0">
            صلاحيات الموظفين وإدارة الهويات الطبية والمالية
          </h4>
          <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed m-0">
            يمكنك من هنا إنشاء حسابات مستقلة لجميع الموظفين (استقبال، أطباء، تمريض، صيدلي، محاسب) بكلمات مرور فريدة تماماً. النظام يفصل بيانات ويوزرات كل منشأة بشكل كامل ومحكم لمنع التداخل وحماية سرية التقارير والحسابات.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 text-center shrink-0">
          <strong className="block text-lg font-black">{clinicStaff.length}</strong>
          <span className="text-[10px] text-emerald-200 font-bold">موظف مسجل بالمنشأة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Builder */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-teal-600" />
              <h6 className="font-bold text-slate-700 text-sm">
                {editingStaffId ? 'تعديل بيانات وصلاحيات الموظف' : 'إنشاء حساب جديد وتعيين الصلاحيات'}
              </h6>
            </div>
            {editingStaffId && (
              <button 
                onClick={resetStaffForm}
                className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                إلغاء التعديل
              </button>
            )}
          </div>

          <div className="p-5 space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-150 rounded-xl text-xs font-bold leading-relaxed">
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-xl text-xs font-bold leading-relaxed">
                ✅ {formSuccess}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">الاسم الكامل للموظف <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: د. ياسمين ممدوح، أو أحمد علي..."
                  value={staffName} 
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نوع الدور البرمجي</label>
                  <select 
                    value={staffRole} 
                    onChange={e => {
                      const val = e.target.value as any;
                      setStaffRole(val);
                      if (val === 'doctor') {
                        setStaffJobTitle('طبيب مختص');
                      } else {
                        setStaffJobTitle('موظف استقبال');
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="staff">موظف عادي (صلاحيات مخصصة)</option>
                    <option value="doctor">طبيب معالج (صلاحيات طبية كاملة)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">المسمى الوظيفي</label>
                  <input 
                    type="text" 
                    placeholder="استقبال، تمريض، صيدلي، محاسب..."
                    value={staffJobTitle} 
                    onChange={e => setStaffJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اسم الدخول (Username) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="yasmine.clinic"
                    value={staffUsername} 
                    onChange={e => setStaffUsername(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-teal-700 focus:bg-white focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center justify-between">
                    <span>كلمة المرور (Password) <span className="text-red-500">*</span></span>
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-teal-600 hover:underline"
                    >
                      {showPassword ? 'إخفاء' : 'عرض'}
                    </button>
                  </label>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="مثال: P@ss9821"
                    value={staffPass} 
                    onChange={e => setStaffPass(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف (اختياري)</label>
                  <input 
                    type="text" 
                    placeholder="010XXXXXXXX"
                    value={staffPhone} 
                    onChange={e => setStaffPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">عمولة الطبيب % (إن وجد)</label>
                  <input 
                    type="number" 
                    placeholder="مثال: 25%"
                    value={staffCommission} 
                    onChange={e => setStaffCommission(e.target.value ? Number(e.target.value) : '')}
                    disabled={staffRole !== 'doctor'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Granular Permissions Section */}
              {staffRole === 'staff' ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-slate-700">التفصيل الدقيق للصلاحيات الممنوحة:</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={selectAllPerms} 
                        className="text-[10px] font-bold text-teal-600 hover:underline"
                      >
                        تحديد الكل
                      </button>
                      <span className="text-slate-300">|</span>
                      <button 
                        type="button" 
                        onClick={clearAllPerms} 
                        className="text-[10px] font-bold text-slate-500 hover:underline"
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3 max-h-[300px] overflow-y-auto space-y-1.5 custom-scrollbar">
                    {STAFF_PERMISSIONS.map(p => {
                      const isSelected = staffPerms.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => toggleStaffPerm(p.id)}
                          className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer border transition-all ${
                            isSelected 
                              ? 'bg-teal-50/40 border-teal-200 text-teal-900 shadow-2xs' 
                              : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="mt-0.5 text-teal-600 shrink-0">
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
                          </div>
                          <div>
                            <strong className="block text-xs font-bold leading-tight">{p.label}</strong>
                            <span className="block text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 text-xs font-bold leading-relaxed">
                  💡 <strong>حساب طبيب:</strong> هذا الحساب يتمتع تلقائياً بكامل الصلاحيات الطبية، استعراض وكتابة الروشتات، والتقارير السريرية، دون الحاجة لتقييده بصلاحيات فرعية.
                </div>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={saveStaff}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/10"
              >
                {editingStaffId ? <Edit3 size={16} /> : <Plus size={16} />}
                <span>{editingStaffId ? 'حفظ وتثبيت التعديلات الحالية' : 'اعتماد وإنشاء الحساب فوراً'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Staff List & Isolation Audit */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h6 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                <span>طاقم العمل المسجل لعيادتك حالياً</span>
              </h6>
              <p className="text-[10px] text-slate-400">
                حماية البيانات نشطة: يتم حظر وتصفية يوزرات وموظفي العيادات الأخرى تلقائياً
              </p>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو اسم الدخول..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[660px] overflow-y-auto custom-scrollbar">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Users size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold">لم يتم العثور على أي موظف مطابق للبحث حالياً.</p>
                <p className="text-[11px] text-slate-400">اكتب بيانات الموظف في النموذج الجانبي لإنشاء حسابه المعتمد.</p>
              </div>
            ) : (
              filteredStaff.map((u) => {
                const isDoc = u.role === 'doctor';
                return (
                  <div 
                    key={u.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isDoc ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                        <h6 className="font-bold text-slate-800 text-sm m-0">{u.name}</h6>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide ${
                          isDoc ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.jobTitle || (isDoc ? 'طبيب' : 'موظف')}
                        </span>
                      </div>

                      {/* Display username & raw password safely so admin knows it */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Key size={12} className="text-slate-400" />
                          <span>اسم الدخول: <strong className="text-slate-700 font-mono font-bold">{u.username}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock size={12} className="text-slate-400" />
                          <span>الرمز السري: <strong className="text-slate-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{u.pass}</strong></span>
                        </div>
                        {u.phone && u.phone !== '--' && (
                          <div className="text-[11px] text-slate-400" dir="ltr">📞 {u.phone}</div>
                        )}
                      </div>

                      {/* Active Permissions Badges */}
                      <div className="pt-1 flex flex-wrap gap-1">
                        {isDoc ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold">
                            🔐 صلاحيات الطبيب الكاملة (وصول مطلق)
                          </span>
                        ) : u.perms?.length ? (
                          u.perms.map(pId => {
                            const found = STAFF_PERMISSIONS.find(sp => sp.id === pId);
                            if (!found) return null;
                            return (
                              <span 
                                key={pId}
                                className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-100 rounded-md text-[10px] font-bold"
                              >
                                {found.label}
                              </span>
                            );
                          })
                        ) : (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[10px] font-bold">
                            🚫 لم تُمنح أي صلاحية بعد (حساب معطل مؤقتاً)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end shrink-0 md:border-r md:border-slate-200 md:pr-4">
                      <button 
                        onClick={() => editStaff(u)} 
                        className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 hover:border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="تعديل بيانات وصلاحيات الموظف"
                      >
                        <Edit3 size={13} />
                        <span>تعديل</span>
                      </button>
                      <button 
                        onClick={() => removeStaff(u.id)} 
                        className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="حذف حساب الموظف بالكامل"
                      >
                        <Trash2 size={13} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs font-bold text-indigo-700 flex items-center gap-2">
            <Settings size={15} />
            <span>نظام التدقيق النشط يضمن عدم تداخل كلمات المرور أو اليوزرات مع عيادات أخرى بنسبة 100%.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
