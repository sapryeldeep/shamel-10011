import React, { useState, useMemo } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, Shield, Key, Eye, EyeOff, 
  Calendar, DollarSign, Wallet, FileText, CheckCircle2, AlertTriangle, 
  ChevronDown, ChevronUp, Printer, Users, Sparkles, Phone, Lock, 
  Download, RefreshCw, Layers, Check, X, Stethoscope, Sliders,
  Search, MapPin, Globe, Award, Zap, Activity, Heart, Scissors,
  Baby, Eye as EyeIcon, Pill, Bed, Syringe, Radio, ClipboardList,
  Flame, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import { Clinic, User } from '../../../types';
import { AppState } from '../../../context/defaults';
import { MEDICAL_SPECIALTIES } from '../../../lib/specialties';
import DeveloperContractModal from './DeveloperContractModal';
import DeveloperBranchStaffModal from './DeveloperBranchStaffModal';

interface DeveloperTenantsPermissionsTabProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  logAction: (action: string, details: string) => void;
}

// Available System Medical Modules
const ALL_SYSTEM_MODULES倍 = [
  { id: 'queue', name: 'العيادات الخارجية والطابور', icon: '🩺', desc: 'إدارة أدوار المرضى والنداء الذكي' },
  { id: 'patients', name: 'سجلات المرضى والأرشيف', icon: '📁', desc: 'ملفات المرضى والتاريخ المرضي' },
  { id: 'appointments', name: 'المواعيد والحجوزات', icon: '📅', desc: 'جدولة الكشوفات والعمليات' },
  { id: 'prescription', name: 'الروشتة الإلكترونية والبروتوكولات', icon: '💊', desc: 'طباعة وتوليد الروشتات الذكية' },
  { id: 'operations', name: 'العمليات الجراحية (OR)', icon: '🔪', desc: 'جدولة غرف العمليات والتدخلات' },
  { id: 'emergency', name: 'قسم الطوارئ والاستقبال (ER)', icon: '🚨', desc: 'فرز الحالات الحرجة وترياج Triage' },
  { id: 'inpatient', name: 'القسم الداخلي والتنويم', icon: '🛏️', desc: 'إدارة الأسرة والعنابر وتذاكر الإقامة' },
  { id: 'pharmacy', name: 'الصيدلية ومخزن الأدوية', icon: '🧪', desc: 'متابعة الأرصدة وحدود النواقص' },
  { id: 'lab', name: 'معمل التحاليل الطبية', icon: '🔬', desc: 'نتائج الفحوصات والملفات المرفقة' },
  { id: 'radiology', name: 'وحدة الأشعة التشخيصية', icon: '🩻', desc: 'تقارير وفحوصات الأشعة الرقمية' },
  { id: 'accounting', name: 'الخزينة والحسابات والضريبة', icon: '💰', desc: 'الفواتير وسندات القبض والمصروفات' },
  { id: 'insurance', name: 'شركات التأمين والتعاقدات', icon: '🛡️', desc: 'نسب التحمل والمطالبات المالية' },
  { id: 'staff-payroll', name: 'شؤون الموظفين والرواتب', icon: '👥', desc: 'المرتبات والحوافز والخصومات' },
  { id: 'smart-tv', name: 'شاشات الانتظار والنداء الصوتي', icon: '📺', desc: 'العرض التفاعلي والإعلانات' },
  { id: 'ai-assistant', name: 'المساعد الطبي والذكاء الاصطناعي', icon: '✨', desc: 'تحليل الحالات والبروتوكولات الذكية' },
  { id: 'whatsapp', name: 'محرك رسائل الواتساب', icon: '💬', desc: 'إرسال تنبيهات المواعيد والفواتير' }
];

export default function DeveloperTenantsPermissionsTab({
  state,
  updateState,
  logAction
}: DeveloperTenantsPermissionsTabProps) {
  const clinics = state.clinics || [];
  const users = state.users || [];

  // Form State for Add / Edit Clinic
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [docName, setDocName] = useState('');
  const [systemType, setSystemType] = useState<'hospital' | 'center' | 'clinic' | 'pharmacy'>('hospital');
  
  // Specialties Selection State
  const [specialty, setSpecialty] = useState('الجراحة العامة والمناظير');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'الجراحة العامة والمناظير',
    'الطوارئ والعناية المركزة',
    'الباطنة العامة والجهاز الهضمي'
  ]);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [specialtyCategory, setSpecialtyCategory] = useState<'all' | 'surgical' | 'medical' | 'dental' | 'specialized' | 'emergency'>('all');
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');

  // Modules State
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'queue', 'patients', 'appointments', 'prescription', 'operations', 
    'emergency', 'inpatient', 'pharmacy', 'lab', 'radiology', 
    'accounting', 'insurance', 'staff-payroll', 'settings'
  ]);

  // Contact & Regional
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [vatRate, setVatRate] = useState<number>(14);
  const [taxId, setTaxId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [storageProvider, setStorageProvider] = useState<'local' | 'cloudinary' | 'firebase'>('local');

  // Login Credentials
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPass, setOwnerPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Financials & Licensing
  const [maxBranches, setMaxBranches] = useState<number>(3);
  const [designPrice, setDesignPrice] = useState<number>(15000);
  const [branchLicensePrice, setBranchLicensePrice] = useState<number>(3000);
  const [paidAmount, setPaidAmount] = useState<number>(10000);
  const [daysCount, setDaysCount] = useState<number>(365);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid' | 'trial'>('partial');
  const [notes, setNotes] = useState('');

  // Master Developer Feature Toggles
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowChatbot, setAllowChatbot] = useState(true);
  const [allowAccounting, setAllowAccounting] = useState(true);
  const [allowEditDeleteAccounting, setAllowEditDeleteAccounting] = useState(true);
  const [allowExcelExport, setAllowExcelExport] = useState(true);
  const [allowPdfExport, setAllowPdfExport] = useState(true);
  const [allowAuditLogs, setAllowAuditLogs] = useState(true);
  const [allowPharmacyPriceEdit, setAllowPharmacyPriceEdit] = useState(true);
  const [allowCustomDiscounts, setAllowCustomDiscounts] = useState(true);
  const [allowStaffRoleCreation, setAllowStaffRoleCreation] = useState(true);
  const [allowPatientDeletion, setAllowPatientDeletion] = useState(true);
  const [allowPrescriptionCustomHeader, setAllowPrescriptionCustomHeader] = useState(true);
  const [allowMultiBranchSync, setAllowMultiBranchSync] = useState(true);
  const [allowOperationsModule, setAllowOperationsModule] = useState(true);
  const [allowPharmacyModule, setAllowPharmacyModule] = useState(true);
  const [allowInsuranceModule, setAllowInsuranceModule] = useState(true);
  const [allowStaffPayrollModule, setAllowStaffPayrollModule] = useState(true);
  const [allowClinicalReportsModule, setAllowClinicalReportsModule] = useState(true);
  const [allowDoctorCommissions, setAllowDoctorCommissions] = useState(true);
  const [allowICUModule, setAllowICUModule] = useState(true);
  const [allowBloodBankModule, setAllowBloodBankModule] = useState(true);
  const [allowDialysisModule, setAllowDialysisModule] = useState(true);
  const [allowQueueScreen, setAllowQueueScreen] = useState(true);
  const [auditLogVisibility, setAuditLogVisibility] = useState<'all_staff' | 'admin_only' | 'developer_only'>('all_staff');
  const [maxStaff, setMaxStaff] = useState<number>(20);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Modals
  const [selectedClinicForContract, setSelectedClinicForContract] = useState<Clinic | null>(null);
  const [selectedClinicForStaff, setSelectedClinicForStaff] = useState<Clinic | null>(null);
  const [expandedClinicId, setExpandedClinicId] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'hospital' | 'center' | 'clinic'>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');

  // Filtered Medical Specialties for Picker
  const filteredSpecialties = useMemo(() => {
    return MEDICAL_SPECIALTIES.filter(s => {
      const matchCat = specialtyCategory === 'all' || s.category === specialtyCategory;
      const matchQuery在前 = s.name.includes(specialtySearch) || s.description.includes(specialtySearch);
      return matchCat && matchQuery在前;
    });
  }, [specialtyCategory, specialtySearch]);

  // Toggle multi-specialty
  const toggleSpecialtyInList = (specName: string) => {
    if (selectedSpecialties.includes(specName)) {
      if (selectedSpecialties.length === 1) {
        alert('يجب الإبقاء على تخصص طبي واحد على الأقل للمنشأة.');
        return;
      }
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specName));
      if (specialty === specName) {
        const remaining = selectedSpecialties.filter(s => s !== specName);
        setSpecialty(remaining[0] || 'عام');
      }
    } else {
      setSelectedSpecialties([...selectedSpecialties, specName]);
    }
  };

  // Add custom specialty
  const handleAddCustomSpecialty = () => {
    if (!customSpecialtyInput.trim()) return;
    const val = customSpecialtyInput.trim();
    if (!selectedSpecialties.includes(val)) {
      setSelectedSpecialties([...selectedSpecialties, val]);
    }
    setSpecialty(val);
    setCustomSpecialtyInput('');
  };

  // Toggle module
  const toggleModule = (modId: string) => {
    if (selectedModules.includes(modId)) {
      setSelectedModules(selectedModules.filter(m => m !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
    }
  };

  // Select all modules
  const selectAllModules = () => {
    setSelectedModules(ALL_SYSTEM_MODULES倍.map(m => m.id));
  };

  // Quick Presets
  const applyPreset = (preset: 'hospital' | 'dialysis' | 'vascular' | 'dental' | 'polyclinic' | 'private_clinic') => {
    if (preset === 'hospital') {
      setName('مستشفى الشفاء التخصصي والجراحي');
      setDocName('د. صبري الديب');
      setSystemType('hospital');
      setSpecialty('الجراحة العامة والمناظير');
      setSelectedSpecialties([
        'الجراحة العامة والمناظير',
        'الطوارئ والعناية المركزة',
        'العظام وجراحة العظام والمفاصل',
        'الباطنة العامة والجهاز الهضمي',
        'النساء والتوليد والعقم',
        'أمراض القلب والأوعية الدموية'
      ]);
      setDesignPrice(25000);
      setBranchLicensePrice(5000);
      setMaxBranches(5);
      setPaidAmount(20000);
      setDaysCount(365);
      setSelectedModules(ALL_SYSTEM_MODULES倍.map(m => m.id));
    } else if (preset === 'dialysis') {
      setName('مركز الحياة لأمراض الكلى والغسيل الكلوي');
      setDocName('د. محمد عبد الرحمن');
      setSystemType('hospital');
      setSpecialty('أمراض الكلى والغسيل الكلوي');
      setSelectedSpecialties([
        'أمراض الكلى والغسيل الكلوي',
        'جراحة الأوعية الدموية',
        'العناية بالقدم السكري وقدم السكر',
        'الباطنة العامة والجهاز الهضمي'
      ]);
      setDesignPrice(20000);
      setBranchLicensePrice(4000);
      setMaxBranches(3);
      setPaidAmount(15000);
      setDaysCount(365);
      setSelectedModules(['queue', 'patients', 'appointments', 'prescription', 'operations', 'inpatient', 'pharmacy', 'lab', 'accounting', 'insurance', 'staff-payroll']);
    } else if (preset === 'vascular') {
      setName('مركز رعاية القدم السكري وجراحة الأوعية');
      setDocName('د. صبري الديب');
      setSystemType('center');
      setSpecialty('جراحة الأوعية الدموية');
      setSelectedSpecialties([
        'جراحة الأوعية الدموية',
        'العناية بالقدم السكري وقدم السكر',
        'الجلدية والتجميل والليزر'
      ]);
      setDesignPrice(15000);
      setBranchLicensePrice(3000);
      setMaxBranches(2);
      setPaidAmount(10000);
      setDaysCount(365);
      setSelectedModules(['queue', 'patients', 'appointments', 'prescription', 'operations', 'pharmacy', 'lab', 'accounting', 'reports']);
    } else if (preset === 'dental') {
      setName('مركز سمايل لطب وجراحة وتجميل الأسنان');
      setDocName('د. أحمد سامي');
      setSystemType('center');
      setSpecialty('طب وجراحة الأسنان');
      setSelectedSpecialties([
        'طب وجراحة الأسنان',
        'جراحة التجميل والحروق'
      ]);
      setDesignPrice(12000);
      setBranchLicensePrice(2500);
      setMaxBranches(2);
      setPaidAmount(8000);
      setDaysCount(365);
      setSelectedModules(['queue', 'patients', 'appointments', 'prescription', 'pharmacy', 'accounting', 'whatsapp']);
    } else if (preset === 'polyclinic') {
      setName('مجمع عيادات النخبة الطبي التخصصي');
      setDocName('د. طارق محمود');
      setSystemType('center');
      setSpecialty('متعدد التخصصات / كتابة حرة');
      setSelectedSpecialties([
        'الباطنة العامة والجهاز الهضمي',
        'أمراض القلب والأوعية الدموية',
        'الأطفال وحديثي الولادة',
        'النساء والتوليد والعقم',
        'العيون وجراحة الشبكية والليزك',
        'الأنف والأذن والحنجرة',
        'الجلدية والتجميل والليزر',
        'العظام وجراحة العظام والمفاصل'
      ]);
      setDesignPrice(18000);
      setBranchLicensePrice(3500);
      setMaxBranches(4);
      setPaidAmount(12000);
      setDaysCount(365);
      setSelectedModules(['queue', 'patients', 'appointments', 'prescription', 'pharmacy', 'lab', 'accounting', 'staff-payroll', 'reports']);
    } else {
      setName('عيادة الجراحة والاستشارات التخصصية');
      setDocName('د. صبري الديب');
      setSystemType('clinic');
      setSpecialty('الجراحة العامة والمناظير');
      setSelectedSpecialties(['الجراحة العامة والمناظير']);
      setDesignPrice(8000);
      setBranchLicensePrice(2000);
      setMaxBranches(1);
      setPaidAmount(8000);
      setDaysCount(365);
      setSelectedModules(['queue', 'patients', 'appointments', 'prescription', 'accounting', 'whatsapp']);
    }
  };

  const generateRandomPassword = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOwnerPass(res);
  };

  const handleEditClick = (c: Clinic) => {
    setEditingClinicId(c.id);
    setName(c.name);
    setDocName(c.docName || c.name);
    setSystemType(c.systemType || 'clinic');
    setSpecialty(c.specialty || 'الجراحة العامة والمناظير');
    setSelectedSpecialties(c.specialties && c.specialties.length > 0 ? c.specialties : [c.specialty || 'الجراحة العامة والمناظير']);
    setSelectedModules(c.modules || ['queue', 'patients', 'appointments', 'prescription', 'accounting']);
    setPhone(c.phone || '');
    setAddress(c.address || '');
    setCurrency(c.currency || 'EGP');
    setVatRate(c.vatRate ?? 14);
    setTaxId(c.taxId || '');
    setLogoUrl(c.logoUrl || '');
    setReceiptFooter(c.receiptFooter || '');
    setStorageProvider(c.storageProvider || 'local');
    setOwnerUsername(c.ownerUsername || '');
    setOwnerPass(c.ownerPass || '');
    setMaxBranches(c.maxBranches || 1);
    setDesignPrice(c.designPrice || c.contractPrice || 0);
    setBranchLicensePrice(c.branchLicensePrice || 0);
    setPaidAmount(c.paidAmount || 0);
    setPaymentStatus(c.paymentStatus || 'partial');
    setDaysCount(c.daysCount || 365);
    setNotes(c.notes || '');
    setAllowWhatsApp(c.allowWhatsApp !== false);
    setAllowPrinting(c.allowPrinting !== false);
    setAllowChatbot(c.allowChatbot !== false);
    setAllowAccounting(c.allowAccounting !== false);
    setAllowEditDeleteAccounting(c.allowEditDeleteAccounting !== false);
    setAllowExcelExport(c.allowExcelExport !== false);
    setAllowPdfExport(c.allowPdfExport !== false);
    setAllowAuditLogs(c.allowAuditLogs !== false);
    setAllowPharmacyPriceEdit(c.allowPharmacyPriceEdit !== false);
    setAllowCustomDiscounts(c.allowCustomDiscounts !== false);
    setAllowStaffRoleCreation(c.allowStaffRoleCreation !== false);
    setAllowPatientDeletion(c.allowPatientDeletion !== false);
    setAllowPrescriptionCustomHeader(c.allowPrescriptionCustomHeader !== false);
    setAllowMultiBranchSync(c.allowMultiBranchSync !== false);
    setAllowOperationsModule(c.allowOperationsModule !== false);
    setAllowPharmacyModule(c.allowPharmacyModule !== false);
    setAllowInsuranceModule(c.allowInsuranceModule !== false);
    setAllowStaffPayrollModule(c.allowStaffPayrollModule !== false);
    setAllowClinicalReportsModule(c.allowClinicalReportsModule !== false);
    setAllowDoctorCommissions(c.allowDoctorCommissions !== false);
    setAllowICUModule(c.allowICUModule !== false);
    setAllowBloodBankModule(c.allowBloodBankModule !== false);
    setAllowDialysisModule(c.allowDialysisModule !== false);
    setAllowQueueScreen(c.allowQueueScreen !== false);
    setAuditLogVisibility(c.auditLogVisibility || 'all_staff');
    setMaxStaff(c.maxStaff || 20);
    setGeminiApiKey(c.geminiApiKey || '');
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingClinicId(null);
    setName('');
    setDocName('');
    setPhone('');
    setAddress('');
    setOwnerUsername('');
    setOwnerPass('');
    setNotes('');
    setGeminiApiKey('');
    setMaxStaff(20);
    setAllowAccounting(true);
    setAllowEditDeleteAccounting(true);
    setAllowExcelExport(true);
    setAllowPdfExport(true);
    setAllowAuditLogs(true);
    setAuditLogVisibility('all_staff');
  };

  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerUsername.trim() || !ownerPass.trim()) {
      alert('يرجى ملء اسم المنشأة واسم المستخدم وكلمة المرور');
      return;
    }

    const cleanUsername迷 = ownerUsername.trim().toLowerCase();
    const cleanPass迷 = ownerPass.trim();

    // 1. Guard against using master developer credentials
    const reservedDevUsernames = ['sapry eldeep', 'master', 'sapry.eldeep@gmail.com', 'admin.master', 'sapry', 'sabry'];
    if (reservedDevUsernames.includes(cleanUsername迷)) {
      alert('⚠️ خطأ أمني: اسم المستخدم هذا محجوز للمطور الرئيسي للنظام ولا يمكن تخصيصه لأي منشأة!');
      return;
    }

    const reservedDevPasswords = ['159632', 'master123', 'master'];
    if (reservedDevPasswords.includes(cleanPass迷)) {
      alert('⚠️ خطأ أمني: كلمة المرور هذه مخصصة للمطور الرئيسي فقط. يرجى اختيار كلمة مرور أخرى للمنشأة لضمان عدم التداخل!');
      return;
    }

    // 2. Strict Uniqueness Check for Username across all other clinics
    const duplicateClinicUser = clinics.find(c => c.id !== editingClinicId && c.ownerUsername?.trim().toLowerCase() === cleanUsername迷);
    if (duplicateClinicUser) {
      alert(`⚠️ خطأ تكرار: اسم المستخدم (${cleanUsername迷}) مستخدم بالفعل في منشأة أخرى (${duplicateClinicUser.name}).\nيرجى كتابة اسم مستخدم فريد تماماً لمنع أي تداخل بين المنشآت.`);
      return;
    }

    // 3. Strict Uniqueness Check for Password across all other clinics
    const duplicateClinicPass = clinics.find(c => c.id !== editingClinicId && c.ownerPass?.trim() === cleanPass迷);
    if (duplicateClinicPass) {
      alert(`⚠️ خطأ تكرار: كلمة المرور هذه مطابقة لكلمة مرور منشأة أخرى (${duplicateClinicPass.name}).\nيجب أن تكون كلمة المرور فريدة لكل منشأة لمنع أي تداخل في تسجيل الدخول.`);
      return;
    }

    // 4. Strict Uniqueness Check across all staff users
    const duplicateStaffUser = (state.users || []).find(u => u.clinicId !== editingClinicId && u.username?.trim().toLowerCase() === cleanUsername迷);
    if (duplicateStaffUser) {
      alert(`⚠️ خطأ تكرار: اسم المستخدم (${cleanUsername迷}) مسجل بالفعل لموظف أو طبيب آخر في النظام!`);
      return;
    }

    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(expiry.getDate() + Number(daysCount));
    const expiryISO = expiry.toISOString().split('T')[0];
    const startISO = today.toISOString().split('T')[0];

    const totalContract = Number(designPrice) + (Number(maxBranches) * Number(branchLicensePrice));
    const paid不易 = Number(paidAmount);
    
    let computedPaymentStatus: 'paid' | 'partial' | 'unpaid' | 'trial' = paymentStatus;
    if (paid不易 >= totalContract && totalContract > 0) computedPaymentStatus = 'paid';
    else if (paid不易 > 0) computedPaymentStatus = 'partial';
    else computedPaymentStatus = 'unpaid';

    if (editingClinicId) {
      // Update Existing Clinic
      const updatedClinics = clinics.map(c => {
        if (c.id === editingClinicId) {
          return {
            ...c,
            name: name.trim(),
            docName: docName.trim() || name.trim(),
            systemType,
            specialty: specialty.trim(),
            specialties: selectedSpecialties,
            modules: selectedModules,
            daysCount: Number(daysCount),
            ownerUsername: cleanUsername迷,
            ownerPass: cleanPass迷,
            maxBranches: Number(maxBranches),
            maxStaff: Number(maxStaff),
            designPrice: Number(designPrice),
            branchLicensePrice: Number(branchLicensePrice),
            contractPrice: totalContract,
            paidAmount: paid不易,
            paymentStatus: computedPaymentStatus,
            phone: phone.trim(),
            address: address.trim(),
            currency,
            vatRate: Number(vatRate),
            taxId: taxId.trim(),
            logoUrl: logoUrl.trim(),
            receiptFooter: receiptFooter.trim(),
            storageProvider,
            notes: notes.trim(),
            allowWhatsApp,
            allowPrinting,
            allowChatbot,
            allowAccounting,
            allowEditDeleteAccounting,
            allowExcelExport,
            allowPdfExport,
            allowAuditLogs,
            allowPharmacyPriceEdit,
            allowCustomDiscounts,
            allowStaffRoleCreation,
            allowPatientDeletion,
            allowPrescriptionCustomHeader,
            allowMultiBranchSync,
            allowOperationsModule,
            allowPharmacyModule,
            allowInsuranceModule,
            allowStaffPayrollModule,
            allowClinicalReportsModule,
            allowDoctorCommissions,
            allowICUModule,
            allowBloodBankModule,
            allowDialysisModule,
            allowQueueScreen,
            auditLogVisibility,
            geminiApiKey: geminiApiKey.trim()
          };
        }
        return c;
      });

      // Update associated admin user credentials
      const updatedUsers = users.map(u => {
        if (u.clinicId === editingClinicId && (u.username === ownerUsername || u.role === 'doctor' || u.role === 'staff')) {
          return {
            ...u,
            name: docName.trim() || name.trim(),
            username: cleanUsername迷,
            pass: cleanPass迷,
            phone: phone.trim()
          };
        }
        return u;
      });

      updateState({ clinics: updatedClinics, users: updatedUsers });
      logAction('تعديل منشأة', `تم تحديث بيانات وتراخيص المنشأة: ${name}`);
      alert(`تم تحديث بيانات وترخيص المنشأة (${name}) بنجاح!`);
      handleCancelEdit();
    } else {
      // Create New Clinic
      const newClinicId = 'clinic_' + Date.now();
      const newClinic: Clinic = {
        id: newClinicId,
        name: name.trim(),
        docName: docName.trim() || name.trim(),
        systemType,
        specialty: specialty.trim(),
        specialties: selectedSpecialties,
        daysCount: Number(daysCount),
        expiryDate: expiryISO,
        startDate: startISO,
        ownerUsername: cleanUsername迷,
        ownerPass: cleanPass迷,
        maxBranches: Number(maxBranches),
        maxStaff: Number(maxStaff),
        designPrice: Number(designPrice),
        branchLicensePrice: Number(branchLicensePrice),
        contractPrice: totalContract,
        paidAmount: paid不易,
        paymentStatus: computedPaymentStatus,
        phone: phone.trim(),
        address: address.trim(),
        currency,
        vatRate: Number(vatRate),
        taxId: taxId.trim(),
        logoUrl: logoUrl.trim(),
        receiptFooter: receiptFooter.trim(),
        storageProvider,
        notes: notes.trim(),
        status: 'active',
        allowWhatsApp,
        allowPrinting,
        allowChatbot,
        allowAccounting,
        allowEditDeleteAccounting,
        allowExcelExport,
        allowPdfExport,
        allowAuditLogs,
        allowPharmacyPriceEdit,
        allowCustomDiscounts,
        allowStaffRoleCreation,
        allowPatientDeletion,
        allowPrescriptionCustomHeader,
        allowMultiBranchSync,
        allowOperationsModule,
        allowPharmacyModule,
        allowInsuranceModule,
        allowStaffPayrollModule,
        allowClinicalReportsModule,
        allowDoctorCommissions,
        allowICUModule,
        allowBloodBankModule,
        allowDialysisModule,
        allowQueueScreen,
        auditLogVisibility,
        geminiApiKey: geminiApiKey.trim(),
        modules: selectedModules,
        granularPermissions: {
          pos_printing: true,
          a4_tax_printing: true,
          clinical_reports_export: true,
          patient_queue_print: true,
          payroll_print: true,
          inventory_print: true,
          treasury_view: true,
          add_expenses: true,
          vat_tax_reports: true,
          edit_service_prices: true,
          add_staff: true,
          edit_staff: true,
          delete_staff: true,
          run_payroll: true,
          or_er_bookings: true,
          excel_pdf_export: true,
          edit_delete_patients: true,
          ai_chatbot_access: true
        }
      };

      // Create Admin User for this clinic
      const newAdminUser: User = {
        id: 'user_' + Date.now(),
        name: docName.trim() || name.trim(),
        username: cleanUsername迷,
        pass: cleanPass迷,
        role: systemType === 'hospital' ? 'doctor' : 'doctor',
        clinicId: newClinicId,
        phone: phone.trim(),
        perms: ['queue', 'patients', 'appointments', 'rx', 'billing', 'pharmacy', 'operations', 'reports', 'settings']
      };

      updateState({
        clinics: [...clinics, newClinic],
        users: [...users, newAdminUser]
      });

      logAction('إضافة منشأة', `تم إنشاء منشأة سحابية جديدة: ${name} (${specialty})`);
      alert(`تم اعتماد المنشأة (${name}) وتوليد الحساب بنجاح!`);
      handleCancelEdit();
    }
  };

  // Toggle Granular Permission for a clinic
  const toggleClinicPerm = (clinicId: string, permKey: string) => {
    const updatedClinics = clinics.map(c => {
      if (c.id === clinicId) {
        const perms = c.granularPermissions || {};
        return {
          ...c,
          granularPermissions: {
            ...perms,
            [permKey]: perms[permKey] === false ? true : false
          }
        };
      }
      return c;
    });

    updateState({ clinics: updatedClinics });
    logAction('تعديل صلاحيات', `تم تعديل صلاحية (${permKey}) للمنشأة: ${clinicId}`);
  };

  // Quick Renewal (+30, +90, +365 days, Lifetime)
  const renewClinic = (clinicId: string, daysToAdd: number) => {
    const updatedClinics = clinics.map(c => {
      if (c.id === clinicId) {
        const currentExp = new Date(c.expiryDate);
        const baseDate = currentExp > new Date() ? currentExp : new Date();
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        const newExpiry = baseDate.toISOString().split('T')[0];

        return {
          ...c,
          expiryDate: newExpiry,
          daysCount: (c.daysCount || 0) + daysToAdd,
          status: 'active' as const
        };
      }
      return c;
    });

    updateState({ clinics: updatedClinics });
    logAction('تجديد اشتراك', `تم تمديد اشتراك المنشأة (${daysToAdd} يوم)`);
    alert(`تم تجديد وترخيص الاشتراك بنجاح (+${daysToAdd} يوم)!`);
  };

  // Toggle Freeze / Active status
  const toggleClinicStatus抓 = (clinicId: string) => {
    const updatedClinics = clinics.map(c => {
      if (c.id === clinicId) {
        const newStatus = c.status === 'suspended' ? 'active' : 'suspended';
        return { ...c, status: newStatus as any };
      }
      return c;
    });
    updateState({ clinics: updatedClinics });
    logAction('تغيير حالة منشأة', `تم تغيير حالة المنشأة إلى: ${clinicId}`);
  };

  // Delete Clinic
  const deleteClinic = (clinicId: string, clinicName: string) => {
    if (!window.confirm(`تحذير أمني: هل أنت متأكد تماماً من حذف منشأة (${clinicName})؟ سيتم مسح كافة سجلاتها وبياناتها بشكل نهائي.`)) {
      return;
    }

    const updatedClinics = clinics.filter(c => c.id !== clinicId);
    const updatedUsers = users.filter(u => u.clinicId !== clinicId);
    
    updateState({ clinics: updatedClinics, users: updatedUsers });
    logAction('حذف منشأة', `تم حذف المنشأة: ${clinicName}`);
    alert('تم حذف المنشأة بنجاح.');
  };

  // Filtered Clinics
  const filteredClinics = clinics.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.docName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.ownerUsername || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || c.systemType === filterType;
    const matchSpec = filterSpecialty === 'all' || 
                      c.specialty === filterSpecialty || 
                      (c.specialties || []).includes(filterSpecialty);
    return matchSearch && matchType && matchSpec;
  });

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* 1. Add / Edit Master Tenant Form with Full Specialty Suite */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 flex-wrap gap-3">
          <div>
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <Building2 className="text-blue-600" size={22} />
              {editingClinicId ? 'تعديل بيانات وترخيص المنشأة والتخصصات' : 'اعتماد منشأة / مركز رئيسي جديد (Master Tenant & Specialties)'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحديد كافة التخصصات الطبية، الأقسام، الموديلات المفعلة، أسعار التعاقد، وتراخيص الفروع
            </p>
          </div>

          {/* Quick Presets */}
          {!editingClinicId && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">نماذج مسبقة الإعداد:</span>
              <button
                type="button"
                onClick={() => applyPreset('hospital')}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                🏥 مستشفى جراحي وطوارئ
              </button>
              <button
                type="button"
                onClick={() => applyPreset('dialysis')}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                🧪 مركز كلى وغسيل
              </button>
              <button
                type="button"
                onClick={() => applyPreset('vascular')}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                🩸 أوعية وقدم سكري
              </button>
              <button
                type="button"
                onClick={() => applyPreset('dental')}
                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                🦷 مركز أسنان
              </button>
              <button
                type="button"
                onClick={() => applyPreset('polyclinic')}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                🏢 مجمع عيادات شامل
              </button>
              <button
                type="button"
                onClick={() => applyPreset('private_clinic')}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                🩺 عيادة خاصة
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveClinic} className="space-y-6">
          
          {/* Section A: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنشأة الطبية / المستشفى *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: مستشفى الشفاء التخصصي"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطبيب / المشرف المسؤول</label>
              <input
                type="text"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                placeholder="مثال: د. صبري الديب"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع المنظومة والمنشأة</label>
              <select
                value={systemType}
                onChange={e => setSystemType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="pharmacy">💊 صيدلية وخدمات دوائية ومستلزمات (Pharmacy POS)</option>
                <option value="hospital">🏥 مستشفى متكامل (أقسام، طوارئ ER، عمليات OR، تنويم)</option>
                <option value="center">🏢 مركز طبي تخصصي / مجمع عيادات متعددة</option>
                <option value="clinic">🩺 عيادة خاصة واستشارات تخصصية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التواصل / الواتساب</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section B: Medical Specialties Selector (The core request) */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 p-5 rounded-2xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-indigo-950">التخصصات الطبية والأقسام المعتمدة في المنشأة</h4>
                  <p className="text-[11px] text-indigo-700/80">
                    اختر التخصص الرئيسي وعيّن كافة الأقسام التخصصية التابعة للمستشفى / المركز
                  </p>
                </div>
              </div>

              {/* Specialty Category Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSpecialtyCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    specialtyCategory === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-indigo-100/50'
                  }`}
                >
                  الكل ({MEDICAL_SPECIALTIES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialtyCategory('surgical')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    specialtyCategory === 'surgical' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-indigo-100/50'
                  }`}
                >
                  🔪 جراحة ومناظير
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialtyCategory('medical')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    specialtyCategory === 'medical' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-indigo-100/50'
                  }`}
                >
                  💊 باطنية وطبية
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialtyCategory('dental')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    specialtyCategory === 'dental' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-indigo-100/50'
                  }`}
                >
                  🦷 طب الأسنان
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialtyCategory('emergency')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    specialtyCategory === 'emergency' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-indigo-100/50'
                  }`}
                >
                  🚨 طوارئ وعناية
                </button>
              </div>
            </div>

            {/* Specialty Search & Main Specialty Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <Search size={14} className="absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={specialtySearch}
                  onChange={e => setSpecialtySearch(e.target.value)}
                  placeholder="ابحث في قائمة التخصصات الطبية (أوعية، كلى، باطنة، عظام، أطفال، أسنان...)"
                  className="w-full pr-8 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSpecialtyInput}
                  onChange={e => setCustomSpecialtyInput(e.target.value)}
                  placeholder="أو اكتب تخصصاً مخصصاً..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSpecialty}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Currently Selected Primary Specialty Badge */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">التخصص الرئيسي للمنشأة:</span>
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold shadow-xs flex items-center gap-1">
                  <Award size={13} />
                  {specialty || 'غير محدد'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                الأقسام المعتمدة المختارة: <strong className="text-indigo-600 font-mono font-bold">{selectedSpecialties.length}</strong> تخصص
              </div>
            </div>

            {/* Medical Specialties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
              {filteredSpecialties.map(spec => {
                const isSelected = selectedSpecialties.includes(spec.name);
                const isPrimary = specialty === spec.name;

                return (
                  <div
                    key={spec.id}
                    onClick={() => {
                      toggleSpecialtyInList(spec.name);
                      if (!isPrimary && !isSelected) {
                        setSpecialty(spec.name);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isPrimary 
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-bold text-xs line-clamp-1">{spec.name}</span>
                      {isPrimary ? (
                        <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">رئيسي</span>
                      ) : isSelected ? (
                        <Check size={14} className="text-indigo-600 shrink-0" />
                      ) : null}
                    </div>
                    <p className={`text-[10px] line-clamp-1 ${isPrimary ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {spec.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Medical Modules & Units Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                <h4 className="font-bold text-xs text-slate-800">الأقسام والوحدات الطبية والبرمجية المفعلة (System Modules)</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  تحديد كافة الوحدات
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] text-slate-500">
                  المفعل: <strong className="text-blue-600 font-mono font-bold">{selectedModules.length}</strong> من {ALL_SYSTEM_MODULES倍.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {ALL_SYSTEM_MODULES倍.map(mod => {
                const isChecked展现 = selectedModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isChecked展现 
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className="text-base">{mod.icon}</span>
                    <span className="text-[10px] font-bold leading-tight">{mod.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section D: Regional, Address & Branding Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان والموقع الجغرافي</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="مثال: القاهرة - مدينة نصر"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العملة المعتمدة بالمنشأة</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="KWD">دينار كويتي (KWD)</option>
                <option value="JOD">دينار أردني (JOD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نسبة ضريبة القيمة المضافة (VAT %)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={vatRate}
                onChange={e => setVatRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الضريبي للمنشأة (Tax ID)</label>
              <input
                type="text"
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                placeholder="مثال: 882-901-445"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section E: Login Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم مستخدم الحساب الرئيسي (Username) *</label>
              <input
                type="text"
                required
                value={ownerUsername}
                onChange={e => setOwnerUsername(e.target.value)}
                placeholder="admin_shifa"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">كلمة المرور (Password) *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-0.5"
                  >
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-indigo-600 font-bold hover:underline"
                  >
                    توليد كلمة سر
                  </button>
                </div>
              </div>
              <input
                type={showPass ? "text" : "password"}
                required
                value={ownerPass}
                onChange={e => setOwnerPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مدة الاشتراك والترخيص (أيام)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  value={daysCount}
                  onChange={e => setDaysCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDaysCount(365)}
                  className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
                >
                  1 سنة
                </button>
              </div>
            </div>
          </div>

          {/* Section F: Financial & Licensing Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">سعر بيع التصميم والمنظومة ({currency})</label>
              <input
                type="number"
                min="0"
                value={designPrice}
                onChange={e => setDesignPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-900 mb-1">سعر ترخيص الفرع الواحد ({currency})</label>
              <input
                type="number"
                min="0"
                value={branchLicensePrice}
                onChange={e => setBranchLicensePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-purple-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">الحد الأقصى للفروع المصرح بها</label>
              <input
                type="number"
                min="1"
                value={maxBranches}
                onChange={e => setMaxBranches(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-mono font-bold text-indigo-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">المبلغ المحصل كاش (دفعة مقدمة)</label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={e => setPaidAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Section G: Master Developer Feature Toggles & Gemini Key */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Sliders size={14} className="text-indigo-600" />
              <span>صلاحيات المطور والتحكم في ظهور الأقسام والوظائف للمنشأة:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Accounting */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">شجرة الحسابات والمالية</span>
                <button
                  type="button"
                  onClick={() => setAllowAccounting(!allowAccounting)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowAccounting ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowAccounting ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Edit/Delete Accounting */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">تعديل وحذف الحسابات والقيود</span>
                <button
                  type="button"
                  onClick={() => setAllowEditDeleteAccounting(!allowEditDeleteAccounting)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowEditDeleteAccounting ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowEditDeleteAccounting ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Excel Export */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">تصدير إكسيل (Excel)</span>
                <button
                  type="button"
                  onClick={() => setAllowExcelExport(!allowExcelExport)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowExcelExport ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowExcelExport ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* PDF & Print */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">تصدير PDF والطباعة</span>
                <button
                  type="button"
                  onClick={() => setAllowPdfExport(!allowPdfExport)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowPdfExport ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowPdfExport ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Audit Logs */}
              <div className="flex flex-col gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">سجل حركات المستخدمين (Audit)</span>
                  <button
                    type="button"
                    onClick={() => setAllowAuditLogs(!allowAuditLogs)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      allowAuditLogs ? 'bg-slate-800' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      allowAuditLogs ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
                {allowAuditLogs && (
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold">ظهور السجل:</span>
                    <select
                      value={auditLogVisibility}
                      onChange={e => setAuditLogVisibility(e.target.value as any)}
                      className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="all_staff">متاح للجميع</option>
                      <option value="admin_only">للإدارة/الطبيب فقط</option>
                      <option value="developer_only">محجوب للمطور فقط</option>
                    </select>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">تذكير الواتساب (WhatsApp)</span>
                <button
                  type="button"
                  onClick={() => setAllowWhatsApp(!allowWhatsApp)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowWhatsApp ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowWhatsApp ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* AI Chatbot */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">المساعد الطبي الذكي (AI)</span>
                <button
                  type="button"
                  onClick={() => setAllowChatbot(!allowChatbot)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowChatbot ? 'bg-purple-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowChatbot ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Pharmacy Price Edit */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">تعديل أسعار الصيدلية/المستلزمات</span>
                <button
                  type="button"
                  onClick={() => setAllowPharmacyPriceEdit(!allowPharmacyPriceEdit)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowPharmacyPriceEdit ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowPharmacyPriceEdit ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Custom Discounts */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">منح الخصومات اليدوية بالفواتير</span>
                <button
                  type="button"
                  onClick={() => setAllowCustomDiscounts(!allowCustomDiscounts)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowCustomDiscounts ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowCustomDiscounts ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Staff Role Creation */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">إنشاء وتعديل أدوار الكادر</span>
                <button
                  type="button"
                  onClick={() => setAllowStaffRoleCreation(!allowStaffRoleCreation)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowStaffRoleCreation ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowStaffRoleCreation ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Patient Deletion */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">حذف ملفات المرضى نهائياً</span>
                <button
                  type="button"
                  onClick={() => setAllowPatientDeletion(!allowPatientDeletion)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowPatientDeletion ? 'bg-rose-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowPatientDeletion ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Prescription Custom Header */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">رفع وتخصيص هيدر الروشتة</span>
                <button
                  type="button"
                  onClick={() => setAllowPrescriptionCustomHeader(!allowPrescriptionCustomHeader)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowPrescriptionCustomHeader ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowPrescriptionCustomHeader ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Multi-Branch Sync */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">مشاركة وبحث الملفات بين الفروع</span>
                <button
                  type="button"
                  onClick={() => setAllowMultiBranchSync(!allowMultiBranchSync)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowMultiBranchSync ? 'bg-cyan-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowMultiBranchSync ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Module Visibility Controls Section Header */}
              <div className="col-span-full border-t border-slate-200 pt-3 mt-1">
                <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  🛡️ صلاحيات إتاحة وإخفاء الأقسام الرئيسية والوحدات (Developer Module Switches)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">يمكن للمطور إتاحة أو إخفاء أي قسم أو وحدة داخل المنشأة بنقرة واحدة.</p>
              </div>

              {/* Operations Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">قسم المستشفى والعمليات والرعاية (ER/OR)</span>
                <button
                  type="button"
                  onClick={() => setAllowOperationsModule(!allowOperationsModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowOperationsModule ? 'bg-rose-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowOperationsModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Pharmacy Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">قسم الصيدلية والمخزون الأدوية</span>
                <button
                  type="button"
                  onClick={() => setAllowPharmacyModule(!allowPharmacyModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowPharmacyModule ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowPharmacyModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Insurance Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">قسم التأمين الصحي والروشتات</span>
                <button
                  type="button"
                  onClick={() => setAllowInsuranceModule(!allowInsuranceModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowInsuranceModule ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowInsuranceModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Staff Payroll Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">قسم الكوادر وإدارة الرواتب</span>
                <button
                  type="button"
                  onClick={() => setAllowStaffPayrollModule(!allowStaffPayrollModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowStaffPayrollModule ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowStaffPayrollModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Clinical Reports Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">قسم التقارير والتحاليل السريرية</span>
                <button
                  type="button"
                  onClick={() => setAllowClinicalReportsModule(!allowClinicalReportsModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowClinicalReportsModule ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowClinicalReportsModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Doctor Commissions */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">حسابات وعمولات الأطباء والزيارات</span>
                <button
                  type="button"
                  onClick={() => setAllowDoctorCommissions(!allowDoctorCommissions)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowDoctorCommissions ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowDoctorCommissions ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* ICU Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">وحدة العناية المركزة (ICU)</span>
                <button
                  type="button"
                  onClick={() => setAllowICUModule(!allowICUModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowICUModule ? 'bg-red-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowICUModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Blood Bank Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">وحدة بنك الدم وفحوص التطابق</span>
                <button
                  type="button"
                  onClick={() => setAllowBloodBankModule(!allowBloodBankModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowBloodBankModule ? 'bg-rose-700' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowBloodBankModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Dialysis Module */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">وحدة ومكائن الغسيل الكلوي ومحطة RO</span>
                <button
                  type="button"
                  onClick={() => setAllowDialysisModule(!allowDialysisModule)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowDialysisModule ? 'bg-cyan-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowDialysisModule ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Queue Screen */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">شاشة العرض التلفزيونية لطابور الانتظار</span>
                <button
                  type="button"
                  onClick={() => setAllowQueueScreen(!allowQueueScreen)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowQueueScreen ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    allowQueueScreen ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Max Staff Limit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">الحد الأقصى للكوادر/الموظفين</label>
                </div>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={maxStaff}
                  onChange={e => setMaxStaff(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Gemini API Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مفتاح Gemini API المستقل</label>
                <input
                  type="text"
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  placeholder="مفتاح Gemini API المستقل (اختياري)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Financial Summary & Action Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <span className="text-slate-400 block text-[10px]">إجمالي قيمة التعاقد:</span>
                <span className="text-sm font-black text-cyan-400 font-bold">
                  {(Number(designPrice) + (Number(maxBranches) * Number(branchLicensePrice))).toLocaleString()} {currency}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المحصل كاش:</span>
                <span className="text-sm font-black text-emerald-400 font-bold">{Number(paidAmount).toLocaleString()} {currency}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المتبقي الآجل:</span>
                <span className="text-sm font-black text-rose-400 font-bold">
                  {Math.max(0, (Number(designPrice) + (Number(maxBranches) * Number(branchLicensePrice))) - Number(paidAmount)).toLocaleString()} {currency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingClinicId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء التعديل
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>{editingClinicId ? 'حفظ التعديلات والتخصصات' : 'اعتماد وحفظ المنشأة والتراخيص'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. Search & Filter Bar for Registered Clinics */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-slate-800 text-base">دليل وتراخيص المراكز والمستشفيات المعتمدة ({clinics.length})</h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المنشأة أو الطبيب أو التخصص..."
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none w-64"
          />

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">جميع أنواع المنشآت</option>
            <option value="hospital">مستشفيات كبرى</option>
            <option value="center">مراكز تخصصية</option>
            <option value="clinic">عيادات خاصة</option>
          </select>

          <select
            value={filterSpecialty}
            onChange={e => setFilterSpecialty(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer max-w-xs"
          >
            <option value="all">كافة التخصصات الطبية</option>
            {MEDICAL_SPECIALTIES.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Cards of Registered Clinics with Accordion Permissions & Full Specialty Badges */}
      <div className="space-y-4">
        {filteredClinics.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <Building2 size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-sm">لا توجد منشآت مطابقة للبحث حالياً</p>
          </div>
        ) : (
          filteredClinics.map(c => {
            const design = Number(c.designPrice || c.contractPrice || 0);
            const maxBr = Number(c.maxBranches || 1);
            const brPrice = Number(c.branchLicensePrice || 0);
            const totalContract = design + (maxBr * brPrice);
            const paid = Number(c.paidAmount || 0);
            const remaining紧 = Math.max(0, totalContract - paid);
            const isSuspended = c.status === 'suspended';
            const isExpanded = expandedClinicId === c.id;
            const staffCount = users.filter(u => u.clinicId === c.id).length;
            const specialtiesList = c.specialties && c.specialties.length > 0 ? c.specialties : [c.specialty || 'عام'];

            return (
              <div 
                key={c.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isSuspended ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Main Clinic Card Header */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    
                    {/* Facility Info & Specialties */}
                    <div className="flex items-start gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs shrink-0 ${
                        c.systemType === 'hospital' 
                          ? 'bg-indigo-600 text-white' 
                          : c.systemType === 'center' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {c.systemType === 'hospital' ? '🏥' : c.systemType === 'center' ? '🏢' : '🩺'}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-base text-slate-900">{c.name}</h4>
                          <span className="text-xs text-slate-500 font-bold">({c.docName || c.name})</span>
                          
                          {/* System Type Badge */}
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                            {c.systemType === 'hospital' ? 'مستشفى متكامل' : c.systemType === 'center' ? 'مركز تخصصي' : 'عيادة خاصة'}
                          </span>

                          {/* License Status Badge */}
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                            isSuspended 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSuspended ? 'مجمد وموقوف مؤقتاً' : 'مرخص ونشط'}
                          </span>

                          {/* Payment Status Badge */}
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            c.paymentStatus === 'paid' 
                              ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                              : c.paymentStatus === 'partial' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {c.paymentStatus === 'paid' ? 'خالص السداد 100%' : c.paymentStatus === 'partial' ? 'سداد جزئي' : 'غير مسدد'}
                          </span>
                        </div>

                        {/* Primary Specialty & Sub-specialties Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-indigo-100">
                            <Stethoscope size={12} />
                            التخصص الرئيسي: {c.specialty || 'عام'}
                          </span>
                          
                          {specialtiesList.slice(0, 5).map((sp, idx) => (
                            <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {sp}
                            </span>
                          ))}
                          {specialtiesList.length > 5 && (
                            <span className="text-[10px] font-bold text-slate-400">+{specialtiesList.length - 5} تخصصات أخرى</span>
                          )}
                        </div>

                        {/* Contact & Meta */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1 font-mono">
                          {c.phone && <span>📞 {c.phone}</span>}
                          {c.address && <span>📍 {c.address}</span>}
                          <span>📅 ينتهي: {c.expiryDate}</span>
                          <span>🏢 الفروع المصرح بها: {maxBr} فرع</span>
                          <span>👥 الكادر: {staffCount} مستخدم</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary & Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left font-mono text-xs">
                        <div className="text-slate-400 text-[10px]">قيمة العقد / المحصل:</div>
                        <div className="font-bold text-slate-800">
                          {totalContract.toLocaleString()} / <span className="text-emerald-600">{paid.toLocaleString()}</span> {c.currency || 'ج.م'}
                        </div>
                        {remaining紧 > 0 && (
                          <div className="text-[10px] text-rose-600 font-bold">متبقي: {remaining紧.toLocaleString()} {c.currency || 'ج.م'}</div>
                        )}
                      </div>

                      {/* Contract Modal Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedClinicForContract(c)}
                        className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
                        title="طباعة سند التعاقد الرسمي A4"
                      >
                        <FileText size={16} />
                      </button>

                      {/* Staff & Branches Modal Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedClinicForStaff(c)}
                        className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors cursor-pointer"
                        title="تسكين كوادر وموظفي المنشأة"
                      >
                        <Users size={16} />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleEditClick(c)}
                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors cursor-pointer"
                        title="تعديل بيانات المنشأة والتخصصات"
                      >
                        <Edit3 size={16} />
                      </button>

                      {/* Freeze / Active Button */}
                      <button
                        type="button"
                        onClick={() => toggleClinicStatus抓(c.id)}
                        className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                          isSuspended ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                        title={isSuspended ? 'تفعيل وتشغيل المنشأة' : 'تجميد وإيقاف المنشأة'}
                      >
                        <ShieldAlert size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteClinic(c.id, c.name)}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors cursor-pointer"
                        title="حذف المنشأة نهائياً"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Account Login Bar & Quick Renewals */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <Key size={14} className="text-indigo-600" /> الحساب الرئيسي:
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-slate-800">
                        {c.ownerUsername}
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-indigo-600">
                        {c.ownerPass}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">تمديد الترخيص:</span>
                      <button
                        onClick={() => renewClinic(c.id, 30)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        +30 يوم
                      </button>
                      <button
                        onClick={() => renewClinic(c.id, 90)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        +3 شهور
                      </button>
                      <button
                        onClick={() => renewClinic(c.id, 365)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        +1 سنة
                      </button>

                      {/* Expand / Collapse Granular Permissions Accordion */}
                      <button
                        onClick={() => setExpandedClinicId(isExpanded ? null : c.id)}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 mr-2"
                      >
                        <Sliders size={13} />
                        <span>{isExpanded ? 'إخفاء الصلاحيات' : 'تخصيص الصلاحيات الدقيقة'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Granular Permissions Accordion Body */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/80 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                        <Shield size={16} className="text-purple-600" />
                        صلاحيات التشغيل والأزرار الدقيقة الممنوحة لمستخدمي المنشأة
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        التحكم في العمليات المحاسبية، الطباعة، الحذف، والتقارير
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[
                        { key: 'pos_printing', label: 'طباعة فواتير POS الحرارية' },
                        { key: 'a4_tax_printing', label: 'طباعة الفواتير الضريبية A4' },
                        { key: 'clinical_reports_export', label: 'تصدير التقارير السريرية' },
                        { key: 'patient_queue_print', label: 'طباعة تذاكر طابور الانتظار' },
                        { key: 'payroll_print', label: 'طباعة مسيرات الرواتب والمكافآت' },
                        { key: 'inventory_print', label: 'طباعة جرد صيدلية ومخزن الأدوية' },
                        { key: 'treasury_view', label: 'الاطلاع على حركة الخزينة والإيرادات' },
                        { key: 'add_expenses', label: 'إضافة وتسجيل سندات المصروفات' },
                        { key: 'vat_tax_reports', label: 'الاطلاع على تقارير الإقرار الضريبي' },
                        { key: 'edit_service_prices', label: 'تعديل أسعار الكشوفات والخدمات' },
                        { key: 'add_staff', label: 'إضافة موظفين وأطباء جدد' },
                        { key: 'delete_staff', label: 'حذف وتعديل حسابات الطاقم' },
                        { key: 'run_payroll', label: 'صرف الرواتب والسلف والخصومات' },
                        { key: 'or_er_bookings', label: 'حجز غرف العمليات واستقبال الطوارئ' },
                        { key: 'excel_pdf_export', label: 'تصدير الجداول إلى Excel و PDF' },
                        { key: 'edit_delete_patients', label: 'تعديل وحذف سجلات المرضى' },
                        { key: 'ai_chatbot_access', label: 'تشغيل المساعد الطبي الذكي' }
                      ].map(perm => {
                        const isGranted = (c.granularPermissions || {})[perm.key] !== false;
                        return (
                          <div
                            key={perm.key}
                            onClick={() => toggleClinicPerm(c.id, perm.key)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isGranted 
                                ? 'bg-white border-purple-200 text-purple-950 shadow-2xs' 
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-xs font-bold">{perm.label}</span>
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                              isGranted ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                              {isGranted ? '✓' : '✕'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Modals */}
      <DeveloperContractModal
        clinic={selectedClinicForContract}
        onClose={() => setSelectedClinicForContract(null)}
      />

      <DeveloperBranchStaffModal
        clinic={selectedClinicForStaff}
        users={users}
        onClose={() => setSelectedClinicForStaff(null)}
        onAddUser={(newUser) => {
          updateState({ users: [...users, newUser] });
          logAction('إضافة موظف للمنشأة', `تم تسكين موظف جديد: ${newUser.name} بالمنشأة`);
        }}
        onDeleteUser={(userId) => {
          updateState({ users: users.filter(u => u.id !== userId) });
          logAction('حذف موظف', `تم حذف حساب المستخدم: ${userId}`);
        }}
      />

    </div>
  );
}
