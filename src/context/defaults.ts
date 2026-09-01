import { getFormattedDateTime, getTodayISO } from '../lib/utils';
import { 
  User, Clinic, PatientQueueItem, Appointment, Expense, Drug, DiagnosisProtocol, Service, Department, 
  ClinicalReport, AccountingTransaction, Invoice, AuditLog, InsuranceCompany, InventoryItem,
  ErPatient, OrBooking, InpatientAdmission, HospLabOrder, RadOrder, StaffMember, 
  PayrollTransaction, InsuranceClaim, LabSettingItem, PrescriptionSettings, QueueDisplaySettings,
  WhatsAppSettings, PatientStatusRecord, Account, JournalEntry, Voucher,
  IcuPatient, BloodBankUnit, DoctorCommission, DialysisMachine, DialysisSession, WaterTreatmentLog,
  SystemReleaseUpdate
} from '../types';

export const defaultDiagnosisProtocols: DiagnosisProtocol[] = [
  {
    id: 'dp_1',
    diagnosisName: 'التهاب وقرحة القدم السكري (Diabetic Foot Ulcer)',
    specialty: 'جراحة الأوعية والقدم السكري',
    drugs: [
      { name: "Augmentin 1g", dose: "قرص كل 12 ساعة بعد الأكل لمدة 10 أيام" },
      { name: "Ciprofloxacin 500mg", dose: "قرص كل 12 ساعة لمدة 7 أيام" },
      { name: "Alphintern", dose: "قرصين 3 مرات يومياً قبل الأكل بساعة" },
      { name: "Silver Sulfadiazine Cream", dose: "دهان موضعى مع غيار معقم مرتين يومياً" }
    ],
    notes: '• تجنب وضع الوزن أو المشي على القدم المصابة.\n• الالتزام بنظافة وتجفيف الجرح وغيار معقم يومياً.',
    needs: ['حذاء قدم سكري طبي مخصص (Diabetic Custom Offloading Footwear)', 'ضمادات نسيجية هيدروجيل وفضة (Hydrogel & Foam Dressings)']
  },
  {
    id: 'dp_2',
    diagnosisName: 'ارتفاع ضغط الدم الشرياني والقسطرة (Hypertension & CAD)',
    specialty: 'أمراض القلب والأوعية',
    drugs: [
      { name: "Concor 5mg", dose: "قرص واحد صباحاً بعد الأفطار" },
      { name: "Exforge 5/160mg", dose: "قرص واحد مساءً" },
      { name: "Aspocid 75mg", dose: "قرص واحد وسط الغداء" },
      { name: "Atorvastatin 40mg", dose: "قرص واحد قبل النوم" }
    ],
    notes: '• قياس وتسجيل ضغط الدم صباحاً ومساءً.\n• التقليل التام لملح الطعام والأطعمة الدسمة.',
    needs: ['جهاز قياس ضغط الدم الإلكتروني المعتمد (BP Monitor)', 'دفتر سجل متابعة الضغط والنبض اليومي']
  },
  {
    id: 'dp_3',
    diagnosisName: 'التهاب الشعب الهوائية الحاد (Acute Bronchitis)',
    specialty: 'باطنة وصدرية',
    drugs: [
      { name: "Curam 1g", dose: "قرص كل 12 ساعة لمدة 7 أيام" },
      { name: "Cataflam 50mg", dose: "قرص عند اللزوم بعد الأكل" },
      { name: "Claritin 10mg", dose: "قرص واحد قبل النوم" }
    ],
    notes: '• شرب الكثير من السوائل الدافئة والراحة التامة.',
    needs: ['بخاخ غسيل الأنف بمحلول البحر الفسيولوجي (Seawater Nasal Spray)']
  },
  {
    id: 'dp_4',
    diagnosisName: 'التهاب وخشونة المفاصل (Knee Osteoarthritis)',
    specialty: 'جراحة العظام والمفاصل',
    drugs: [
      { name: "Arcoxia 90mg", dose: "قرص واحد يومياً بعد الغداء لمدة 10 أيام" },
      { name: "Panadol Joint 665mg", dose: "قرصين عند زيادة الألم" },
      { name: "Voltaren Emulgel", dose: "دهان موضعى للركبتين مرتين يومياً" }
    ],
    notes: '• تجنب الصعود والهبوط المكرر للسلم والجلوس التربيع.',
    needs: ['حزام ظهر طبي / مشد ركبة مفصلي (Lumbosacral / Knee Brace)', 'كمادات جيل باردة ودافئة (Hot/Cold Gel Pack)']
  },
  {
    id: 'dp_5',
    diagnosisName: 'الفشل الكلوي المزمن - جلسات الغسيل الدموي (Chronic Hemodialysis ESRD)',
    specialty: 'أمراض الكلى والغسيل الكلوي',
    drugs: [
      { name: "Epoetin Alfa 4000 IU Syringe", dose: "حقنة تحت الجلد عقب كل جلسة غسيل (3 مرات أسبوعياً)" },
      { name: "Venofer 100mg Amp (Iron Sucrose)", dose: "أمبول بالوريد بطيء على 100 مل محلول ملح أثناء الجلسة" },
      { name: "Renvela 800mg Tab (Sevelamer)", dose: "قرص وسط الوجبات الرئيسية 3 مرات يومياً" },
      { name: "Alpha D3 0.5mcg Cap (Alfacalcidol)", dose: "كبسولة واحدة مساءً" },
      { name: "Heparin Sodium 5000 IU/ml", dose: "جرعة تحميل 2000 وحدة + 1000 وحدة/ساعة أثناء الجلسة" }
    ],
    notes: '• جلسة غسيل دموي 4 ساعات (3 مرات أسبوعياً).\n• الالتزام الصارم بالوزن الجاف ومنع زيادة السوائل عن 1.5 كجم بين الجلسات.\n• الامتناع عن أطعمة البوتاسيوم المرتفعة (الموز، التمر، الموالح).',
    needs: ['فلاتر غسيل دموي عالية النفاذية F70/F80 High-Flux Dialyzers', 'وصلات دم شريانية ووريدية معقمة للغسيل (AV Bloodlines)', 'إبر فستولا شريانية ووريدية مقاس 16G/17G معقمة', 'ميزان حساس دقيق وتسجيل الوزن الجاف (Dry Weight Tracker)']
  },
  {
    id: 'dp_6',
    diagnosisName: 'العناية بوصلة الفستولا وقسطرة الغسيل (AV Fistula & Permcath Maintenance)',
    specialty: 'جراحة الأوعية والقساطر الكلوية',
    drugs: [
      { name: "Heparin Lock Flush 5000 IU/ml", dose: "لقفل القسطرة بعد نهاية الجلسة حسب السعة المكتوبة" },
      { name: "Bactroban Ointment", dose: "دهان موضعى مع غيار معقم على خروج القسطرة" },
      { name: "Clexane 40mg Syringe", dose: "حقنة تحت الجلد لمنع التجلط" }
    ],
    notes: '• يمنع نهائياً قياس ضغط الدم أو سحب عينات دم من ذراع الفستولا.\n• فحص الاهتزاز الصوتي (Thrill) للفستولا يومياً باليد.\n• غيار معقم يومياً على قسطرة الفيرماكاث بدون تعريضها للماء.',
    needs: ['حقيبة غيار معقم ومطهرات قسطرة الغسيل (Permcath Care Kit)', 'إبر فستولا شريانية ووريدية مقاس 16G/17G معقمة']
  }
];

export const defaultWhatsAppSettings: WhatsAppSettings = {
  phone: "01065826742",
  enableReminders: true,
  reminderTemplate: "مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic} - {doctor} بتاريخ {date} الساعة {time}. نتمنى لكم دوام الصحة والعافية.",
  autoIncludeMap: true
};

export const defaultRxSettings: PrescriptionSettings = {
  headerTitle: "مستشفى ومنظومة رعاية التخصصية",
  headerSubtitle: "العيادات الخارجية والاستشارات الطبية التخصصية",
  clinicName: "المركز الطبي المتكامل",
  clinicAddress: "جمهورية مصر العربية - القاهرة - مدينة نصر - مجمع العيادات",
  clinicPhones: "01065826742 / 0123456789",
  doctorName: "د. صبري الديب",
  doctorTitle: "استشاري أول الجراحة العامة والمناظير",
  specialty: "جراحة عامة وأورام ومناظير متقدمة",
  notesFooter: "• يرجى الالتزام بالجرعات المحددة ومواعيد تناول الدواء.\n• إعادة الكشف مجاناً خلال 14 يوماً من تاريخ الزيارة.\n• يرجى إحضار هذه الروشتة ونتائج الفحوصات عند كل زيارة.",
  showWatermark: true,
  rxSymbolStyle: 'modern',
  themeColor: '#2563eb',
  fontSize: 'md',
  showQrCode: true,
  showDiagnosis: true,
  showPatientAgeAndPhone: true,
  showTaxAndVat: true,
  printMargins: 'normal'
};

export const defaultQueueDisplaySettings: QueueDisplaySettings = {
  tickerText: "🏥 أهلاً بكم في المستشفى التخصصي | نرجو من السادة المراجعين التزام الهدوء والانتظار حتى سماع النداء الصوتي | لطوارئ المستشفى والاستفسارات: يرجى التوجه لمكتب الاستقبال الرئيسي | نتمنى لجميع مراجعينا دوام الصحة والعافية",
  tickerSpeed: "normal",
  tickerBgColor: "#0f172a",
  tickerTextColor: "#38bdf8",
  showTicker: true,
  mediaLayoutMode: "slideshow",
  slideshowIntervalSeconds: 8,
  customImages: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
  ],
  showHealthcareTips: true,
  soundEnabled: true,
  volume: 0.9,
  chimeType: "standard",
  repeatCount: 1,
  speechRate: 0.88,
  callPhraseTemplate: "المريض {patient}، تفضل بالدخول إلى {clinic}"
};

export interface AppState {
  users: User[];
  clinics: Clinic[];
  queue: Record<string, PatientQueueItem[]>;
  archive: Record<string, PatientQueueItem[]>;
  appointments: Record<string, Appointment[]>;
  drugs: Drug[];
  services: Service[];
  departments: Department[];
  expensesStore: Record<string, Expense[]>;
  reports: ClinicalReport[];
  transactions: AccountingTransaction[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  insuranceCompanies: InsuranceCompany[];
  inventory: InventoryItem[];
  erStore: Record<string, ErPatient[]>;
  orStore: Record<string, OrBooking[]>;
  inpatientStore: Record<string, InpatientAdmission[]>;
  hospLabStore: Record<string, HospLabOrder[]>;
  radStore: Record<string, RadOrder[]>;
  icuStore?: Record<string, IcuPatient[]>;
  bloodBankStore?: Record<string, BloodBankUnit[]>;
  doctorCommissionsStore?: Record<string, DoctorCommission[]>;
  dialysisMachinesStore?: Record<string, DialysisMachine[]>;
  dialysisSessionsStore?: Record<string, DialysisSession[]>;
  waterTreatmentLogsStore?: Record<string, WaterTreatmentLog[]>;
  staffDirectory: Record<string, StaffMember[]>;
  payrollStore: Record<string, PayrollTransaction[]>;
  insuranceStore: Record<string, InsuranceClaim[]>;
  labSettingsList: LabSettingItem[];
  vitalsStore: Record<string, { bp: string, hr: string, temp: string, spo2: string, weight: string, height: string, notes: string }>;
  labStore: Record<string, { tests: string, results: string, fileData?: string, date: string }[]>;
  rxStore: Record<string, { 
    items: Drug[], 
    diagnosis: string, 
    notes: string, 
    date: string, 
    doctorName?: string, 
    clinicId?: string 
  }[]>;
  rxSettingsStore: Record<string, PrescriptionSettings>;
  queueDisplaySettingsStore: Record<string, QueueDisplaySettings>;
  whatsappSettingsStore: Record<string, WhatsAppSettings>;
  diagnosisProtocols: DiagnosisProtocol[];
  patientStatusHistoryStore: Record<string, PatientStatusRecord[]>;
  accountsStore?: Record<string, Account[]>;
  journalEntriesStore?: Record<string, JournalEntry[]>;
  vouchersStore?: Record<string, Voucher[]>;
  medicalAlertsStore?: Record<string, { allergies?: string; chronicDiseases?: string }>;
  maintenanceMode?: boolean;
  systemUpdatesHistory?: SystemReleaseUpdate[];
  globalAnnouncement?: { message: string; active: boolean; type: 'info' | 'warning' | 'error' };
  globalSystemMode?: string;
  globalWhatsAppConfig?: {
    enabled: boolean;
    defaultSenderNumber: string;
    allowClinicsToOverride: boolean;
  };
  databaseConfig?: {
    type: 'firebase' | 'local_sql' | 'remote_sql';
    firebaseConfig?: string;
    sqlHost?: string;
    sqlPort?: string;
    sqlUser?: string;
    sqlPass?: string;
    sqlDb?: string;
  };
}

export const defaultClinics: Clinic[] = [];

export const defaultState: AppState = {
  globalSystemMode: "medical",
  globalWhatsAppConfig: {
    enabled: true,
    defaultSenderNumber: "01065826742",
    allowClinicsToOverride: true
  },
  users: [
    { 
      id: 'master', 
      name: 'صبري الديب (المطور)', 
      username: 'sapry eldeep', 
      pass: '159632', 
      role: 'master_admin', 
      clinicId: 'master' 
    }
  ],
  clinics: [],
  queue: {},
  archive: {},
  appointments: {},
  drugs: [
    { name: "Augmentin 1g", dose: "قرص كل 12 ساعة" },
    { name: "Panadol 500mg", dose: "قرص عند اللزوم" },
    { name: "Amoxicillin 500mg", dose: "كبسولة 3 مرات يومياً" },
    { name: "Brufen 400mg", dose: "قرص بعد الأكل مرتين" },
    { name: "Concor 5mg", dose: "قرص صباحاً" },
    { name: "Cataflam 50mg", dose: "قرص عند اللزوم" },
    { name: "Zithromax 500mg", dose: "قرص يومياً لمدة 3 أيام" }
  ],
  services: [
    { name: "كشف عام واستشارة", price: 300 },
    { name: "كشف استشاري تخصصي", price: 450 },
    { name: "إعادة كشف ومتابعة", price: 150 },
    { name: "جلسة غسيل كلوي دموي HD (F70/F80 High-Flux)", price: 1200 },
    { name: "تركيب قسطرة غسيل كلوي مستديمة Permcath", price: 3500 },
    { name: "عملية تجهيز وصلة فستولا شريانية وريدية AV Fistula", price: 5000 },
    { name: "جلسة غسيل كلوي طوارئ بالعناية المركزة Acute HD", price: 2000 }
  ],
  departments: [],
  expensesStore: {},
  reports: [],
  transactions: [],
  invoices: [],
  auditLogs: [],
  insuranceCompanies: [],
  inventory: [],
  erStore: {},
  orStore: {},
  inpatientStore: {},
  hospLabStore: {},
  radStore: {},
  icuStore: {},
  bloodBankStore: {},
  doctorCommissionsStore: {},
  dialysisMachinesStore: {
    'master': [
      { id: 'm1', clinicId: 'master', machineCode: 'M-01 (Fresenius 5008S)', brand: 'Fresenius Medical Care', isolationCategory: 'Negative', shift: 'Morning', status: 'Ready', lastSterilizationDate: '2026-08-31 06:00' },
      { id: 'm2', clinicId: 'master', machineCode: 'M-02 (B.Braun Dialog+)', brand: 'B.Braun Avitum', isolationCategory: 'Negative', shift: 'Morning', status: 'In_Session', assignedPatient: 'محمود عبد السلام', assignedDoctor: 'أ.د. طارق الجمال', lastSterilizationDate: '2026-08-31 06:30' },
      { id: 'm3', clinicId: 'master', machineCode: 'M-03 (Nipro DBB-EXA)', brand: 'Nipro Medical', isolationCategory: 'HCV_Positive', shift: 'Morning', status: 'Ready', lastSterilizationDate: '2026-08-30 22:00' },
      { id: 'm4', clinicId: 'master', machineCode: 'M-04 (Fresenius 4008S)', brand: 'Fresenius Medical Care', isolationCategory: 'HBV_Positive', shift: 'Afternoon', status: 'Sterilization', lastSterilizationDate: '2026-08-31 11:00' }
    ]
  },
  dialysisSessionsStore: {
    'master': [
      { id: 's1', clinicId: 'master', patientName: 'محمود عبد السلام', patientAge: '54 سنة', machineCode: 'M-02 (B.Braun Dialog+)', shift: 'Morning', dialyserFilter: 'High-Flux FX80', vascularAccess: 'AV_Fistula', preWeight: 78.5, postWeight: 75.2, dryWeight: 75.0, ufTarget: 3.3, bloodFlowQB: 300, heparinDose: 3500, ktvAdequacy: 1.45, sessionCost: 1200, status: 'Ongoing', date: '2026-08-31' }
    ]
  },
  waterTreatmentLogsStore: {
    'master': [
      { id: 'w1', clinicId: 'master', inspectorName: 'م. أحمد الشافعي (مهندس الصيانة والتعقيم)', conductivity: 4.8, freeChlorine: 0.0, waterTemp: 22.5, roPressureBar: 14.2, endotoxinPassed: true, notes: 'محطة معالجة المياه RO تعمل بكفاءة عالية، القراءات ضمن الحدود القياسية لقوانين الصحة والسلامة.', status: 'Passed', timestamp: '2026-08-31 08:00' }
    ]
  },
  staffDirectory: {},
  payrollStore: {},
  insuranceStore: {},
  accountsStore: {},
  journalEntriesStore: {},
  vouchersStore: {},
  labSettingsList: [
    { name: "صورة دم كاملة (CBC)", price: 150 },
    { name: "سكر صائم وفاطر", price: 90 },
    { name: "وظائف كلى وكبد", price: 250 },
    { name: "أشعة مقطعية (CT Scan)", price: 1200 },
    { name: "فحص كفاءة الغسيل الكلوي (Kt/V Clearance)", price: 200 },
    { name: "يوريا صائمة وبعد الجلسة (URR Ratio)", price: 160 },
    { name: "سيروم فيروسات كبدية ومناعة (HBV / HCV / HIV)", price: 350 },
    { name: "هرمون غدة الجاردرقية (Intact PTH Level)", price: 450 },
    { name: "نسبة الفوسفور والكالسيوم بالدم (Serum Calcium & Phosphorus)", price: 180 }
  ],
  vitalsStore: {},
  labStore: {},
  rxStore: {},
  rxSettingsStore: {
    'master': defaultRxSettings
  },
  queueDisplaySettingsStore: {
    'master': defaultQueueDisplaySettings
  },
  whatsappSettingsStore: {
    'master': defaultWhatsAppSettings
  },
  diagnosisProtocols: defaultDiagnosisProtocols,
  patientStatusHistoryStore: {},
  systemUpdatesHistory: [
    {
      id: 'update_v2.5.0',
      version: 'v2.5.0 Enterprise',
      title: 'إصدار التحديث الهيكلي للنظام المحاسبي والمالي ووحدات الغسيل الكلوي',
      releaseDate: '2026-08-31 10:00',
      updateType: 'major',
      targetAudience: 'all',
      description: 'تم إضافة شجرة الحسابات التخصصية، عزل البيانات بشكل كامل، إضافة وحدات الغسيل الكلوي ومحطة RO، وتطوير لوحة المطور لتمكين مفاتيح الرقابة المباشرة.',
      changesList: [
        'تخصيص نماذج شجرة الحسابات التخصصية للعيادات والمراكز والمستشفيات',
        'مفاتيح المطور لإظهار/إخفاء الأقسام والطباعة والتصدير',
        'إضافة وحدة ومكائن الغسيل الكلوي ومحطة معالجة المياه RO',
        'فصل وعزل بيانات العيادات بالكامل لمنع أي تداخل'
      ],
      broadcastAlert: true,
      publishedBy: 'المطور الرئيسي (Master Developer)'
    }
  ],
  databaseConfig: {
    type: 'firebase',
    firebaseConfig: 'AIzaSyCUxhbtN0L5_Eymcxx894P7Ux0fDjrv26w',
    sqlDb: 'nesa-3a5c8',
    sqlHost: 'https://nesa-3a5c8-default-rtdb.firebaseio.com'
  }
};
