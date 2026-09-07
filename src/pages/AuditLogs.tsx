import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  History, Search, Filter, FileSpreadsheet, Printer, ShieldCheck, 
  User, Building2, Calendar, CheckCircle2, Clock, Trash2, ArrowUpDown,
  PlusCircle, Edit3, Trash, AlertTriangle, RefreshCw, Key, ShieldAlert,
  Sliders, Eye, EyeOff, Lock, Unlock, Download, ChevronRight, Activity,
  Check, X, FileText, DollarSign, Database, Sparkles, Layers, ListFilter
} from 'lucide-react';
import { AuditLog, AuditOperationType, Clinic } from '../types';
import { exportToExcel, printReport } from '../lib/exportUtils';

export default function AuditLogs() {
  const { state, currentUser, updateState, logAction } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpType, setSelectedOpType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState<string>(
    currentUser?.clinicId === 'master' ? 'all' : (currentUser?.clinicId || 'default')
  );
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLog | null>(null);

  // Developer control panel state
  const [showDevControlModal, setShowDevControlModal] = useState(false);
  const [facilitySearchDev, setFacilitySearchDev] = useState('');

  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const targetClinic = state.clinics.find(c => String(c.id) === String(currentUser?.clinicId));

  // Determine visibility permissions for normal staff
  const isAuditLogsAllowedForClinic = isMaster || (targetClinic?.allowAuditLogs !== false);
  const clinicVisibility = targetClinic?.auditLogVisibility || 'all_staff';
  const canViewLogs = isMaster || (
    isAuditLogsAllowedForClinic && (
      clinicVisibility === 'all_staff' || 
      (clinicVisibility === 'admin_only' && currentUser?.role === 'doctor')
    )
  );

  const allowExcel = isMaster || (targetClinic?.allowExcelExport !== false);
  const allowPdf = isMaster || (targetClinic?.allowPdfExport !== false);
  const allowPrinting = isMaster || (targetClinic?.allowPrinting !== false);

  // Filter logs strictly by clinic isolation
  const visibleLogs: AuditLog[] = useMemo(() => {
    let logs = state.auditLogs || [];

    // Tenant isolation: if not master, enforce currentUser.clinicId
    if (!isMaster) {
      logs = logs.filter(log => String(log.clinicId) === String(currentUser?.clinicId));
    } else if (selectedClinicFilter !== 'all') {
      logs = logs.filter(log => String(log.clinicId) === String(selectedClinicFilter));
    }

    // CRUD Operation Type filter
    if (selectedOpType !== 'all') {
      logs = logs.filter(log => (log.operationType || 'process') === selectedOpType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      logs = logs.filter(log => log.category === selectedCategory);
    }

    // User filter
    if (selectedUserId !== 'all') {
      logs = logs.filter(log => String(log.userId) === String(selectedUserId));
    }

    // Date filter
    if (dateFilter) {
      logs = logs.filter(log => log.timestamp?.startsWith(dateFilter));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(log => 
        log.action?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.userName?.toLowerCase().includes(q) ||
        log.clinicName?.toLowerCase().includes(q) ||
        (log.targetName && log.targetName.toLowerCase().includes(q)) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
      );
    }

    return logs;
  }, [state.auditLogs, isMaster, currentUser, selectedClinicFilter, selectedOpType, selectedCategory, selectedUserId, dateFilter, searchQuery]);

  // Unique users for filtering
  const availableUsers = useMemo(() => {
    const logs = isMaster && selectedClinicFilter === 'all' 
      ? (state.auditLogs || [])
      : (state.auditLogs || []).filter(l => String(l.clinicId) === (isMaster ? String(selectedClinicFilter) : String(currentUser?.clinicId)));
    
    const userMap = new Map<string, { id: string; name: string; role?: string }>();
    logs.forEach(l => {
      if (l.userId && !userMap.has(l.userId)) {
        userMap.set(l.userId, { id: l.userId, name: l.userName, role: l.userRole });
      }
    });
    return Array.from(userMap.values());
  }, [state.auditLogs, isMaster, selectedClinicFilter, currentUser]);

  // Analytics & KPIs
  const stats = useMemo(() => {
    const total = visibleLogs.length;
    const createCount = visibleLogs.filter(l => l.operationType === 'create').length;
    const updateCount = visibleLogs.filter(l => l.operationType === 'update').length;
    const deleteCount = visibleLogs.filter(l => l.operationType === 'delete').length;
    const processCount = visibleLogs.filter(l => l.operationType === 'process').length;
    const authCount = visibleLogs.filter(l => l.operationType === 'auth').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = visibleLogs.filter(l => l.timestamp?.startsWith(todayStr)).length;

    return { total, createCount, updateCount, deleteCount, processCount, authCount, todayCount };
  }, [visibleLogs]);

  // Toggle clinic audit log setting (Developer Only)
  const toggleClinicAuditLogs = (clinicId: string, currentVal?: boolean) => {
    const newVal = currentVal === false ? true : false;
    const updatedClinics = state.clinics.map(c => c.id === clinicId ? { ...c, allowAuditLogs: newVal } : c);
    updateState({ clinics: updatedClinics });
    logAction(
      newVal ? 'تفعيل سجل الرقابة' : 'إيقاف سجل الرقابة',
      `تم ${newVal ? 'تفعيل' : 'تعطيل'} وحدة سجل الرقابة للمنشأة: ${state.clinics.find(c => c.id === clinicId)?.name}`,
      'settings'
    );
  };

  // Change clinic audit log visibility (Developer Only)
  const changeClinicVisibility = (clinicId: string, visibility: 'all_staff' | 'admin_only' | 'developer_only') => {
    const updatedClinics = state.clinics.map(c => c.id === clinicId ? { ...c, auditLogVisibility: visibility } : c);
    updateState({ clinics: updatedClinics });
    logAction(
      'تعديل ظهور سجل الرقابة',
      `تم تغيير صلاحية استعراض سجل الرقابة للمنشأة (${state.clinics.find(c => c.id === clinicId)?.name}) إلى «${visibility === 'all_staff' ? 'متاح للجميع' : visibility === 'admin_only' ? 'للإدارة فقط' : 'محجوب للمطور فقط'}».`,
      'settings'
    );
  };

  // Export & Print
  const handleExportExcel = () => {
    exportToExcel(
      visibleLogs,
      [
        { key: 'timestamp', label: 'التاريخ والوقت', format: (val) => new Date(val).toLocaleString('ar-EG') },
        { key: 'userName', label: 'المستخدم' },
        { key: 'userRole', label: 'الصفة / الدور' },
        { key: 'clinicName', label: 'المنشأة / العيادة' },
        { key: 'operationType', label: 'نوع العملية (CRUD)', format: (val) => getOpTypeLabel(val) },
        { key: 'action', label: 'الإجراء' },
        { key: 'category', label: 'القسم / التصنيف' },
        { key: 'details', label: 'تفاصيل النشاط والبيان' },
        { key: 'targetName', label: 'الطرف المستهدف' }
      ],
      `سجل_الرقابة_والنشاط_${targetClinic?.name || 'النظام'}_${new Date().toISOString().split('T')[0]}`
    );
  };

  const handlePrint = () => {
    printReport({
      title: 'سجل النشاط والرقابة وحركات المستخدمين (Audit Trail)',
      subtitle: `تقرير التدقيق الأمني والرقابي الشامل • تم الاستخراج بتاريخ ${new Date().toLocaleString('ar-EG')}`,
      facilityName: isMaster && selectedClinicFilter === 'all' ? 'المنظومة المركزية للمستشفيات' : (targetClinic?.name || 'المنشأة الطبية'),
      doctorName: targetClinic?.docName,
      columns: [
        { key: 'timestamp', label: 'الوقت والتاريخ', format: (val) => new Date(val).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(val).toLocaleDateString('ar-EG') },
        { key: 'userName', label: 'المستخدم' },
        { key: 'action', label: 'الإجراء والعملية' },
        { key: 'category', label: 'القسم' },
        { key: 'details', label: 'التفاصيل' }
      ],
      data: visibleLogs,
      summaryCards: [
        { label: 'إجمالي العمليات', value: stats.total.toString() },
        { label: 'عمليات اليوم', value: stats.todayCount.toString() },
        { label: 'عمليات الحذف', value: stats.deleteCount.toString() },
        { label: 'عمليات الإضافة', value: stats.createCount.toString() }
      ]
    });
  };

  // Clear logs for master
  const handleClearLogs = () => {
    if (confirm('⚠️ تحذير: هل أنت متأكد من تفريغ سجل النشاطات لهذا النطاق؟ لا يمكن التراجع عن هذا الإجراء.')) {
      if (isMaster && selectedClinicFilter === 'all') {
        updateState({ auditLogs: [] });
      } else {
        const targetCId = isMaster ? selectedClinicFilter : currentUser?.clinicId;
        const remaining = (state.auditLogs || []).filter(l => String(l.clinicId) !== String(targetCId));
        updateState({ auditLogs: remaining });
      }
    }
  };

  const getOpTypeBadge = (type?: AuditOperationType) => {
    switch (type) {
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle size={11} className="text-emerald-600" /> إضافة (Create)
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Edit3 size={11} className="text-amber-600" /> تعديل (Update)
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <Trash size={11} className="text-rose-600" /> حذف (Delete)
          </span>
        );
      case 'auth':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            <Key size={11} className="text-purple-600" /> دخول وأمان (Auth)
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
            <Eye size={11} className="text-sky-600" /> استعراض (View)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            <Activity size={11} className="text-blue-600" /> معالجة (Process)
          </span>
        );
    }
  };

  const getOpTypeLabel = (type?: AuditOperationType) => {
    switch (type) {
      case 'create': return 'إضافة / إنشاء';
      case 'update': return 'تعديل / تحديث';
      case 'delete': return 'حذف / إلغاء';
      case 'auth': return 'دخول وأمان';
      case 'read': return 'استعراض وقراءة';
      default: return 'معاملة وإجراء';
    }
  };

  if (!canViewLogs) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm" dir="rtl">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-200">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">سجل النشاط والرقابة محجوب أو غير مفعل</h2>
        <p className="text-slate-500 text-xs max-w-md leading-relaxed mb-4">
          تم تقييد صلاحية استعراض سجل الرقابة والحركات لهذه المنشأة من قِبل إدارة النظام والمطور لحماية سرية العمليات.
        </p>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          الحالة: {clinicVisibility === 'developer_only' ? 'خاص بالمطور الرئيسي فقط' : 'خاص بمدير المنشأة فقط'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto" dir="rtl">
      
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
            <History size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800">سجل النشاط والرقابة (Audit Trail)</h1>
              {isMaster && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full">
                  👑 تحكم المطور المركزي
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              تتبع زمني وفوري لكافة عمليات الإنشاء والتعديل والحذف (CRUD) عبر العيادات والمراكز والمستشفيات
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Developer Control Center Button */}
          {isMaster && (
            <button
              onClick={() => setShowDevControlModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Sliders size={15} /> تحكم سجلات المنشآت
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              جدول مفصل
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'timeline' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              شريط زمني
            </button>
          </div>

          {allowExcel && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="تصدير إكسيل"
            >
              <FileSpreadsheet size={15} /> تصدير إكسيل
            </button>
          )}

          {(allowPdf || allowPrinting) && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="طباعة التقرير"
            >
              <Printer size={15} /> طباعة / PDF
            </button>
          )}

          {isMaster && (
            <button
              onClick={handleClearLogs}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              title="تفريغ سجل النشاط"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ================= KPI STATS CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 font-bold block mb-1">إجمالي الحركات</span>
          <div className="text-xl font-black text-slate-800">{stats.total.toLocaleString('ar-EG')}</div>
          <span className="text-[10px] text-slate-400 font-medium">كافة العمليات المسجلة</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-emerald-600 font-bold block mb-1">عمليات الإضافة (Create)</span>
          <div className="text-xl font-black text-emerald-700">{stats.createCount.toLocaleString('ar-EG')}</div>
          <span className="text-[10px] text-emerald-500 font-medium">سجلات ومرضى وفواتير</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-amber-600 font-bold block mb-1">عمليات التعديل (Update)</span>
          <div className="text-xl font-black text-amber-700">{stats.updateCount.toLocaleString('ar-EG')}</div>
          <span className="text-[10px] text-amber-500 font-medium">تحديث بيانات وحالات</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-rose-600 font-bold block mb-1">عمليات الحذف (Delete)</span>
          <div className="text-xl font-black text-rose-700">{stats.deleteCount.toLocaleString('ar-EG')}</div>
          <span className="text-[10px] text-rose-500 font-medium">حذف بيانات وسجلات</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-blue-600 font-bold block mb-1">معاملات مالية وإجراءات</span>
          <div className="text-xl font-black text-blue-700">{stats.processCount.toLocaleString('ar-EG')}</div>
          <span className="text-[10px] text-blue-500 font-medium">قيود، سندات، رواتب</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-purple-600 font-bold block mb-1">نشاط اليوم</span>
          <div className="text-xl font-black text-purple-700">{stats.todayCount.toLocaleString('ar-EG')}</div>
          <span className="text-[10px] text-purple-500 font-medium">حركات منفذة اليوم</span>
        </div>
      </div>

      {/* ================= CRUD OPERATION TYPE PILLS ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedOpType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedOpType === 'all' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          الكل ({stats.total})
        </button>

        <button
          onClick={() => setSelectedOpType('create')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedOpType === 'create' 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <PlusCircle size={13} /> إضافة Create ({stats.createCount})
        </button>

        <button
          onClick={() => setSelectedOpType('update')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedOpType === 'update' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Edit3 size={13} /> تعديل Update ({stats.updateCount})
        </button>

        <button
          onClick={() => setSelectedOpType('delete')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedOpType === 'delete' 
              ? 'bg-rose-600 text-white shadow-xs' 
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Trash size={13} /> حذف Delete ({stats.deleteCount})
        </button>

        <button
          onClick={() => setSelectedOpType('process')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedOpType === 'process' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          <Activity size={13} /> إجراءات Process ({stats.processCount})
        </button>

        <button
          onClick={() => setSelectedOpType('auth')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            selectedOpType === 'auth' 
              ? 'bg-purple-600 text-white shadow-xs' 
              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          <Key size={13} /> دخول وأمان Auth ({stats.authCount})
        </button>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 lg:col-span-2">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث في الإجراء، التفاصيل، اسم المريض، المستخدم، أو المنشأة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full outline-none font-medium text-slate-700"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Facility Filter (Master Developer Only) */}
          {isMaster ? (
            <select
              value={selectedClinicFilter}
              onChange={(e) => setSelectedClinicFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              <option value="all">🏥 جميع المنشآت الطبية</option>
              <option value="master">👑 الإدارة المركزية (المطور)</option>
              {state.clinics.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.specialty ? `(${c.specialty})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 truncate">
              <Building2 size={15} className="text-slate-400 shrink-0" />
              <span className="truncate">{targetClinic?.name || 'منشأتك الطبية'}</span>
            </div>
          )}

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">📁 جميع الأقسام والتصنيفات</option>
            <option value="patients">👥 المرضى والاستقبال</option>
            <option value="accounting">💰 الحسابات وشجرة الحسابات</option>
            <option value="medical">🩺 الروشتات والكشوفات</option>
            <option value="appointments">📅 المواعيد والحجوزات</option>
            <option value="operations">🏥 العمليات والطوارئ والأقسام</option>
            <option value="pharmacy">💊 الصيدلية والمخازن</option>
            <option value="staff">👔 الكوادر والرواتب</option>
            <option value="auth">🔐 الدخول والأمان</option>
            <option value="settings">⚙️ الإعدادات والتراخيص</option>
            <option value="system">🖥️ إجراءات النظام</option>
          </select>

          {/* User Filter */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">👤 جميع المستخدمين</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'master_admin' ? 'مطور' : u.role === 'doctor' ? 'طبيب' : u.role === 'receptionist' ? 'استقبال' : u.role || 'مستخدم'})
              </option>
            ))}
          </select>

        </div>

        {/* Secondary Filter Row: Date */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Calendar size={14} className="text-slate-400" /> تصفية بالتاريخ:
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                مسح التاريخ
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-bold">
            عدد السجلات المعروضة: <span className="text-slate-800 font-black">{visibleLogs.length}</span> من أصل <span className="text-slate-800 font-black">{(state.auditLogs || []).length}</span>
          </div>
        </div>
      </div>

      {/* ================= LOGS VIEW: TABLE OR TIMELINE ================= */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 whitespace-nowrap">التاريخ والوقت</th>
                  <th className="py-3 px-4 whitespace-nowrap">المستخدم</th>
                  <th className="py-3 px-4 whitespace-nowrap">المنشأة / العيادة</th>
                  <th className="py-3 px-4 whitespace-nowrap">نوع العملية</th>
                  <th className="py-3 px-4 whitespace-nowrap">الإجراء</th>
                  <th className="py-3 px-4 whitespace-nowrap">القسم</th>
                  <th className="py-3 px-4">التفاصيل والبيان</th>
                  <th className="py-3 px-3 text-center">معاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {visibleLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <History size={40} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-600">لا توجد حركات أو سجلات رقابية مطابقة لمعايير البحث</p>
                      <p className="text-xs text-slate-400 mt-1">تأكد من ضبط الفلاتر أو كتابة كلمات بحث أخرى</p>
                    </td>
                  </tr>
                ) : visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        <span className="font-bold text-slate-700">
                          {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(log.timestamp).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span>{log.userName}</span>
                      </div>
                      {log.userRole && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {log.userRole === 'master_admin' ? '👑 مطور رئيسي' : log.userRole === 'doctor' ? '🩺 طبيب' : log.userRole === 'receptionist' ? '📋 استقبال' : log.userRole === 'accountant' ? '💼 محاسب' : log.userRole}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{log.clinicName || 'النظام'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getOpTypeBadge(log.operationType)}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {log.category === 'accounting' ? 'مالية ومحاسبة' : 
                         log.category === 'patients' ? 'مرضى' : 
                         log.category === 'medical' ? 'طبي وروشتات' : 
                         log.category === 'appointments' ? 'مواعيد' :
                         log.category === 'operations' ? 'عمليات وطوارئ' : 
                         log.category === 'pharmacy' ? 'صيدلية ومخزن' : 
                         log.category === 'staff' ? 'كوادر ورواتب' :
                         log.category === 'auth' ? 'أمان ودخول' : 
                         log.category === 'settings' ? 'إعدادات وتراخيص' : 'نظام'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 max-w-md break-words">
                      {log.details}
                      {log.targetName && (
                        <div className="text-[10px] text-blue-600 font-bold mt-0.5">
                          الهدف: {log.targetName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedLogDetail(log)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="عرض التفاصيل الكاملة"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= TIMELINE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {visibleLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد حركات مسجلة في الشريط الزمني</p>
            </div>
          ) : (
            <div className="relative border-r-2 border-slate-200 pr-6 space-y-6 mr-3">
              {visibleLogs.map((log) => {
                const isDelete = log.operationType === 'delete';
                const isCreate = log.operationType === 'create';
                const isUpdate = log.operationType === 'update';
                const isAuth = log.operationType === 'auth';

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className={`absolute -right-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                      isDelete ? 'bg-rose-500 ring-4 ring-rose-100' :
                      isCreate ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                      isUpdate ? 'bg-amber-500 ring-4 ring-amber-100' :
                      isAuth ? 'bg-purple-500 ring-4 ring-purple-100' :
                      'bg-blue-500 ring-4 ring-blue-100'
                    }`} />

                    <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getOpTypeBadge(log.operationType)}
                          <span className="font-black text-sm text-slate-800">{log.action}</span>
                          <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold">
                            {log.clinicName || 'النظام'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                          <Clock size={12} />
                          <span>{new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                        {log.details}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-slate-400" />
                          <span className="font-bold text-slate-700">{log.userName}</span>
                          <span className="text-slate-400">({log.userRole || 'مستخدم'})</span>
                        </div>

                        <button
                          onClick={() => setSelectedLogDetail(log)}
                          className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          تفاصيل <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: FULL LOG DETAILS ================= */}
      {selectedLogDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="text-blue-600" size={20} />
                <h3 className="font-black text-slate-800 text-base">تفاصيل الحركة الرقابية</h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">نوع العملية:</span>
                  {getOpTypeBadge(selectedLogDetail.operationType)}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">الإجراء:</span>
                  <span className="font-black text-slate-800">{selectedLogDetail.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">التصنيف / القسم:</span>
                  <span className="font-bold text-slate-700">{selectedLogDetail.category || 'عام'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">التاريخ والوقت:</span>
                  <span className="font-mono text-slate-700 font-bold">{new Date(selectedLogDetail.timestamp).toLocaleString('ar-EG')}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">المستخدم:</span>
                  <span className="font-black text-slate-800">{selectedLogDetail.userName} ({selectedLogDetail.userId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">الصفة / الدور:</span>
                  <span className="font-bold text-slate-700">{selectedLogDetail.userRole || 'طاقم العمل'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">المنشأة:</span>
                  <span className="font-bold text-slate-700">{selectedLogDetail.clinicName || 'النظام'} ({selectedLogDetail.clinicId})</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-bold block mb-1">البيان والتفاصيل:</span>
                <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {selectedLogDetail.details}
                </p>
              </div>

              {selectedLogDetail.metadata && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-slate-500 font-bold block mb-1">البيانات الإضافية (Metadata):</span>
                  <pre className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto text-left" dir="ltr">
                    {JSON.stringify(selectedLogDetail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEVELOPER FACILITY CONTROL CENTER ================= */}
      {showDevControlModal && isMaster && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">لوحة تحكم المطور في سجلات الرقابة للجهات</h3>
                  <p className="text-[11px] text-slate-500">تفعيل/إيقاف وتحديد صلاحيات ظهور سجل الرقابة لكل عيادة أو مركز أو مستشفى على حدة</p>
                </div>
              </div>
              <button
                onClick={() => setShowDevControlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Facility Search in Dev Modal */}
            <div className="py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="بحث في المستشفيات والعيادات..."
                  value={facilitySearchDev}
                  onChange={(e) => setFacilitySearchDev(e.target.value)}
                  className="bg-transparent text-xs w-full outline-none font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Facilities List */}
            <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-1">
              {state.clinics.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold">لا توجد منشآت مسجلة حالياً في النظام</p>
                </div>
              ) : state.clinics
                  .filter(c => !facilitySearchDev || c.name.toLowerCase().includes(facilitySearchDev.toLowerCase()) || (c.specialty && c.specialty.toLowerCase().includes(facilitySearchDev.toLowerCase())))
                  .map(clinic => {
                    const isEnabled = clinic.allowAuditLogs !== false;
                    const visibility = clinic.auditLogVisibility || 'all_staff';
                    const clinicLogsCount = (state.auditLogs || []).filter(l => String(l.clinicId) === String(clinic.id)).length;

                    return (
                      <div key={clinic.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-800">{clinic.name}</span>
                            {clinic.specialty && (
                              <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-bold">
                                {clinic.specialty}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span>المالك: <strong className="text-slate-700">{clinic.docName || clinic.ownerUsername}</strong></span>
                            <span>•</span>
                            <span>إجمالي العمليات المسجلة: <strong className="text-blue-600">{clinicLogsCount}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2">
                          {/* Toggle Enable / Disable Audit Log */}
                          <button
                            onClick={() => toggleClinicAuditLogs(clinic.id, clinic.allowAuditLogs)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isEnabled 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {isEnabled ? <Check size={14} /> : <X size={14} />}
                            {isEnabled ? 'سجل الرقابة: مفعل' : 'سجل الرقابة: معطل'}
                          </button>

                          {/* Visibility Selector */}
                          <select
                            value={visibility}
                            onChange={(e) => changeClinicVisibility(clinic.id, e.target.value as any)}
                            disabled={!isEnabled}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                              !isEnabled ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            <option value="all_staff">👥 متاح لكافة الكادر</option>
                            <option value="admin_only">🩺 متاح للإدارة والطبيب فقط</option>
                            <option value="developer_only">👑 محجوب (للمطور فقط)</option>
                          </select>

                          {/* Filter logs for this clinic */}
                          <button
                            onClick={() => {
                              setSelectedClinicFilter(clinic.id);
                              setShowDevControlModal(false);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                            title="استعراض سجلات هذه المنشأة"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
            </div>

            <div className="pt-4 border-t border-slate-100 shrink-0 flex justify-end">
              <button
                onClick={() => setShowDevControlModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                تم والعودة للسجلات
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
