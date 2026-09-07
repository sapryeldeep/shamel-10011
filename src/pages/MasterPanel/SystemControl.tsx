import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Settings, ShieldAlert, Megaphone, CheckCircle, RefreshCcw, Power, 
  MessageSquare, Phone, ShieldCheck, HelpCircle, Eye, Trash2, CheckCircle2, Save, Building2
} from 'lucide-react';

export default function SystemControl() {
  const { state, updateState, logAction } = useAppContext();

  // Announcement state
  const [announcementMsg, setAnnouncementMsg] = useState(state.globalAnnouncement?.message || '');
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'error'>(state.globalAnnouncement?.type || 'info');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(state.globalAnnouncement?.active || false);

  // WhatsApp Global Control State
  const waConfig = state.globalWhatsAppConfig || {
    enabled: true,
    defaultSenderNumber: '01065826742',
    allowClinicsToOverride: true
  };

  const [waEnabled, setWaEnabled] = useState(waConfig.enabled);
  const [waDefaultSender, setWaDefaultSender] = useState(waConfig.defaultSenderNumber);
  const [waAllowOverride, setWaAllowOverride] = useState(waConfig.allowClinicsToOverride);
  const [waSuccess, setWaSuccess] = useState(false);

  // Live edits of clinic WhatsApp numbers inside the directory table
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [tempClinicWaPhone, setTempClinicWaPhone] = useState('');

  const handleSaveWaGlobalConfig = () => {
    updateState({
      globalWhatsAppConfig: {
        enabled: waEnabled,
        defaultSenderNumber: waDefaultSender.trim(),
        allowClinicsToOverride: waAllowOverride
      }
    });
    logAction('تحديث إعدادات الواتساب العالمية', `تعديل إعدادات الإرسال والتحكم للواتساب بواسطة المطور`);
    setWaSuccess(true);
    setTimeout(() => setWaSuccess(false), 3000);
  };

  const handleSaveClinicSpecificWaPhone = (clinicId: string) => {
    const store = state.whatsappSettingsStore || {};
    const existing = store[clinicId] || {
      phone: '',
      enableReminders: true,
      reminderTemplate: 'مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic} - {doctor} بتاريخ {date} الساعة {time}. نتمنى لكم دوام الصحة والعافية.',
      autoIncludeMap: true
    };
    updateState({
      whatsappSettingsStore: {
        ...store,
        [clinicId]: {
          ...existing,
          phone: tempClinicWaPhone.trim()
        }
      }
    });
    logAction('تحديث هاتف واتساب لمنشأة', `تعديل هاتف الواتساب للمنشأة ${clinicId} بواسطة المطور`);
    setEditingClinicId(null);
  };

  // Maintenance state
  const isMaintenance = state.maintenanceMode || false;

  const handleToggleMaintenance = () => {
    const newVal = !isMaintenance;
    if (newVal) {
      if (!confirm('تحذير: سيتم طرد جميع المستخدمين النشطين باستثناء حساب المطور. هل أنت متأكد من تفعيل وضع الصيانة؟')) return;
    }
    updateState({ maintenanceMode: newVal });
    logAction(newVal ? 'تفعيل وضع الصيانة' : 'إيقاف وضع الصيانة', 'تغيير حالة النظام بالكامل');
  };

  const handleSaveAnnouncement = () => {
    updateState({
      globalAnnouncement: {
        message: announcementMsg,
        type: announcementType,
        active: isAnnouncementActive
      }
    });
    logAction('تحديث إعلانات النظام', isAnnouncementActive ? `نشر إعلان: ${announcementMsg}` : 'إيقاف الإعلان العام');
    alert('تم حفظ إعدادات الإعلان العام بنجاح.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <Power size={24} />
          </div>
          <div>
            <h6 className="font-extrabold text-slate-800 text-base">وضع الصيانة الشامل (Maintenance Mode)</h6>
            <p className="text-xs text-slate-500 mt-1 font-medium">إغلاق النظام مؤقتاً أمام جميع العيادات والمستخدمين للتحديث أو الصيانة.</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
          <div>
            <p className="font-bold text-slate-800 text-sm">حالة النظام حالياً:</p>
            <p className={`text-xs font-bold mt-1 ${isMaintenance ? 'text-red-600' : 'text-emerald-600'}`}>
              {isMaintenance ? '🔴 مغلق للصيانة' : '🟢 يعمل بشكل طبيعي'}
            </p>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${
              isMaintenance ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isMaintenance ? (
              <>إيقاف وضع الصيانة</>
            ) : (
              <>
                <ShieldAlert size={18} />
                تفعيل وضع الصيانة
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <Megaphone size={24} />
          </div>
          <div>
            <h6 className="font-extrabold text-slate-800 text-base">الإعلانات العالمية (Global Broadcast)</h6>
            <p className="text-xs text-slate-500 mt-1 font-medium">إرسال رسالة تظهر كشريط علوي لجميع مستخدمي النظام بجميع العيادات.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نص الرسالة</label>
            <input
              type="text"
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              placeholder="مثال: سيتم تحديث النظام الليلة في تمام الساعة 2 صباحاً..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الإعلان (اللون)</label>
              <select
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              >
                <option value="info">أزرق (معلومة / تحديث)</option>
                <option value="warning">أصفر (تنبيه / صيانة قادمة)</option>
                <option value="error">أحمر (عطل / خطأ هام)</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 border border-slate-200 rounded-lg w-full h-[38px]">
                <input
                  type="checkbox"
                  checked={isAnnouncementActive}
                  onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-bold text-slate-800">تفعيل الإعلان (ظهور للجميع)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveAnnouncement}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center gap-2"
            >
              <CheckCircle size={18} />
              حفظ ونشر
            </button>
          </div>
        </div>
      </div>

      {/* بوابة التحكم العالمية في الواتساب */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <h6 className="font-extrabold text-slate-800 text-base">بوابة التحكم العالمية في الواتساب (Global WhatsApp API Portal)</h6>
            <p className="text-xs text-slate-500 mt-1 font-medium">التحكم في تشغيل ميزة التذكيرات بالكامل للمنشآت، وإدارة الأرقام المعتمدة للإرسال.</p>
          </div>
        </div>

        {waSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>تم حفظ إعدادات الواتساب العالمية وتطبيقها على جميع المنشآت بنجاح!</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">خدمة الواتساب لجميع المنشآت</p>
                <p className="text-[10px] text-slate-400 mt-0.5">تفعيل أو إيقاف الخدمة عالمياً</p>
              </div>
              <button
                onClick={() => setWaEnabled(!waEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  waEnabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {waEnabled ? 'نشط عالمياً ✓' : 'معطل مؤقتاً 🛑'}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم المعتمد لإرسال التذكيرات</label>
              <input
                type="text"
                value={waDefaultSender}
                onChange={e => setWaDefaultSender(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 font-mono"
                placeholder="رقم المطور أو الرقم الافتراضي..."
                dir="ltr"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">تخصيص الأرقام للمنشآت</p>
                <p className="text-[10px] text-slate-400 mt-0.5">السماح للعيادات بإدخال رقمها الخاص</p>
              </div>
              <button
                onClick={() => setWaAllowOverride(!waAllowOverride)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  waAllowOverride ? 'bg-blue-600 text-white shadow-xs' : 'bg-amber-600 text-white'
                }`}
              >
                {waAllowOverride ? 'مسموح بالتخصيص ✓' : 'إجبار الرقم الافتراضي 🔒'}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={handleSaveWaGlobalConfig}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> حفظ إعدادات المطور للواتساب
            </button>
          </div>

          {/* دليل هواتف وأرقام إرسال المنشآت */}
          <div className="border-t border-slate-200/80 pt-6">
            <h6 className="font-bold text-slate-800 text-xs mb-4 flex items-center gap-1.5">
              <Building2 size={16} className="text-slate-500" />
              دليل هواتف المنشآت وأرقام الواتساب النشطة (Clinic WhatsApp Routing Directory)
            </h6>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">المنشأة</th>
                    <th className="px-4 py-2.5">النوع</th>
                    <th className="px-4 py-2.5">رقم الاتصال المسجل</th>
                    <th className="px-4 py-2.5">رقم الواتساب الفعلي للإرسال</th>
                    <th className="px-4 py-2.5">حالة الخدمة</th>
                    <th className="px-4 py-2.5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {state.clinics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">لا توجد منشآت (عيادات أو مستشفيات) مسجلة في النظام حالياً.</td>
                    </tr>
                  ) : (
                    state.clinics.map(c => {
                      const waSetting = state.whatsappSettingsStore?.[c.id];
                      const currentWaPhone = waSetting?.phone || c.phone || waDefaultSender;
                      const hasOverride = !!waSetting?.phone;

                      return (
                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.systemType === 'hospital' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              c.systemType === 'center' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {c.systemType === 'hospital' ? 'مستشفى' : c.systemType === 'center' ? 'مركز طبي' : 'عيادة تخصصية'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold" dir="ltr">{c.phone || '—'}</td>
                          <td className="px-4 py-3 font-mono">
                            {editingClinicId === c.id ? (
                              <input
                                type="text"
                                value={tempClinicWaPhone}
                                onChange={e => setTempClinicWaPhone(e.target.value)}
                                className="px-2 py-1 bg-white border border-slate-300 rounded font-bold text-xs"
                                placeholder="010XXXXXXXX"
                              />
                            ) : (
                              <span className={`font-bold ${hasOverride ? 'text-blue-600' : 'text-slate-400'}`}>
                                {currentWaPhone} {hasOverride ? ' (مخصص ✓)' : ' (الافتراضي)'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                              !waEnabled ? 'bg-red-500' : (c.allowWhatsApp !== false ? 'bg-emerald-500' : 'bg-red-500')
                            }`} title={!waEnabled ? 'معطل عالمياً' : (c.allowWhatsApp !== false ? 'نشط للمنشأة' : 'معطل للمنشأة')} />
                            <span className="text-[10px] font-bold mr-1.5 text-slate-500">
                              {!waEnabled ? 'معطل عالمياً' : (c.allowWhatsApp !== false ? 'نشط للمنشأة' : 'معطل من الإعدادات')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {editingClinicId === c.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleSaveClinicSpecificWaPhone(c.id)}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={() => setEditingClinicId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingClinicId(c.id);
                                  setTempClinicWaPhone(waSetting?.phone || c.phone || '');
                                }}
                                className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[10px] font-bold"
                              >
                                تعديل الرقم
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
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
