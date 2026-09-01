import React from 'react';
import { Clinic } from '../../../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClinicDeleteModalsProps {
  deleteTarget: Clinic | null;
  onCancelDeleteTarget: () => void;
  onConfirmDeleteTarget: (target: Clinic) => void;
  showDeleteAllModal: boolean;
  totalClinicsCount: number;
  onCloseDeleteAllModal: () => void;
  onConfirmDeleteAll: () => void;
}

export default function ClinicDeleteModals({
  deleteTarget,
  onCancelDeleteTarget,
  onConfirmDeleteTarget,
  showDeleteAllModal,
  totalClinicsCount,
  onCloseDeleteAllModal,
  onConfirmDeleteAll
}: ClinicDeleteModalsProps) {
  return (
    <>
      {/* In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <AlertTriangle size={28} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">تأكيد حذف المنشأة الطبية</h4>
              <p className="text-xs text-slate-500 mt-1">
                أنت على وشك حذف المنشأة: <strong className="text-slate-800">{deleteTarget.name}</strong>
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 mb-6 leading-relaxed">
              ⚠️ <strong>تحذير هام:</strong> هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع حسابات الموظفين والبيانات التابعة لهذه المنشأة بشكل كامل.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onConfirmDeleteTarget(deleteTarget)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                نعم، احذف نهائياً
              </button>
              <button
                onClick={onCancelDeleteTarget}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete All Clinics Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h5 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Trash2 size={20} className="text-rose-600" /> تصفير وتطهير كافة المنشآت والسحابة
              </h5>
              <button
                type="button"
                onClick={onCloseDeleteAllModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-sm text-rose-800">
                <AlertTriangle size={20} className="text-rose-600 shrink-0" />
                <span>تنبيه خطير: تصفير السيرفر السحابي والمنشآت</span>
              </div>
              <p className="leading-relaxed font-semibold">
                أنت على وشك مسح وحذف جميع المنشآت الحالية (<strong className="text-rose-900 font-extrabold">{totalClinicsCount} منشأة</strong>) وكافة حسابات الموظفين والمرضى وسجلات الطابور، وتصفير السيرفر السحابي (Firebase) بالكامل.
              </p>
              <div className="bg-white/80 p-2.5 rounded-xl border border-rose-200 text-[11px] text-slate-700 font-bold">
                ✓ سيتم الإبقاء فقط على حساب المطور الرئيسي (<span className="text-blue-700">صبري الديب</span>) لتهيئة المنظومة لبيع اشتراكات جديدة.
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onConfirmDeleteAll}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={18} /> نعم، مسح وتصفير كافة المنشآت والسحابة
              </button>
              <button
                type="button"
                onClick={onCloseDeleteAllModal}
                className="px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
