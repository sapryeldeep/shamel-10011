
import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Stethoscope, Plus, Edit3, Trash2, Save, X, Activity, FileText, LayoutGrid } from 'lucide-react';
import { MEDICAL_SPECIALTIES } from '../../../lib/specialties';
import { getSpecialtyFields, SpecialtyFieldConfig } from '../../../lib/specialtyFields';
import { getReportTemplatesForSpecialty } from '../../../lib/specialtyReportTemplates';
import { ReportTemplate } from '../../../types';

export default function DeveloperSpecialtyConfigTab() {
  const { state, updateState, logAction } = useAppContext();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('general_hospital');
  const [activeSubTab, setActiveSubTab] = useState<'fields' | 'reports'>('fields');
  
  // Local state for fields
  const [fields, setFields] = useState<SpecialtyFieldConfig[]>(
    state.customSpecialtyFieldsStore?.[selectedSpecialty] || getSpecialtyFields(selectedSpecialty)
  );

  // Local state for report templates
  const [reports, setReports] = useState<ReportTemplate[]>(
    state.customReportTemplatesStore?.[selectedSpecialty] || getReportTemplatesForSpecialty(selectedSpecialty)
  );

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setSelectedSpecialty(newVal);
    setFields(state.customSpecialtyFieldsStore?.[newVal] || getSpecialtyFields(newVal));
    setReports(state.customReportTemplatesStore?.[newVal] || getReportTemplatesForSpecialty(newVal));
  };

  // --- Fields Handlers ---
  const handleAddField = () => {
    const newField: SpecialtyFieldConfig = {
      key: `customField_${Date.now()}`,
      label: 'حقل سريري جديد',
      placeholder: 'أدخل القيم أو الملاحظات هنا...',
      type: 'text'
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, key: keyof SpecialtyFieldConfig, value: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const handleDeleteField = (index: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الحقل؟')) {
      const updated = fields.filter((_, i) => i !== index);
      setFields(updated);
    }
  };

  // --- Reports Handlers ---
  const handleAddReport = () => {
    const newReport: ReportTemplate = {
      id: `customReport_${Date.now()}`,
      specialtyKey: selectedSpecialty,
      templateName: 'نموذج تقرير جديد',
      chiefComplaint: '',
      medicalHistory: '',
      physicalExamination: '',
      diagnosis: '',
      treatmentPlan: ''
    };
    setReports([...reports, newReport]);
  };

  const handleUpdateReport = (index: number, key: keyof ReportTemplate, value: string) => {
    const updated = [...reports];
    updated[index] = { ...updated[index], [key]: value };
    setReports(updated);
  };

  const handleDeleteReport = (index: number) => {
    if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
      const updated = reports.filter((_, i) => i !== index);
      setReports(updated);
    }
  };

  // --- Global Handlers ---
  const handleSaveConfiguration = () => {
    const currentFieldsStore = state.customSpecialtyFieldsStore || {};
    const currentReportsStore = state.customReportTemplatesStore || {};

    updateState({
      customSpecialtyFieldsStore: {
        ...currentFieldsStore,
        [selectedSpecialty]: fields
      },
      customReportTemplatesStore: {
        ...currentReportsStore,
        [selectedSpecialty]: reports
      }
    });

    logAction('تحديث إعدادات التخصص', `تم تحديث الحقول والنماذج لتخصص: ${MEDICAL_SPECIALTIES.find(s => s.id === selectedSpecialty)?.name}`, 'system');
    alert('تم حفظ إعدادات الوحدة (الحقول ونماذج التقارير) بنجاح!');
  };

  const handleResetToDefault = () => {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية لهذا التخصص؟ سيتم مسح أي حقول أو نماذج مخصصة قمت بإنشائها له.')) {
      const currentFieldsStore = { ...state.customSpecialtyFieldsStore };
      const currentReportsStore = { ...state.customReportTemplatesStore };
      
      delete currentFieldsStore[selectedSpecialty];
      delete currentReportsStore[selectedSpecialty];
      
      updateState({ 
        customSpecialtyFieldsStore: currentFieldsStore,
        customReportTemplatesStore: currentReportsStore
      });
      
      setFields(getSpecialtyFields(selectedSpecialty));
      setReports(getReportTemplatesForSpecialty(selectedSpecialty));
      alert('تمت استعادة الإعدادات الافتراضية بنجاح.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="text-indigo-600" />
            وحدة التخصصات السريرية (Fields & Reports)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            قم بإنشاء وتخصيص قوالب الكشف السريري ونماذج التقارير الطبية الجاهزة لكل تخصص طبي ليعمل بشكل مسبق ومؤتمت.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Controls: Specialty Selector & Sub-Tabs */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">اختر التخصص الطبي للتهيئة:</label>
              <select 
                value={selectedSpecialty}
                onChange={handleSpecialtyChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                {MEDICAL_SPECIALTIES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-end">
              <button
                onClick={() => setActiveSubTab('fields')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeSubTab === 'fields' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Stethoscope size={16} /> الحقول السريرية (Clinical Fields)
              </button>
              <button
                onClick={() => setActiveSubTab('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeSubTab === 'reports' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText size={16} /> نماذج التقارير الجاهزة
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50">
          
          {/* TAB: FIELDS */}
          {activeSubTab === 'fields' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope size={18} className="text-indigo-500" />
                  الحقول السريرية التلقائية لتخصص ({MEDICAL_SPECIALTIES.find(s => s.id === selectedSpecialty)?.name})
                </h3>
                <button 
                  onClick={handleAddField}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus size={14} /> إضافة حقل سريري
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                  <Stethoscope size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">لا توجد حقول سريرية مخصصة لهذا التخصص.</p>
                  <button onClick={handleAddField} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">اضغط هنا لإضافة الحقل الأول</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors">
                      <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteField(idx)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors" title="حذف الحقل">
                           <Trash2 size={14} />
                         </button>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">اسم الحقل (يظهر للطبيب)</label>
                            <input 
                              type="text" 
                              value={field.label}
                              onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">المعرف البرمجي (Key)</label>
                            <input 
                              type="text" 
                              value={field.key}
                              onChange={(e) => handleUpdateField(idx, 'key', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">نص توضيحي (Placeholder)</label>
                          <input 
                            type="text" 
                            value={field.placeholder || ''}
                            onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeSubTab === 'reports' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-teal-500" />
                  نماذج التقارير الجاهزة لتخصص ({MEDICAL_SPECIALTIES.find(s => s.id === selectedSpecialty)?.name})
                </h3>
                <button 
                  onClick={handleAddReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Plus size={14} /> إضافة نموذج تقرير
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                  <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">لا توجد نماذج تقارير جاهزة لهذا التخصص.</p>
                  <button onClick={handleAddReport} className="mt-4 text-teal-600 font-bold text-sm hover:underline">اضغط هنا لإنشاء النموذج الأول</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-teal-300 transition-colors">
                      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteReport(idx)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors" title="حذف النموذج">
                           <Trash2 size={16} />
                         </button>
                      </div>

                      <div className="mb-4 pr-8">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">اسم النموذج (يظهر للطبيب لاختياره)</label>
                        <input 
                          type="text" 
                          value={report.templateName}
                          onChange={(e) => handleUpdateReport(idx, 'templateName', e.target.value)}
                          className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-lg text-sm text-teal-900 font-bold focus:outline-none focus:border-teal-500 transition-colors"
                          placeholder="مثال: تقرير التهاب المفاصل الروماتويدي"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">الشكوى الرئيسية (Chief Complaint)</label>
                          <textarea 
                            rows={2}
                            value={report.chiefComplaint}
                            onChange={(e) => handleUpdateReport(idx, 'chiefComplaint', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors custom-scrollbar"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">التاريخ الطبي (Medical History)</label>
                          <textarea 
                            rows={2}
                            value={report.medicalHistory}
                            onChange={(e) => handleUpdateReport(idx, 'medicalHistory', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors custom-scrollbar"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">الكشف السريري (Physical Examination)</label>
                          <textarea 
                            rows={2}
                            value={report.physicalExamination}
                            onChange={(e) => handleUpdateReport(idx, 'physicalExamination', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors custom-scrollbar"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">التشخيص (Diagnosis)</label>
                          <textarea 
                            rows={2}
                            value={report.diagnosis}
                            onChange={(e) => handleUpdateReport(idx, 'diagnosis', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors custom-scrollbar"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">الخطة العلاجية (Treatment Plan)</label>
                          <textarea 
                            rows={3}
                            value={report.treatmentPlan}
                            onChange={(e) => handleUpdateReport(idx, 'treatmentPlan', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors custom-scrollbar"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <button 
          onClick={handleResetToDefault}
          className="px-4 py-2 text-slate-500 font-bold text-sm hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto text-center"
        >
          استعادة الافتراضي وحذف التعديلات
        </button>
        <button 
          onClick={handleSaveConfiguration}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md transition-all active:scale-95 w-full sm:w-auto"
        >
          <Save size={18} />
          حفظ وتطبيق إعدادات الوحدة
        </button>
      </div>
    </div>
  );
}
