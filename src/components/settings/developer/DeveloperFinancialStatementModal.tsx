import React from 'react';
import { X, Printer, Download, Shield, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Clinic } from '../../../types';
import { getFormattedDateTime } from '../../../lib/utils';

interface DeveloperFinancialStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: Clinic[];
}

export default function DeveloperFinancialStatementModal({
  isOpen,
  onClose,
  clinics
}: DeveloperFinancialStatementModalProps) {
  if (!isOpen) return null;

  let totalDesign = 0;
  let totalBranchLicensing = 0;
  let totalDueOverall = 0;
  let totalPaidOverall = 0;
  let totalRemainingOverall = 0;

  const rows = clinics.map(c => {
    const designPrice = Number(c.designPrice || c.contractPrice || 0);
    const maxBranches = Number(c.maxBranches || 1);
    const branchLicensePrice = Number(c.branchLicensePrice || 0);
    const branchTotal = maxBranches * branchLicensePrice;
    const totalContract = designPrice + branchTotal;
    const paid = Number(c.paidAmount || 0);
    const remaining = Math.max(0, totalContract - paid);

    totalDesign += designPrice;
    totalBranchLicensing += branchTotal;
    totalDueOverall += totalContract;
    totalPaidOverall += paid;
    totalRemainingOverall += remaining;

    return {
      clinic: c,
      designPrice,
      maxBranches,
      branchLicensePrice,
      branchTotal,
      totalContract,
      paid,
      remaining
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    const dataRows = rows.map((r, i) => ({
      "م": i + 1,
      "اسم المنشأة": r.clinic.name,
      "المسؤول": r.clinic.docName || r.clinic.name,
      "المستخدم": r.clinic.ownerUsername || '-',
      "عدد الفروع": r.maxBranches,
      "سعر التصميم (ج.م)": r.designPrice,
      "سعر ترخيص الفرع (ج.م)": r.branchLicensePrice,
      "إجمالي تراخيص الفروع (ج.م)": r.branchTotal,
      "إجمالي قيمة التعاقد (ج.م)": r.totalContract,
      "المحصل كاش (ج.م)": r.paid,
      "المتبقي الآجل (ج.م)": r.remaining,
      "حالة السداد": r.clinic.paymentStatus === 'paid' ? 'مسدد بالكامل' : r.clinic.paymentStatus === 'partial' ? 'سداد جزئي' : 'آجل / غير مسدد'
    }));

    dataRows.push({
      "م": "" as any,
      "اسم المنشأة": "الإجمالي العام للمبيعات",
      "المسؤول": "",
      "المستخدم": "",
      "عدد الفروع": "" as any,
      "سعر التصميم (ج.م)": totalDesign,
      "سعر ترخيص الفرع (ج.م)": 0,
      "إجمالي تراخيص الفروع (ج.م)": totalBranchLicensing,
      "إجمالي قيمة التعاقد (ج.م)": totalDueOverall,
      "المحصل كاش (ج.م)": totalPaidOverall,
      "المتبقي الآجل (ج.م)": totalRemainingOverall,
      "حالة السداد": `التحصيل: ${totalDueOverall > 0 ? Math.round((totalPaidOverall / totalDueOverall) * 100) : 100}%`
    });

    const ws = XLSX.utils.json_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "كشف الحسابات العام");
    XLSX.writeFile(wb, `كشف_حسابات_المطور_العام_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-400" size={22} />
            <div>
              <h3 className="font-bold text-sm">كشف الحسابات المالية العام للمطور (Financial Statement)</h3>
              <span className="text-[11px] text-slate-400">وثيقة مالية رسمية لكافة مبيعات المنظومة السحابية وتراخيص المراكز</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Download size={14} /> تصدير Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Printer size={14} /> طباعة المستند (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer mr-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body (A4 Style) */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 print:p-0 print:bg-white text-slate-800" id="printable-statement">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-4">
            
            {/* Document Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-900 font-black text-xl mb-1">
                  <Shield size={24} className="text-indigo-600" />
                  <span>منظومة شامل الطبية السحابية (ERP Multi-Tenant)</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  إدارة الأنظمة والحلول البرمجية المتكاملة للمستشفيات والمراكز التخصصية
                </p>
                <p className="text-xs text-slate-600 mt-1 font-bold">
                  المطور والمهندس المسؤول: <span className="text-indigo-700">م/ صبري الديب</span> | ت: 01065826742
                </p>
              </div>

              <div className="text-left font-mono text-xs">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg mb-1">
                  كشف حساب عام معتمد
                </span>
                <div className="text-slate-500">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</div>
                <div className="text-slate-500">كود الوثيقة: DEV-STMT-{new Date().getFullYear()}-{clinics.length}</div>
              </div>
            </div>

            {/* Financial Summary KPI Ribbon */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-center">
              <div>
                <span className="block text-[11px] text-slate-500 font-bold">إجمالي مبيعات التصميم</span>
                <span className="text-base font-black text-blue-700 font-mono">{totalDesign.toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-bold">إجمالي تراخيص الفروع</span>
                <span className="text-base font-black text-purple-700 font-mono">{totalBranchLicensing.toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-bold">المحصل الفعلي (كاش)</span>
                <span className="text-base font-black text-emerald-700 font-mono">{totalPaidOverall.toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-bold">المتبقي الآجل لدى المراكز</span>
                <span className="text-base font-black text-rose-700 font-mono">{totalRemainingOverall.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-white font-bold">
                  <tr>
                    <th className="p-2.5">م</th>
                    <th className="p-2.5">اسم المنشأة والمسؤول</th>
                    <th className="p-2.5">المستخدم</th>
                    <th className="p-2.5 text-center">الفروع</th>
                    <th className="p-2.5">سعر التصميم</th>
                    <th className="p-2.5">تراخيص الفروع</th>
                    <th className="p-2.5">إجمالي التعاقد</th>
                    <th className="p-2.5">المحصل كاش</th>
                    <th className="p-2.5">المتبقي الآجل</th>
                    <th className="p-2.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((r, index) => (
                    <tr key={r.clinic.id} className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="p-2.5 font-bold font-mono">{index + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{r.clinic.name}</div>
                        <div className="text-[10px] text-slate-500">{r.clinic.docName || r.clinic.name}</div>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-indigo-700">
                        {r.clinic.ownerUsername || '-'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold">
                        {r.maxBranches}
                      </td>
                      <td className="p-2.5 font-mono font-bold">
                        {r.designPrice.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono font-bold">
                        {r.branchTotal.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono font-black text-slate-800">
                        {r.totalContract.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600">
                        {r.paid.toLocaleString()}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-rose-600">
                        {r.remaining > 0 ? r.remaining.toLocaleString() : '0'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.remaining === 0 ? 'bg-emerald-100 text-emerald-800' :
                          r.paid > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.remaining === 0 ? 'خالص' : r.paid > 0 ? 'جزئي' : 'آجل'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-3 text-left font-bold text-slate-800">
                      الإجمالي العام:
                    </td>
                    <td className="p-3 font-mono font-black text-blue-700">{totalDesign.toLocaleString()}</td>
                    <td className="p-3 font-mono font-black text-purple-700">{totalBranchLicensing.toLocaleString()}</td>
                    <td className="p-3 font-mono font-black text-slate-900">{totalDueOverall.toLocaleString()}</td>
                    <td className="p-3 font-mono font-black text-emerald-700">{totalPaidOverall.toLocaleString()}</td>
                    <td className="p-3 font-mono font-black text-rose-700">{totalRemainingOverall.toLocaleString()}</td>
                    <td className="p-3 text-center font-bold text-slate-700">ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Document Footer & Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-800 mb-1">ملاحظات والتزامات التعاقد:</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                  • يتضمن التعاقد الصيانة الدورية، ترقية التحديثات السحابية، ونسخ البيانات الاحتياطية.<br/>
                  • يتم تجديد التراخيص السنوية للفروع وفقاً لبنود عقد الاستضافة والتشغيل.
                </p>
              </div>

              <div className="text-center">
                <p className="font-bold text-slate-800 mb-6">توقيع واعتماد المطور والمهندس المسؤول</p>
                <div className="font-bold text-indigo-800 font-serif text-sm border-t border-dashed border-slate-400 pt-2 px-6">
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
