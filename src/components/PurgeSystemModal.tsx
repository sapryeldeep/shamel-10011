import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Sparkles, Trash2, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Building, Users } from 'lucide-react';

interface PurgeSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PurgeSystemModal({ isOpen, onClose }: PurgeSystemModalProps) {
  const { updateState, logAction, purgeCloudDatabase } = useAppContext();
  const [purgeMode, setPurgeMode] = useState<'clinical_only' | 'full_reset'>('full_reset');
  const [isDone, setIsDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleExecutePurge = async () => {
    setIsProcessing(true);

    if (purgeMode === 'clinical_only') {
      // Clinical & Operational records purge (Keeps clinics & user accounts)
      updateState({
        patients: [],
        inventory: [],
        queue: {},
        archive: {},
        appointments: {},
        reports: [],
        transactions: [],
        invoices: [],
        auditLogs: [],
        erStore: {},
        orStore: {},
        inpatientStore: {},
        hospLabStore: {},
        radStore: {},
        staffDirectory: {},
        payrollStore: {},
        insuranceStore: {},
        expensesStore: {},
        vitalsStore: {},
        labStore: {},
        rxStore: {},
        patientStatusHistoryStore: {}
      });
      logAction('تطهير النظام بالنشر', 'تم تطهير كافة السجلات الطبية والمالية والمرضى بنجاح مع الإبقاء على المنشآت والحسابات');
    } else {
      // Full System Wipe Out & Cloud Database Purge
      await purgeCloudDatabase();
      logAction('إعادة ضبط مصنعي شاملة وتصفير السحابي', 'تم حذف كافة بيانات المنشآت والسحابة وتصفير السيرفر السحابي بنجاح');
    }

    setIsProcessing(false);
    setIsDone(true);
  };

  const handleCloseModal = () => {
    setIsDone(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-800 text-base">تطهير بيانات النظام للنشر على GitHub</h5>
              <p className="text-xs text-slate-500 mt-0.5">تنظيف وتطوير السجلات التجريبية قبل رفع المشروع</p>
            </div>
          </div>
          <button 
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {isDone ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h6 className="font-extrabold text-slate-800 text-lg">✨ تم تطهير النظام بنجاح!</h6>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                السجلات الآن طاهرة وجاهزة تماماً. يمكنك الآن حفظ التغيرات أو النشر والرفع المباشر إلى GitHub بثقة وأمان.
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
            >
              تم ورجوع للنظام
            </button>
          </div>
        ) : (
          <>
            {/* Warning Note */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-900 mb-0.5">تنبيه هام للمطورين والإدارة:</strong>
                تطهير النظام سيمسح جميع السجلات الوهمية وطوابير الانتظار التجريبية والعمليات والتقارير الطبية المسجلة بالكامل لتجهيز المشروع للتوزيع الفعلي.
              </div>
            </div>

            {/* Options selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">حدد مستوى التطهير المطلوبة:</label>
              
              <div 
                onClick={() => setPurgeMode('clinical_only')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  purgeMode === 'clinical_only' 
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="purge_type" 
                  checked={purgeMode === 'clinical_only'} 
                  onChange={() => setPurgeMode('clinical_only')}
                  className="mt-1 accent-blue-600"
                />
                <div>
                  <strong className="block text-xs font-bold text-slate-800">
                    تطهير السجلات السريرية والانتظار والمالية (موصى به)
                  </strong>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    حذف المراجعين، السجلات السريرية، طابور الانتظار، العمليات، الرواتب، والتقارير.
                    <span className="text-blue-700 font-bold block mt-0.5">✓ يتم الاحتفاظ بجميع المنشآت والمستخدمين والأطباء والخدمات والبروتوكولات.</span>
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setPurgeMode('full_reset')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  purgeMode === 'full_reset' 
                    ? 'border-rose-600 bg-rose-50/50 shadow-2xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="purge_type" 
                  checked={purgeMode === 'full_reset'} 
                  onChange={() => setPurgeMode('full_reset')}
                  className="mt-1 accent-rose-600"
                />
                <div>
                  <strong className="block text-xs font-bold text-slate-800">
                    إعادة ضبط مصنعي كامل (Full Factory Reset)
                  </strong>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    مسح الذاكرة المحلية بالكامل وإعادة ضبط كافة الجداول والبيانات إلى الوضع الافتراضي النظيف الأول.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleExecutePurge}
                disabled={isProcessing}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>جاري التطهير والتهيئة...</span>
                ) : (
                  <>
                    <Sparkles size={18} />
                    تأكيد تطهير النظام والنشر
                  </>
                )}
              </button>
              <button
                onClick={handleCloseModal}
                disabled={isProcessing}
                className="px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
