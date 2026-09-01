import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Plus, Printer, Trash2, Stethoscope, CheckCircle, Sparkles, ShoppingBag, ShieldAlert, CheckSquare, X } from 'lucide-react';
import { ClinicalReport } from '../types';
import { MEDICAL_SPECIALTIES, getSpecialtyName } from '../lib/specialties';
import { getSpecialtyFields } from '../lib/specialtyFields';
import { getPatientNeedsForSpecialty } from '../lib/specialtyNeeds';

export default function ClinicalReports() {
  const { state, updateState, currentUser } = useAppContext();
  const getClinicId = () => currentUser?.role === 'master_admin' ? (state.clinics[0]?.id || 'master') : (currentUser?.clinicId || '');
  const clinicId = getClinicId();
  const clinicObj = state.clinics.find(c => String(c.id) === String(clinicId));
  
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  
  // Available Specialties for this clinic/center/hospital
  const availableSpecialties = React.useMemo(() => {
    if (!clinicObj) return MEDICAL_SPECIALTIES;
    if (clinicObj.systemType === 'hospital' || (clinicObj.specialties && clinicObj.specialties.length > 0)) {
      if (clinicObj.specialties && clinicObj.specialties.length > 0) {
        return MEDICAL_SPECIALTIES.filter(s => clinicObj.specialties?.includes(s.name) || clinicObj.specialties?.includes(s.id));
      }
      return MEDICAL_SPECIALTIES;
    }
    // Single specialty clinic
    const mainSpec = clinicObj.specialty;
    const found = MEDICAL_SPECIALTIES.find(s => s.name === mainSpec || s.id === mainSpec);
    return found ? [found] : MEDICAL_SPECIALTIES;
  }, [clinicObj]);

  const defaultSpecialty = availableSpecialties[0]?.id || 'general_hospital';

  // Form State
  const [patientName, setPatientName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialtyKey, setSpecialtyKey] = useState(defaultSpecialty);
  const [specialtyData, setSpecialtyData] = useState<Record<string, string>>({});
  
  // Patient Needs per Specialty State
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [customNeedText, setCustomNeedText] = useState('');

  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [physicalExamination, setPhysicalExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null);

  // AI Diagnostic assistant states
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiResult, setAiResult] = useState<{ diagnosis: string; code: string; treatment: string; advice: string } | null>(null);
  const [aiError, setAiError] = useState('');

  const runAiDiagnosis = async () => {
    const queryText = diagnosis.trim() || chiefComplaint.trim() || specialtyKey;
    if (!queryText) {
      alert('يرجى كتابة الشكوى الرئيسية أو التشخيص المبدئي أولاً ليقوم الذكاء الاصطناعي بمساعدتك بشكل دقيق!');
      return;
    }

    setAiSuggesting(true);
    setAiError('');
    setAiResult(null);

    try {
      const apiKey = clinicObj?.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert clinical medical coding and clinical advisor assistant.
A doctor is compiling a medical report for a patient with:
- Medical Specialty: ${getSpecialtyName(specialtyKey)}
- Patient Chief Complaint: ${chiefComplaint}
- Current Diagnosis Text (Raw): ${diagnosis}
- Vital Signs: BP: ${bp}, Pulse: ${hr}, Temp: ${temp}, Weight: ${weight}

Please provide a highly professional clinical diagnosis and a detailed treatment plan, along with matching international ICD-10 classification codes.
Return strictly a valid JSON object in the following format (no other text or markdown codeblocks outside JSON):
{
  "diagnosis": "Highly polished professional diagnosis in Arabic",
  "code": "ICD-10 Code with its precise description in Arabic and English (e.g. E11.9 Diabetes Mellitus without complications)",
  "treatment": "Comprehensive treatment plan, medication interactions, clinical advice, and follow-up in Arabic",
  "advice": "Clinical tip or warning for the treating physician"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "";
      const cleaned = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = JSON.parse(cleaned);
      setAiResult(parsed);
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_MISSING" || String(err).includes("API_KEY_MISSING")) {
        setAiError("مفتاح API الخاص بـ Gemini غير متوفر للعيادة. يرجى تهيئة مفتاح API الخاص بـ Gemini للعيادة من إعدادات النظام.");
      } else {
        setAiError("حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي. يرجى تكرار المحاولة.");
      }
    } finally {
      setAiSuggesting(false);
    }
  };

  const clinicReports = (state.reports || []).filter(r => String(r.clinicId) === String(clinicId));
  const clinicDepartments = (state.departments || []).filter(d => String(d.clinicId) === String(clinicId));
  
  const uniquePatients = Array.from(new Set([
    ...(Object.values(state.queue || {}).flat() as any[]).map(q => q?.name).filter(Boolean),
    ...(Object.values(state.archive || {}).flat() as any[]).map(a => a?.name).filter(Boolean)
  ]));

  const currentSpecialtyFields = getSpecialtyFields(specialtyKey);
  const currentSpecialtyNeeds = getPatientNeedsForSpecialty(specialtyKey);

  const toggleNeed = (title: string) => {
    if (selectedNeeds.includes(title)) {
      setSelectedNeeds(selectedNeeds.filter(n => n !== title));
    } else {
      setSelectedNeeds([...selectedNeeds, title]);
    }
  };

  const addCustomNeed = () => {
    if (!customNeedText.trim()) return;
    if (!selectedNeeds.includes(customNeedText.trim())) {
      setSelectedNeeds([...selectedNeeds, customNeedText.trim()]);
    }
    setCustomNeedText('');
  };

  const handleSpecialtyFieldChange = (key: string, val: string) => {
    setSpecialtyData(prev => ({ ...prev, [key]: val }));
  };

  const saveReport = () => {
    if (!patientName || !diagnosis) {
      alert('يرجى إدخال اسم المريض والتشخيص السريري على الأقل');
      return;
    }

    const report: ClinicalReport = {
      id: Date.now().toString(),
      patientName,
      clinicId,
      departmentId: departmentId || 'general',
      doctorId: currentUser?.id || '',
      doctorName: currentUser?.name || '',
      date: new Date().toISOString().split('T')[0],
      specialtyKey,
      specialtyName: getSpecialtyName(specialtyKey),
      vitalSigns: { bp, hr, temp, weight },
      chiefComplaint,
      medicalHistory,
      physicalExamination,
      diagnosis,
      treatmentPlan,
      specialtyFields: specialtyData,
      patientNeeds: selectedNeeds
    };

    updateState({ reports: [...(state.reports || []), report] });
    
    // Reset form
    setPatientName('');
    setBp(''); setHr(''); setTemp(''); setWeight('');
    setChiefComplaint(''); setMedicalHistory(''); setPhysicalExamination('');
    setDiagnosis(''); setTreatmentPlan('');
    setSpecialtyData({});
    setSelectedNeeds([]);
    
    alert('تم حفظ التقرير السريري واحتياجات المريض بنجاح!');
  };

  const deleteReport = (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذا التقرير؟')) {
      updateState({ reports: state.reports.filter(r => String(r.id) !== String(id)) });
    }
  };

  const printReport = () => {
    window.print();
  };

  const viewReport = (r: ClinicalReport) => {
    setSelectedReport(r);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> التقارير السريرية المتخصصة
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            تقارير سريرية مخصصة لكل تخصص طبي (أوعية دموية، قدم سكري، باطنة، عظام، قلب...)
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            كتابة تقرير جديد
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            سجل التقارير ({clinicReports.length})
          </button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto custom-scrollbar flex-1 print:fixed print:inset-0 print:z-[9999] print:m-0 print:w-full print:h-full print:border-0 print:shadow-none print:rounded-none">
          
          <div className="hidden print:block mb-8 border-b border-slate-200 pb-4 text-center">
             <h2 className="text-2xl font-bold text-slate-800 m-0">تقرير طبي سريري موثق</h2>
             <p className="text-slate-600 font-bold m-0 mt-2">{clinicObj?.name || 'المنشأة الطبية'}</p>
          </div>

          {/* Specialty Selector & Basic Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المريض <span className="text-red-500">*</span></label>
              <input type="text" list="patients-list" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300" placeholder="اسم المريض بالكامل..." />
              <datalist id="patients-list">
                {uniquePatients.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الطبي للتقرير <span className="text-blue-600">*</span></label>
              <select 
                value={specialtyKey} 
                onChange={e => {
                  setSpecialtyKey(e.target.value);
                  setSpecialtyData({});
                }} 
                className="w-full px-4 py-2 bg-blue-50/60 border border-blue-200 rounded-lg text-sm font-bold text-blue-900 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300"
              >
                {availableSpecialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">القسم الطبي الداخلي</label>
              <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300 print:appearance-none">
                <option value="general">قسم عيادات خارجية عامة</option>
                {clinicDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Specialty Specific Fields Box */}
          {currentSpecialtyFields.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-xl p-5 print:bg-white print:border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-100">
                <h6 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <Stethoscope size={18} className="text-blue-600" />
                  الفحوصات والمؤشرات السريرية الخاصة بتخصص ({getSpecialtyName(specialtyKey)})
                </h6>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold print:hidden">
                  تخصص مفصل
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                {currentSpecialtyFields.map(field => (
                  <div key={field.key} className={field.key.includes('Notes') || field.key.includes('Exam') ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <textarea
                      rows={field.key.includes('Notes') ? 2 : 1}
                      value={specialtyData[field.key] || ''}
                      onChange={e => handleSpecialtyFieldChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 print:border-slate-300"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vital Signs Box */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 print:bg-white print:border-slate-200">
            <h6 className="font-bold text-slate-800 text-sm mb-3">العلامات الحيوية (Vital Signs)</h6>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">ضغط الدم (BP)</label>
                <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm print:border-slate-300" placeholder="120/80" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">النبض (Pulse)</label>
                <input type="text" value={hr} onChange={e => setHr(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm print:border-slate-300" placeholder="80 bpm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">الحرارة (Temp)</label>
                <input type="text" value={temp} onChange={e => setTemp(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm print:border-slate-300" placeholder="37 C" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">الوزن (Weight)</label>
                <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm print:border-slate-300" placeholder="70 kg" />
              </div>
            </div>
          </div>

          {/* Standard Medical Sections */}
          <div className="grid grid-cols-1 gap-5 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الشكوى الرئيسية (Chief Complaint)</label>
              <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300" placeholder="وصف شكوى المريض الرئيسية..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ الطبي والعمليات الجراحية (Medical History)</label>
              <textarea value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300" placeholder="الأمراض المزمنة، الجراحات السابقة، الحساسية..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الفحص السريري الشامل (Physical Examination)</label>
              <textarea value={physicalExamination} onChange={e => setPhysicalExamination(e.target.value)} rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300" placeholder="ملاحظات الفحص البدني الإكلينيكي..." />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 print:bg-white print:border-none print:p-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1 print:hidden">
                <label className="block text-xs font-bold text-slate-700">التشخيص النهائي / الأولي (Diagnosis) <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={runAiDiagnosis}
                  disabled={aiSuggesting}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-[11px] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Sparkles size={12} className="animate-pulse" />
                  {aiSuggesting ? 'جاري التحليل السريري...' : 'مساعد التشخيص الذكي وترميز ICD-10 ✨'}
                </button>
              </div>
              <label className="hidden print:block text-xs font-bold text-slate-700 mb-1">التشخيص النهائي / الأولي (Diagnosis) <span className="text-red-500">*</span></label>
              <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300" placeholder="التشخيص الطبي... اكتب التشخيص أو أعراض المرض ثم اضغط على زر المساعد الذكي للحصول على ترميز دولي" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">خطة العلاج والمتابعة (Treatment Plan)</label>
              <textarea value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)} rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 print:bg-white print:border-slate-300" placeholder="الأدوية الموصى بها، النصائح، وموعد الإعادة..." />
            </div>
          </div>

          {/* Specialty Patient Needs Section */}
          <div className="mb-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 print:bg-white print:border-slate-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200">
              <h6 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-600" />
                احتياجات وتجهيزات المريض الخاصة بتخصص ({getSpecialtyName(specialtyKey)})
              </h6>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold print:hidden">
                متطلبات ومستلزمات علاجية
              </span>
            </div>
            
            <p className="text-xs text-slate-600 mb-3 print:hidden">
              اختر احتياجات المريض والمستلزمات الطبية أو الإرشادات الخاصة الموصى بها لهذا التخصص:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
              {currentSpecialtyNeeds.map(need => {
                const isSelected = selectedNeeds.includes(need.title);
                return (
                  <div
                    key={need.id}
                    onClick={() => toggleNeed(need.title)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                      isSelected 
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                        : 'bg-white border-emerald-200 text-slate-800 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                      isSelected ? 'border-white bg-white text-emerald-700' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle size={12} className="stroke-[3]" />}
                    </div>
                    <div>
                      <strong className="block text-xs font-bold">{need.title}</strong>
                      {need.description && (
                        <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {need.description}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Need Input */}
            <div className="flex gap-2 print:hidden">
              <input
                type="text"
                value={customNeedText}
                onChange={e => setCustomNeedText(e.target.value)}
                placeholder="إضافة تلبية / احتياج خاص بالطلب..."
                className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={addCustomNeed}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                + إضافة متطلب
              </button>
            </div>

            {/* Printed Selected Needs */}
            {selectedNeeds.length > 0 && (
              <div className="hidden print:block mt-3 border-t border-slate-200 pt-2">
                <h6 className="font-bold text-slate-900 text-xs mb-1">احتياجات وتجهيزات المريض الخاصة:</h6>
                <ul className="list-disc pr-5 text-xs text-slate-800 space-y-1">
                  {selectedNeeds.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-4 print:hidden">
            <button onClick={saveReport} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Plus size={18} /> حفظ التقرير السريري
            </button>
            <button onClick={printReport} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Printer size={18} /> طباعة مباشرة
            </button>
          </div>

          <div className="hidden print:block mt-12 pt-8 border-t border-slate-200">
             <div className="flex justify-between items-end">
               <div className="text-sm text-slate-500">التاريخ: {new Date().toISOString().split('T')[0]}</div>
               <div className="text-center">
                 <div className="text-xs text-slate-500 mb-2">الطبيب المعالج</div>
                 <strong className="text-slate-800 text-lg">د. {currentUser?.name}</strong>
               </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col print:hidden">
          <div className="overflow-y-auto overflow-x-auto custom-scrollbar flex-1 p-6">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">المريض</th>
                  <th className="px-4 py-3">التخصص السريري</th>
                  <th className="px-4 py-3">التشخيص</th>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">الطبيب</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {clinicReports.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400">لا توجد تقارير سريرية مسجلة بعد</td></tr>
                ) : clinicReports.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{r.patientName}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        {r.specialtyName || getSpecialtyName(r.specialtyKey || '')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium max-w-xs truncate">{r.diagnosis}</td>
                    <td className="px-4 py-3 text-slate-500">{r.date}</td>
                    <td className="px-4 py-3">{r.doctorName}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => viewReport(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs" title="معاينة وطباعة">
                          <Printer size={16} /> معاينة وطباعة
                        </button>
                        <button onClick={() => deleteReport(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden Print Template for List View Viewers */}
      {selectedReport && (
        <div className="hidden print:block print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-8">
           <div className="mb-8 border-b border-slate-200 pb-4 text-center">
             <h2 className="text-2xl font-bold text-slate-800 m-0">تقرير طبي / سريري موثق</h2>
             <p className="text-slate-600 font-bold m-0 mt-2">{clinicObj?.name || 'منشأة طبية'}</p>
             <div className="text-xs text-blue-700 font-bold mt-1">تخصص: {selectedReport.specialtyName || getSpecialtyName(selectedReport.specialtyKey || '')}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div><strong>اسم المريض:</strong> {selectedReport.patientName}</div>
            <div><strong>القسم:</strong> {clinicDepartments.find(d => d.id === selectedReport.departmentId)?.name || 'عام'}</div>
            <div><strong>تاريخ التقرير:</strong> {selectedReport.date}</div>
            <div><strong>الطبيب المعالج:</strong> د. {selectedReport.doctorName}</div>
          </div>

          {/* Specialty Specific Fields in Print */}
          {selectedReport.specialtyFields && Object.keys(selectedReport.specialtyFields).length > 0 && (
            <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
              <h6 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-3">
                المؤشرات والفحوصات السريرية الخاصة بتخصص ({selectedReport.specialtyName || getSpecialtyName(selectedReport.specialtyKey || '')})
              </h6>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(selectedReport.specialtyFields).map(([k, val]) => {
                  if (!val) return null;
                  const fieldConfig = getSpecialtyFields(selectedReport.specialtyKey || '').find(f => f.key === k);
                  const label = fieldConfig ? fieldConfig.label : k;
                  return (
                    <div key={k} className={k.includes('Notes') || k.includes('Exam') ? 'col-span-2' : ''}>
                      <span className="font-bold text-slate-800">{label}: </span>
                      <span className="text-slate-900">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h6 className="font-bold text-slate-800 border-b pb-1 mb-2">العلامات الحيوية (Vital Signs)</h6>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>BP: {selectedReport.vitalSigns.bp || '--'}</div>
              <div>Pulse: {selectedReport.vitalSigns.hr || '--'}</div>
              <div>Temp: {selectedReport.vitalSigns.temp || '--'}</div>
              <div>Weight: {selectedReport.vitalSigns.weight || '--'}</div>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {selectedReport.chiefComplaint && <div><h6 className="font-bold text-slate-800 border-b pb-1 mb-1">الشكوى الرئيسية</h6><p>{selectedReport.chiefComplaint}</p></div>}
            {selectedReport.medicalHistory && <div><h6 className="font-bold text-slate-800 border-b pb-1 mb-1">التاريخ الطبي</h6><p>{selectedReport.medicalHistory}</p></div>}
            {selectedReport.physicalExamination && <div><h6 className="font-bold text-slate-800 border-b pb-1 mb-1">الفحص السريري</h6><p>{selectedReport.physicalExamination}</p></div>}
            {selectedReport.diagnosis && <div><h6 className="font-bold text-slate-800 border-b pb-1 mb-1 text-base text-blue-900">التشخيص الطبي</h6><p className="font-bold">{selectedReport.diagnosis}</p></div>}
            {selectedReport.treatmentPlan && <div><h6 className="font-bold text-slate-800 border-b pb-1 mb-1">خطة العلاج والمتابعة</h6><p>{selectedReport.treatmentPlan}</p></div>}
            {selectedReport.patientNeeds && selectedReport.patientNeeds.length > 0 && (
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 mt-3">
                <h6 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2">احتياجات وتجهيزات المريض المخصصة للتخصص:</h6>
                <ul className="list-disc pr-5 space-y-1 text-slate-800 font-medium">
                  {selectedReport.patientNeeds.map((need, idx) => (
                    <li key={idx}>{need}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end">
             <div className="text-sm text-slate-500">التاريخ: {selectedReport.date}</div>
             <div className="text-center">
               <div className="text-xs text-slate-500 mb-2">توقيع الطبيب المعالج</div>
               <strong className="text-slate-800 text-lg">د. {selectedReport.doctorName}</strong>
             </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {(aiSuggesting || aiResult || aiError) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h5 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600 animate-spin-slow" />
                مستشار الذكاء الاصطناعي والترميز السريري (Gemini-3.7)
              </h5>
              <button
                type="button"
                onClick={() => {
                  setAiSuggesting(false);
                  setAiResult(null);
                  setAiError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {aiSuggesting && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-600">جاري قراءة الأعراض السريرية، تحليل الشكوى، ومطابقة التصنيف الدولي للأمراض (ICD-10)...</p>
              </div>
            )}

            {aiError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 space-y-2">
                <p className="font-bold">{aiError}</p>
                <p>يرجى التأكد من تفعيل الاتصال بالإنترنت أو مراجعة مفتاح API الخاص بالعيادة.</p>
              </div>
            )}

            {aiResult && (
              <div className="space-y-4 text-right" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-600">التشخيص السريري المقترح</span>
                    <p className="text-sm font-extrabold text-slate-800">{aiResult.diagnosis}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-600">رمز التصنيف الدولي (ICD-10 Code)</span>
                    <p className="text-sm font-extrabold text-emerald-800">{aiResult.code}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  <span className="text-[10px] uppercase font-bold text-slate-500">الخطة العلاجية الدقيقة والجرعات الموصى بها</span>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{aiResult.treatment}</p>
                </div>

                {aiResult.advice && (
                  <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
                    <strong>تنبيه طبي:</strong> {aiResult.advice}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosis(`${aiResult.diagnosis} - [ICD-10: ${aiResult.code}]`);
                      setTreatmentPlan(aiResult.treatment);
                      setAiResult(null);
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare size={14} /> اعتماد التشخيص وخطة العلاج المقترحة بالكامل
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiResult(null)}
                    className="px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                  >
                    تجاهل
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
