import React, { useState } from 'react';
import { FileSpreadsheet, Building, Printer, Check, Copy, Edit3 , Download, Shield, Plus, Trash2, Key, Save, X } from 'lucide-react';
import { Clinic, User } from '../../types';
import { useAppContext } from '../../context/AppContext';


export function DeveloperAccountsReportModal({ 
  clinics, 
  allClinics,
  onClose 
}: { 
  clinics: Clinic[]; 
  allClinics: Clinic[];
  onClose: () => void;
}) {
  const totalContractsValue = clinics.reduce((sum, c) => sum + (Number(c.contractPrice) || 0), 0);
  const totalPaid = clinics.reduce((sum, c) => {
    const contract = Number(c.contractPrice) || 0;
    if (c.paidAmount !== undefined) return sum + Number(c.paidAmount);
    return sum + (c.paymentStatus === 'paid' ? contract : 0);
  }, 0);
  const totalRemaining = Math.max(0, totalContractsValue - totalPaid);

  const exportExcel = () => {
    const headers = [
      'م',
      'اسم المنشأة / المركز',
      'التخصص / نوع المنشأة',
      'الطبيب / المدير المسؤول',
      'رقم الهاتف',
      'اسم المستخدم (الحساب)',
      'تاريخ بداية الاشتراك',
      'تاريخ نهاية الاشتراك',
      'الأيام المتبقية',
      'قيمة العقد (جنيه)',
      'المحصل (جنيه)',
      'المتبقي (جنيه)',
      'حالة السداد'
    ];

    const rows = clinics.map((c, idx) => {
      const expDate = c.expiryDate ? new Date(c.expiryDate) : null;
      const daysDiff = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      const contractPrice = Number(c.contractPrice) || 0;
      const paidAmount = c.paidAmount !== undefined ? Number(c.paidAmount) : (c.paymentStatus === 'paid' ? contractPrice : 0);
      const remainingAmount = Math.max(0, contractPrice - paidAmount);
      const payStatusText = c.paymentStatus === 'paid' ? 'تم السداد بالكامل' : c.paymentStatus === 'partial' ? 'سداد جزئي' : c.paymentStatus === 'trial' ? 'فترة تجريبية' : 'غير مسدد';

      return [
        idx + 1,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.specialty || (c.systemType === 'hospital' ? 'مستشفى عام' : 'عيادة طبية')).replace(/"/g, '""')}"`,
        `"${(c.docName || '--').replace(/"/g, '""')}"`,
        `"${(c.phone || '--').replace(/"/g, '""')}"`,
        `"${(c.ownerUsername || '--').replace(/"/g, '""')}"`,
        `"${c.startDate || '--'}"`,
        `"${c.expiryDate || '--'}"`,
        daysDiff,
        contractPrice,
        paidAmount,
        remainingAmount,
        `"${payStatusText}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `بيان_حسابات_اشتراكات_المطور_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-4 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2 font-black text-base">
            <Shield className="text-amber-400" size={20} />
            <span>شاشة تقرير وتفاصيل حسابات المطور المستقلة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet size={15} /> تصدير إكسيل (Excel)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={15} /> طباعة التقرير (PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50 print:bg-white print:p-0">
          
          {/* Developer Report Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center flex-wrap gap-4 print:border-b-2 print:border-slate-800 print:shadow-none print:rounded-none">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="text-blue-600" size={24} />
                <h2 className="text-xl font-black text-slate-900">تقرير وتفاصيل سيستم حسابات المطور الرئيسي</h2>
              </div>
              <p className="text-xs font-bold text-slate-500">
                منظومة شامل للمستشفيات والعيادات ERP — إعداد وتطوير: <strong className="text-blue-900">م/ صبري الديب (01065826742)</strong>
              </p>
            </div>

            <div className="text-left font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 print:border-none print:p-0">
              <div>تاريخ التقرير: <strong>{new Date().toLocaleDateString('ar-EG')}</strong></div>
              <div>إجمالي المنشآت بالتقرير: <strong>{clinics.length} منشأة</strong></div>
            </div>
          </div>

          {/* Financial Totals Row */}
          <div className="grid grid-cols-3 gap-4 print:grid-cols-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي قيمة التعاقدات والعقود</span>
              <div className="text-lg font-black text-slate-900">{totalContractsValue.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center shadow-2xs bg-emerald-50/30">
              <span className="text-xs font-bold text-emerald-700 block mb-1">إجمالي المبالغ المحصلة فعلياً</span>
              <div className="text-lg font-black text-emerald-800">{totalPaid.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 text-center shadow-2xs bg-rose-50/30">
              <span className="text-xs font-bold text-rose-700 block mb-1">إجمالي المبالغ والمستحقات المتبقية</span>
              <div className="text-lg font-black text-rose-800">{totalRemaining.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span></div>
            </div>
          </div>

          {/* Structured Detailed Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs print:border-slate-400 print:rounded-none">
            <table className="w-full text-xs text-right text-slate-800">
              <thead className="bg-slate-100 border-b border-slate-200 font-extrabold text-slate-700">
                <tr>
                  <th className="px-3 py-3 text-center">م</th>
                  <th className="px-3 py-3">المنشأة والمركز</th>
                  <th className="px-3 py-3">التخصص والنوع</th>
                  <th className="px-3 py-3">المسؤول / الهاتف</th>
                  <th className="px-3 py-3">بداية الاشتراك</th>
                  <th className="px-3 py-3">نهاية الاشتراك</th>
                  <th className="px-3 py-3 text-center">الأيام</th>
                  <th className="px-3 py-3">قيمة العقد</th>
                  <th className="px-3 py-3">المحصل</th>
                  <th className="px-3 py-3">المتبقي</th>
                  <th className="px-3 py-3 text-center">حالة السداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {clinics.map((c, idx) => {
                  const expDate = c.expiryDate ? new Date(c.expiryDate) : null;
                  const daysDiff = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                  const contractPrice = Number(c.contractPrice) || 0;
                  const paidAmount = c.paidAmount !== undefined ? Number(c.paidAmount) : (c.paymentStatus === 'paid' ? contractPrice : 0);
                  const remainingAmount = Math.max(0, contractPrice - paidAmount);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{c.name}</td>
                      <td className="px-3 py-2.5">{c.specialty || (c.systemType === 'hospital' ? 'مستشفى عام' : 'عيادة طبية')}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold">{c.docName || '--'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.phone || '--'}</div>
                      </td>
                      <td className="px-3 py-2.5 font-mono dir-ltr">{c.startDate || '--'}</td>
                      <td className="px-3 py-2.5 font-mono dir-ltr">{c.expiryDate || '--'}</td>
                      <td className="px-3 py-2.5 text-center font-bold">
                        {daysDiff <= 0 ? (
                          <span className="text-red-600">منتهي</span>
                        ) : (
                          <span>{daysDiff} يوم</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-bold">{contractPrice.toLocaleString('ar-EG')} ج.م</td>
                      <td className="px-3 py-2.5 font-bold text-emerald-700">{paidAmount.toLocaleString('ar-EG')} ج.م</td>
                      <td className="px-3 py-2.5 font-bold text-rose-700">{remainingAmount.toLocaleString('ar-EG')} ج.م</td>
                      <td className="px-3 py-2.5 text-center font-bold">
                        {c.paymentStatus === 'paid' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">مسدد بالكامل</span>
                        ) : c.paymentStatus === 'partial' ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">سداد جزئي</span>
                        ) : c.paymentStatus === 'trial' ? (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">تجريبي</span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">غير مسدد</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900 text-xs">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-left">الإجمالي الشامل للتقرير:</td>
                  <td className="px-3 py-3">{totalContractsValue.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-3 py-3 text-emerald-800">{totalPaid.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-3 py-3 text-rose-800">{totalRemaining.toLocaleString('ar-EG')} ج.م</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs font-semibold text-slate-400 pt-2 border-t border-slate-200 print:text-black">
            منظومة إدارة حسابات المطور — جميع البيانات مسجلة وموثقة في خادم السحابة للمطور الرئيسي م/ صبري الديب
          </div>
        </div>

      </div>
    </div>
  );
}

export function MasterAccountsModal({ onClose }: { onClose: () => void }) {
  const { state, updateState, logAction, checkPasswordUniqueness } = useAppContext();
  const masterUsers = state.users.filter(u => u.role === 'master_admin');
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveMasterUser = () => {
    if (!name.trim() || !username.trim() || !pass.trim()) {
      return alert('يرجى ملء كافة الحقول المطلوبة');
    }

    const trimmedUser = username.trim().toLowerCase();

    // Audit check for unique password
    const pwCheck = checkPasswordUniqueness(pass, editingId || undefined);
    if (!pwCheck.isUnique) {
      return alert(`عفواً، تم اكتشاف تطابق/تشابه في كلمة المرور مع حساب آخر في المنظومة («${pwCheck.conflictUser?.name}»)! يرجى كتابة كلمة مرور فريدة تماماً لضمان عدم تداخل الحسابات والبيانات.`);
    }

    if (editingId) {
      updateState({
        users: state.users.map(u => u.id === editingId ? {
          ...u,
          name: name.trim(),
          username: username.trim(),
          pass: pass.trim()
        } : u)
      });
      logAction('تعديل حساب مطور', `تم تعديل بيانات حساب المطور: ${name}`);
    } else {
      const existing = state.users.find(u => (u.username || '').trim().toLowerCase() === trimmedUser);
      if (existing) return alert('اسم المستخدم مستخدم بالفعل!');

      const newMasterUser: User = {
        id: 'master_' + Date.now(),
        name: name.trim(),
        username: username.trim(),
        pass: pass.trim(),
        role: 'master_admin',
        clinicId: 'master',
        perms: []
      };
      updateState({ users: [...state.users, newMasterUser] });
      logAction('إضافة حساب مطور جديد', `تم إنشاء حساب مطور إضافي: ${name}`);
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setUsername('');
    setPass('');
  };

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setName(u.name);
    setUsername(u.username);
    setPass(u.pass);
  };

  const handleDeleteMaster = (u: User) => {
    if (masterUsers.length <= 1) {
      return alert('لا يمكن حذف حساب المطور الرئيسي الوحيد في المنظومة!');
    }
    if (!confirm(`هل أنت متأكد من حذف حساب المطور «${u.name}»؟`)) return;

    updateState({ users: state.users.filter(user => user.id !== u.id) });
    logAction('حذف حساب مطور', `تم حذف حساب المطور: ${u.name}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/30 border border-indigo-400/40 rounded-xl flex items-center justify-center text-indigo-300">
              <Shield size={22} />
            </div>
            <div>
              <h5 className="font-bold text-lg">حسابات المطور الرئيسية (Master Accounts)</h5>
              <p className="text-xs text-indigo-200">إدارة حسابات الأدمن الرئيسي والتأكيد على كلمات سر الوصول للنظام</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Master Accounts List */}
          <div>
            <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Key size={14} className="text-indigo-600" /> الحسابات المعتمدة الحالية ({masterUsers.length})
            </h6>

            <div className="space-y-3">
              {masterUsers.map((user) => (
                <div key={user.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 hover:border-indigo-200 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold">مطور رئيسي</span>
                    </div>
                    <div className="text-xs font-mono text-slate-600 flex items-center gap-4">
                      <span>اسم المستخدم: <strong className="text-indigo-700">{user.username}</strong></span>
                      <span>كلمة السر: <strong className="text-slate-800">{user.pass}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(`User: ${user.username} | Pass: ${user.pass}`, user.id)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedField === user.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedField === user.id ? 'تم النسخ!' : 'نسخ الحساب'}
                    </button>

                    <button
                      onClick={() => startEdit(user)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit3 size={16} />
                    </button>

                    {masterUsers.length > 1 && (
                      <button
                        onClick={() => handleDeleteMaster(user)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add / Edit Master Account */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-4">
            <h6 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" />
              {editingId ? 'تعديل بيانت حساب المطور' : 'إضافة حساب مطور رئيسي جديد'}
            </h6>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="د. صبري الديب"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المستخدم (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="sapry eldeep"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور (Password)</label>
                <input
                  type="text"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="159632"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveMasterUser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save size={14} /> {editingId ? 'حفظ التغييرات' : 'إنشاء حساب المطور'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">حساب المطور الرئيسي يتمتع بصلاحية الوصول الكاملة للوحة التحكم.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
