import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings, Activity, Sparkles } from 'lucide-react';

export default function SystemModeTab() {
  const { state, updateState, logAction } = useAppContext();
  const [systemMode, setSystemMode] = useState<'medical'|'beauty'>(state.globalSystemMode || 'medical');

  const handleSaveSystemMode = () => {
    updateState({ globalSystemMode: systemMode });
    alert(`تم تغيير وضع النظام بالكامل إلى: ${systemMode === 'beauty' ? 'بيوتي سنتر (Beauty Center)' : 'طبي (Clinic/Hospital)'}`);
    logAction('تغيير وضع النظام', `تم تفعيل وضع: ${systemMode}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
          <Settings className="text-indigo-600" />
          وضع النظام والواجهات (System UI Mode)
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          يقوم هذا الإعداد بتغيير المسميات الأساسية في النظام بالكامل ليتوافق مع نشاط العميل (مثلاً: المريض يصبح عميل، العيادة تصبح مركز تجميل، الروشتة تصبح جلسة، إلخ).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            onClick={() => setSystemMode('medical')}
            className={`p-5 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
              systemMode === 'medical' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">الوضع الطبي (Medical Mode)</h4>
              <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                <li>المراجع يسمى "مريض"</li>
                <li>تفعيل أقسام الطوارئ والعمليات والغرف</li>
                <li>تفعيل الروشتة الطبية والصيدلية السريرية</li>
                <li>المصطلحات الطبية المتوافقة مع العيادات والمستشفيات</li>
              </ul>
            </div>
          </div>
          
          <div 
            onClick={() => setSystemMode('beauty')}
            className={`p-5 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
              systemMode === 'beauty' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">وضع التجميل (Beauty Center)</h4>
              <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                <li>المراجع يسمى "عميل / زائر"</li>
                <li>الخدمات تحل محل العمليات (جلسات ليزر، عناية، تجميل)</li>
                <li>التركيز على المبيعات، الباقات، والحجوزات الفردية</li>
                <li>إخفاء التفاصيل الطبية المعقدة والروشتات الدوائية الصعبة</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSaveSystemMode} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            تطبيق وضع النظام الجديد
          </button>
        </div>
      </div>
    </div>
  );
}
