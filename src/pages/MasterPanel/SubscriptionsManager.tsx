import { DeveloperAccountsReportModal } from "./MasterModals";
import React, { useState } from 'react';
import { Wallet, FileText, FileSpreadsheet, Printer, Check, Building, Stethoscope, Phone , Search, Filter, Plus, Edit3, DollarSign, Calendar, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Clinic } from '../../types';
import { useAppContext } from '../../context/AppContext';


export default function SubscriptionsManager() {
  const { state, updateState, logAction } = useAppContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid' | 'trial' | 'expiring' | 'expired'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [showDeveloperReportModal, setShowDeveloperReportModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const updateClinicSubscription = (clinicId: string, updates: Partial<Clinic>, logDetail: string) => {
    const cIdStr = String(clinicId);
    const updatedClinics = state.clinics.map(c => String(c.id) === cIdStr ? { ...c, ...updates } : c);
    updateState({ clinics: updatedClinics });
    logAction('تحديث اشتراك وعقد منشأة', logDetail);
    showMsg('تم تحديث بيانات الاشتراك بنجاح!');
  };

  const extendSubscription = (c: Clinic, months: number) => {
    const currentExp = c.expiryDate ? new Date(c.expiryDate) : new Date();
    const baseDate = currentExp.getTime() < Date.now() ? new Date() : currentExp;
    baseDate.setMonth(baseDate.getMonth() + months);
    const newExpiryStr = baseDate.toISOString().split('T')[0];
    updateClinicSubscription(c.id, { expiryDate: newExpiryStr, status: 'active' }, `تمديد اشتراك منشأة ${c.name} لمدة ${months} شهر حتى ${newExpiryStr}`);
  };

  const setPermanentSubscription = (c: Clinic) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 25);
    const newExpiryStr = d.toISOString().split('T')[0];
    updateClinicSubscription(c.id, { expiryDate: newExpiryStr, status: 'active' }, `تجديد دائم لاشتراك منشأة ${c.name} حتى ${newExpiryStr}`);
  };

  const sendWhatsAppReminder = (c: Clinic) => {
    const adminUser = state.users.find(u => String(u.clinicId) === String(c.id) && (u.username === c.ownerUsername || u.role === 'doctor'));
    const phoneNum = c.phone || adminUser?.phone || '';
    const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
    const priceText = c.contractPrice ? `${c.contractPrice} جنيه` : 'غير محدد';
    const statusText = c.paymentStatus === 'paid' ? 'تم السداد بالكامل' : c.paymentStatus === 'partial' ? 'سداد جزئي' : c.paymentStatus === 'trial' ? 'فترة تجريبية' : 'غير مسدد';
    
    const msg = `
🏥 *إشعار تجديد اشتراك منصة شامل للمستشفيات والعيادات ERP*

عزيزي دكتور / ${c.docName || c.name} 👋
نحيطكم علماً ببيانات الاشتراك الخاص بمنشأتكم الطبية (*${c.name}*):

📅 *تاريخ بداية الاشتراك:* ${c.startDate || 'غير محدد'}
📅 *تاريخ انتهاء الاشتراك:* ${c.expiryDate || 'غير محدد'}
💰 *قيمة الاشتراك:* ${priceText}
💳 *حالة الدفع:* ${statusText}

🔐 *بيانات حساب الدخول:* ${c.ownerUsername || adminUser?.username || 'غير مسجل'}
🌐 *رابط المنصة:* ${window.location.origin}

يرجى التواصل مع المطور (م/ صبري الديب: 01065826742) لتأكيد التجديد واستدامة الخدمة بدون انقطاع.
    `.trim();

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      navigator.clipboard.writeText(msg);
      showMsg('تم نسخ نص رسالة التذكير للحافظة بنجاح!');
    }
  };

  // KPIs
  const totalValue = state.clinics.reduce((sum, c) => sum + (Number(c.contractPrice) || 0), 0);
  const paidValue = state.clinics.reduce((sum, c) => {
    const contract = Number(c.contractPrice) || 0;
    if (c.paidAmount !== undefined) return sum + Number(c.paidAmount);
    return sum + (c.paymentStatus === 'paid' ? contract : 0);
  }, 0);
  const unpaidValue = Math.max(0, totalValue - paidValue);

  const nowTime = new Date().setHours(0,0,0,0);
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const specialtiesList = Array.from(
    new Set([
      'all',
      ...state.clinics.map(c => c.specialty || (c.systemType === 'hospital' ? 'مستشفى عام' : 'عيادة عامة')).filter(Boolean)
    ])
  );

  const filtered = state.clinics.filter(c => {
    const expTime = new Date(c.expiryDate || 0).getTime();
    if (filter === 'paid' && c.paymentStatus !== 'paid') return false;
    if (filter === 'partial' && c.paymentStatus !== 'partial') return false;
    if (filter === 'unpaid' && c.paymentStatus !== 'unpaid' && c.paymentStatus !== undefined) return false;
    if (filter === 'trial' && c.paymentStatus !== 'trial') return false;
    if (filter === 'expiring' && (expTime < nowTime || expTime > nowTime + thirtyDaysMs)) return false;
    if (filter === 'expired' && expTime >= nowTime) return false;

    if (specialtyFilter !== 'all') {
      const spec = c.specialty || (c.systemType === 'hospital' ? 'مستشفى عام' : 'عيادة عامة');
      if (spec !== specialtyFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.docName || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.ownerUsername || '').toLowerCase().includes(q) ||
        (c.specialty || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportDeveloperExcel = () => {
    const headers = [
      'م',
      'اسم المنشأة / المركز',
      'التخصص / نوع المنشأة',
      'الطبيب / المدير المسؤول',
      'رقم الهاتف',
      'اسم المستخدم',
      'تاريخ بداية الاشتراك',
      'تاريخ نهاية الاشتراك',
      'الأيام المتبقية',
      'حالة الاشتراك',
      'إجمالي قيمة العقد (جنيه)',
      'المبلغ المحصل (جنيه)',
      'المبلغ المتبقي (جنيه)',
      'حالة الدفع'
    ];

    const rows = filtered.map((c, idx) => {
      const expDate = c.expiryDate ? new Date(c.expiryDate) : null;
      const daysDiff = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      const contractPrice = Number(c.contractPrice) || 0;
      const paidAmount = c.paidAmount !== undefined ? Number(c.paidAmount) : (c.paymentStatus === 'paid' ? contractPrice : 0);
      const remainingAmount = Math.max(0, contractPrice - paidAmount);
      const statusText = daysDiff <= 0 ? 'منتهي' : daysDiff <= 30 ? 'ينتهي قريباً' : 'نشط وساري';
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
        `"${statusText}"`,
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
    link.setAttribute('download', `تقرير_حسابات_المطور_صبري_الديب_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Financial KPIs Banner & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Wallet className="text-emerald-600" size={24} /> سيستم حسابات وعقود المطور الرئيسي
          </h4>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            إدارة مدد الاشتراكات وتواريخ البداية والنهاية ومستحقات المطور (م/ صبري الديب) لجميع العيادات والمراكز والمستشفيات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeveloperReportModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
            title="فتح نافذة تقرير حسابات المطور المستقلة والشاملة"
          >
            <FileText size={16} /> شاشة تقرير المطور
          </button>

          <button
            onClick={exportDeveloperExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
            title="تصدير جدول حسابات المطور إلى ملف إكسيل Excel (CSV)"
          >
            <FileSpreadsheet size={16} /> تصدير إكسيل
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
            title="طباعة التقرير المالي واشتراكات المنشآت"
          >
            <Printer size={16} /> طباعة التقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-blue-100 block mb-1">إجمالي قيمة التعاقدات والاشتراكات</span>
          <div className="text-2xl font-black">{totalValue.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span></div>
          <span className="text-[11px] text-blue-200 mt-2 block">لجميع المنشآت ({state.clinics.length})</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-emerald-100 block mb-1">إجمالي المبالغ المحصلة نقداً</span>
          <div className="text-2xl font-black">{paidValue.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span></div>
          <span className="text-[11px] text-emerald-200 mt-2 block">{state.clinics.filter(c => c.paymentStatus === 'paid').length} منشأة مسددة بالكامل</span>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-amber-100 block mb-1">إجمالي المستحقات والديون المتبقية</span>
          <div className="text-2xl font-black">{unpaidValue.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span></div>
          <span className="text-[11px] text-amber-200 mt-2 block">المبالغ الآجلة والمتبقية للدفع</span>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-purple-100 block mb-1">المنشآت النشطة والسارية</span>
          <div className="text-2xl font-black">
            {state.clinics.filter(c => new Date(c.expiryDate || 0).getTime() >= nowTime).length} / {state.clinics.length}
          </div>
          <span className="text-[11px] text-purple-200 mt-2 block">اشتراكات سارية حالياً</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Control Bar: Search, Specialty Filter & Status Filter */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="بحث باسم المنشأة، الطبيب، التخصص، أو اسم المستخدم..." 
              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">التخصص / النوع:</span>
            <select
              value={specialtyFilter}
              onChange={e => setSpecialtyFilter(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 min-w-[160px]"
            >
              <option value="all">كل التخصصات والمراكز ({state.clinics.length})</option>
              {specialtiesList.filter(s => s !== 'all').map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-200/80">
          <Filter size={16} className="text-slate-500 shrink-0" />
          <span className="text-xs font-bold text-slate-500 shrink-0">حالة السداد والاشتراك:</span>
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
          >
            الكل ({filtered.length})
          </button>
          <button 
            onClick={() => setFilter('paid')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'paid' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200'}`}
          >
            مسددة بالكامل
          </button>
          <button 
            onClick={() => setFilter('partial')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'partial' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 border border-amber-200'}`}
          >
            سداد جزئي
          </button>
          <button 
            onClick={() => setFilter('unpaid')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'unpaid' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200'}`}
          >
            غير مسددة
          </button>
          <button 
            onClick={() => setFilter('trial')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'trial' ? 'bg-purple-600 text-white' : 'bg-white text-purple-700 border border-purple-200'}`}
          >
            فترة تجريبية
          </button>
          <button 
            onClick={() => setFilter('expiring')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'expiring' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 border border-indigo-200'}`}
          >
            تنتهي قريباً (30 يوم)
          </button>
          <button 
            onClick={() => setFilter('expired')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'expired' ? 'bg-red-600 text-white' : 'bg-white text-red-700 border border-red-200'}`}
          >
            منتهية
          </button>
        </div>
      </div>

      {/* Table of Subscriptions */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
              <tr>
                <th className="px-4 py-3.5">المنشأة والتخصص</th>
                <th className="px-4 py-3.5">تاريخ البداية</th>
                <th className="px-4 py-3.5">تاريخ النهاية والأيام</th>
                <th className="px-4 py-3.5">قيمة العقد والمحصل</th>
                <th className="px-4 py-3.5">المتبقي وحالة السداد</th>
                <th className="px-4 py-3.5 text-center">التمديد السريع للاشتراك</th>
                <th className="px-4 py-3.5 text-center">الواتساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    لا توجد منشآت مطابقة للفلاتر المحددة.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const expDate = c.expiryDate ? new Date(c.expiryDate) : null;
                  const daysDiff = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                  const isExpired = daysDiff <= 0;
                  const isExpiringSoon = daysDiff > 0 && daysDiff <= 30;

                  const contractPrice = Number(c.contractPrice) || 0;
                  const paidAmount = c.paidAmount !== undefined ? Number(c.paidAmount) : (c.paymentStatus === 'paid' ? contractPrice : 0);
                  const remainingAmount = Math.max(0, contractPrice - paidAmount);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          {c.systemType === 'hospital' ? <Building className="text-purple-600 shrink-0" size={16} /> : <Stethoscope className="text-blue-600 shrink-0" size={16} />}
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          التخصص: <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">{c.specialty || (c.systemType === 'hospital' ? 'مستشفى عام' : 'عيادة عامة')}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          الطبيب: <span className="font-semibold text-slate-700">{c.docName || '--'}</span> | هاتف: <span dir="ltr" className="font-mono">{c.phone || '--'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <input 
                            type="date"
                            value={c.startDate || ''}
                            onChange={e => {
                              const val = e.target.value;
                              updateClinicSubscription(c.id, { startDate: val }, `تعديل تاريخ بداية اشتراك ${c.name} إلى ${val}`);
                            }}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-400">تاريخ بداية العقد</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <input 
                            type="date"
                            value={c.expiryDate || ''}
                            onChange={e => {
                              const val = e.target.value;
                              updateClinicSubscription(c.id, { expiryDate: val }, `تعديل تاريخ انتهاء اشتراك ${c.name} إلى ${val}`);
                            }}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {isExpired ? (
                            <span className="inline-block text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                              منتهي منذ {Math.abs(daysDiff)} يوم
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              متبقي {daysDiff} يوم فقط
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              ساري (متبقي {daysDiff} يوم)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-500 text-[11px] font-semibold w-12">العقد:</span>
                            <input 
                              type="number"
                              value={c.contractPrice || ''}
                              onChange={e => {
                                const val = Number(e.target.value) || 0;
                                updateClinicSubscription(c.id, { contractPrice: val }, `تغيير سعر اشتراك ${c.name} إلى ${val}`);
                              }}
                              placeholder="0.00"
                              className="w-20 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-[11px] font-bold text-slate-400">ج.م</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-500 text-[11px] font-semibold w-12">المحصل:</span>
                            <input 
                              type="number"
                              value={c.paidAmount !== undefined ? c.paidAmount : (c.paymentStatus === 'paid' ? contractPrice : '')}
                              onChange={e => {
                                const val = Number(e.target.value) || 0;
                                const pStatus = val >= contractPrice && contractPrice > 0 ? 'paid' : val > 0 ? 'partial' : 'unpaid';
                                updateClinicSubscription(c.id, { paidAmount: val, paymentStatus: pStatus }, `تحديث المبلغ المحصل لمنشأة ${c.name} إلى ${val}`);
                              }}
                              placeholder="0.00"
                              className="w-20 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-[11px] font-bold text-emerald-600">ج.م</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="text-xs font-extrabold flex items-center gap-1">
                            <span className="text-slate-400 text-[11px] font-normal">المتبقي:</span>
                            <span className={remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                              {remainingAmount.toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>

                          <select
                            value={c.paymentStatus || 'unpaid'}
                            onChange={e => {
                              const val = e.target.value as any;
                              updateClinicSubscription(c.id, { paymentStatus: val }, `تعديل حالة دفع اشتراك ${c.name} إلى ${val}`);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none w-full ${
                              c.paymentStatus === 'paid' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : c.paymentStatus === 'partial' 
                                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                : c.paymentStatus === 'trial'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="paid">✓ تم السداد بالكامل</option>
                            <option value="partial">⏳ سداد جزئي (متبقي)</option>
                            <option value="unpaid">✕ غير مسدد (مستحق)</option>
                            <option value="trial">🎁 فترة تجريبية مجانية</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <button 
                            onClick={() => extendSubscription(c, 1)} 
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-bold"
                            title="تمديد شهر واحد"
                          >
                            +1 شهر
                          </button>
                          <button 
                            onClick={() => extendSubscription(c, 6)} 
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold"
                            title="تمديد 6 أشهر"
                          >
                            +6 أشهر
                          </button>
                          <button 
                            onClick={() => extendSubscription(c, 12)} 
                            className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-[11px] font-bold"
                            title="تمديد سنة كاملة"
                          >
                            +سنة
                          </button>
                          <button 
                            onClick={() => setPermanentSubscription(c)} 
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold"
                            title="تجديد دائم (25 سنة)"
                          >
                            دائم ∞
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => sendWhatsAppReminder(c)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                          title="إرسال إشعار تذكير السداد والتجديد عبر الواتساب"
                        >
                          <Phone size={14} /> واتساب
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standalone Developer Accounts & Subscriptions Report Modal */}
      {showDeveloperReportModal && (
        <DeveloperAccountsReportModal 
          clinics={filtered} 
          allClinics={state.clinics}
          onClose={() => setShowDeveloperReportModal(false)} 
        />
      )}
    </div>
  );
}

