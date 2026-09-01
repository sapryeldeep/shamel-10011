import React, { useState } from 'react';
import { QueueDisplaySettings } from '../types';
import { announcePatientCall } from '../lib/audioVoice';
import { 
  X, Volume2, Image as ImageIcon, MessageSquare, 
  Play, Settings, Check, RefreshCw, Layers, ShieldCheck,
  Sparkles, Sliders, Palette, Zap
} from 'lucide-react';

interface QueueSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QueueDisplaySettings;
  onSaveSettings: (newSettings: QueueDisplaySettings) => void;
}

const DEFAULT_QUEUE_SETTINGS: QueueDisplaySettings = {
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

export default function QueueSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}: QueueSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'sound' | 'media' | 'ticker'>('sound');
  const [form, setForm] = useState<QueueDisplaySettings>(() => ({
    ...DEFAULT_QUEUE_SETTINGS,
    ...(settings || {})
  }));
  const [testStatusMsg, setTestStatusMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setForm({
        ...DEFAULT_QUEUE_SETTINGS,
        ...settings
      });
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleChange = (key: keyof QueueDisplaySettings, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTestVoiceCall = () => {
    setTestStatusMsg('جاري تشغيل تجربة الصوت والنداء...');
    announcePatientCall('أحمد محمود السيد', 'عيادة الباطنة العامة', {
      chimeType: form.chimeType,
      repeatCount: form.repeatCount,
      speechRate: form.speechRate,
      callPhraseTemplate: form.callPhraseTemplate,
      volume: form.volume
    });
    setTimeout(() => setTestStatusMsg(null), 4000);
  };

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  const presetImages = [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
  ];

  const presetPhraseTemplates = [
    "المريض {patient}، تفضل بالدخول إلى {clinic}",
    "عزيزي المريض {patient}، نرجو التوجه فوراً إلى {clinic}",
    "نداء إلى المريض {patient}، يرجى التوجه لـ {clinic} للكشف",
    "دور المريض {patient}، تفضل بزيارة {clinic}"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Header Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white m-0 flex items-center gap-2">
                <span>إعدادات شاشة الانتظار والنداء الذكي</span>
                <span className="text-[11px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  تخصيص مباشر
                </span>
              </h3>
              <p className="text-xs text-slate-400 m-0">التحكم في شريط الحالة، مستوى عرض الصور والإعلانات، وإعدادات الصوت</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sound')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sound'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Volume2 size={16} />
            <span>الصوت والنداء الصوتي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <ImageIcon size={16} />
            <span>عرض الصور والإعلانات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ticker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ticker'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={16} />
            <span>شريط الأخبار والحالة</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* TAB 1: Sound & Voice Settings */}
          {activeTab === 'sound' && (
            <div className="space-y-6">
              
              {/* Enable Sound Toggle */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white m-0 flex items-center gap-2">
                    <Volume2 size={18} className="text-emerald-400" />
                    <span>تفعيل نظام النداء والصوت الآلي</span>
                  </h4>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">تشغيل النغمات والنطق الآلي الصوتي باللغة العربية عند نداء المريض</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.soundEnabled} 
                    onChange={e => handleChange('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Chime Style & Repeat Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    🔔 نوع نغمة التنبيه (Hospital Chime Style):
                  </label>
                  <select
                    value={form.chimeType}
                    onChange={e => handleChange('chimeType', e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="standard">نغمة المستشفى المزدوجة القياسية (C-E-G)</option>
                    <option value="emergency">نغمة الطوارئ والتنبيه العالي (Code Blue Alert)</option>
                    <option value="digital">نغمة رقمية حديثة (Modern Chime)</option>
                    <option value="none">بدون نغمة (صوت النداء مباشرة)</option>
                  </select>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    🔄 تكرار النداء الآلي (Repeat Count):
                  </label>
                  <select
                    value={form.repeatCount}
                    onChange={e => handleChange('repeatCount', parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>مرة واحدة (Once)</option>
                    <option value={2}>مرتان متتاليتان (Twice)</option>
                    <option value={3}>3 مرات متتالية (3 Times)</option>
                  </select>
                </div>
              </div>

              {/* Speech Speed & Volume Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300">⚡ سرعة نطق المتحدث الآلي:</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{form.speechRate}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.7" 
                    max="1.2" 
                    step="0.05"
                    value={form.speechRate}
                    onChange={e => handleChange('speechRate', parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>بطيء ومستقر</span>
                    <span>معتدل</span>
                    <span>سريع</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300">🔊 مستوى الصوت العام (Volume):</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{Math.round(form.volume * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1"
                    value={form.volume}
                    onChange={e => handleChange('volume', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>منخفض</span>
                    <span>متوسط</span>
                    <span>مرتفع</span>
                  </div>
                </div>
              </div>

              {/* Call Phrase Template */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  🗣️ صيغة قالب جملة النداء الصوتي:
                </label>
                <input 
                  type="text"
                  value={form.callPhraseTemplate ?? ''}
                  onChange={e => handleChange('callPhraseTemplate', e.target.value)}
                  placeholder="المريض {patient}، تفضل بالدخول إلى {clinic}"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  استخدم المتغيرات <code className="text-cyan-300 font-bold">{'{patient}'}</code> لاسم المريض، و <code className="text-cyan-300 font-bold">{'{clinic}'}</code> للعيادة.
                </span>

                <div className="mt-3 flex flex-wrap gap-2">
                  {presetPhraseTemplates.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange('callPhraseTemplate', p)}
                      className="text-[10px] bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Audio Button */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-xs text-blue-300 m-0">اختبار سماع الصوت والنداء الآن</h5>
                  <p className="text-[11px] text-slate-400 m-0">تأكد من ضبط الصوت ومستوى النغمات قبل الاعتماد</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestVoiceCall}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Play size={16} />
                  <span>تشغيل نداء تجريبي 📢</span>
                </button>
              </div>

              {testStatusMsg && (
                <div className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-3 rounded-xl font-bold flex items-center gap-2 animate-fade-in">
                  <Sparkles size={16} />
                  {testStatusMsg}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Media & Images Slideshow Level Settings */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              
              {/* Layout Mode Selector */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                <label className="block text-xs font-bold text-slate-300 mb-3">
                  🖼️ مستوى ونمط عرض الصور والإعلانات (Media Display Mode):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => handleChange('mediaLayoutMode', 'none')}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      form.mediaLayoutMode === 'none'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white mb-1">بدون صور (شاشة كاملة للطابور)</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">تركيز كامل على طابور المرضى والعيادات بدون مساحات إعلامية.</p>
                    </div>
                    {form.mediaLayoutMode === 'none' && <Check size={16} className="text-blue-400 mt-2" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('mediaLayoutMode', 'banner')}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      form.mediaLayoutMode === 'banner'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white mb-1">بطاقة إعلانية/صورة جانبية</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">عرض صورة ثابتة واحدة مع الإرشادات الطبية بجوار الطابور.</p>
                    </div>
                    {form.mediaLayoutMode === 'banner' && <Check size={16} className="text-blue-400 mt-2" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('mediaLayoutMode', 'slideshow')}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      form.mediaLayoutMode === 'slideshow'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white mb-1">معرض شرائح تلقائي (Slideshow)</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">تبديل تلقائي بين الصور التوعوية الصحية وإعلانات المستشفى.</p>
                    </div>
                    {form.mediaLayoutMode === 'slideshow' && <Check size={16} className="text-blue-400 mt-2" />}
                  </button>

                </div>
              </div>

              {/* Interval & Healthcare Tips Options */}
              {form.mediaLayoutMode !== 'none' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      ⏱️ زمن التنقل والتبديل بين الصور (Interval):
                    </label>
                    <select
                      value={form.slideshowIntervalSeconds}
                      onChange={e => handleChange('slideshowIntervalSeconds', parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value={3}>كل 3 ثواني (سريع)</option>
                      <option value={5}>كل 5 ثواني (قياسي)</option>
                      <option value={8}>كل 8 ثواني (مستحسن)</option>
                      <option value={10}>كل 10 ثواني (مستقر)</option>
                      <option value={15}>كل 15 ثانية (هادئ)</option>
                    </select>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-white m-0">عرض التوجيهات الطبية والتوعية</h5>
                      <p className="text-[11px] text-slate-400 m-0 mt-0.5">إظهار نصائح الوقاية والتغذية الصحية أسفل الصور</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.showHealthcareTips} 
                        onChange={e => handleChange('showHealthcareTips', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                </div>
              )}

              {/* Preset Healthcare Image Gallery */}
              {form.mediaLayoutMode !== 'none' && (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    🖼️ مكتبة الصور الطبية والتوعوية المعتمدة:
                  </label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {presetImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video">
                        <img src={imgUrl} alt={`Preset ${idx+1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-1 rounded-md">صورة معتمدة #{idx+1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Ticker / Marquee Settings */}
          {activeTab === 'ticker' && (
            <div className="space-y-6">
              
              {/* Show Ticker Toggle */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white m-0 flex items-center gap-2">
                    <MessageSquare size={18} className="text-cyan-400" />
                    <span>إظهار شريط الأخبار والتنويهات السفلي</span>
                  </h4>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">عرض التوجيهات العامة والأخبار المتحركة في أسفل الشاشة للمراجعين</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.showTicker} 
                    onChange={e => handleChange('showTicker', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {form.showTicker && (
                <>
                  {/* Ticker Text Input */}
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      ✍️ نص الشريط التنويهي المتحرك:
                    </label>
                    <textarea
                      rows={3}
                      value={form.tickerText ?? ''}
                      onChange={e => handleChange('tickerText', e.target.value)}
                      placeholder="أدخل نص التوجيهات والأخبار..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>

                  {/* Ticker Speed & Color Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        ⚡ سرعة حركة الشريط:
                      </label>
                      <select
                        value={form.tickerSpeed}
                        onChange={e => handleChange('tickerSpeed', e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                      >
                        <option value="slow">بطيئة (سهولة قراءة)</option>
                        <option value="normal">عادية (قياسي)</option>
                        <option value="fast">سريعة</option>
                      </select>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        🎨 لون خلفية الشريط:
                      </label>
                      <select
                        value={form.tickerBgColor}
                        onChange={e => handleChange('tickerBgColor', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                      >
                        <option value="#0f172a">كحلي داكن (Dark Slate)</option>
                        <option value="#1e3a8a">أزرق داكن (Dark Blue)</option>
                        <option value="#064e3b">أخضر زمردي (Dark Green)</option>
                        <option value="#881337">أحمر عنابي (Burgundy)</option>
                      </select>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        ✨ لون نص الخط:
                      </label>
                      <select
                        value={form.tickerTextColor}
                        onChange={e => handleChange('tickerTextColor', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                      >
                        <option value="#38bdf8">أزرق سماوي (Cyan Blue)</option>
                        <option value="#fde047">أصفر زاهي (Bright Yellow)</option>
                        <option value="#ffffff">أبيض ناصع (Pure White)</option>
                        <option value="#4ade80">أخضر فاتح (Emerald Green)</option>
                      </select>
                    </div>

                  </div>

                  {/* Live Marquee Preview Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <span className="text-[11px] text-slate-400 font-bold block mb-2">معاينة مباشرة لشريط التنويهات:</span>
                    <div 
                      className="p-3 rounded-xl overflow-hidden font-bold text-xs"
                      style={{ backgroundColor: form.tickerBgColor, color: form.tickerTextColor }}
                    >
                      <div className="whitespace-nowrap animate-marquee">
                        {form.tickerText}
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Check size={16} />
            <span>حفظ واعتماد التعديلات الشاملة</span>
          </button>
        </div>

      </div>
    </div>
  );
}
