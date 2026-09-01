import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import QueueSettingsModal from '../components/QueueSettingsModal';
import CustomStatesManager from "./CustomStatesManager";
import PurgeSystemModal from '../components/PurgeSystemModal';
import DeveloperConsole from '../components/DeveloperConsole';
import { QueueDisplaySettings } from '../types';

// Modular Tabs
import DrugsAndServicesTab from './Settings/DrugsAndServicesTab';
import FinancialsAndInsuranceTab from './Settings/FinancialsAndInsuranceTab';
import ProtocolsTab from './Settings/ProtocolsTab';
import WhatsAppSettingsTab from './Settings/WhatsAppSettingsTab';
import StaffManagementTab from './Settings/StaffManagementTab';

import { 
  Settings as SettingsIcon, Pill, Receipt, 
  Users, Sparkles, Tv, MessageCircle, Lock, LayoutGrid,
  Database, Download, Upload
} from 'lucide-react';

export default function Settings() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'all' | 'drugs_services' | 'financials' | 'staff' | 'protocols' | 'whatsapp' | 'workflows' | 'security'>('all');
  const [isDevConsoleOpen, setDevConsoleOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const isMaster = currentUser?.clinicId === 'master';
  const clinicKey = currentClinic?.id || 'master';

  const currentQueueSettings: QueueDisplaySettings = 
    state.queueDisplaySettingsStore?.[clinicKey] || 
    state.queueDisplaySettingsStore?.['master'] || {
      tickerText: "🏥 أهلاً بكم في المستشفى التخصصي | نرجو من السادة المراجعين التزام الهدوء والانتظار حتى سماع النداء الصوتي | لطوارئ المستشفى والاستفسارات: يرجى التوجه لمكتب الاستقبال الرئيسي",
      tickerSpeed: "normal",
      tickerBgColor: "#0f172a",
      tickerTextColor: "#38bdf8",
      showTicker: true,
      mediaLayoutMode: "slideshow",
      slideshowIntervalSeconds: 8,
      customImages: [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
      ],
      showHealthcareTips: true,
      soundEnabled: true,
      volume: 0.9,
      chimeType: "standard",
      repeatCount: 1,
      speechRate: 0.88,
      callPhraseTemplate: "المريض {patient}، تفضل بالدخول إلى {clinic}"
    };

  const handleSaveQueueDisplaySettings = (newSettings: QueueDisplaySettings) => {
    const store = state.queueDisplaySettingsStore || {};
    const updatedStore = {
      ...store,
      [clinicKey]: newSettings
    };
    updateState({ queueDisplaySettingsStore: updatedStore });
    logAction('تحديث إعدادات شاشة الانتظار', `تحديث نصوص وإعدادات نداء وطابور المنشأة`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h6 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <SettingsIcon size={20} className="text-blue-600" /> الإعدادات والدليل الشامل للمنشأة
          </h6>
          <p className="text-xs text-slate-500 mt-0.5">إدارة قوائم الخدمات والأدوية والتأمين والطاقم وإعدادات شاشة الانتظار والنظام</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer"
            title="تطهير وحذف البيانات التجريبية لتجهيز النظام للنشر الفعلي"
          >
            <Sparkles size={15} className="text-rose-600 animate-pulse" /> تطهير النظام للنشر (Purge)
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 custom-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <LayoutGrid size={15} /> عرض الكل
        </button>

        <button
          onClick={() => setActiveTab('drugs_services')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'drugs_services' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Pill size={15} /> الأدوية والخدمات
        </button>

        {!isMaster && (
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'financials' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Receipt size={15} /> المالية والتأمين
          </button>
        )}

        {!isMaster && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staff' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users size={15} /> طاقم العمل والصلاحيات
          </button>
        )}

        <button
          onClick={() => setActiveTab('protocols')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'protocols' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sparkles size={15} /> بروتوكولات التشخيص
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'whatsapp' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageCircle size={15} /> تذكيرات الواتساب
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'workflows' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <SettingsIcon size={15} /> تخصيص الحالات والمسارات
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'security' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lock size={15} /> أمان الحساب وتغيير كلمة المرور
        </button>
      </div>
      
      {/* Content Rendering based on Tab */}
      <div className="space-y-8">
        {/* Drugs and Services */}
        {(activeTab === 'all' || activeTab === 'drugs_services') && (
          <DrugsAndServicesTab />
        )}

        {/* Financials & Insurance */}
        {!isMaster && (activeTab === 'all' || activeTab === 'financials') && (
          <FinancialsAndInsuranceTab />
        )}

        {/* Protocols */}
        {(activeTab === 'all' || activeTab === 'protocols') && (
          <ProtocolsTab />
        )}

        {/* Queue Display Settings Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Tv size={18} />
              <span>شاشة التلفزيون وشريط الحالة والنداء الصوتي</span>
            </div>
            <h5 className="text-lg md:text-xl font-black text-white m-0">
              إعدادات شاشة الانتظار المتقدمة (Queue Display Settings)
            </h5>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed m-0">
              خصص نصوص شريط الأخبار السفلي، سرعة الحركة، ألوان الشريط، صور التوعية والسلايد شو، نغمة الجرس الصوتي، سرعة نطق الاسم باللغة العربية، وصيغة الترحيب بالمرضى.
            </p>
          </div>

          <button
            onClick={() => setQueueModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <SettingsIcon size={18} />
            <span>ضبط شاشة الانتظار والصوت</span>
          </button>
        </div>

        {/* WhatsApp Reminders */}
        {(activeTab === 'all' || activeTab === 'whatsapp') && (
          <WhatsAppSettingsTab />
        )}

        {/* Staff Management */}
        {!isMaster && (activeTab === 'all' || activeTab === 'staff') && (
          <StaffManagementTab />
        )}

        {/* Custom States Manager */}
        {(activeTab === 'all' || activeTab === 'workflows') && (
          <CustomStatesManager />
        )}

        {/* Account Security & Password Change Tab */}
        {activeTab === 'security' && (
          <SecurityTab />
        )}
      </div>

      {/* Queue Settings Modal */}
      <QueueSettingsModal
        isOpen={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        settings={currentQueueSettings}
        onSaveSettings={handleSaveQueueDisplaySettings}
      />

      {/* Purge System Modal */}
      <PurgeSystemModal
        isOpen={showPurgeModal}
        onClose={() => setShowPurgeModal(false)}
      />
    </div>
  );
}

function SecurityTab() {
  const { state, updateState, currentUser, changeUserPassword } = useAppContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentUser) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('يرجى ملء كافة الحقول المطلوبة.');
      return;
    }

    if (currentPassword !== currentUser.pass) {
      setErrorMessage('كلمة المرور الحالية غير صحيحة! يرجى التحقق وإعادة المحاولة.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('يجب أن لا تقل كلمة المرور الجديدة عن 4 خانات/رموز.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('تأكيد كلمة المرور الجديدة لا يطابق المدخل!');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('كلمة المرور الجديدة مطابقة تماماً للمستعملة حالياً! يرجى تعيين كلمة مرور جديدة ومختلفة.');
      return;
    }

    // Attempt password change with context-level uniqueness validation
    const error = changeUserPassword(currentUser.id, newPassword);
    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage('تهانينا، تم تحديث كلمة مرور حسابك بنجاح وأرشفة الرمز السري الجديد! لن تتداخل حساباتك بعد الآن.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleExportBackup = () => {
    try {
      const backupStr = JSON.stringify(state, null, 2);
      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shamel-erp-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('حدث خطأ أثناء تصدير النسخة الاحتياطية!');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isConfirmed = window.confirm('⚠️ تحذير هام جداً:\nاستيراد نسخة احتياطية سيقوم باستبدال كافة البيانات الحالية (المرضى، الصيدلية، الحسابات، التقارير الطبية) ببيانات الملف.\nهل أنت متأكد من الاستمرار؟');
    if (!isConfirmed) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && ('clinics' in parsed || 'reports' in parsed || 'patients' in parsed)) {
          updateState(parsed);
          alert('✅ تم استرجاع النسخة الاحتياطية بنجاح وتحديث كافة لوحات العيادات والمراكز والمحاسبة بنجاح تام!');
        } else {
          alert('❌ ملف النسخة الاحتياطية غير متوافق أو تالف.');
        }
      } catch (err) {
        alert('❌ حدث خطأ في قراءة ملف الـ JSON المختار.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" dir="rtl">
      {/* Column 1: Password Update */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-base mb-2">
          <Lock size={20} />
          <h6>تحديث كلمة مرور الحساب ومنع تداخل البيانات</h6>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          بصفتك المسؤول عن العيادة، المركز أو المستشفى، يمكنك تغيير كلمة مرور حسابك الشخصية من هنا.
          سيقوم النظام تلقائياً بتدقيق وتدبيج كلمة المرور الجديدة للتأكد من عدم وجود أي تطابق مع أي موظف أو حساب آخر بالمنظومة لضمان الفصل التام ومنع اختلاط الصلاحيات أو تداخل السجلات.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold leading-relaxed">
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">اسم المستخدم الحالي (Username)</label>
            <input
              type="text"
              value={currentUser?.username || ''}
              disabled
              dir="ltr"
              className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور الحالية (Current Password)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              dir="ltr"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور الجديدة (New Unique Password)</label>
            <input
              type="password"
              placeholder="كلمة مرور فريدة وقوية..."
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              dir="ltr"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">تأكيد كلمة المرور الجديدة (Confirm Password)</label>
            <input
              type="password"
              placeholder="أعد كتابة كلمة المرور..."
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              dir="ltr"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            حفظ واعتماد كلمة المرور الجديدة
          </button>
        </form>
      </div>

      {/* Column 2: Backup & Data Sovereignty Center */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-base mb-1">
          <Database size={20} />
          <h6>مركز النسخ الاحتياطي وحماية بيانات المرضى</h6>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          يوفر لك هذا القسم القدرة المطلقة على حماية وأرشفة بيانات منشأتك محلياً. 
          بما أن البيانات يتم تخزينها وتشفيرها بشكل آمن داخل متصفحك لضمان السرية، يمكنك تصدير ملف النسخة الاحتياطية وحفظه في مكان آمن على جهازك الشخصي لاستعادته في أي وقت أو نقله لمتصفح آخر.
        </p>

        <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-700 block">تصدير كافة البيانات (JSON Export)</span>
            <span className="text-[11px] text-slate-500 block">تحميل ملف يحتوي على كافة ملفات المرضى، الصيدلية، الحسابات والتقارير.</span>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Download size={14} /> تصدير نسخة احتياطية
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-700 block">استيراد نسخة احتياطية (JSON Import)</span>
            <span className="text-[11px] text-rose-600 font-medium block">⚠️ تنبيه: استيراد ملف سيستبدل ويحذف البيانات الحالية في المتصفح تماماً.</span>
          </div>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              id="db-backup-upload"
              className="hidden"
            />
            <label
              htmlFor="db-backup-upload"
              className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all text-xs font-bold text-slate-600 hover:text-teal-700 select-none"
            >
              <Upload size={18} className="text-slate-400" />
              <span>اختر ملف النسخة الاحتياطية لرفعه واسترجاعه (.json)</span>
            </label>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
          💡 <strong>نصيحة أمان سريرية:</strong> ينصح دائماً بتحميل نسخة احتياطية أسبوعية وتخزينها في قرص صلب خارجي لضمان عدم ضياع سجلات المرضى عند قيامك بتنظيف ذاكرة المتصفح أو الكاش (Cache Clears).
        </div>
      </div>
    </div>
  );
}
