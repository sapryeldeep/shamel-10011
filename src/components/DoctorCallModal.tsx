import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { announceDoctorCall } from '../lib/audioVoice';
import { Stethoscope, Volume2, AlertTriangle, X, Check, Building2, Bell, Radio } from 'lucide-react';

interface DoctorCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS = [
  'قسم الطوارئ والاستقبال (ER)',
  'غرفة العمليات الجراحية (OR)',
  'العناية المركزة (ICU)',
  'عيادة الكشف رقم 1',
  'عيادة الكشف رقم 2',
  'عيادة العظام',
  'عيادة الباطنة والقلب',
  'عيادة الأطفال',
  'عيادة النساء والولادة',
  'قسم الأشعة والتصوير الطبي',
  'المختبر وبنك الدم',
  'الاستقبال العام',
  'إدارة المستشفى',
];

export default function DoctorCallModal({ isOpen, onClose }: DoctorCallModalProps) {
  const { state, currentUser, logAction } = useAppContext();

  const cId = currentUser?.clinicId || 'master';
  const clinicUsers = state.users.filter(u => cId === 'master' || u.clinicId === cId);
  const doctorsList = clinicUsers.filter(u => u.role === 'doctor');

  const [selectedDoctor, setSelectedDoctor] = useState(doctorsList[0]?.name || '');
  const [customDoctor, setCustomDoctor] = useState('');
  const [useCustomName, setUseCustomName] = useState(doctorsList.length === 0);
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]);
  const [customDept, setCustomDept] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [isCalling, setIsCalling] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);

  if (!isOpen) return null;

  const doctorName = useCustomName ? customDoctor.trim() : selectedDoctor.trim();
  const locationDept = customDept.trim() || selectedDept;

  const handleCallDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName) return;

    setIsCalling(true);
    setCallSuccess(false);

    try {
      // 1. Voice Announcement with Chime in Arabic
      await announceDoctorCall(doctorName, locationDept, urgency);

      // 2. Broadcast active call in state if available
      const callLog = {
        id: 'call_' + Date.now(),
        type: 'doctor' as const,
        targetName: doctorName,
        location: locationDept,
        urgency,
        timestamp: new Date().toISOString(),
        timeStr: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      const currentBroadcasts = state.activeDoctorCalls || [];
      updateStateWithDoctorCall(callLog);

      logAction(
        'نداء كادر طبي',
        `نداء صوتي على الدكتور: ${doctorName} للتوجه إلى: ${locationDept} (${urgency === 'emergency' ? 'طوارئ' : urgency === 'urgent' ? 'عاجل' : 'عادي'})`
      );

      setCallSuccess(true);
      setTimeout(() => {
        setIsCalling(false);
        setCallSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Call doctor error:', err);
      setIsCalling(false);
    }
  };

  const updateStateWithDoctorCall = (callLog: any) => {
    try {
      // Store in window / localStorage for waiting screen broadcast
      const existingStr = localStorage.getItem('hospital_active_calls');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [callLog, ...existing].slice(0, 10);
      localStorage.setItem('hospital_active_calls', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Storage sync:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div>
              <h5 className="font-bold text-lg m-0">منظومة النداء الصوتي للأطباء والكوادر</h5>
              <p className="text-xs text-blue-100 m-0">إذاعة نداء صوتي فوري في سماعات المستشفى وشاشات الانتظار</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleCallDoctor} className="p-6 space-y-4">
          {/* Doctor Name Selection */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">اسم الطبيب أو الكادر المطلوب *</label>
              <button
                type="button"
                onClick={() => setUseCustomName(!useCustomName)}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                {useCustomName ? 'اختر من قائمة الأطباء' : 'كتابة اسم يدوي'}
              </button>
            </div>

            {useCustomName || doctorsList.length === 0 ? (
              <input
                type="text"
                value={customDoctor}
                onChange={e => setCustomDoctor(e.target.value)}
                placeholder="مثال: د. أحمد الشناوي (استشاري الجراحة)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-hidden"
                required
                autoFocus
              />
            ) : (
              <select
                value={selectedDoctor || ''}
                onChange={e => setSelectedDoctor(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-hidden"
              >
                {!selectedDoctor && <option value="">اختر الطبيب...</option>}
                {doctorsList.map((doc, idx) => (
                  <option key={`${doc.id || 'doc'}_${doc.username || ''}_${idx}`} value={doc.name}>
                    {doc.name} ({doc.specialty || 'طبيب'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Department / Location Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">المكان أو القسم المطلوب التوجه إليه *</label>
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setCustomDept('');
              }}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:border-blue-600 focus:outline-hidden mb-2"
            >
              {DEPARTMENTS.map((dept, idx) => (
                <option key={`dept_${idx}_${dept}`} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customDept}
              onChange={e => setCustomDept(e.target.value)}
              placeholder="أو اكتب مكاناً مخصصاً (مثال: غرفة العناية 304 / طابق 3)"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:border-blue-600 focus:outline-hidden text-slate-700"
            />
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">مستوى أهمية النداء (درجة الاستعجال)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  urgency === 'normal'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bell size={16} />
                <span>عادي (استدعاء)</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  urgency === 'urgent'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Radio size={16} />
                <span>هام وعاجل</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('emergency')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  urgency === 'emergency'
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle size={16} />
                <span>طوارئ قصوى (Code)</span>
              </button>
            </div>
          </div>

          {/* Preview Announcement Text */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">نص النداء الصوتي الذي سيُذاع بالعربية:</span>
            <p className="italic text-slate-700 m-0">
              {urgency === 'emergency'
                ? `📢 "نداء عاجل وهام! دكتور ${doctorName || '...'}، يرجى التوجه فوراً وبأقصى سرعة إلى ${locationDept}"`
                : urgency === 'urgent'
                ? `📢 "نداء هام، الدكتور ${doctorName || '...'}، مطلوب فوراً في ${locationDept}"`
                : `📢 "نداء إلى الدكتور ${doctorName || '...'}، يرجى التوجه إلى ${locationDept}"`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isCalling || !doctorName}
              className={`flex-2 py-2.5 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                callSuccess
                  ? 'bg-emerald-600'
                  : urgency === 'emergency'
                  ? 'bg-red-600 hover:bg-red-700'
                  : urgency === 'urgent'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {isCalling ? (
                <>
                  <Volume2 size={16} className="animate-spin" />
                  <span>جاري إذاعة النداء الصوتي...</span>
                </>
              ) : callSuccess ? (
                <>
                  <Check size={16} />
                  <span>تمت الإذاعة بنجاح!</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} />
                  <span>إذاعة النداء الصوتي الآن 🔊</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
