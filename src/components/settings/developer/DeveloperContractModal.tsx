import React, { useState } from 'react';
import { X, Printer, Shield, CheckCircle2, DollarSign, Calendar, Building2, User, Phone, FileText } from 'lucide-react';
import { Clinic } from '../../../types';

interface DeveloperContractModalProps {
  clinic: Clinic | null;
  onClose: () => void;
  onSaveTerms?: (updatedClinic: Partial<Clinic>) => void;
}

export default function DeveloperContractModal({
  clinic,
  onClose,
  onSaveTerms
}: DeveloperContractModalProps) {
  if (!clinic) return null;

  const designPrice = Number(clinic.designPrice || clinic.contractPrice || 0);
  const maxBranches四周 = Number(clinic.maxBranches || 1);
  const branchLicensePrice = Number(clinic.branchLicensePrice || 0);
  const branchTotal = maxBranches四周 * branchLicensePrice;
  const totalDue = designPrice + branchTotal;
  const paid = Number(clinic.paidAmount || 0);
  const remaining = Math.max(0, totalDue - paid);

  const [editableNotes, setEditableNotes] = useState(clinic.notes || `1. يلتزم الطرف الثاني (المطور) بتقديم الدعم الفني، الصيانة السحابية، وضمان استقرار الخادم على مدار الساعة.
2. يشمل الترخيص حق الاستخدام للنظام لعدد ${maxBranches四周} فرع/عيادة مع التحديثات المستمرة.
3. الدفعة المقدمة المستلمة كاش وقدرها (${paid.toLocaleString()} ج.م)، والمتبقي الآجل وقدره (${remaining.toLocaleString()} ج.م) يستحق السداد خلال المدة المتفق عليها.`);

  const [contractNumber] = useState(`CON-${clinic.id.substring(0, 6).toUpperCase()}-${new Date().getFullYear()}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Controls Ribbon (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-400" size={22} />
            <div>
              <h3 className="font-bold text-sm">سند التعاقد والترخيص المالي الرسمي (Official Contract Bond)</h3>
              <span className="text-[11px] text-slate-400">وثيقة إثبات استلام الدفعة النقدية وترخيص تشغيل النظام</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer size={16} /> طباعة السند (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer mr-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contract Sheet Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 print:p-0 print:bg-white text-slate-800" id="printable-contract">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  H
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900">سند تعاقد وترخيص برنامج إدارة المستشفيات والمراكز</h1>
                  <p className="text-xs text-indigo-700 font-bold">منظومة شامل الطبية السحابية (ERP Multi-Tenant)</p>
                </div>
              </div>

              <div className="text-left font-mono text-xs">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold rounded-lg mb-1">
                  سند قبض واعتماد رسمي
                </span>
                <div className="text-slate-500 font-bold">رقم العقد: {contractNumber}</div>
                <div className="text-slate-500">التاريخ: {clinic.startDate || new Date().toISOString().split('T')[0]}</div>
              </div>
            </div>

            {/* Parties Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* First Party: Developer */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <Shield size={14} className="text-indigo-600" />
                  <span>الطرف الأول (المطور ومزود الخدمة):</span>
                </div>
                <p className="font-bold text-slate-800">م/ صبري الديب</p>
                <p className="text-slate-600">الصفة: المطور العام ومهندس البنية التحتية السحابية</p>
                <p className="text-slate-600">الهاتف: 01065826742</p>
                <p className="text-slate-600">البريد: sapry.eldeep@gmail.com</p>
              </div>

              {/* Second Party: Client/Clinic */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-blue-900 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" />
                  <span>الطرف الثاني (العميل والمنشأة الطبية):</span>
                </div>
                <p className="font-bold text-slate-800">{clinic.name}</p>
                <p className="text-slate-600">المسؤول: {clinic.docName || clinic.name}</p>
                <p className="text-slate-600">نوع المنظومة: {clinic.systemType === 'hospital' ? 'مستشفى متكامل' : clinic.systemType === 'center' ? 'مركز تخصصي' : 'عيادة خاصة'}</p>
                <p className="text-slate-600">الهاتف: {clinic.phone || 'غير مسجل'}</p>
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
                <span>بيان الرسوم والتراخيص المالية</span>
                <span>العملة: جنيه مصري (EGP)</span>
              </div>

              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">البند والبيان</th>
                    <th className="p-3 text-center">العدد / الكمية</th>
                    <th className="p-3">سعر الوحدة</th>
                    <th className="p-3 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-medium">سعر تصميم وبرمجة المنظومة السحابية المخصصة</td>
                    <td className="p-3 text-center font-mono">1 نظام رئيسي</td>
                    <td className="p-3 font-mono">{designPrice.toLocaleString()} ج.م</td>
                    <td className="p-3 text-left font-mono font-bold">{designPrice.toLocaleString()} ج.م</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">تراخيص الفروع والعيادات الإضافية المصرح بها</td>
                    <td className="p-3 text-center font-mono">{maxBranches四周} فروع</td>
                    <td className="p-3 font-mono">{branchLicensePrice.toLocaleString()} ج.م</td>
                    <td className="p-3 text-left font-mono font-bold">{branchTotal.toLocaleString()} ج.م</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold divide-y divide-slate-200 text-xs">
                  <tr>
                    <td colSpan={3} className="p-3 text-left text-slate-800">إجمالي قيمة التعاقد والتراخيص:</td>
                    <td className="p-3 text-left font-mono font-black text-blue-900 text-sm">{totalDue.toLocaleString()} ج.م</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-left text-emerald-800">المبلغ المدفوع كاش (سند قبض):</td>
                    <td className="p-3 text-left font-mono font-black text-emerald-700 text-sm">{paid.toLocaleString()} ج.م</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-left text-rose-800">المتبقي الآجل المستحق:</td>
                    <td className="p-3 text-left font-mono font-black text-rose-700 text-sm">{remaining.toLocaleString()} ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Account Credentials Box */}
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 mb-6 flex items-center justify-between text-xs">
              <div>
                <span className="block font-bold text-indigo-900 mb-1">بيانات الحساب الإداري المعتمد للمنشأة (Master Admin Credentials):</span>
                <div className="flex items-center gap-4 text-slate-700">
                  <span>اسم المستخدم: <strong className="text-indigo-800 font-mono font-bold">{clinic.ownerUsername || '-'}</strong></span>
                  <span>كلمة المرور: <strong className="text-indigo-800 font-mono font-bold">{clinic.ownerPass || '-'}</strong></span>
                  <span>تاريخ انتهاء الترخيص: <strong className="text-slate-800 font-mono">{clinic.expiryDate}</strong></span>
                </div>
              </div>
              <CheckCircle2 size={24} className="text-indigo-600 shrink-0" />
            </div>

            {/* Terms and Conditions (Editable on screen) */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-2">الشروط والأحكام الخاصة بالعقد:</label>
              <textarea
                value={editableNotes}
                onChange={e => setEditableNotes(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed focus:bg-white focus:outline-none print:border-none print:p-0 print:bg-transparent"
              />
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-8 text-xs text-center">
              <div>
                <p className="font-bold text-slate-800 mb-8">توقيع المستلم والطرف الثاني (العميل):</p>
                <div className="border-t border-dashed border-slate-400 pt-2 text-slate-600 font-medium">
                  {clinic.docName || clinic.name}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-8">توقيع واعتماد الطرف الأول (المطور):</p>
                <div className="border-t border-dashed border-slate-400 pt-2 text-indigo-900 font-bold font-serif">
                  م/ صبري الديب
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
