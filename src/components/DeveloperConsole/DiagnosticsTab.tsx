import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Activity, CheckCircle2, Power } from 'lucide-react';

export default function DiagnosticsTab() {
  const { state } = useAppContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dataSize, setDataSize] = useState('0 KB');

  const dbProvider = (localStorage.getItem('shamel_db_provider') as any) || 'firebase';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Calc data size
    const size = new Blob([JSON.stringify(state)]).size;
    setDataSize((size / 1024).toFixed(2) + ' KB');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state]);

  const patientCount = (state.patients || []).length;
  const clinicCount = (state.clinics || []).length;
  const userCount = (state.users || []).length;
  const appointmentCount = Object.values(state.appointments || {}).flat().length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
          <Activity className="text-indigo-600" />
          مراقبة الأداء والتشخيص (Diagnostics & System Health)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500 mb-1">حالة الاتصال بالسيرفر</div>
            <div className={`text-lg font-black flex items-center justify-center gap-2 ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
              {isOnline ? <><CheckCircle2 size={20}/> متصل سحابياً (Online)</> : <><Power size={20}/> غير متصل (Offline)</>}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500 mb-1">حجم البيانات التقريبي المحملة</div>
            <div className="text-xl font-black text-indigo-600" dir="ltr">
              {dataSize}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500 mb-1">بيئة التشغيل الحالية</div>
            <div className="text-lg font-black text-slate-800">
              {dbProvider === 'firebase' ? 'Firebase RTDB' : dbProvider === 'local_sql' ? 'Local SQL / Offline' : 'Remote SQL (Cloud)'}
            </div>
          </div>
        </div>

        {/* System Entities Summary */}
        <h4 className="font-bold text-sm text-slate-700 mb-3">إحصائيات الكيانات النشطة في الذاكرة:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-center">
            <div className="text-2xl font-black text-blue-700">{patientCount}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">ملفات المرضى</div>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
            <div className="text-2xl font-black text-emerald-700">{clinicCount}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">المنشآت والعيادات</div>
          </div>
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-center">
            <div className="text-2xl font-black text-purple-700">{userCount}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">المستخدمين والأطباء</div>
          </div>
          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-center">
            <div className="text-2xl font-black text-amber-700">{appointmentCount}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">الحجوزات والمواعيد</div>
          </div>
        </div>
      </div>
    </div>
  );
}
