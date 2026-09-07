import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { announcePatientCall, announceDoctorCall } from '../lib/audioVoice';
import DoctorCallModal from '../components/DoctorCallModal';
import QueueSettingsModal from '../components/QueueSettingsModal';
import { QueueDisplaySettings } from '../types';
import { 
  Tv, Volume2, VolumeX, Maximize2, Minimize2, Clock, 
  User, Stethoscope, AlertTriangle, ArrowRight, 
  Sparkles, ShieldCheck, HeartPulse, RefreshCw, Radio,
  Settings, Image as ImageIcon, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultDisplaySettings: QueueDisplaySettings = {
  tickerText: "🏥 أهلاً بكم في المستشفى التخصصي | نرجو من السادة المراجعين التزام الهدوء والانتظار حتى سماع النداء الصوتي | لطوارئ المستشفى والاستفسارات: يرجى التوجه لمكتب الاستقبال الرئيسي | نتمنى لجميع مراجعينا دوام الصحة والعافية",
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

const healthcareTipsList = [
  "💡 التوعية الصحية: شرب 8 أكواب من الماء يومياً يساعد في تحسين الدورة الدموية ووظائف الكلى.",
  "🍎 التغذية السليمة: تناول الخضروات والفواكه الطازجة يقوي جهاز المناعة ويحمي من الأمراض المزمنة.",
  "🏃 الرياضة والصحة: 30 دقيقة من المشي اليومي تقلل خطورة الإصابة بأمراض القلب وضغط الدم.",
  "🧼 الوقاية خير من العلاج: غسل اليدين بالماء والصابون لمدة 20 ثانية يمنع انتقال العدوى الفيروسية."
];

export default function QueueDisplayScreen() {
  const { state, currentUser, updateState } = useAppContext();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const userClinicId = currentUser?.clinicId || 'default';
  const [selectedClinicId, setSelectedClinicId] = useState<string>(isMaster ? 'all' : userClinicId);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [activeDoctorAlert, setActiveDoctorAlert] = useState<{
    targetName: string;
    location: string;
    urgency: 'normal' | 'urgent' | 'emergency';
    timeStr: string;
  } | null>(null);

  // Retrieve Clinic-specific or Master Queue Display Settings
  const clinicSettingsKey = selectedClinicId === 'all' ? 'master' : selectedClinicId;
  const displaySettings: QueueDisplaySettings = 
    state.queueDisplaySettingsStore?.[clinicSettingsKey] || 
    state.queueDisplaySettingsStore?.['master'] || 
    defaultDisplaySettings;

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slideshow interval timer
  useEffect(() => {
    if (displaySettings.mediaLayoutMode === 'slideshow' && displaySettings.customImages.length > 0) {
      const intervalMs = (displaySettings.slideshowIntervalSeconds || 8) * 1000;
      const slideTimer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % displaySettings.customImages.length);
      }, intervalMs);
      return () => clearInterval(slideTimer);
    }
  }, [displaySettings.mediaLayoutMode, displaySettings.slideshowIntervalSeconds, displaySettings.customImages]);

  // Listen to cross-tab / local storage doctor call alerts
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('hospital_active_calls');
        if (stored) {
          const calls = JSON.parse(stored);
          if (calls && calls.length > 0) {
            const latest = calls[0];
            const ageMs = Date.now() - new Date(latest.timestamp).getTime();
            if (ageMs < 15000) {
              setActiveDoctorAlert(latest);
            }
          }
        }
      } catch (e) {
        console.warn(e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Clear doctor alert after 12 seconds
  useEffect(() => {
    if (activeDoctorAlert) {
      const t = setTimeout(() => {
        setActiveDoctorAlert(null);
      }, 12000);
      return () => clearTimeout(t);
    }
  }, [activeDoctorAlert]);

  // Aggregate queue items
  const allClinics = state.clinics || [];
  const activeClinic = allClinics.find(c => c.id === selectedClinicId);

  let displayedQueue: any[] = [];
  if (selectedClinicId === 'all') {
    Object.keys(state.queue || {}).forEach(k => {
      const items = (state.queue[k] || []).map(item => ({
        ...item,
        clinicName: allClinics.find(c => c.id === k)?.name || 'العيادة العامة'
      }));
      displayedQueue.push(...items);
    });
  } else {
    displayedQueue = (state.queue?.[selectedClinicId] || []).map(item => ({
      ...item,
      clinicName: activeClinic?.name || 'العيادة'
    }));
  }

  // Active in-consultation patient
  const currentInExam = displayedQueue.find(p => p.status === 'in');
  // Waiting queue list
  const waitingList = displayedQueue.filter(p => p.status === 'waiting');
  // Completed today
  const doneList = displayedQueue.filter(p => p.status === 'done');

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Call Patient
  const handleCallPatient = (patientName: string, clinicName?: string) => {
    if (displaySettings.soundEnabled) {
      announcePatientCall(patientName, clinicName, {
        chimeType: displaySettings.chimeType,
        repeatCount: displaySettings.repeatCount,
        speechRate: displaySettings.speechRate,
        callPhraseTemplate: displaySettings.callPhraseTemplate,
        volume: displaySettings.volume
      });
    }
  };

  // Call Next Patient
  const handleCallNext = () => {
    if (waitingList.length === 0) return;
    const nextPatient = waitingList[0];
    
    // Update queue in state
    const updatedQueue = { ...state.queue };
    
    const markInAsDone = (list: any[]) =>
      (list || []).map(item => item.status === 'in' ? { ...item, status: 'done' as const } : item);

    Object.keys(updatedQueue).forEach(k => {
      updatedQueue[k] = markInAsDone(updatedQueue[k]).map(item => 
        String(item.id) === String(nextPatient.id) ? { ...item, status: 'in' as const } : item
      );
    });

    updateState({ queue: updatedQueue });

    if (displaySettings.soundEnabled) {
      announcePatientCall(nextPatient.name, nextPatient.clinicName, {
        chimeType: displaySettings.chimeType,
        repeatCount: displaySettings.repeatCount,
        speechRate: displaySettings.speechRate,
        callPhraseTemplate: displaySettings.callPhraseTemplate,
        volume: displaySettings.volume
      });
    }
  };

  const handleSaveDisplaySettings = (newSettings: QueueDisplaySettings) => {
    const store = state.queueDisplaySettingsStore || {};
    const updatedStore = {
      ...store,
      [clinicSettingsKey]: newSettings
    };
    updateState({ queueDisplaySettingsStore: updatedStore });
  };

  // Format Time & Date
  const timeFormatted = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateFormatted = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hospitalTitle = activeClinic ? activeClinic.name : (state.clinics[0]?.name || 'المستشفى التخصصي الحديث');

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-x-hidden select-none font-sans"
      dir="rtl"
      style={{ fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif' }}
    >
      {/* Top TV Header Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <HeartPulse size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white m-0 flex items-center gap-2">
              <span>{hospitalTitle}</span>
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
                شاشة النداء الرقمية
              </span>
            </h1>
            <p className="text-xs text-slate-400 m-0">نظام إدارة الطوابير والنداء الصوتي الذكي</p>
          </div>
        </div>

        {/* Live Clock & Date */}
        <div className="flex items-center gap-6">
          <div className="text-left hidden sm:block">
            <div className="text-2xl md:text-3xl font-black text-cyan-400 tracking-wider font-mono">
              {timeFormatted}
            </div>
            <div className="text-xs text-slate-400 font-semibold">{dateFormatted}</div>
          </div>

          {/* Quick TV Screen Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDoctorModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="نداء فوري على طبيب أو كادر"
            >
              <Stethoscope size={16} />
              <span>نداء طبيب 📢</span>
            </button>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 hover:border-blue-500 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="إعدادات شاشة الانتظار والصوت والميديا"
            >
              <Settings size={16} />
              <span>⚙️ إعدادات الشاشة</span>
            </button>

            <button
              onClick={() => handleSaveDisplaySettings({ ...displaySettings, soundEnabled: !displaySettings.soundEnabled })}
              className={`p-2.5 rounded-xl border transition-all ${
                displaySettings.soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
              title={displaySettings.soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم'}
            >
              {displaySettings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="ملء الشاشة للتلفزيون"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <Link
              to="/"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>الرئيسية</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Emergency / Doctor Announcement Overlay Banner */}
      {activeDoctorAlert && (
        <div className={`px-6 py-3 border-y flex items-center justify-between animate-bounce transition-all ${
          activeDoctorAlert.urgency === 'emergency'
            ? 'bg-red-600 text-white border-red-400 shadow-xl'
            : activeDoctorAlert.urgency === 'urgent'
            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg'
            : 'bg-blue-600 text-white border-blue-400 shadow-md'
        }`}>
          <div className="flex items-center gap-3">
            <Radio className="animate-spin" size={24} />
            <div>
              <span className="font-black text-sm block">
                {activeDoctorAlert.urgency === 'emergency' ? '🚨 نداء طوارئ قصوى (Emergency Alert)' : '📢 نداء عاجل للكادر الطبي'}
              </span>
              <span className="text-xs md:text-sm font-bold">
                يرجى من الدكتور <span className="underline font-black">{activeDoctorAlert.targetName}</span> التوجه فوراً إلى: <span className="underline font-black">{activeDoctorAlert.location}</span>
              </span>
            </div>
          </div>
          <span className="text-xs bg-black/20 px-3 py-1 rounded-full font-mono font-bold">
            {activeDoctorAlert.timeStr}
          </span>
        </div>
      )}

      {/* Department Filter Bar - Visible ONLY to Master/Developer to switch clinics, regular clinics locked to their own clinic */}
      {isMaster && allClinics.length > 1 && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-xs text-slate-400 font-bold ml-2">عرض القسم:</span>
          <button
            onClick={() => setSelectedClinicId('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedClinicId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            جميع الأقسام والعيادات ({displayedQueue.length})
          </button>
          {allClinics.map((c, idx) => (
            <button
              key={c.id || `clinic_${idx}`}
              onClick={() => setSelectedClinicId(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedClinicId === c.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Waiting Screen Content */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
        
        {/* Left / Center: Currently Active Patient Inside Examination Room */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-8 border border-blue-500/30 shadow-2xl flex-1 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Calling Card Header */}
            <div className="flex justify-between items-center z-10 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
                <span className="text-sm md:text-base font-bold text-emerald-400 tracking-wide uppercase">
                  في غرفة الكشف حالياً (Now In Room)
                </span>
              </div>

              {currentInExam && (
                <button
                  onClick={() => handleCallPatient(currentInExam.name, currentInExam.clinicName)}
                  className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                  title="إعادة النداء الصوتي بالعربية"
                >
                  <Volume2 size={16} />
                  <span>إعادة النداء 🔊</span>
                </button>
              )}
            </div>

            {/* Big Center Display */}
            <div className="my-auto py-8 text-center z-10">
              {currentInExam ? (
                <div className="space-y-4">
                  <div className="inline-block bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-2 rounded-2xl text-lg md:text-xl font-black">
                    الدور رقم: #{currentInExam.id?.toString().slice(-3) || '1'}
                  </div>

                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
                    {currentInExam.name}
                  </h2>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300 text-sm md:text-base pt-2">
                    <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                      <Stethoscope size={18} className="text-blue-400" />
                      <span>{currentInExam.clinicName || 'العيادة التخصصية'}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                      <Clock size={18} className="text-emerald-400" />
                      <span>وقت الدخول: {currentInExam.time}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-slate-500">
                  <User size={64} className="mx-auto mb-4 opacity-30 text-slate-400" />
                  <h3 className="text-2xl font-bold text-slate-400">غرفة الكشف جاهزة لاستقبال المريض التالي</h3>
                  <p className="text-sm text-slate-500 mt-2">اضغط على نداء المريض التالي لبدء الكشف</p>
                </div>
              )}
            </div>

            {/* Quick Action Footer in Card */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 z-10">
              <div className="text-xs text-slate-400 font-semibold">
                إجمالي حالات اليوم: <span className="text-white font-bold">{displayedQueue.length}</span> | تم الكشف: <span className="text-emerald-400 font-bold">{doneList.length}</span>
              </div>

              {waitingList.length > 0 && (
                <button
                  onClick={handleCallNext}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Volume2 size={18} />
                  <span>نداء المريض التالي ({waitingList[0]?.name})</span>
                </button>
              )}
            </div>
          </div>

          {/* Media / Slideshow Panel Level */}
          {displaySettings.mediaLayoutMode !== 'none' && displaySettings.customImages.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl overflow-hidden relative group">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800">
                <img 
                  src={displaySettings.customImages[currentSlideIndex % displaySettings.customImages.length]} 
                  alt="Medical Awareness Slide" 
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-600/80 text-white font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                      إرشادات ومعلومات صحية
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono font-bold">
                      {currentSlideIndex + 1} / {displaySettings.customImages.length}
                    </span>
                  </div>
                  {displaySettings.showHealthcareTips && (
                    <p className="text-xs text-slate-200 font-bold mt-1.5 m-0 drop-shadow-sm">
                      {healthcareTipsList[currentSlideIndex % healthcareTipsList.length]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Upcoming Waiting Queue Table */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-amber-400" />
              <span>قائمة الانتظار القادمة</span>
            </h3>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black">
              {waitingList.length} مرضى بالانتظار
            </span>
          </div>

          {/* Scrollable Queue List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
            {waitingList.length > 0 ? (
              waitingList.map((item, idx) => (
                <div
                  key={`${item.id || 'q'}_${idx}_${item.name}`}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-950/40 to-slate-800 border-amber-500/40 shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base text-white m-0">{item.name}</h4>
                      <p className="text-xs text-slate-400 m-0">{item.clinicName || 'العيادة العامة'} - {item.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCallPatient(item.name, item.clinicName)}
                      className="p-2 bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition-all"
                      title="نداء صوتي بالاسم"
                    >
                      <Volume2 size={16} />
                    </button>
                    <span className="text-[11px] bg-slate-700/80 text-amber-300 px-2.5 py-1 rounded-lg font-bold">
                      انتظار
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <Sparkles size={40} className="mb-3 opacity-30 text-emerald-400" />
                <p className="text-base font-bold text-slate-400">لا يوجد مرضى في قائمة الانتظار حالياً</p>
                <span className="text-xs text-slate-600 mt-1">يتم تحديث الطابور تلقائياً فور تسجيل مريض جديد</span>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Bottom Ticker / News Bar */}
      {displaySettings.showTicker && (
        <footer 
          className="border-t px-6 py-3 flex items-center gap-4 text-xs font-semibold shrink-0 transition-colors"
          style={{ backgroundColor: displaySettings.tickerBgColor, borderColor: '#334155', color: displaySettings.tickerTextColor }}
        >
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-xs shrink-0 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck size={14} />
            <span>تنويهات المستشفى</span>
          </div>

          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <div 
              className={`inline-block whitespace-nowrap ${
                displaySettings.tickerSpeed === 'fast' ? 'animate-marquee' :
                displaySettings.tickerSpeed === 'slow' ? 'animate-marquee' : 'animate-marquee'
              }`}
            >
              {displaySettings.tickerText || `🏥 أهلاً بكم في ${hospitalTitle} | نرجو من السادة المراجعين التزام الهدوء والانتظار حتى سماع النداء الصوتي باسم المريض`}
            </div>
          </div>
        </footer>
      )}

      {/* Doctor Calling Modal */}
      <DoctorCallModal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
      />

      {/* Queue Display Settings Modal */}
      <QueueSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={displaySettings}
        onSaveSettings={handleSaveDisplaySettings}
      />
    </div>
  );
}

