import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { WhatsAppSettings } from '../../types';
import { MessageCircle, Shield, CheckCircle2, Save } from 'lucide-react';

export default function WhatsAppSettingsTab() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const clinicKey = currentClinic?.id || 'master';

  const globalWA = state.globalWhatsAppConfig || {
    enabled: true,
    defaultSenderNumber: '01065826742',
    allowClinicsToOverride: true
  };

  const currentWhatsAppSettings: WhatsAppSettings = 
    state.whatsappSettingsStore?.[clinicKey] || {
      phone: currentClinic?.phone || globalWA.defaultSenderNumber,
      enableReminders: true,
      reminderTemplate: 'مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic} - {doctor} بتاريخ {date} الساعة {time}. نتمنى لكم دوام الصحة والعافية.',
      autoIncludeMap: true
    };

  const [waPhone, setWaPhone] = useState(currentWhatsAppSettings.phone);
  const [waEnableReminders, setWaEnableReminders] = useState(currentWhatsAppSettings.enableReminders);
  const [waTemplate, setWaTemplate] = useState(currentWhatsAppSettings.reminderTemplate);
  const [waAutoMap, setWaAutoMap] = useState(currentWhatsAppSettings.autoIncludeMap);
  const [waSuccessMsg, setWaSuccessMsg] = useState(false);

  const saveWhatsAppSettings = () => {
    const store = state.whatsappSettingsStore || {};
    const finalPhone = globalWA.allowClinicsToOverride ? waPhone.trim() : globalWA.defaultSenderNumber;
    const newConfig: WhatsAppSettings = {
      phone: finalPhone,
      enableReminders: waEnableReminders,
      reminderTemplate: waTemplate,
      autoIncludeMap: waAutoMap
    };
    updateState({
      whatsappSettingsStore: {
        ...store,
        [clinicKey]: newConfig
      }
    });
    logAction('تحديث إعدادات تذكير الواتساب', `تعديل قوالب ورقم الواتساب للمنشأة`);
    setWaSuccessMsg(true);
    setTimeout(() => setWaSuccessMsg(false), 4000);
  };

  return (
    <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <MessageCircle size={18} className="text-emerald-400" />
            <span>خدمة تذكيرات الواتساب الذكية للمرضى (WhatsApp Reminders)</span>
          </div>
          <h5 className="text-lg md:text-xl font-black text-white m-0">
            إعدادات وتخصيص تذكير الواتساب للمنشأة
          </h5>
          <p className="text-xs text-emerald-200 max-w-2xl leading-relaxed m-0">
            قم بضبط رقم هاتف الواتساب المعتمد للمنشأة وتعديل النص التلقائي لتذكير المرضى بمواعيدهم قبل الحضور.
          </p>
        </div>

        {currentClinic?.allowWhatsApp === false && (
          <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <Shield size={16} className="text-amber-400 shrink-0" />
            <span>تنبيه: ميزة الواتساب معطلة حالياً من قبل المطور العام لهذه المنشأة.</span>
          </div>
        )}

        {globalWA.enabled === false && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <Shield size={16} className="text-red-400 shrink-0" />
            <span>عطل عام: تم إيقاف بوابة إرسال الواتساب مؤقتاً للصيانة العامة من قِبل مطور النظام.</span>
          </div>
        )}
      </div>

      {waSuccessMsg && (
        <div className="mb-4 bg-emerald-500/30 border border-emerald-400 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-300" />
          <span>تم حفظ إعدادات الواتساب ورقم المنشأة ونموذج التذكير بنجاح!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-xs font-bold text-emerald-200 mb-1.5">
            رقم هاتف المنشأة للواتساب (سعودي / مصري / دولي)
          </label>
          <input
            type="text"
            value={globalWA.allowClinicsToOverride ? waPhone : globalWA.defaultSenderNumber}
            onChange={e => setWaPhone(e.target.value)}
            disabled={!globalWA.allowClinicsToOverride}
            placeholder="010XXXXXXXX أو 9665XXXXXXXX"
            className={`w-full px-4 py-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-sm font-bold text-white font-mono focus:outline-none focus:border-emerald-400 ${
              !globalWA.allowClinicsToOverride ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            dir="ltr"
          />
          {!globalWA.allowClinicsToOverride && (
            <span className="text-[10px] text-amber-300 font-bold block mt-1">🔒 تم تثبيت رقم الإرسال المعتمد من قبل المطور العام.</span>
          )}
        </div>

        <div className="flex items-center gap-3 bg-emerald-950/50 p-3 rounded-xl border border-emerald-800/60 self-end">
          <input
            type="checkbox"
            id="waEnable"
            checked={waEnableReminders}
            onChange={e => setWaEnableReminders(e.target.checked)}
            className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
          />
          <label htmlFor="waEnable" className="text-xs font-bold text-emerald-100 cursor-pointer">
            تفعيل زِر وإشعارات تذكير الواتساب في جدول المواعيد وسجلات المرضى
          </label>
        </div>

        <div className="flex items-center gap-3 bg-emerald-950/50 p-3 rounded-xl border border-emerald-800/60 self-end">
          <input
            type="checkbox"
            id="waAutoMap"
            checked={waAutoMap}
            onChange={e => setWaAutoMap(e.target.checked)}
            className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
          />
          <label htmlFor="waAutoMap" className="text-xs font-bold text-emerald-100 cursor-pointer">
            إرفاق رابط الموقِع الجغرافي للمستشفى/العيادة تلقائياً بالرسالة
          </label>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-emerald-200">
            قالب رسالة التذكير القابلة للتخصيص (Custom Message Template)
          </label>
          <div className="text-[11px] text-emerald-300">
            الوسوم المتاحة: <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">&#123;patient&#125;</code> <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">&#123;clinic&#125;</code> <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">&#123;doctor&#125;</code> <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">&#123;date&#125;</code> <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">&#123;time&#125;</code>
          </div>
        </div>
        <textarea
          rows={3}
          value={waTemplate}
          onChange={e => setWaTemplate(e.target.value)}
          className="w-full px-4 py-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 leading-relaxed"
          placeholder="اكتب قالب التذكير..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveWhatsAppSettings}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Save size={18} />
          <span>حفظ إعدادات وتصريحات الواتساب للمنشأة</span>
        </button>
      </div>
    </div>
  );
}
