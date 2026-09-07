import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Activity, CalendarDays, Search, UserCircle2, FileText, Pill, Stethoscope, ChevronRight } from 'lucide-react';

export default function PatientPortal({ onBack }: { onBack: () => void }) {
  const { state } = useAppContext();
  
  const [phone, setPhone] = useState('');
  const [visitCode, setVisitCode] = useState('');
  
  const [patientData, setPatientData] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handlePatientSearch = () => {
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف المسجل.');
      return;
    }
    setError('');
    
    // Find appointments by phone
    const allAppointments = Object.values(state.appointments).flat() as any[];
    const myApps = allAppointments.filter(a => a?.phone === phone);
    
    // Find report by visit code (if provided)
    let myReport = null;
    if (visitCode.trim()) {
      myReport = state.reports.find(r => r.id === visitCode.trim());
    }

    setPatientData({ appointments: myApps, report: myReport });
    setSearched(true);
  };

  return (
    <div className="w-full">
      {!searched ? (
        <>
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1 text-sm transition-colors">
            <ChevronRight size={16} /> عودة للدخول
          </button>
          
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md mx-auto mb-6">
            <UserCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">بوابة المريض الذكية</h3>
          <p className="text-sm text-slate-500 mb-8">الاستعلام عن المواعيد والتقارير الطبية</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-sm mb-6 font-bold">
              {error}
            </div>
          )}
          
          <div className="text-right mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">رقم الهاتف المسجل <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="مثال: 01012345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePatientSearch()}
            />
          </div>
          
          <div className="text-right mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-1">كود الزيارة أو التقرير (اختياري)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="أدخل كود الزيارة لعرض الروشتة/التقرير"
              value={visitCode}
              onChange={e => setVisitCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePatientSearch()}
            />
          </div>
          
          <button 
            onClick={handlePatientSearch}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-2"
          >
            <Search size={18} /> عرض السجل الطبي
          </button>
        </>
      ) : (
        <div className="text-right">
          <button onClick={() => setSearched(false)} className="text-emerald-600 hover:text-emerald-700 mb-6 flex items-center gap-1 text-sm font-bold transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg">
            <ChevronRight size={16} /> بحث جديد
          </button>
          
          {/* Medical Report / Visit Code Results */}
          {visitCode.trim() && (
            <div className="mb-6">
              <h6 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                <FileText size={20} className="text-blue-600" /> التقرير الطبي (كود: {visitCode})
              </h6>
              
              {!patientData?.report ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-sm font-bold text-center">
                  عفواً، لا يوجد تقرير طبي مطابق لكود الزيارة المدخل.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="block text-slate-800">{patientData.report.doctorName}</strong>
                      <span className="text-xs text-slate-500">{patientData.report.date}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">تم الكشف</span>
                  </div>
                  <div className="p-4 space-y-4 text-sm">
                    {patientData.report.vitalSigns && (
                      <div className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <span className="block text-xs text-slate-400 mb-1">الضغط</span>
                          <strong className="text-slate-700">{patientData.report.vitalSigns.bp || '--'}</strong>
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs text-slate-400 mb-1">النبض</span>
                          <strong className="text-slate-700">{patientData.report.vitalSigns.pulse || '--'}</strong>
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs text-slate-400 mb-1">الحرارة</span>
                          <strong className="text-slate-700">{patientData.report.vitalSigns.temp || '--'}</strong>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Stethoscope size={14} /> التشخيص المبدئي</h4>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">{patientData.report.diagnosis || 'لم يكتب التشخيص'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Pill size={14} /> الخطة العلاجية والروشتة</h4>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">{patientData.report.treatmentPlan || 'لا توجد أدوية مسجلة'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appointments */}
          <div>
            <h6 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
              <CalendarDays size={20} className="text-emerald-600" /> المواعيد المرتبطة
            </h6>
            {patientData?.appointments.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-500 text-sm text-center">
                لا توجد مواعيد مسجلة برقم الهاتف هذا.
              </div>
            ) : (
              <div className="space-y-3">
                {patientData?.appointments.map((a: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <strong className="block text-slate-800 text-base">{a.date}</strong>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Activity size={12} /> {a.service} | {a.time}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                      a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      a.status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {a.status === 'confirmed' ? 'مؤكد' : a.status === 'cancelled' ? 'ملغي' : 'انتظار'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
