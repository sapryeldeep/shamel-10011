import React from 'react';
import { Sparkles, Edit3, Key, Syringe, Building2, Shield, Check, Printer } from 'lucide-react';
import { MEDICAL_SPECIALTIES } from '../../../lib/specialties';

export const CLINIC_MODULES = [
  { id: 'queue', label: 'طابور الانتظار (الاستقبال)' },
  { id: 'appointments', label: 'إدارة المواعيد والحجوزات' },
  { id: 'patients', label: 'الملف الطبي الشامل (EMR)' },
  { id: 'prescription', label: 'الروشتة والوصفات الطبية' },
  { id: 'operations', label: 'أقسام المستشفى (الطوارئ ER / العمليات OR / الإقامة)' },
  { id: 'staff-payroll', label: 'الكوادر البشرية ومسير الرواتب (HR)' },
  { id: 'insurance', label: 'التأمين الطبي ومطالبات TPA' },
  { id: 'reports', label: 'التقارير الطبية السريرية' },
  { id: 'pharmacy', label: 'المخزون والصيدلية' },
  { id: 'settings', label: 'الإعدادات والخدمات والمالية' }
];

interface ClinicFormCardProps {
  editingId: string | null;
  name: string;
  setName: (v: string) => void;
  docName: string;
  setDocName: (v: string) => void;
  systemType: 'clinic' | 'center' | 'hospital';
  setSystemType: (v: 'clinic' | 'center' | 'hospital') => void;
  specialty: string;
  setSpecialty: (v: string) => void;
  selectedSpecialties: string[];
  setSelectedSpecialties: (v: string[]) => void;
  phone: string;
  setPhone: (v: string) => void;
  adminUsername: string;
  setAdminUsername: (v: string) => void;
  adminPass: string;
  setAdminPass: (v: string) => void;
  contractPrice: number | '';
  setContractPrice: (v: number | '') => void;
  notes: string;
  setNotes: (v: string) => void;
  expiry: string;
  setExpiry: (v: string) => void;
  modules: string[];
  setModules: React.Dispatch<React.SetStateAction<string[]>>;
  allowWhatsApp: boolean;
  setAllowWhatsApp: (v: boolean) => void;
  allowPrinting: boolean;
  setAllowPrinting: (v: boolean) => void;
  allowChatbot: boolean;
  setAllowChatbot: (v: boolean) => void;
  geminiApiKey: string;
  setGeminiApiKey: (v: string) => void;
  dbType: 'cloud_firebase' | 'local_sql' | 'external_sql';
  setDbType: (v: 'cloud_firebase' | 'local_sql' | 'external_sql') => void;
  dbHost: string;
  setDbHost: (v: string) => void;
  dbPort: string;
  setDbPort: (v: string) => void;
  dbUser: string;
  setDbUser: (v: string) => void;
  dbPass: string;
  setDbPass: (v: string) => void;
  dbName: string;
  setDbName: (v: string) => void;
  generateRandomCredentials: () => void;
  setPresetExpiry: (months: number) => void;
  setPermanentExpiry: () => void;
  saveClinic: (printAfterSave: boolean) => void;
  resetForm: () => void;
  actionSuccessMsg: string | null;
}

export default function ClinicFormCard({
  editingId,
  name,
  setName,
  docName,
  setDocName,
  systemType,
  setSystemType,
  specialty,
  setSpecialty,
  selectedSpecialties,
  setSelectedSpecialties,
  phone,
  setPhone,
  adminUsername,
  setAdminUsername,
  adminPass,
  setAdminPass,
  contractPrice,
  setContractPrice,
  notes,
  setNotes,
  expiry,
  setExpiry,
  modules,
  setModules,
  allowWhatsApp,
  setAllowWhatsApp,
  allowPrinting,
  setAllowPrinting,
  allowChatbot,
  setAllowChatbot,
  geminiApiKey,
  setGeminiApiKey,
  dbType,
  setDbType,
  dbHost,
  setDbHost,
  dbPort,
  setDbPort,
  dbUser,
  setDbUser,
  dbPass,
  setDbPass,
  dbName,
  setDbName,
  generateRandomCredentials,
  setPresetExpiry,
  setPermanentExpiry,
  saveClinic,
  resetForm,
  actionSuccessMsg
}: ClinicFormCardProps) {
  const toggleModule = (modId: string) => {
    setModules(prev => prev.includes(modId) ? prev.filter(x => x !== modId) : [...prev, modId]);
  };

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
      {actionSuccessMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <Check size={18} className="text-emerald-600 shrink-0" />
          {actionSuccessMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <h6 className="font-bold text-base text-slate-800 flex items-center gap-2">
          {editingId ? <Edit3 size={18} className="text-amber-600" /> : <Sparkles size={18} className="text-blue-600" />}
          {editingId ? 'تعديل وتجديد بيانات المنشأة والترخيص' : 'إنشاء منشأة جديدة وتوليد حساب المدير الرئيسي فوراً'}
        </h6>
        {!editingId && (
          <button
            type="button"
            onClick={generateRandomCredentials}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200/50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Key size={14} /> اقتراح اسم مستخدم وكلمة مرور عشوائية
          </button>
        )}
      </div>

      {/* Quick Presets Bar */}
      {!editingId && (
        <div className="mb-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl border border-blue-200/80">
          <label className="block text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <Sparkles size={16} className="text-blue-600" />
            <span>اختيار نماذج وتكوين المنشأة بضغطة واحدة (Quick Hospital Templates):</span>
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setName('مستشفى ومجمع مراكز الغسيل الكلوي ورعاية الكلى');
                setSystemType('hospital');
                setSpecialty('أمراض الكلى والغسيل الكلوي');
                setSelectedSpecialties(['أمراض الكلى والغسيل الكلوي', 'جراحة الأوعية الدموية', 'الباطنة العامة والجهاز الهضمي', 'العناية المركزة والطوارئ']);
                setModules(CLINIC_MODULES.map(m => m.id));
                setNotes('مستشفى مخصص لغسيل الكلى والدعم الكلوي الشامل مع كافة الأجهزة والمستلزمات الطبية والفستولا');
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Syringe size={15} />
              <span>🧪 مستشفى غسيل كلوي ورعاية الكلى (Hemodialysis)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setName('مستشفى السلام العام والعيادات التخصصية');
                setSystemType('hospital');
                setSpecialty('عام (متعدد التخصصات)');
                setSelectedSpecialties(MEDICAL_SPECIALTIES.map(s => s.name));
                setModules(CLINIC_MODULES.map(m => m.id));
                setNotes('مستشفى عام مفتوح لكافة التخصصات والعمليات والطوارئ والأقسام السريرية');
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Building2 size={15} />
              <span>🏥 مستشفى عام (تخصصات مفتوحة / متعددة)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSystemType('hospital');
                setSpecialty('');
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>✏️ مستشفى / مركز تخصصي (كتابة يدوي حرة)</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            اسم المنشأة الطبية <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            placeholder="مثال: مستشفى غسيل كلوي أو مستشفى الشفاء العام..." 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع المنشأة الطبية</label>
          <select 
            value={systemType} 
            onChange={e => setSystemType(e.target.value as 'clinic'|'center'|'hospital')} 
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="clinic">عيادة خاصة (تخصص محدد)</option>
            <option value="center">مركز طبي متكامل (اختيار عدة تخصصات)</option>
            <option value="hospital">مستشفى عام / غسيل كلوي (تخصصات مفتوحة / كتابة حرة)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">التخصص الرئيسي / اكتب باليد</label>
          <div className="flex flex-col gap-1.5">
            <input 
              type="text" 
              value={specialty} 
              onChange={e => setSpecialty(e.target.value)} 
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500" 
              placeholder="اكتب التخصص باليد (مثلاً: غسيل كلوي، مستشفى عام...)" 
            />
            <select
              value={specialty || ''}
              onChange={e => { if (e.target.value) setSpecialty(e.target.value); }}
              className="w-full px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">أو اختر من التخصصات الشائعة...</option>
              <option value="أمراض الكلى والغسيل الكلوي">🧪 أمراض الكلى والغسيل الكلوي (Hemodialysis)</option>
              <option value="عام (متعدد التخصصات)">🏥 عام (متعدد التخصصات / تخصصات مفتوحة)</option>
              {MEDICAL_SPECIALTIES.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الطبيب أو المدير المسؤول</label>
          <input 
            type="text" 
            value={docName} 
            onChange={e => setDocName(e.target.value)} 
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500" 
            placeholder="د. أحمد محمود..." 
          />
        </div>
      </div>

      {/* Multi-Specialties Selection for Medical Centers and Hospitals */}
      {(systemType === 'center' || systemType === 'hospital') && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
          <label className="block text-xs font-bold text-slate-800 mb-2">
            التخصصات المتاحة بالمركز / المستشفى (يمكن اختيار أكثر من تخصص للتقارير السريرية):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {MEDICAL_SPECIALTIES.map(s => {
              const checked = selectedSpecialties.includes(s.name);
              return (
                <label key={s.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${checked ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedSpecialties([...selectedSpecialties, s.name]);
                      } else {
                        setSelectedSpecialties(selectedSpecialties.filter(x => x !== s.name));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="truncate">{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Credentials & Contact Sub-Box */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 mb-5 shadow-xs">
        <div className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
          <Key size={16} /> بيانات حساب المدير للعميل (Owner / Clinic Admin Account)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              اسم مستخدم المدير (Username للدخول) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={adminUsername} 
              onChange={e => setAdminUsername(e.target.value)} 
              dir="ltr"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-blue-700 focus:bg-white focus:border-blue-500" 
              placeholder="dr.ahmed101" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              كلمة المرور (Password) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={adminPass} 
              onChange={e => setAdminPass(e.target.value)} 
              dir="ltr"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-500" 
              placeholder="pass123456" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">رقم هاتف العميل للتواصل</label>
            <input 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-blue-500" 
              placeholder="010XXXXXXXX" 
            />
          </div>
        </div>
      </div>

      {/* Subscription & Pricing Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            مدة صلاحية الترخيص والاشتراك <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <input 
              type="date" 
              value={expiry} 
              onChange={e => setExpiry(e.target.value)} 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-500" 
            />
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setPresetExpiry(1)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer">+ شهر</button>
              <button type="button" onClick={() => setPresetExpiry(3)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer">+ 3 شهور</button>
              <button type="button" onClick={() => setPresetExpiry(6)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer">+ 6 شهور</button>
              <button type="button" onClick={() => setPresetExpiry(12)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer">+ 1 سنة</button>
              <button type="button" onClick={() => setPresetExpiry(24)} className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer">+ سنتين</button>
              <button type="button" onClick={setPermanentExpiry} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">ترخيص دائم</button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">قيمة التعاقد / البيع (EGP)</label>
          <input 
            type="number" 
            min="0"
            value={contractPrice} 
            onChange={e => setContractPrice(e.target.value ? Number(e.target.value) : '')} 
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:border-blue-500" 
            placeholder="مثال: 5000" 
          />
        </div>
      </div>

      {/* Master Developer Feature Toggles */}
      <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-xl mb-6">
        <label className="block text-xs font-bold text-purple-900 mb-2.5 flex items-center gap-1.5">
          <Shield size={16} className="text-purple-600" /> صلاحيات وتحكم المطور العام المباشر (Master Permission Toggles):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <label className="flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-purple-100 cursor-pointer shadow-xs">
            <input
              type="checkbox"
              checked={allowWhatsApp}
              onChange={e => setAllowWhatsApp(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">📱 تذكير واتساب (WhatsApp)</span>
              <span className="text-[10px] text-slate-500">سماح أو حظر إرسال التذكيرات</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-purple-100 cursor-pointer shadow-xs">
            <input
              type="checkbox"
              checked={allowPrinting}
              onChange={e => setAllowPrinting(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">🩻 الطباعة والتحميل (PDF)</span>
              <span className="text-[10px] text-slate-500">سماح أو حظر تصدير وطباعة المستندات</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-purple-100 cursor-pointer shadow-xs">
            <input
              type="checkbox"
              checked={allowChatbot}
              onChange={e => setAllowChatbot(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">🤖 الشات بوت الطبي (AI)</span>
              <span className="text-[10px] text-slate-500">تفعيل أو إيقاف المساعد الذكي</span>
            </div>
          </label>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">مفتاح الذكاء الاصطناعي (Gemini API Key)</label>
          <input 
            type="text" 
            value={geminiApiKey} 
            onChange={e => setGeminiApiKey(e.target.value)} 
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:border-blue-500" 
            placeholder="AI API Key (اتركه فارغاً لإيقاف البوت لهذه المنشأة)" 
            dir="ltr"
          />
        </div>
      </div>

      {/* Database Isolation & Server Config per Clinic */}
      <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl mb-6">
        <label className="block text-xs font-bold text-blue-900 mb-2.5 flex items-center gap-1.5">
          <Building2 size={16} className="text-blue-600" /> التحكم في خادم قاعدة البيانات ومسار السحابة (Independent Server Config):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <label className={`flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border cursor-pointer shadow-xs transition-all ${dbType === 'cloud_firebase' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}>
            <input
              type="radio"
              name="clinicDbType"
              checked={dbType === 'cloud_firebase'}
              onChange={() => setDbType('cloud_firebase')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">☁️ السحابة العامة الافتراضية</span>
              <span className="text-[10px] text-slate-500">Firebase Cloud Server (المشتركة)</span>
            </div>
          </label>

          <label className={`flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border cursor-pointer shadow-xs transition-all ${dbType === 'local_sql' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}>
            <input
              type="radio"
              name="clinicDbType"
              checked={dbType === 'local_sql'}
              onChange={() => setDbType('local_sql')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">🖥️ سيرفر داخلي (محلي)</span>
              <span className="text-[10px] text-slate-500">Local SQL Server (داخل المنشأة)</span>
            </div>
          </label>

          <label className={`flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border cursor-pointer shadow-xs transition-all ${dbType === 'external_sql' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'}`}>
            <input
              type="radio"
              name="clinicDbType"
              checked={dbType === 'external_sql'}
              onChange={() => setDbType('external_sql')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">🌐 سيرفر خارجي مستقل</span>
              <span className="text-[10px] text-slate-500">Cloud SQL (MySQL / Postgres / SQL Server)</span>
            </div>
          </label>
        </div>

        {dbType !== 'cloud_firebase' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-fade-in">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">عنوان السيرفر (Server Host / IP)</label>
              <input
                type="text"
                value={dbHost}
                onChange={e => setDbHost(e.target.value)}
                placeholder="localhost أو 192.168.1.50 أو sql.domain.com"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">المنفذ (Port)</label>
              <input
                type="text"
                value={dbPort}
                onChange={e => setDbPort(e.target.value)}
                placeholder="3306 أو 5432"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">اسم المستخدم (DB User)</label>
              <input
                type="text"
                value={dbUser}
                onChange={e => setDbUser(e.target.value)}
                placeholder="root"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">كلمة المرور (DB Password)</label>
              <input
                type="text"
                value={dbPass}
                onChange={e => setDbPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 text-right">اسم قاعدة البيانات الخاصة بالمنشأة (Database Name)</label>
              <input
                type="text"
                value={dbName}
                onChange={e => setDbName(e.target.value)}
                placeholder="shamel_clinic_db"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <div className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100 leading-relaxed font-bold">
                ⚠️ سيقوم السيستم بعزل بيانات هذه العيادة وتوجيهها لقاعدة البيانات المُدخلة بشكل منعزل ومستقل تماماً.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modules Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700">الوحدات الوظيفية المفعلة للمنشأة (Modules)</label>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setModules(CLINIC_MODULES.map(m => m.id))}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              تفعيل الكل
            </button>
            <span className="text-slate-300">|</span>
            <button 
              type="button" 
              onClick={() => setModules([])}
              className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
            >
              إلغاء الكل
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {CLINIC_MODULES.map(m => (
            <label key={m.id} className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={modules.includes(m.id)} 
                onChange={() => toggleModule(m.id)} 
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
              />
              <span className="text-xs font-semibold text-slate-700">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save & Print Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button 
          type="button"
          onClick={() => saveClinic(false)} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          {editingId ? <Edit3 size={18} /> : <Check size={18} />}
          {editingId ? 'حفظ تعديلات المنشأة' : 'حفظ واعتماد المنشأة والحساب'}
        </button>

        <button 
          type="button"
          onClick={() => saveClinic(true)} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Printer size={18} />
          {editingId ? 'حفظ وطباعة وثيقة الترخيص' : 'حفظ وطباعة إيصال التسليم والترخيص'}
        </button>

        {editingId && (
          <button 
            type="button"
            onClick={resetForm} 
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        )}
      </div>
    </div>
  );
}
