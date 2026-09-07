import React from 'react';
import { useAppContext } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import { HardDrive, Download, Upload, Database, FileSpreadsheet } from 'lucide-react';

export default function SmartBackupTab() {
  const { state, updateState, logAction } = useAppContext();

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "shamel_full_backup_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    logAction('نسخ احتياطي', 'تم تصدير نسخة JSON كاملة للنظام');
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Add Users
    const wsUsers = XLSX.utils.json_to_sheet(state.users || []);
    XLSX.utils.book_append_sheet(wb, wsUsers, "Users");
    
    // Add Clinics
    const wsClinics = XLSX.utils.json_to_sheet(state.clinics || []);
    XLSX.utils.book_append_sheet(wb, wsClinics, "Clinics");

    // Add Patients
    const wsPatients = XLSX.utils.json_to_sheet(state.patients || []);
    XLSX.utils.book_append_sheet(wb, wsPatients, "Patients");
    
    // Add Appointments (flattened)
    const allAppointments = Object.values(state.appointments || {}).flat();
    const wsAppointments = XLSX.utils.json_to_sheet(allAppointments);
    XLSX.utils.book_append_sheet(wb, wsAppointments, "Appointments");

    // Add Invoices
    const wsInvoices = XLSX.utils.json_to_sheet(state.invoices || []);
    XLSX.utils.book_append_sheet(wb, wsInvoices, "Invoices");

    XLSX.writeFile(wb, "shamel_backup_" + new Date().toISOString().split('T')[0] + ".xlsx");
    logAction('نسخ احتياطي', 'تم تصدير نسخة Excel لجميع الجداول');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        if (window.confirm('هل أنت متأكد من استعادة هذه النسخة؟ سيتم مسح كافة البيانات الحالية وإحلال هذه النسخة مكانها.')) {
          updateState(jsonData);
          logAction('استعادة نسخة احتياطية', 'تم استعادة نسخة احتياطية من جهاز المطور');
          alert('تم استعادة النسخة الاحتياطية بنجاح!');
          window.location.reload();
        }
      } catch (err) {
        alert('حدث خطأ في قراءة ملف الـ JSON. تأكد من أن الملف سليم.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
          <HardDrive className="text-indigo-600" />
          النسخ الاحتياطي الذكي واستعادة البيانات الشاملة
        </h3>
        
        {/* بطاقة توضيحية لشمولية النسخ الاحتياطي لجميع الوحدات */}
        <div className="mt-2 mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-xl text-xs text-indigo-900 leading-relaxed font-semibold">
          🛡️ <span className="font-bold">نظام الأمان والشمولية الذكية:</span> تم تصميم وتكوين نظام النسخ الاحتياطي هذا ليكون <span className="text-blue-700 underline font-extrabold">شاملاً ومجمعاً لكافة الكيانات</span> في المنظومة. عند تشغيل النسخ الاحتياطي أو الاستعادة، يقوم النظام آلياً بحفظ واستعادة بيانات <span className="font-bold text-emerald-700">المستشفيات والعمليات</span>، <span className="font-bold text-indigo-700">المراكز الطبية والمجمعات</span>، <span className="font-bold text-amber-700">العيادات التخصصية الفردية</span>، بالإضافة إلى <span className="font-bold text-slate-700">بيانات المطور وإعدادات النظام المتقدمة شجرة الحسابات والقيود</span> بدقة مطلقة في ملف واحد موحد.
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                <Download size={18} /> تصدير قواعد البيانات (Export)
              </h4>
              <p className="text-xs text-emerald-700 mb-4">
                استخراج كافة بيانات المنظومة (مرضى، عيادات، مستخدمين، فواتير) بصيغ متعددة لاستخدامها للتحليل أو نقلها لخوادم أخرى.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportJSON} 
                  className="flex-1 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Database size={16} /> كود JSON
                </button>
                <button 
                  onClick={handleExportExcel} 
                  className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet size={16} /> جداول Excel
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <Upload size={18} /> استعادة البيانات (Restore JSON)
                </h4>
                <p className="text-xs text-amber-700 mb-4">
                  رفع ملف JSON سابق لتعويض النظام وإحلال كافة البيانات القديمة محله بدقة.
                </p>
              </div>
              <label className="w-full bg-white border border-amber-300 text-amber-800 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-100 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                <Upload size={16} /> رفع ملف النسخة الاحتياطية واستعادتها
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
