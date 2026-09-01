export type Role = 'master_admin' | 'developer' | 'doctor' | 'staff';

export interface User {
  id: string;
  name: string;
  username: string;
  pass: string;
  role: Role;
  jobTitle?: string; // المسمى الوظيفي: طبيب، استقبال، تمريض، معمل، أشعة، صيدلي، محاسب
  clinicId: string;
  perms?: string[];
  commissionRate?: number; // نسبة الطبيب من الخدمات (مثلاً 40%)
  phone?: string;
}

export interface InventoryItem {
  id: string;
  clinicId: string;
  name: string;
  type: 'drug' | 'supply';
  quantity: number;
  minStock: number; // حد التنبيه بالنفاذ
  expiryDate?: string; // تاريخ الصلاحية
  price: number;
}

export interface ErPatient {
  id: number | string;
  clinicId: string;
  name: string;
  age: string;
  phone: string;
  severity: 'Critical' | 'Urgent' | 'Stable';
  reason: string;
  date: string;
}

export interface OrBooking {
  id: number | string;
  clinicId: string;
  patient: string;
  surgery: string;
  surgeon: string;
  date: string;
  time: string;
  room: string;
  cost?: number;
}

export interface InpatientAdmission {
  id: number | string;
  clinicId: string;
  name: string;
  ward: string;
  bed: string;
  doctor: string;
  date: string;
  cost?: number;
}

export interface HospLabOrder {
  id: number | string;
  clinicId: string;
  patient: string;
  testName: string;
  result: string;
  date: string;
  fileData?: string; // Base64 data URL
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  cost?: number;
}

export interface RadOrder {
  id: number | string;
  clinicId: string;
  patient: string;
  type: string;
  report: string;
  date: string;
  fileData?: string; // Base64 data URL
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  cost?: number;
}

export interface IcuPatient {
  id: string;
  clinicId: string;
  patientName: string;
  age: string;
  bedNumber: string;
  ventilatorStatus: 'None' | 'Invasive' | 'Non-Invasive';
  oxygenSaturation: number;
  heartRate: number;
  condition: 'Critical' | 'Severe' | 'Improving';
  dateAdded: string;
  costPerDay: number;
}

export interface BloodBankUnit {
  id: string;
  clinicId: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  stockCount: number;
  expiryDate: string;
  lastTestedDate: string;
}

export interface DoctorCommission {
  id: string;
  clinicId: string;
  doctorName: string;
  operationType: string;
  patientName: string;
  totalAmount: number;
  commissionPercentage: number;
  commissionEarned: number;
  status: 'pending' | 'paid';
  date: string;
}

export interface DialysisMachine {
  id: string;
  clinicId: string;
  machineCode: string;
  brand: string; // Fresenius, B.Braun, Nipro, Gambro
  isolationCategory: 'Negative' | 'HBV_Positive' | 'HCV_Positive'; // عزل فيروسي
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Night_Emergency';
  status: 'Ready' | 'In_Session' | 'Sterilization' | 'Maintenance';
  assignedPatient?: string;
  assignedDoctor?: string;
  lastSterilizationDate?: string;
}

export interface DialysisSession {
  id: string;
  clinicId: string;
  patientName: string;
  patientAge: string;
  machineCode: string;
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Night_Emergency';
  dialyserFilter: string; // e.g. High-flux FX80, Low-flux F6
  vascularAccess: 'AV_Fistula' | 'Permcath' | 'Temp_Catheter' | 'AV_Graft';
  preWeight: number;
  postWeight: number;
  dryWeight: number;
  ufTarget: number; // كمية السوائل المراد سحبها L
  bloodFlowQB: number; // ml/min
  heparinDose: number; // IU
  ktvAdequacy: number; // كفاءة الغسيل
  sessionCost: number;
  status: 'Ongoing' | 'Completed' | 'Terminated_Emergency';
  date: string;
}

export interface WaterTreatmentLog {
  id: string;
  clinicId: string;
  inspectorName: string;
  conductivity: number; // µS/cm (يجب أن تكون < 15)
  freeChlorine: number; // mg/L (يجب أن تكون 0.0)
  waterTemp: number; // °C
  roPressureBar: number;
  endotoxinPassed: boolean;
  notes: string;
  status: 'Passed' | 'Warning' | 'Critical_Shutdown';
  timestamp: string;
}

export interface StaffMember {
  id: number | string;
  clinicId: string;
  name: string;
  cat: string;
  dep: string;
  salary: number;
  phone: string;
}

export interface PayrollTransaction {
  id: number | string;
  clinicId: string;
  staffName: string;
  transType: 'bonus' | 'advance' | 'deduction';
  amount: number;
  note: string;
  date: string;
}

export interface InsuranceClaim {
  id: number | string;
  clinicId: string;
  patient: string;
  company: string;
  cardNo: string;
  copay: number;
  amount: number;
  companyShare: number;
  status: string;
  date: string;
}

export interface LabSettingItem { clinicId?: string; 
  name: string;
  price: number;
}

export interface Clinic {
  id: string;
  name: string;
  docName: string;
  systemType: 'clinic' | 'center' | 'hospital' | 'pharmacy';
  specialty: string;
  daysCount: number;
  expiryDate: string;
  modules?: string[];
  specialties?: string[];
  customClinicalStates?: { id: string; label: string; color: string }[];
  status?: 'active' | 'suspended';
  currency?: string; // EGP, SAR, AED, USD
  vatRate?: number; // 0, 5, 14, 15
  taxId?: string; // الرقم الضريبي
  phone?: string; // هاتف العيادة / الطبيب
  ownerUsername?: string; // اسم مستخدم الحساب الرئيسي
  ownerPass?: string; // كلمة مرور الحساب الرئيسي
  contractPrice?: number; // قيمة الاشتراك / البيع
  designPrice?: number; // سعر بيع التصميم والمنظومة
  branchLicensePrice?: number; // سعر ترخيص الفرع
  maxBranches?: number; // الحد الأقصى للفروع
  maxStaff?: number; // الحد الأقصى لعدد الموظفين المرخص بهم
  paidAmount?: number; // المبلغ المحصل فعلياً
  paymentStatus?: 'paid' | 'partial' | 'unpaid' | 'trial'; // حالة سداد الاشتراك
  startDate?: string; // تاريخ بداية العقد
  notes?: string; // ملاحظات العقد
  logoUrl?: string; // شعار المنشأة
  receiptFooter?: string; // تذييل الفاتورة
  storageProvider?: 'local' | 'cloudinary' | 'firebase'; // مستودع الصور
  address?: string; // عنوان المنشأة
  granularPermissions?: Record<string, boolean>; // صلاحيات الأزرار والعمليات المتقدمة
  // Master Developer Permission Toggles
  allowWhatsApp?: boolean; // تفعيل/إيقاف تذكير الواتساب
  allowPrinting?: boolean; // تفعيل/إيقاف الطباعة والتحميل
  allowChatbot?: boolean;  // تفعيل/إيقاف الشات بوت الذكي
  allowAccounting?: boolean; // تفعيل/إيقاف قسم وشجرة الحسابات
  allowExcelExport?: boolean; // تفعيل/إيقاف زر تحميل إكسيل
  allowPdfExport?: boolean; // تفعيل/إيقاف زر تحميل PDF
  allowAuditLogs?: boolean; // تفعيل/إيقاف سجل النشاط
  allowEditDeleteAccounting?: boolean; // تفعيل/إيقاف تعديل وحذف بنود المحاسبة والقيود والسندات
  allowPharmacyPriceEdit?: boolean; // السماح/منع تعديل أسعار الأدوية والمستلزمات بالصيدلية
  allowCustomDiscounts?: boolean; // السماح/منع منح خصومات يدوية بالفواتير
  allowStaffRoleCreation?: boolean; // السماح/منع إنشاء وتعديل صلاحيات الأدوار المخصصة
  allowPatientDeletion?: boolean; // السماح/منع حذف ملفات المرضى من الأرشيف
  allowPrescriptionCustomHeader?: boolean; // السماح/منع رفع وتخصيص هيدر الروشتة
  allowMultiBranchSync?: boolean; // السماح/منع الربط والبحث الموحد بين الفروع
  allowOperationsModule?: boolean; // تفعيل/إيقاف قسم المستشفى (طوارئ/عمليات/إقامة/عناية/كلى)
  allowPharmacyModule?: boolean; // تفعيل/إيقاف قسم المخزون والصيدلية
  allowInsuranceModule?: boolean; // تفعيل/إيقاف قسم التأمين الصحي
  allowStaffPayrollModule?: boolean; // تفعيل/إيقاف قسم الكوادر والرواتب
  allowClinicalReportsModule?: boolean; // تفعيل/إيقاف قسم التقارير السريرية
  allowDoctorCommissions?: boolean; // تفعيل/إيقاف حسابات وعمولات الأطباء
  allowICUModule?: boolean; // تفعيل/إيقاف وحدة العناية المركزة ICU
  allowBloodBankModule?: boolean; // تفعيل/إيقاف بنك الدم
  allowDialysisModule?: boolean; // تفعيل/إيقاف وحدة ومكائن الغسيل الكلوي ومحطة RO
  allowQueueScreen?: boolean; // تفعيل/إيقاف شاشة العرض الخارجية طابور الانتظار TV
  auditLogVisibility?: 'all_staff' | 'admin_only' | 'developer_only'; // صلاحية رؤية السجل داخل المنشأة
  geminiApiKey?: string;   // مفتاح الذكاء الاصطناعي الخاص بالعيادة
  dbType?: 'cloud_firebase' | 'local_sql' | 'external_sql'; // نوع السيرفر وقاعدة البيانات لكل عيادة منفصلة
  dbHost?: string; // عنوان السيرفر المحرك لقاعدة البيانات
  dbPort?: string; // منفذ السيرفر المحرك لقاعدة البيانات
  dbUser?: string; // اسم مستخدم السيرفر
  dbPass?: string; // كلمة مرور السيرفر
  dbName?: string; // اسم قاعدة البيانات
}

export type AuditOperationType = 'create' | 'read' | 'update' | 'delete' | 'process' | 'auth';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  clinicId: string;
  clinicName?: string;
  userRole?: string;
  action: string; // e.g., "إنشاء مريض", "تعديل فاتورة", "حذف موعد", "إضافة قيد محاسبي"
  operationType?: AuditOperationType; // نوع عملية CRUD
  category?: 'patients' | 'billing' | 'accounting' | 'appointments' | 'rx' | 'medical' | 'staff' | 'pharmacy' | 'operations' | 'auth' | 'settings' | 'system' | string;
  details: string;
  targetId?: string;
  targetName?: string;
  severity?: 'info' | 'warning' | 'danger' | 'success';
  ipAddress?: string;
  metadata?: Record<string, any>;
}

// ==================== المحاسبة وشجرة الحسابات (Accounting & Chart of Accounts) ====================
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  clinicId: string;
  code: string; // e.g., '1101', '1201', '2101', '4101', '5101'
  name: string;
  nameEn?: string;
  type: AccountType;
  category: string; // e.g., 'current_assets', 'fixed_assets', 'current_liabilities', 'operating_revenue', etc.
  parentId?: string; // معرف الحساب الأب
  level: number; // 1: رئيسي، 2: فرعي، 3: تفصيلي
  openingBalance: number; // رصيد افتتاحي
  currentBalance: number; // الرصيد الحالي المحسوب
  isSystemAccount?: boolean; // حساب نظامي محمي من الحذف
  description?: string;
  createdAt?: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number; // مدين
  credit: number; // دائن
  note?: string;
}

export interface JournalEntry {
  id: string;
  clinicId: string;
  entryNumber: string; // e.g., 'JV-2026-0001'
  date: string;
  description: string;
  referenceType?: 'manual' | 'invoice' | 'expense' | 'payroll' | 'voucher' | 'pharmacy';
  referenceId?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  clinicId: string;
  type: 'receipt' | 'payment'; // سند قبض (Receipt) أو سند صرف (Payment)
  voucherNumber: string; // e.g., 'RV-001' or 'PV-001'
  date: string;
  amount: number;
  accountId: string; // حساب الحساب المقابل (مصروف/إيراد/مورد/مريض)
  accountName: string;
  treasuryAccountId: string; // حساب الخزينة أو البنك
  treasuryAccountName: string;
  beneficiary: string; // المستلم / المسلّم منه
  paymentMethod: 'cash' | 'bank' | 'card' | 'transfer';
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface InsuranceCompany {
  id: string;
  clinicId: string;
  name: string;
  code: string;
  discountPercentage: number; // نسبة الخصم
  coveragePercentage: number; // نسبة التغطية (100 - تحمل المريض)
}

export interface Department { 
  id: string;
  name: string;
  clinicId: string;
  description: string;
}

export interface PatientQueueItem {
  id: string | number;
  name: string;
  age: string;
  phone: string;
  service: string;
  total: number;
  paid: number;
  due: number;
  status: 'waiting' | 'in' | 'done';
  isoDate: string;
  date: string;
}

export interface Appointment {
  id: string | number;
  name: string;
  phone: string;
  date: string;
  time: string;
}

export interface Expense {
  id: string | number;
  desc: string;
  amount: number;
  date: string;
}

export interface Drug { clinicId?: string; 
  name: string;
  dose: string;
}

export interface DiagnosisProtocol { clinicId?: string; 
  id: string;
  diagnosisName: string;
  specialty?: string;
  drugs: Drug[];
  notes?: string;
  needs?: string[];
}

export interface PatientStatusRecord {
  id: string;
  patientName: string;
  clinicId: string;
  date: string;
  isoDate?: string;
  visitType: string; // نوع الزيارة: كشف عادي / متابعة / كشف تخصصي / فحص دوري / استشارة
  clinicalStatus: string;
  diagnosisNotes: string;
  treatmentResponse?: string;
  vitalSigns?: {
    bp?: string;
    hr?: string;
    temp?: string;
    spo2?: string;
  };
  doctorName?: string;
  nextFollowUpDate?: string;
}

export interface Service { clinicId?: string; 
  name: string;
  price: number;
}

export interface ClinicalReport {
  id: string;
  patientName: string;
  clinicId: string;
  departmentId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  specialtyKey?: string;
  specialtyName?: string;
  vitalSigns: {
    bp: string;
    hr: string;
    temp: string;
    weight: string;
    pulse?: string;
  };
  chiefComplaint: string;
  medicalHistory: string;
  physicalExamination: string;
  diagnosis: string;
  treatmentPlan: string;
  specialtyFields?: Record<string, string>;
  patientNeeds?: string[];
  patientSupplies?: string[];
}

export interface AccountingTransaction {
  id: string;
  clinicId: string;
  type: 'income' | 'expense' | 'invoice_payment';
  amount: number;
  category: string;
  description: string;
  date: string;
  patientName?: string;
  createdBy: string;
}

export interface Invoice {
  id: string;
  clinicId: string;
  patientName: string;
  date: string;
  items: { description: string; price: number; qty: number }[];
  total: number;
  paid: number;
  due: number;
  insuranceClaimId?: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface QueueDisplaySettings {
  tickerText: string;
  tickerSpeed: 'slow' | 'normal' | 'fast';
  tickerBgColor: string;
  tickerTextColor: string;
  showTicker: boolean;

  mediaLayoutMode: 'none' | 'banner' | 'slideshow';
  slideshowIntervalSeconds: number;
  customImages: string[];
  showHealthcareTips: boolean;

  soundEnabled: boolean;
  volume: number;
  chimeType: 'standard' | 'emergency' | 'digital' | 'none';
  repeatCount: number;
  speechRate: number;
  callPhraseTemplate: string;
}

export interface PrescriptionSettings {
  headerTitle: string;
  headerSubtitle: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhones: string;
  doctorName: string;
  doctorTitle: string;
  specialty: string;
  notesFooter: string;
  logoUrl?: string;
  showWatermark: boolean;
  rxSymbolStyle: 'classic' | 'modern' | 'caduceus' | 'minimal';
  themeColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  showQrCode: boolean;
  showDiagnosis: boolean;
  showPatientAgeAndPhone: boolean;
  showTaxAndVat: boolean;
  printMargins: 'compact' | 'normal' | 'spacious';
  facilityType?: 'clinic' | 'center' | 'hospital';
  specialtiesList?: string[];
  showSpecialtyNeedsInRx?: boolean;
}

export interface WhatsAppSettings {
  phone: string; // رقم الواتساب المعتمد للإرسال/التواصل
  enableReminders: boolean; // تفعيل إرسال التذكيرات
  reminderTemplate: string; // قالب نص رسالة التذكير
  autoIncludeMap: boolean; // تضمين بيانات الموقع والهاتف
}

export interface SystemReleaseUpdate {
  id: string;
  version: string;
  title: string;
  releaseDate: string;
  updateType: 'major' | 'minor' | 'security' | 'patch';
  targetAudience: 'all' | 'hospitals' | 'centers' | 'clinics';
  description: string;
  changesList: string[];
  broadcastAlert: boolean;
  maintenanceWindow?: boolean;
  publishedBy: string;
}

