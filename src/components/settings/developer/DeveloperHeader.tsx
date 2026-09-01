import React from 'react';
import { 
  Shield, Download, Printer, LayoutDashboard, Building2, 
  Settings, Activity, Sparkles, CheckCircle2, Phone, Mail, 
  Database, Lock, FileSpreadsheet, FileText, Server, BookOpen, Rocket
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Clinic } from '../../../types';
import { getFormattedDateTime } from '../../../lib/utils';

export type DeveloperTabType = 'dashboard' | 'tenants_permissions' | 'accounts_preview' | 'system_updates' | 'system_cloud' | 'maintenance_health';

interface DeveloperHeaderProps {
  activeTab: DeveloperTabType;
  setActiveTab: (tab: DeveloperTabType) => void;
  clinics: Clinic[];
  onOpenFinancialStatement: () => void;
}

export default function DeveloperHeader({
  activeTab,
  setActiveTab,
  clinics,
  onOpenFinancialStatement
}: DeveloperHeaderProps) {

  // Export Financial Accounts to Excel
  const exportAccountsToExcel = () => {
    let totalDesign = 0;
    let totalBranchLicensing = 0;
    let totalDueOverall = 0;
    let totalPaidOverall = 0;
    let totalRemainingOverall = 0;

    const dataRows = clinics.map((c, index) => {
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
        "م": index + 1,
        "اسم المنشأة / المركز": c.name,
        "نوع المنظومة": c.systemType === 'hospital' ? 'مستشفى' : c.systemType === 'center' ? 'مركز تخصصي' : 'عيادة خاصة',
        "المسؤول / الطبيب": c.docName || c.name,
        "اسم المستخدم": c.ownerUsername || '-',
        "كلمة المرور": c.ownerPass || '-',
        "الحد الأقصى للفروع": maxBranches,
        "سعر بيع التصميم (ج.م)": designPrice,
        "سعر ترخيص الفرع (ج.م)": branchLicensePrice,
        "إجمالي تراخيص الفروع (ج.م)": branchTotal,
        "إجمالي قيمة التعاقد (ج.م)": totalContract,
        "المحصل كاش (ج.م)": paid,
        "المتبقي الآجل (ج.م)": remaining,
        "حالة السداد": c.paymentStatus === 'paid' ? 'مسدد بالكامل' : c.paymentStatus === 'partial' ? 'سداد جزئي' : 'آجل / غير مسدد',
        "تاريخ التعاقد": c.startDate || '-',
        "تاريخ الانتهاء": c.expiryDate || '-',
        "الهاتف": c.phone || '-'
      };
    });

    // Add Summary Row
    dataRows.push({
      "م": "" as any,
      "اسم المنشأة / المركز": "الإجمالي العام (Total Summary)",
      "نوع المنظومة": `عدد المنشآت: ${clinics.length}`,
      "المسؤول / الطبيب": "",
      "اسم المستخدم": "",
      "كلمة المرور": "",
      "الحد الأقصى للفروع": "" as any,
      "سعر بيع التصميم (ج.م)": totalDesign,
      "سعر ترخيص الفرع (ج.م)": 0,
      "إجمالي تراخيص الفروع (ج.م)": totalBranchLicensing,
      "إجمالي قيمة التعاقد (ج.م)": totalDueOverall,
      "المحصل كاش (ج.م)": totalPaidOverall,
      "المتبقي الآجل (ج.م)": totalRemainingOverall,
      "حالة السداد": `نسبة التحصيل: ${totalDueOverall > 0 ? Math.round((totalPaidOverall / totalDueOverall) * 100) : 100}%`,
      "تاريخ التعاقد": "",
      "تاريخ الانتهاء": "",
      "الهاتف": ""
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 4 },  // م
      { wch: 26 }, // اسم المنشأة
      { wch: 15 }, // نوع المنظومة
      { wch: 20 }, // المسؤول
      { wch: 16 }, // اسم المستخدم
      { wch: 16 }, // كلمة المرور
      { wch: 14 }, // الفروع
      { wch: 18 }, // سعر التصميم
      { wch: 18 }, // سعر ترخيص الفرع
      { wch: 20 }, // إجمالي تراخيص الفروع
      { wch: 20 }, // إجمالي التعاقد
      { wch: 16 }, // المحصل
      { wch: 16 }, // المتبقي
      { wch: 16 }, // حالة السداد
      { wch: 14 }, // تاريخ التعاقد
      { wch: 14 }, // تاريخ الانتهاء
      { wch: 16 }  // الهاتف
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "كشف حسابات المطور");

    const todayDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `كشف_حسابات_مبيعات_المطور_${todayDate}.xlsx`);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
      {/* Top Banner: Developer Identity & System Stats */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        
        {/* Developer Profile Card */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-indigo-400">
                <Shield size={32} />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center" title="المطور متصل والمنظومة سحابية نشطة">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                لوحة تحكم المطور المتقدمة
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  SaaS Core Engine
                </span>
              </h1>
            </div>
            
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-200">م/ صبري الديب</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-300 text-xs">كبير مهندسي النظام والمنظومة السحابية</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                <Phone size={12} className="text-emerald-400" /> 01065826742
              </span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={exportAccountsToExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            title="تصدير جدول الحسابات والمبيعات ومستحقات المراكز إلى ملف Excel"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            <span>تصدير الحسابات (Excel)</span>
          </button>

          <button
            onClick={onOpenFinancialStatement}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            title="معاينة وطباعة كشف الحساب المالي العام الشامل للمطور"
          >
            <Printer size={16} className="text-indigo-400" />
            <span>طباعة كشف الحسابات العام</span>
          </button>
        </div>
      </div>

      {/* Badges Info Bar - Responsive for Mobile, Tablet, and Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Server size={18} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400 font-bold">إصدار المنظومة</span>
            <span className="text-xs font-mono font-bold text-slate-200 truncate block">v2.5.0 Enterprise</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400 font-bold">المزامنة السحابية</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" /> مباشر (Realtime)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Lock size={18} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400 font-bold">بروتوكول الأمان</span>
            <span className="text-xs font-bold text-slate-300 font-mono truncate block">AES-256 SSL</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400 font-bold">إجمالي المنشآت</span>
            <span className="text-xs font-bold text-amber-300 font-mono truncate block">{clinics.length} مراكز معتمدة</span>
          </div>
        </div>
      </div>

      {/* 6 Main Modern Navigation Tabs - Responsive Grid for Tablets (iPad, Tablet Portrait/Landscape) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer min-h-[44px] ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 bg-slate-900/30'
          }`}
        >
          <LayoutDashboard size={17} className="shrink-0" />
          <span className="truncate">1. الرئيسية والإحصائيات</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants_permissions')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer min-h-[44px] ${
            activeTab === 'tenants_permissions'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 bg-slate-900/30'
          }`}
        >
          <Building2 size={17} className="shrink-0" />
          <span className="truncate">2. المراكز والتراخيص</span>
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-mono font-bold shrink-0">
            {clinics.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('accounts_preview')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer min-h-[44px] ${
            activeTab === 'accounts_preview'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 bg-slate-900/30'
          }`}
        >
          <BookOpen size={17} className="shrink-0" />
          <span className="truncate">3. معاينة الحسابات</span>
        </button>

        <button
          onClick={() => setActiveTab('system_updates')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer min-h-[44px] ${
            activeTab === 'system_updates'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 bg-slate-900/30'
          }`}
        >
          <Rocket size={17} className="shrink-0" />
          <span className="truncate">4. مركز التحديثات</span>
        </button>

        <button
          onClick={() => setActiveTab('system_cloud')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer min-h-[44px] ${
            activeTab === 'system_cloud'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 bg-slate-900/30'
          }`}
        >
          <Settings size={17} className="shrink-0" />
          <span className="truncate">5. إعدادات السحابة</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance_health')}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs transition-all active:scale-98 cursor-pointer min-h-[44px] ${
            activeTab === 'maintenance_health'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/80 bg-slate-900/30'
          }`}
        >
          <Activity size={17} className="shrink-0" />
          <span className="truncate">6. وضع الصيانة</span>
        </button>
      </div>
    </div>
  );
}
