import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Eye, CheckCircle2, Building2, Stethoscope, Hospital, Pill,
  Search, FileSpreadsheet, FileText, Printer, ArrowRightLeft, ShieldCheck, RefreshCw, Sparkles, Layers,
  Plus, Pencil, Trash2, X, Lock, Unlock, Sliders, AlertCircle, Save, RotateCcw,
  Monitor, Terminal, Download, Github
} from 'lucide-react';
import { AppState } from '../../../context/defaults';
import { generateDefaultChartOfAccounts } from '../../../lib/accountingDefaults';
import { Account, Clinic } from '../../../types';
import { exportToExcel, printReport, exportToPdf } from '../../../lib/exportUtils';

interface DeveloperAccountsPreviewTabProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  logAction: (action: string, details: string) => void;
}

export default function DeveloperAccountsPreviewTab({
  state,
  updateState,
  logAction
}: DeveloperAccountsPreviewTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'pharmacy' | 'clinic' | 'hospital' | 'center'>('pharmacy');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetTenantId, setTargetTenantId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDesktopGuideModal, setShowDesktopGuideModal] = useState<boolean>(false);

  // Custom modified template store per template key
  const [customAccounts, setCustomAccounts] = useState<Record<string, Account[]>>({});

  // Account Modal states (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    type: 'asset' as Account['type'],
    category: 'current_assets' as Account['category'],
    level: 3,
    parentId: '',
    description: ''
  });

  const clinics = state.clinics || [];

  // Get active tenant clinic object if selected
  const selectedClinic = clinics.find(c => c.id === targetTenantId);

  // Initialize or get preview accounts for current selected template
  useEffect(() => {
    if (!customAccounts[selectedTemplate]) {
      const generated = generateDefaultChartOfAccounts('preview_master', selectedTemplate);
      setCustomAccounts(prev => ({
        ...prev,
        [selectedTemplate]: generated
      }));
    }
  }, [selectedTemplate]);

  const currentPreviewAccounts = customAccounts[selectedTemplate] || generateDefaultChartOfAccounts('preview_master', selectedTemplate);

  // Filter accounts by search query and type
  const filteredAccounts = currentPreviewAccounts.filter(acc => {
    const matchesSearch = acc.name.includes(searchQuery) || acc.code.includes(searchQuery) || (acc.description && acc.description.includes(searchQuery));
    const matchesType = filterType === 'all' || acc.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const level1Count = currentPreviewAccounts.filter(a => a.level === 1).length;
  const level2Count = currentPreviewAccounts.filter(a => a.level === 2).length;
  const level3Count = currentPreviewAccounts.filter(a => a.level >= 3).length;
  const totalAccountsCount = currentPreviewAccounts.length;

  // Reset current template accounts back to default
  const handleResetTemplate = () => {
    if (window.confirm('هل أنت أرجو تأكيد إعادة ضبط شجرة الحسابات لهذا القالب إلى النموذج القياسي الأصلي؟')) {
      const resetChart = generateDefaultChartOfAccounts('preview_master', selectedTemplate);
      setCustomAccounts(prev => ({
        ...prev,
        [selectedTemplate]: resetChart
      }));
      logAction('إعادة ضبط شجرة الحسابات', `تمت إعادة ضبط نموذج ${selectedTemplate} إلى النمط المبدئي`);
    }
  };

  // Open modal for Adding Account or Section
  const handleOpenAddModal = (parentAcc?: Account) => {
    setModalMode('add');
    setEditingAccountId(null);
    if (parentAcc) {
      setFormData({
        code: `${parentAcc.code}${Math.floor(Math.random() * 8 + 1)}`,
        name: '',
        nameEn: '',
        type: parentAcc.type,
        category: parentAcc.category,
        level: (parentAcc.level + 1) as 1 | 2 | 3 | 4,
        parentId: parentAcc.code,
        description: ''
      });
    } else {
      setFormData({
        code: `${Math.floor(Math.random() * 90 + 10)}`,
        name: '',
        nameEn: '',
        type: 'asset',
        category: 'current_assets',
        level: 3,
        parentId: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for Editing Account
  const handleOpenEditModal = (acc: Account) => {
    setModalMode('edit');
    setEditingAccountId(acc.id);
    setFormData({
      code: acc.code,
      name: acc.name,
      nameEn: acc.nameEn || '',
      type: acc.type,
      category: acc.category,
      level: acc.level,
      parentId: acc.parentId || '',
      description: acc.description || ''
    });
    setIsModalOpen(true);
  };

  // Save Account (Add or Edit)
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('يرجى كتابة كود الحساب واسم الحساب المحاسبي بالكامل.');
      return;
    }

    const timestamp = new Date().toISOString();

    if (modalMode === 'add') {
      const newAcc: Account = {
        id: `preview_${selectedTemplate}_${Date.now()}`,
        clinicId: 'preview_master',
        code: formData.code.trim(),
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim(),
        type: formData.type,
        category: formData.category,
        level: formData.level,
        parentId: formData.parentId.trim() || undefined,
        openingBalance: 0,
        currentBalance: 0,
        description: formData.description.trim(),
        isSystemAccount: false,
        createdAt: timestamp
      };

      setCustomAccounts(prev => ({
        ...prev,
        [selectedTemplate]: [...(prev[selectedTemplate] || []), newAcc]
      }));
      logAction('إضافة بند محاسبي للقالب', `تم إضافة الحساب ${formData.name} (${formData.code}) إلى نموذج ${selectedTemplate}`);
    } else if (modalMode === 'edit' && editingAccountId) {
      setCustomAccounts(prev => ({
        ...prev,
        [selectedTemplate]: (prev[selectedTemplate] || []).map(acc => {
          if (acc.id === editingAccountId) {
            return {
              ...acc,
              code: formData.code.trim(),
              name: formData.name.trim(),
              nameEn: formData.nameEn.trim(),
              type: formData.type,
              category: formData.category,
              level: formData.level,
              parentId: formData.parentId.trim() || undefined,
              description: formData.description.trim()
            };
          }
          return acc;
        })
      }));
      logAction('تعديل بند محاسبي بالقالب', `تم تعديل الحساب ${formData.name} (${formData.code}) في نموذج ${selectedTemplate}`);
    }

    setIsModalOpen(false);
  };

  // Delete Account
  const handleDeleteAccount = (acc: Account) => {
    if (window.confirm(`هل أنت أرجو تأكيد حذف الحساب المحاسبي (${acc.name} - ${acc.code}) من هذا القالب؟`)) {
      setCustomAccounts(prev => ({
        ...prev,
        [selectedTemplate]: (prev[selectedTemplate] || []).filter(a => a.id !== acc.id)
      }));
      logAction('حذف بند محاسبي من القالب', `تم حذف الحساب ${acc.name} (${acc.code}) من نموذج ${selectedTemplate}`);
    }
  };

  // Toggle Tenant Permission
  const handleToggleTenantPermission = (permKey: keyof Clinic, currentValue: boolean) => {
    if (!targetTenantId || !selectedClinic) {
      alert('الرجاء اختيار المنشأة أولاً لضبط الصلاحيات المالية.');
      return;
    }

    const updatedClinics = clinics.map(c => {
      if (c.id === targetTenantId) {
        return {
          ...c,
          [permKey]: !currentValue
        };
      }
      return c;
    });

    updateState({ clinics: updatedClinics });
    logAction('تحديث الصلاحيات المالية للمنشأة', `تم تغيير ${String(permKey)} لمنشأة ${selectedClinic.name} إلى ${!currentValue}`);
  };

  // Apply current modified template to target Tenant
  const handleApplyTemplateToTenant = () => {
    if (!targetTenantId) {
      alert('الرجاء اختيار المنشأة أو العيادة أولاً.');
      return;
    }
    const targetClinic = clinics.find(c => c.id === targetTenantId);
    if (!targetClinic) return;

    const templateNameAr = 
      selectedTemplate === 'pharmacy' ? 'الصيدلية والخدمات الدوائية' :
      selectedTemplate === 'clinic' ? 'العيادة التخصصية الفردية' :
      selectedTemplate === 'hospital' ? 'المستشفى والرقود والعمليات' : 'المركز الطبي التخصصي';

    if (!window.confirm(`هل أنت أرجو تأكيد تطبيق نموذج شجرة الحسابات المعدلة (${templateNameAr}) بالكامل على منشأة (${targetClinic.name})؟ سيتم تحديث دليل الحسابات المالي الخاص بها.`)) {
      return;
    }

    // Map account IDs to match target tenant
    const templateToApply = (customAccounts[selectedTemplate] || []).map(a => ({
      ...a,
      id: `${targetTenantId}_${a.code}`,
      clinicId: targetTenantId
    }));

    const updatedStore = {
      ...(state.accountsStore || {}),
      [targetTenantId]: templateToApply
    };

    // Also update tenant systemType if needed
    const updatedClinics = clinics.map(c => {
      if (c.id === targetTenantId) {
        return {
          ...c,
          systemType: selectedTemplate === 'center' ? 'center' : selectedTemplate
        };
      }
      return c;
    });

    updateState({ 
      accountsStore: updatedStore,
      clinics: updatedClinics
    });

    logAction('تطبيق القالب المحاسبي للمنشأة', `تم تطبيق نموذج ${selectedTemplate} بنجاح لمنشأة ${targetClinic.name}`);
    alert(`تمت إعادة تهيئة وتطبيق شجرة الحسابات لمنشأة (${targetClinic.name}) بنجاح!`);
  };

  // Export Excel
  const handleExportExcel = () => {
    const templateTitle = 
      selectedTemplate === 'pharmacy' ? 'نموذج_الصيدليات' :
      selectedTemplate === 'clinic' ? 'نموذج_العيادات' :
      selectedTemplate === 'hospital' ? 'نموذج_المستشفيات' : 'نموذج_المراكز';

    exportToExcel(
      currentPreviewAccounts.map(a => ({
        code: a.code,
        name: a.name,
        level: `مستوى ${a.level}`,
        type: a.type === 'asset' ? 'أصول' : a.type === 'liability' ? 'التزامات' : a.type === 'equity' ? 'حقوق ملكية' : a.type === 'revenue' ? 'إيرادات' : 'مصروفات',
        parentCode: a.parentId || 'رئيسي',
        description: a.description || '-'
      })),
      [
        { key: 'code', label: 'كود الحساب' },
        { key: 'name', label: 'اسم الحساب المحاسبي' },
        { key: 'level', label: 'المستوى' },
        { key: 'type', label: 'تصنيف الحساب' },
        { key: 'parentCode', label: 'كود الحساب الأب' },
        { key: 'description', label: 'شرح الحساب' }
      ],
      `شجرة_الحسابات_${templateTitle}`
    );
  };

  // Export PDF
  const handleExportPdf = () => {
    const templateTitle = 
      selectedTemplate === 'pharmacy' ? 'نموذج الصيدليات والخدمات الدوائية' :
      selectedTemplate === 'clinic' ? 'نموذج العيادات التخصصية الفردية' :
      selectedTemplate === 'hospital' ? 'نموذج المستشفيات والرقود والعمليات' : 'نموذج المراكز الطبية';

    exportToPdf({
      title: `دليل ونموذج شجرة الحسابات المالي - ${templateTitle}`,
      subtitle: `إجمالي البنود: ${currentPreviewAccounts.length} حساب محاسبي معتمد`,
      columns: [
        { key: 'code', label: 'الكود' },
        { key: 'name', label: 'اسم الحساب' },
        { key: 'level', label: 'المستوى', format: (val) => `مستوى ${val}` },
        { key: 'type', label: 'النوع', format: (val) => val === 'asset' ? 'أصول' : val === 'liability' ? 'التزامات' : val === 'equity' ? 'حقوق ملكية' : val === 'revenue' ? 'إيرادات' : 'مصروفات' }
      ],
      data: currentPreviewAccounts
    });
  };

  // Print Report
  const handlePrint = () => {
    const templateTitle = 
      selectedTemplate === 'pharmacy' ? 'صيدلية' :
      selectedTemplate === 'clinic' ? 'عيادة تخصصية' :
      selectedTemplate === 'hospital' ? 'مستشفى' : 'مركز طبي';

    printReport({
      title: `دليل شجرة الحسابات القياسية المعتمدة (${templateTitle})`,
      subtitle: `عدد البنود: ${currentPreviewAccounts.length} بند محاسبي`,
      columns: [
        { key: 'code', label: 'الكود' },
        { key: 'name', label: 'اسم الحساب المحاسبي' },
        { key: 'level', label: 'المستوى', format: (val) => `مستوى ${val}` },
        { key: 'type', label: 'التصنيف', format: (val) => val === 'asset' ? 'أصول' : val === 'liability' ? 'التزامات' : val === 'equity' ? 'حقوق ملكية' : val === 'revenue' ? 'إيرادات' : 'مصروفات' }
      ],
      data: currentPreviewAccounts
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Description Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1">
                <Sparkles size={14} /> المعاينة والتحكم المحاسبي المطور (Chart of Accounts Master Control)
              </span>
            </div>
            <h3 className="text-xl font-black text-white">النظام المحاسبي المتكامل للصيدليات والعيادات والمستشفيات</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              تسمح هذه اللوحة الذكية للمطور بمعاينة وتعديل وإدارة الهياكل الحسابية للقطاعات الثلاثة (صيدليات، عيادات، مستشفيات)، مع إضافة وتعديل وإزالة الأقسام والبنود، والتحكم المطلق بصلاحيات الطباعة والتصدير والتحميل والتعديل لكل منشأة.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus size={16} /> إضافة قسم / حساب جديد
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <FileSpreadsheet size={16} /> تصدير Excel
            </button>

            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <FileText size={16} /> تصدير PDF
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer size={16} /> طباعة
            </button>

            <button
              onClick={() => setShowDesktopGuideModal(true)}
              className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border border-teal-400/30 cursor-pointer"
            >
              <Monitor size={16} /> 📦 حزمة Desktop (.exe) & GitHub
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Specialized System Templates Selection Engine */}
      <div className="bg-gradient-to-l from-blue-900 via-indigo-900 to-slate-900 p-5 rounded-3xl text-white shadow-lg border border-indigo-700/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold">
              <Building2 size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold mb-0.5">
                <Sparkles size={13} /> النماذج القياسية للمطور (Developer Control)
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>محرك النماذج المحاسبية الطبية التفاعلية (Interactive Chart Templates Engine)</span>
              </h3>
              <p className="text-xs text-slate-300">
                اختر النموذج المحاسبي المعاين للتحكم في بنوده، أو تعيينه وتخصيصه لأي قسم أو مستشفى أو عيادة أو مركز طبي.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pharmacy Template */}
          <div 
            onClick={() => setSelectedTemplate('pharmacy')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTemplate === 'pharmacy' 
                ? 'bg-emerald-950/80 border-emerald-400 shadow-lg text-white ring-2 ring-emerald-500/30' 
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            {selectedTemplate === 'pharmacy' && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1">
                <CheckCircle2 size={12} /> القالب المعاين
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                selectedTemplate === 'pharmacy' ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                <Pill size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">نموذج الصيدلية والمخزون</h4>
                <span className="text-[10px] text-slate-400 block font-mono">Pharmacy POS Chart</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5 line-clamp-3">
              دليل متخصص بمخزون الأدوية، تكلفة الأدوية COGS، الأدوية المنتهية Expired، والشيفتات الصيدلانية.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] font-bold">
              <span>البنود: {generateDefaultChartOfAccounts('preview', 'pharmacy').length} حساب</span>
              <span className="text-emerald-400 font-mono">POS & Drugs</span>
            </div>
          </div>

          {/* Clinic Template */}
          <div 
            onClick={() => setSelectedTemplate('clinic')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTemplate === 'clinic' 
                ? 'bg-blue-950/80 border-blue-400 shadow-lg text-white ring-2 ring-blue-500/30' 
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            {selectedTemplate === 'clinic' && (
              <div className="absolute top-0 right-0 bg-blue-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1">
                <CheckCircle2 size={12} /> القالب المعاين
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                selectedTemplate === 'clinic' ? 'bg-blue-500 text-slate-950' : 'bg-blue-500/20 text-blue-400'
              }`}>
                <Stethoscope size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">نموذج عيادة تخصصية</h4>
                <span className="text-[10px] text-slate-400 block font-mono">Specialty Clinic Chart</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5 line-clamp-3">
              دليل مالي مبسط للعيادات الفردية للتحكم بإيرادات الكشوفات والمتابعات وصيانة الأجهزة الطبية.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] font-bold">
              <span>البنود: {generateDefaultChartOfAccounts('preview', 'clinic').length} حساب</span>
              <span className="text-blue-400 font-mono">سريع ودقيق</span>
            </div>
          </div>

          {/* Medical Center Template */}
          <div 
            onClick={() => setSelectedTemplate('center')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTemplate === 'center' 
                ? 'bg-purple-950/80 border-purple-400 shadow-lg text-white ring-2 ring-purple-500/30' 
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            {selectedTemplate === 'center' && (
              <div className="absolute top-0 right-0 bg-purple-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1">
                <CheckCircle2 size={12} /> القالب المعاين
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                selectedTemplate === 'center' ? 'bg-purple-500 text-slate-950' : 'bg-purple-500/20 text-purple-400'
              }`}>
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">نموذج مركز متعدد العيادات</h4>
                <span className="text-[10px] text-slate-400 block font-mono">Multi-Specialty Center</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5 line-clamp-3">
              يركز على حسابات توزيع الإيرادات لعيادات الأسنان، العلاج الطبيعي، الباقات الشاملة وأتعاب المتعاقدين.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] font-bold">
              <span>البنود: {generateDefaultChartOfAccounts('preview', 'center').length} حساب</span>
              <span className="text-purple-400 font-mono">تخصصات متعددة</span>
            </div>
          </div>

          {/* Hospital Template */}
          <div 
            onClick={() => setSelectedTemplate('hospital')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTemplate === 'hospital' 
                ? 'bg-indigo-950/80 border-indigo-400 shadow-lg text-white ring-2 ring-indigo-500/30' 
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            {selectedTemplate === 'hospital' && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl flex items-center gap-1">
                <CheckCircle2 size={12} /> القالب المعاين
              </div>
            )}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                selectedTemplate === 'hospital' ? 'bg-indigo-500 text-slate-950' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                <Hospital size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">نموذج المستشفيات والجراحة</h4>
                <span className="text-[10px] text-slate-400 block font-mono">Full Hospital & OR</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5 line-clamp-3">
              يضيف حسابات غرف العمليات OR، الإقامة، العناية المركزة ICU، الطوارئ ER، صيدلية الطوارئ والغازات.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] font-bold">
              <span>البنود: {generateDefaultChartOfAccounts('preview', 'hospital').length} حساب</span>
              <span className="text-indigo-400 font-mono">4 مستويات تفصيلية</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Developer Master Permission & Governance Panel per Tenant */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Sliders size={20} />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">لوحة التحكم بصلاحيات الطباعة والتصدير والتعديل المالي</h4>
              <p className="text-xs text-slate-400">حدد المنشأة للتحكم المباشر في جميع أذونات وقدرات المستخدمين على الحسابات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">المنشأة المستهدفة:</span>
            <select
              value={targetTenantId}
              onChange={(e) => setTargetTenantId(e.target.value)}
              className="text-xs font-bold bg-slate-950 text-slate-200 border border-slate-700 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[220px]"
            >
              <option value="">-- اختر المنشأة أو العيادة --</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.systemType === 'pharmacy' ? 'صيدلية' : c.systemType === 'hospital' ? 'مستشفى' : c.systemType === 'center' ? 'مركز' : 'عيادة'})
                </option>
              ))}
            </select>

            <button
              onClick={handleApplyTemplateToTenant}
              disabled={!targetTenantId}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw size={14} /> تطبيق القالب على المنشأة
            </button>
          </div>
        </div>

        {selectedClinic ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
            {/* 1. Printing Permission */}
            <div 
              onClick={() => handleToggleTenantPermission('allowPrinting', selectedClinic.allowPrinting ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowPrinting ?? true 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Printer size={18} />
              <span className="text-[11px] font-bold">1. الطباعة والأنشطة</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowPrinting ?? true ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowPrinting ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>

            {/* 2. Excel Export Permission */}
            <div 
              onClick={() => handleToggleTenantPermission('allowExcelExport', selectedClinic.allowExcelExport ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowExcelExport ?? true 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <FileSpreadsheet size={18} />
              <span className="text-[11px] font-bold">2. تصدير Excel</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowExcelExport ?? true ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowExcelExport ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>

            {/* 3. PDF Export Permission */}
            <div 
              onClick={() => handleToggleTenantPermission('allowPdfExport', selectedClinic.allowPdfExport ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowPdfExport ?? true 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <FileText size={18} />
              <span className="text-[11px] font-bold">3. تصدير PDF</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowPdfExport ?? true ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowPdfExport ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>

            {/* 4. Edit Accounts Permission */}
            <div 
              onClick={() => handleToggleTenantPermission('allowEditDeleteAccounting', selectedClinic.allowEditDeleteAccounting ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowEditDeleteAccounting ?? true 
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Pencil size={18} />
              <span className="text-[11px] font-bold">4. تعديل الشجرة</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowEditDeleteAccounting ?? true ? 'bg-indigo-500/20 text-indigo-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowEditDeleteAccounting ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>

            {/* 5. Add Sections Permission */}
            <div 
              onClick={() => handleToggleTenantPermission('allowAccounting', selectedClinic.allowAccounting ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowAccounting ?? true 
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Plus size={18} />
              <span className="text-[11px] font-bold">5. إضافة أقسام</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowAccounting ?? true ? 'bg-indigo-500/20 text-indigo-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowAccounting ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>

            {/* 6. Delete Sections Permission */}
            <div 
              onClick={() => handleToggleTenantPermission('allowEditDeleteAccounting', selectedClinic.allowEditDeleteAccounting ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowEditDeleteAccounting ?? true 
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Trash2 size={18} />
              <span className="text-[11px] font-bold">6. حذف البنود</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowEditDeleteAccounting ?? true ? 'bg-indigo-500/20 text-indigo-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowEditDeleteAccounting ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>

            {/* 7. Manual Journal Vouchers */}
            <div 
              onClick={() => handleToggleTenantPermission('allowAuditLogs', selectedClinic.allowAuditLogs ?? true)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-2 ${
                selectedClinic.allowAuditLogs ?? true 
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <ShieldCheck size={18} />
              <span className="text-[11px] font-bold">7. قيود وسندات</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedClinic.allowAuditLogs ?? true ? 'bg-purple-500/20 text-purple-300' : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedClinic.allowAuditLogs ?? true ? 'متاح 🟢' : 'مغلق 🔴'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 font-bold">
            💡 اختر منشأة من القائمة العلوية لعرض وتغيير أذونات الطباعة والتصدير والتعديل الخاصة بها مباشرة.
          </div>
        )}
      </div>

      {/* 4. Action Toolbar & Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <BookOpen size={18} className="text-indigo-600 shrink-0" />
          <h4 className="font-bold text-slate-800 text-sm whitespace-nowrap">
            معاينة وإدارة بنود نموذج: ({
              selectedTemplate === 'pharmacy' ? 'الصيدلية' :
              selectedTemplate === 'clinic' ? 'العيادة' :
              selectedTemplate === 'hospital' ? 'المستشفى' : 'المركز'
            })
          </h4>
          <button
            onClick={handleResetTemplate}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            title="إعادة ضبط القالب إلى النموذج المبدئي"
          >
            <RotateCcw size={13} /> استعادة الافتراضي
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالكود أو اسم الحساب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="asset">الأصول (1)</option>
            <option value="liability">الالتزامات (2)</option>
            <option value="equity">حقوق الملكية (3)</option>
            <option value="revenue">الإيرادات (4)</option>
            <option value="expense">المصروفات (5)</option>
          </select>
        </div>
      </div>

      {/* 5. Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center">
          <span className="block text-[10px] text-slate-500 font-bold">إجمالي البنود الهيكلية</span>
          <span className="text-base font-black text-indigo-900 font-mono">{totalAccountsCount} حساب</span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center">
          <span className="block text-[10px] text-slate-500 font-bold">الأقسام الرئيسية (مستوى 1)</span>
          <span className="text-base font-black text-blue-700 font-mono">{level1Count} رئيسي</span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center">
          <span className="block text-[10px] text-slate-500 font-bold">الحسابات الفرعية (مستوى 2)</span>
          <span className="text-base font-black text-emerald-700 font-mono">{level2Count} فرعي</span>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 text-center">
          <span className="block text-[10px] text-slate-500 font-bold">الحسابات التحليلية (مستوى 3+)</span>
          <span className="text-base font-black text-purple-700 font-mono">{level3Count} تحليلي</span>
        </div>
      </div>

      {/* 6. Chart of Accounts Table with Full Edit / Add / Delete */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-sm">
              جدول الحسابات التفاعلي المتاح للتعديل والحذف والإضافة
            </h4>
          </div>
          <span className="text-xs font-bold text-slate-500">
            يعرض {filteredAccounts.length} من أصل {currentPreviewAccounts.length} بند
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">الكود</th>
                <th className="p-3">اسم الحساب المحاسبي</th>
                <th className="p-3">المستوى</th>
                <th className="p-3">التصنيف المحاسبي</th>
                <th className="p-3">طبيعة الحساب</th>
                <th className="p-3">الشرح والتفاصيل</th>
                <th className="p-3 text-center">إجراءات المطور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const isLevel1 = acc.level === 1;
                const isLevel2 = acc.level === 2;

                return (
                  <tr 
                    key={acc.id || acc.code}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isLevel1 ? 'bg-indigo-50/40 font-black text-indigo-950' : isLevel2 ? 'font-bold text-slate-800' : 'text-slate-600'
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-slate-700">
                      <span className={`px-2 py-0.5 rounded-md ${
                        isLevel1 ? 'bg-indigo-100 text-indigo-800' : isLevel2 ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {acc.code}
                      </span>
                    </td>
                    <td className="p-3">
                      <span style={{ paddingRight: `${(acc.level - 1) * 16}px` }} className="inline-block">
                        {isLevel1 ? '📂 ' : isLevel2 ? '📁 ' : '📄 '}
                        {acc.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">
                        مستوى {acc.level}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {acc.type === 'asset' && <span className="text-emerald-700">أصول (Assets)</span>}
                      {acc.type === 'liability' && <span className="text-red-700">التزامات (Liabilities)</span>}
                      {acc.type === 'equity' && <span className="text-purple-700">حقوق ملكية (Equity)</span>}
                      {acc.type === 'revenue' && <span className="text-blue-700">إيرادات (Revenues)</span>}
                      {acc.type === 'expense' && <span className="text-amber-700">مصروفات (Expenses)</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        acc.type === 'asset' || acc.type === 'expense' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {acc.type === 'asset' || acc.type === 'expense' ? 'مدين (Debit)' : 'دائن (Credit)'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate" title={acc.description}>
                      {acc.description || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenAddModal(acc)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="إضافة فرعي"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(acc)}
                          className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                          title="تعديل الحساب"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc)}
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="حذف الحساب"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" />
                <h3 className="font-black text-slate-800 text-base">
                  {modalMode === 'add' ? 'إضافة قسم / حساب جديد بالقالب' : 'تعديل الحساب المحاسبي'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600">كود الحساب المحاسبي *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="مثال: 1109"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">المستوى المحاسبي</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={1}>مستوى 1 (رئيسي)</option>
                    <option value={2}>مستوى 2 (فرعي)</option>
                    <option value={3}>مستوى 3 (تحليلي)</option>
                    <option value={4}>مستوى 4 (تفصيلي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-600">اسم الحساب (عربي) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="مثال: مخزون الأدوية والمستلزمات الطبية"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-600">اسم الحساب بالإنجليزية (English Name)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left font-mono"
                  placeholder="e.g. Pharmacy Stock Inventory"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-600">تصنيف الحساب</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="asset">أصول (Asset)</option>
                    <option value="liability">التزامات (Liability)</option>
                    <option value="equity">حقوق ملكية (Equity)</option>
                    <option value="revenue">إيرادات (Revenue)</option>
                    <option value="expense">مصروفات (Expense)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">كود الحساب الأب (Parent)</label>
                  <input
                    type="text"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="مثال: 11"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-600">الشرح والتفاصيل الحسابية</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="ملاحظات وشرح طبيعة العمليات المسموح بتقييدها بهذا الحساب..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={16} /> حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESKTOP BUILD & GITHUB GUIDE MODAL */}
      {showDesktopGuideModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/30">
                  <Monitor size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>دليل رفع المشروع على GitHub وتصنيع برنامج سطح المكتب (.exe)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    تم إعداد ملفات Electron القياسية (`electron/main.cjs` و `package.json`) جاهزة للتصدير المباشر
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDesktopGuideModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              {/* Box 1: GitHub Commands */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-300">
                  <span className="flex items-center gap-1.5"><Github size={16} /> 1. أوامر رفع المشروع على GitHub:</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-teal-200 space-y-1 select-all border border-slate-800">
                  <div>git init</div>
                  <div>git add .</div>
                  <div>git commit -m "Initial commit: Complete Medical ERP & Electron"</div>
                  <div>git branch -M main</div>
                  <div>git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git</div>
                  <div>git push -u origin main</div>
                </div>
              </div>

              {/* Box 2: Build Executable .exe */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span className="flex items-center gap-1.5"><Terminal size={16} /> 2. تشغيل وبناء برنامج سطح المكتب (.exe) على جهازك عبر VS Code:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  افتح المشروع ببرنامج Visual Studio Code ثم قم بتشغيل الأوامر التالية في الـ Terminal:
                </p>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-amber-200 space-y-1 select-all border border-slate-800">
                  <div className="text-slate-500"># تثبيت الملحقات والمكتبات</div>
                  <div>npm install</div>
                  <div className="text-slate-500 mt-2"># لتجربة نافذة سطح المكتب فورياً</div>
                  <div>npm run electron:start</div>
                  <div className="text-slate-500 mt-2"># لتوليد وتصنيع برنامج الويندوز النهائي (.exe)</div>
                  <div>npm run electron:build</div>
                </div>
              </div>

              {/* Box 3: Output Location */}
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/60 text-emerald-200 space-y-1">
                <div className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                  <Download size={15} /> ناتِج ملف التثبيت المباشر للعميل (.exe)
                </div>
                <p className="text-[11px]">
                  بعد انتهاء أمر <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">npm run electron:build</code> ستجد المجلد المسمى <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">release/</code> يحتوي على ملف تثبيت الويندوز القياسي:
                  <br />
                  <strong className="text-white">`release/Medical Clinic & Hospital ERP Setup 1.0.0.exe`</strong> (جاهز للبيع أو التثبيت لدى العميل مباشرة).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDesktopGuideModal(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
