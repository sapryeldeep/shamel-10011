import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  FileText, Plus, Printer, Trash2, Settings, Save, Sparkles, Check, 
  QrCode, Stethoscope, Phone, MapPin, Building2, Eye, ShieldCheck, 
  RotateCcw, Sliders, Palette, ChevronRight, Copy, Share2, ShoppingBag,
  Building, Hospital, CheckSquare, Layers, Lock, ShieldAlert, BookmarkPlus,
  Search, UserCheck, History, User
} from 'lucide-react';
import { Drug, PrescriptionSettings, DiagnosisProtocol } from '../types';
import { getFormattedDateTime } from '../lib/utils';
import { MEDICAL_SPECIALTIES } from '../lib/specialties';
import { getPatientNeedsForSpecialty } from '../lib/specialtyNeeds';

const PRESET_SPECIALTY_TEMPLATES: Record<string, Partial<PrescriptionSettings>> = {
  general: {
    facilityType: "clinic",
    headerTitle: "مجمع عيادات رعاية التخصصي",
    headerSubtitle: "العيادات الخارجية والاستشارات الطبية العامة",
    doctorTitle: "استشاري أول الطب الباطني والجراحة العامة",
    specialty: "باطنة عامة وجراحة",
    themeColor: "#2563eb",
    notesFooter: "• يرجى الالتزام بمواعيد وجرعات الأدوية بدقة.\n• الاستشارة والمتابعة مجانية خلال 14 يوماً من تاريخ الكشف.\n• يرجى إحضار الروشتة ونتائج الفحوصات في كل زيارة."
  },
  hospital: {
    facilityType: "hospital",
    headerTitle: "مستشفى رعاية التخصصي الدولي",
    headerSubtitle: "مستشفى شامل كافة الأقسام الطبية والجراحية والطوارئ 24 ساعة",
    doctorTitle: "رئيس الأطباء والمدير الطبي للمستشفى",
    specialty: "أقسام المستشفى: باطنة - جراحة - قلب - عظام - أوعية دموية - طوارئ - أطفال - نساء - أشعة - معامل",
    themeColor: "#0f766e",
    notesFooter: "• طوارئ المستشفى والعناية المركزة تعمل على مدار 24 ساعة.\n• يرجى الاحتفاظ بالروشتة ورقم السجل الطبي للمتابعة بالمستشفى."
  },
  center: {
    facilityType: "center",
    headerTitle: "مركز رعاية التخصصي للأوعية والقلب والسكر",
    headerSubtitle: "مركز طبي متكامل لجراحة الأوعية والقدم السكري والقسطرة التداخلية",
    doctorTitle: "نخبة من كبار الأطباء والاستشاريين في التخصص",
    specialty: "مركز متخصص: جراحة الأوعية الدموية - القدم السكري - أمراض القلب والقسطرة - الباطنة والسكر",
    themeColor: "#1d4ed8",
    notesFooter: "• يرجى متابعة التعليمات والعيادات التخصصية بالمركز.\n• للاستفسارات والحجز يرجى الاتصال بأرقام المركز."
  },
  pediatrics: {
    facilityType: "clinic",
    headerTitle: "عيادة رعاية لطب وجراحة الأطفال",
    headerSubtitle: "وحدة رعاية حديثي الولادة والمبتسرين وتغذية الطفل",
    doctorTitle: "استشاري طب الأطفال وحديثي الولادة - دكتوراه طب الأطفال",
    specialty: "طب أطفال وحديثي ولادة",
    themeColor: "#0284c7",
    notesFooter: "• رجاء الالتزام بجرعات أدوية الشراب بالمليلتر (cm) بالمحقن المدرج.\n• لا تعطى أي أدوية خافضة للحرارة على معدة فارغة.\n• المتابعة مجانية خلال 14 يوماً."
  },
  dental: {
    facilityType: "clinic",
    headerTitle: "مركز رعاية لطب وجراحة وتجميل الأسنان",
    headerSubtitle: "زراعة الأسنان والتقويم والتركيبات التجميلية الثابتة",
    doctorTitle: "أخصائي جراحة الفم والأسنان وتجميل الابتسامة",
    specialty: "طب وجراحة الأسنان",
    themeColor: "#059669",
    notesFooter: "• الامتناع عن المشروبات الساخنة والتدخين لمدة 24 ساعة بعد الجراحة.\n• المضمضة بالماء الدافئ والملح بعد 24 ساعة من الخلع.\n• تناول المسكنات بعد الوجبات مباشرة."
  },
  cardio: {
    facilityType: "center",
    headerTitle: "مركز القلب والأوعية الدموية وقسطرة الشرايين",
    headerSubtitle: "وحدة الفحوصات غير التداخلية والموجات الصوتية (ECHO)",
    doctorTitle: "استشاري أمراض القلب والقسطرة التداخلية - زميل الكلية الملكية",
    specialty: "أمراض القلب والأوعية الدموية",
    themeColor: "#dc2626",
    notesFooter: "• لا توقف أدوية السيولة أو الضغط دون الرجوع للطبيب المعالج.\n• قياس وتسجيل ضغط الدم والنبض يومياً في جدول المتابعة.\n• الطوارئ متاحة على مدار 24 ساعة."
  },
  ortho: {
    facilityType: "clinic",
    headerTitle: "عيادة جراحة العظام والمفاصل والعمود الفقري",
    headerSubtitle: "مناظير المفاصل والكسور والإصابات الرياضية",
    doctorTitle: "استشاري جراحة العظام والكسور ومناظير المفاصل",
    specialty: "جراحة العظام والعمود الفقري",
    themeColor: "#7c3aed",
    notesFooter: "• تجنب حمل الأشياء الثقيلة والجلوس لفترات طويلة منحني الظهر.\n• الالتزام بجلسات العلاج الطبيعي الموصى بها.\n• المتابعة وفحص الأشعة خلال 14 يوماً."
  },
  derma: {
    facilityType: "clinic",
    headerTitle: "عيادة الجلدية والتجميل والعلاج بالليزر",
    headerSubtitle: "أحدث أجهزة الليزر والعناية بالبشرة والشعر",
    doctorTitle: "استشاري الأمراض الجلدية وتجميل الجلد والليزر",
    specialty: "الأمراض الجلدية والتجميل",
    themeColor: "#db2777",
    notesFooter: "• وضع واقي الشمس قبل الخروج بنصف ساعة وتجديده كل ساعتين.\n• استخدام الكريمات الموضعية بكميات بسيطة وتدليكها بلطف.\n• المتابعة بعد 21 يوماً لتقييم النتائج."
  },
  dialysis: {
    facilityType: "hospital",
    headerTitle: "مستشفى ومجمع مراكز الغسيل الكلوي ورعاية الكلى التخصصي",
    headerSubtitle: "وحدة الغسيل الدموي المزمن والحاد - محطة معالجة المياه RO - جراحة وتجهيز الفستولا والقساطر",
    doctorTitle: "استشاري وأخصائيو أمراض الكلى والغسيل الكلوي وجراحة الأوعية",
    specialty: "أمراض الكلى - الغسيل الكلوي الدموي (Hemodialysis) - جراحة الفستولا والقساطر - العناية المركزة للكلى",
    themeColor: "#0284c7",
    notesFooter: "• الالتزام الصارم بمواعيد جلسات الغسيل الدموي (4 ساعات للجلسة 3 مرات أسبوعياً).\n• الالتزام بحساب الوزن الجاف وتحديد كمية السوائل المسموحة يومياً.\n• يرجى إحضار كارت الجلسات وفحوصات الفيروسات الكبدية واليوريا الكاشفة شهرياً."
  }
};

const COMMON_DRUGS_PRESETS = [
  { name: 'Epoetin Alfa 4000 IU Syringe', dose: 'حقنة تحت الجلد عقب كل جلسة غسيل (3 مرات أسبوعياً)' },
  { name: 'Venofer 100mg Amp (Iron Sucrose)', dose: 'أمبول بالوريد بطيء على 100 مل محلول ملح أثناء الجلسة' },
  { name: 'Renvela 800mg Tab (Sevelamer)', dose: 'قرص مع الوجبات الرئيسية (رابط فوسفات)' },
  { name: 'Heparin Sodium 5000 IU/ml Vial', dose: 'جرعة تحميل 2000 وحدة + 1000 وحدة/ساعة أثناء الجلسة' },
  { name: 'Alpha D3 0.5mcg Cap (Alfacalcidol)', dose: 'كبسولة واحدة مساءً يومياً' },
  { name: 'Panadol Extra 500mg', dose: 'قرص 3 مرات يومياً بعد الأكل' },
  { name: 'Augmentin 1g Tab', dose: 'قرص كل 12 ساعة لمدة 7 أيام' },
  { name: 'Cataflam 50mg Tab', dose: 'قرص عند اللزوم (بعد الوجبات)' },
  { name: 'Controloc 40mg Tab', dose: 'قرص صباحاً على الريق قبل الإفطار' },
  { name: 'Zithromax 500mg Cap', dose: 'كبسولة يومياً قبل الأكل بساعة لمدة 3 أيام' },
  { name: 'Brufen 400mg Tab', dose: 'قرص 3 مرات يومياً بعد الوجبات' },
  { name: 'Amrizole 500mg Tab', dose: 'قرص كل 8 ساعات بعد الأكل لمدة 5 أيام' },
  { name: 'Otrivin 0.1% Adult Drops', dose: 'بخاخ / قطرة مرتين يومياً لمدة 5 أيام فقط' },
  { name: 'Ketofan 100mg Cap', dose: 'كبسولة بعد الغداء عند الألم' },
  { name: 'Motilium 10mg Tab', dose: 'قرص قبل الوجبات بنصف ساعة' },
  { name: 'Alphintern Tab', dose: 'قرصين 3 مرات يومياً قبل الأكل بساعة' },
  { name: 'Congestal Tab', dose: 'قرص كل 8 ساعات لأعراض البرد والإنفلونزا' }
];

export default function Prescription() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'create' | 'settings'>('create');
  
  // Patient & Clinical Data
  const [rxPatient, setRxPatient] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [rxDiag, setRxDiag] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [rxSelectedNeeds, setRxSelectedNeeds] = useState<string[]>([]);
  const [customRxNeedInput, setCustomRxNeedInput] = useState('');
  const [selectedDrugIdx, setSelectedDrugIdx] = useState('');
  const [customDrugName, setCustomDrugName] = useState('');
  const [customDrugDose, setCustomDrugDose] = useState('');
  const [customDrugInstructions, setCustomDrugInstructions] = useState('');
  const [activeDrugs, setActiveDrugs] = useState<Array<{ name: string; dose: string; instructions?: string }>>([
    { name: "Augmentin 1g Tab", dose: "قرص كل 12 ساعة", instructions: "لمدة 7 أيام بعد الطعام" },
    { name: "Panadol Extra", dose: "قرص 3 مرات يومياً", instructions: "عند اللزوم بعد الأكل" }
  ]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // Clinic identification
  const currentClinicId = currentUser?.clinicId || 'master';
  const currentClinic = state.clinics.find(c => c.id === currentClinicId);

  // Default / Loaded Prescription Settings
  const defaultRxSettings: PrescriptionSettings = {
    headerTitle: currentClinic ? currentClinic.name : "مستشفى ومنظومة رعاية التخصصية",
    headerSubtitle: currentClinic?.specialty ? `مركز ${currentClinic.specialty} التخصصي` : "العيادات الخارجية والاستشارات التخصصية",
    clinicName: currentClinic?.name || "المركز الطبي المتكامل",
    clinicAddress: "جمهورية مصر العربية - القاهرة - مجمع العيادات التخصصية",
    clinicPhones: currentClinic?.phone || "01065826742 / 0123456789",
    doctorName: currentUser?.name || currentClinic?.docName || "د. صبري الديب",
    doctorTitle: "استشاري أول الجراحة العامة والمناظير",
    specialty: currentClinic?.specialty || "جراحة عامة وأورام ومناظير متقدمة",
    notesFooter: "• يرجى الالتزام بالجرعات ومواعيد تناول الدواء.\n• إعادة الكشف مجاناً خلال 14 يوماً من تاريخ الزيارة.\n• يرجى إحضار الروشتة ونتائج الفحوصات عند كل زيارة.",
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

  const savedSettings: PrescriptionSettings = {
    ...defaultRxSettings,
    ...(state.rxSettingsStore?.[currentClinicId] || state.rxSettingsStore?.['master'] || {})
  };

  const [settingsForm, setSettingsForm] = useState<PrescriptionSettings>(savedSettings);

  // Synchronize when clinic or store changes
  useEffect(() => {
    const activeStoreSettings = state.rxSettingsStore?.[currentClinicId] || state.rxSettingsStore?.['master'];
    if (activeStoreSettings) {
      setSettingsForm({
        ...defaultRxSettings,
        ...activeStoreSettings
      });
    }
  }, [currentClinicId, state.rxSettingsStore]);

  const getAllClinicPatients = () => {
    const map = new Map<string, { name: string; age?: string; phone?: string; source: string; lastVisit?: string; diagnosis?: string }>();

    // 1. Current Queue Patients
    const qList: any[] = currentClinicId === 'master'
      ? (Object.values(state.queue).flat() as any[])
      : (state.queue[currentClinicId] || []);
    qList.forEach(p => {
      if (p.name) {
        map.set(p.name, {
          name: p.name,
          age: p.age,
          phone: p.phone,
          source: 'طابور كشوفات اليوم (الاستقبال)',
          lastVisit: p.date || p.isoDate
        });
      }
    });

    // 2. Archived Past Examinations (كشوفات منتهية)
    const archList: any[] = currentClinicId === 'master'
      ? (Object.values(state.archive).flat() as any[])
      : (state.archive[currentClinicId] || []);
    archList.forEach(p => {
      if (p.name) {
        const ex = map.get(p.name);
        if (!ex) {
          map.set(p.name, {
            name: p.name,
            age: p.age,
            phone: p.phone,
            source: 'أرشيف الكشوفات والزيارات السابقة',
            lastVisit: p.date || p.isoDate
          });
        } else {
          if (!ex.age && p.age) ex.age = p.age;
          if (!ex.phone && p.phone) ex.phone = p.phone;
        }
      }
    });

    // 3. Appointments
    const apptList: any[] = currentClinicId === 'master'
      ? (Object.values(state.appointments).flat() as any[])
      : (state.appointments[currentClinicId] || []);
    apptList.forEach(a => {
      if (a.patientName) {
        const ex = map.get(a.patientName);
        if (!ex) {
          map.set(a.patientName, {
            name: a.patientName,
            age: a.age,
            phone: a.phone,
            source: 'جدول المواعيد والحجوزات',
            lastVisit: a.date
          });
        } else {
          if (!ex.age && a.age) ex.age = a.age;
          if (!ex.phone && a.phone) ex.phone = a.phone;
        }
      }
    });

    // 4. ER Store
    const erList: any[] = currentClinicId === 'master'
      ? (Object.values(state.erStore).flat() as any[])
      : (state.erStore[currentClinicId] || []);
    erList.forEach(e => {
      if (e.name) {
        const ex = map.get(e.name);
        if (!ex) {
          map.set(e.name, {
            name: e.name,
            age: e.age,
            phone: e.phone,
            source: 'قسم الطوارئ ER',
            diagnosis: e.chiefComplaint
          });
        }
      }
    });

    // 5. Inpatients
    const inpList: any[] = currentClinicId === 'master'
      ? (Object.values(state.inpatientStore).flat() as any[])
      : (state.inpatientStore[currentClinicId] || []);
    inpList.forEach(inp => {
      if (inp.patientName) {
        const ex = map.get(inp.patientName);
        if (!ex) {
          map.set(inp.patientName, {
            name: inp.patientName,
            age: inp.age,
            phone: inp.phone,
            source: 'أقسام الإقامة بالمستشفى',
            diagnosis: inp.diagnosis
          });
        }
      }
    });

    // 6. Rx Store History
    const rxList: any[] = currentClinicId === 'master'
      ? (Object.values(state.rxStore).flat() as any[])
      : (state.rxStore[currentClinicId] || []);
    rxList.forEach(rx => {
      const pName = rx.patientName || rx.name;
      if (pName) {
        const ex = map.get(pName);
        if (!ex) {
          map.set(pName, {
            name: pName,
            source: 'سجل الروشتات المكتوبة سابقاً',
            lastVisit: rx.date,
            diagnosis: rx.diag
          });
        } else {
          if (!ex.diagnosis && rx.diag) ex.diagnosis = rx.diag;
        }
      }
    });

    return Array.from(map.values());
  };

  const allClinicPatients = getAllClinicPatients();
  const uniquePatients = allClinicPatients.map(p => p.name);

  // Auto populate patient details on selection
  const handlePatientSelect = (name: string) => {
    setRxPatient(name);
    const found = allClinicPatients.find(p => p.name === name);
    if (found) {
      if (found.age) setPatientAge(found.age);
      if (found.phone) setPatientPhone(found.phone);
      if (found.diagnosis && !rxDiag) setRxDiag(found.diagnosis);
    }
  };

  const clinicDrugs = state.drugs.filter(d => currentUser?.clinicId === 'master' || d.clinicId === String(currentUser?.clinicId) || !d.clinicId);

  const addSelectedDrug = () => {
    if (selectedDrugIdx === '') return;
    const drug = clinicDrugs[parseInt(selectedDrugIdx)];
    if (drug) {
      setActiveDrugs([...activeDrugs, { name: drug.name, dose: drug.dose }]);
      setSelectedDrugIdx('');
    }
  };

  const addPresetDrug = (drug: { name: string; dose: string }) => {
    setActiveDrugs([...activeDrugs, { ...drug }]);
  };

  const addCustomDrug = () => {
    if (!customDrugName.trim()) return;
    setActiveDrugs([
      ...activeDrugs, 
      { 
        name: customDrugName.trim(), 
        dose: customDrugDose.trim() || 'قرص يومياً', 
        instructions: customDrugInstructions.trim() 
      }
    ]);
    setCustomDrugName('');
    setCustomDrugDose('');
    setCustomDrugInstructions('');
  };

  const removeDrug = (index: number) => {
    setActiveDrugs(activeDrugs.filter((_, i) => i !== index));
  };

  const isDeveloper = currentUser?.role === 'master_admin' || currentUser?.username === 'sapry eldeep' || currentUser?.id === 'master';

  const applySpecialtyTemplate = (key: string) => {
    if (!isDeveloper) {
      alert('عذراً، تغيير وقوالب تخصص العيادة محمي ومتاح للمطور الرئيسي فقط.');
      return;
    }
    const tpl = PRESET_SPECIALTY_TEMPLATES[key];
    if (tpl) {
      setSettingsForm(prev => ({
        ...prev,
        ...tpl
      }));
    }
  };

  const saveRxSettings = () => {
    const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
    const allowPrescriptionCustomHeader = isDeveloper || (currentClinic?.allowPrescriptionCustomHeader !== false);

    if (!allowPrescriptionCustomHeader && settingsForm.useCustomHeaderImage) {
      alert('عفواً، تم إيقاف صلاحية تخصيص هيدر/ترويسة الروشتة الخارجية من قبل المطور لهذه المنشأة.');
      return;
    }

    let finalForm = { ...settingsForm };
    if (!isDeveloper) {
      // Revert specialty to original if attempted change by non-developer
      finalForm.specialty = savedSettings.specialty;
    }
    const updatedStore = {
      ...(state.rxSettingsStore || {}),
      [currentClinicId]: finalForm
    };
    updateState({ rxSettingsStore: updatedStore });
    logAction('تحديث إعدادات الروشتة', `تم تحديث قالب وترويسة الروشتة لـ: ${finalForm.clinicName}`);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  const printRx = () => {
    const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
    if (currentClinic?.allowPrinting === false) {
      return alert('عفواً، تم إيقاف خدمة طباعة الروشتات والمستندات لهذه المنشأة من قبل المطور العام. يرجى التواصل مع المطور لتفعيل الصلاحية.');
    }

    // خصم الأدوية تلقائياً من مخزون الصيدلية عند وجودها
    if (activeDrugs.length > 0 && state.inventory) {
      const updatedInventory = [...state.inventory];
      let inventoryChanged = false;

      activeDrugs.forEach(rxDrug => {
        const itemIdx = updatedInventory.findIndex(
          i => (i.name || '').trim().toLowerCase() === (rxDrug.name || '').trim().toLowerCase() && 
               (i.clinicId === currentClinicId || currentClinicId === 'master')
        );

        if (itemIdx >= 0) {
          updatedInventory[itemIdx] = {
            ...updatedInventory[itemIdx],
            quantity: Math.max(0, updatedInventory[itemIdx].quantity - 1)
          };
          inventoryChanged = true;
        }
      });

      if (inventoryChanged) {
        updateState({ inventory: updatedInventory });
      }
    }

    // حفظ في سجل تاريخ روشتات المريض
    if (rxPatient) {
      const currentPatientRx = state.rxStore?.[rxPatient] || [];
      const newEntry = {
        date: new Date().toISOString().split('T')[0],
        diag: rxDiag || 'كشف طبي دوري',
        drugs: activeDrugs
      };
      updateState({
        rxStore: {
          ...(state.rxStore || {}),
          [rxPatient]: [newEntry, ...currentPatientRx]
        }
      });

      logAction(
        'طباعة وصرف روشتة علاجية',
        `تم تحرير وصرف روشتة علاجية للمريض «${rxPatient}» بتشخيص «${rxDiag || 'كشف دوري'}» تحتوي على ${activeDrugs.length} أصناف دوائية.`,
        'medical',
        { operationType: 'create', targetName: rxPatient }
      );
    }
    
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
          <div>
            <h5 className="font-black text-slate-800 text-base">منظومة الوصفات الطبية والروشتات الإلكترونية</h5>
            <p className="text-xs text-slate-500 font-semibold">تحرير وطباعة وتخصيص قوالب وترويسة الروشتة لكافة التخصصات الطبية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Stethoscope size={16} /> تحرير الروشتة والأدوية
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders size={16} /> إعدادات وتخصيص قالب الروشتة
          </button>

          <button
            onClick={printRx}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all mr-2"
          >
            <Printer size={16} /> طباعة الروشتة (A4 / A5)
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs print:hidden animate-fade-in">
          <Check size={18} className="text-emerald-600 shrink-0" />
          تم حفظ إعدادات وترويسة الروشتة واعتمادها كقالب رسمي للمنشأة بنجاح!
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side Controls (Rx Creator OR Settings Form) */}
        <div className="xl:col-span-5 space-y-6 print:hidden">
          
          {activeTab === 'create' ? (
            /* Tab 1: Prescription Content Form */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h6 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Stethoscope size={18} className="text-blue-600" /> بيانات المريض والتشخيص
                </h6>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Settings size={14} /> تخصيص الترويسة
                </button>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Patient selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-600">اسم المريض</label>
                    <button
                      type="button"
                      onClick={() => setShowPatientSearchModal(true)}
                      className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Search size={12} /> بحث في الكشوفات والأرشيف ({allClinicPatients.length})
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="اكتب اسم المريض أو اختر من القائمة..."
                      value={rxPatient} 
                      onChange={e => setRxPatient(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    {uniquePatients.length > 0 && (
                      <select 
                        value="" 
                        onChange={e => handlePatientSelect(e.target.value)}
                        className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 max-w-[130px]"
                      >
                        <option value="">من الكشوفات...</option>
                        {uniquePatients.map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">العمر / السن</label>
                    <input 
                      type="text" 
                      placeholder="مثال: 32 سنة"
                      value={patientAge} 
                      onChange={e => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
                    <input 
                      type="text" 
                      placeholder="010XXXXXXXX"
                      value={patientPhone} 
                      onChange={e => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Quick Diagnosis & Drugs Protocol Selector */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-indigo-600 shrink-0" />
                      بروتوكولات التشخيص والروشتات الجاهزة (تحميل بضغطة زر واحدة):
                    </label>
                    <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                      {(state.diagnosisProtocols || []).length} نموذج جاهز
                    </span>
                  </div>
                  
                  <select
                    value=""
                    onChange={e => {
                      const pId = e.target.value;
                      if (!pId) return;
                      const proto = (state.diagnosisProtocols || []).find(p => p.id === pId);
                      if (proto) {
                        setRxDiag(proto.diagnosisName);
                        setActiveDrugs(proto.drugs.map(d => ({ name: d.name, dose: d.dose })));
                        if (proto.notes) setRxNotes(proto.notes);
                        if (proto.needs && proto.needs.length > 0) setRxSelectedNeeds(proto.needs);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 shadow-2xs"
                  >
                    <option value="">-- اختر تشخيصاً مسبقاً لتحميل التشخيص وأدويته بالجرعات فوراً --</option>
                    {(state.diagnosisProtocols || []).map(p => (
                      <option key={p.id} value={p.id}>
                        🩺 {p.diagnosisName} ({p.drugs.length} أدوية بجرعاتها)
                      </option>
                    ))}
                  </select>

                  {/* Fast Protocol Quick Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {(state.diagnosisProtocols || []).slice(0, 6).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setRxDiag(p.diagnosisName);
                          setActiveDrugs(p.drugs.map(d => ({ name: d.name, dose: d.dose })));
                          if (p.notes) setRxNotes(p.notes);
                          if (p.needs && p.needs.length > 0) setRxSelectedNeeds(p.needs);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-900 transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                        title="تحميل التشخيص بجميع أدوية وجرعات هذا البروتوكول"
                      >
                        <span>⚡ {p.diagnosisName.split('(')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">التشخيص الطبي (Diagnosis)</label>
                  <input 
                    type="text" 
                    placeholder="مثال: التهاب الشعب الهوائية الحاد - Acute Bronchitis..."
                    value={rxDiag} 
                    onChange={e => setRxDiag(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Quick Preset Meds Section */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-blue-700 mb-2 flex items-center justify-between">
                    <span>أدوية سريعة وشائعة بنقرة واحدة:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    {COMMON_DRUGS_PRESETS.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addPresetDrug(d)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                      >
                        + {d.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Drug Input */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Plus size={14} className="text-blue-600" /> إضافة دواء مخصص جديد:
                  </div>
                  <input 
                    type="text" 
                    placeholder="اسم الدواء (مثال: Augmentin 1g Tab)..."
                    value={customDrugName} 
                    onChange={e => setCustomDrugName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="الجرعة (قرص كل 12 ساعة)..."
                      value={customDrugDose} 
                      onChange={e => setCustomDrugDose(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="التعليمات (بعد الأكل لمدة أسبوع)..."
                      value={customDrugInstructions} 
                      onChange={e => setCustomDrugInstructions(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={addCustomDrug}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Plus size={15} /> إدراج الدواء في الروشتة
                  </button>
                </div>

                {/* Active Drugs List */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">الأدوية المدرجة في الروشتة ({activeDrugs.length}):</span>
                    {activeDrugs.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setActiveDrugs([])} 
                        className="text-[11px] font-bold text-red-500 hover:underline"
                      >
                        مسح الكل
                      </button>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto custom-scrollbar">
                    {activeDrugs.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                        لم تقم بإضافة أدوية بعد، استخدم الأزرار أعلاه لإضافة الأدوية
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {activeDrugs.map((d, i) => (
                          <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex-1 pr-2">
                              <span className="block text-xs font-bold text-slate-900">{i + 1}. {d.name}</span>
                              <span className="text-[11px] text-blue-700 font-semibold">{d.dose}</span>
                              {d.instructions && <span className="text-[10px] text-slate-500 block">{d.instructions}</span>}
                            </div>
                            <button 
                              onClick={() => removeDrug(i)} 
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Current Rx as Protocol Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!rxDiag.trim()) {
                        alert('يرجى كِتابة اسم التشخيص الطبي أولاً لتخزينه كبروتوكول.');
                        return;
                      }
                      if (activeDrugs.length === 0) {
                        alert('يرجى إضافة أدوية في الروشتة أولاً لتخزينها مع التشخيص.');
                        return;
                      }
                      const newProto: DiagnosisProtocol = {
                        id: 'dp_' + Date.now(),
                        diagnosisName: rxDiag.trim(),
                        specialty: settingsForm.specialty || 'عام',
                        drugs: activeDrugs.map(d => ({ name: d.name, dose: d.dose })),
                        notes: rxNotes,
                        needs: [...rxSelectedNeeds]
                      };
                      updateState({
                        diagnosisProtocols: [...(state.diagnosisProtocols || []), newProto]
                      });
                      logAction('حفظ بروتوكول روشتة', `إضافة بروتوكول جديد: ${rxDiag}`);
                      alert(`تم حفظ بروتوكول التشخيص "${rxDiag}" وأدويته (${activeDrugs.length} أدوية) كنموذج جاهز بنجاح!`);
                    }}
                    className="w-full mt-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <BookmarkPlus size={16} className="text-indigo-600" />
                    حفظ هذا التشخيص والأدوية كبروتوكول مسبق للروشتات
                  </button>
                </div>

                {/* Additional Clinical Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات أو تحاليل مطلوبة للمريض</label>
                  <textarea 
                    rows={2}
                    placeholder="ملاحظات إضافية، تحاليل مطلوبة، أو راحة تامة لمدة..."
                    value={rxNotes} 
                    onChange={e => setRxNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Specialty Patient Needs & Care Supplies Quick Selector */}
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShoppingBag size={15} className="text-emerald-600" />
                      احتياجات ومستلزمات المريض الخاصة بالتخصص ({settingsForm.specialty || 'عام'}):
                    </span>
                    {rxSelectedNeeds.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setRxSelectedNeeds([])} 
                        className="text-[10px] font-bold text-red-600 hover:underline"
                      >
                        مسح ({rxSelectedNeeds.length})
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">حدد المستلزمات أو الإرشادات التي تريد طباعتها على روشتة المريض:</p>
                  
                  <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
                    {getPatientNeedsForSpecialty(settingsForm.specialty || '').map(need => {
                      const isChecked = rxSelectedNeeds.includes(need.title);
                      return (
                        <label 
                          key={need.id} 
                          className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                            isChecked ? 'bg-emerald-600 text-white border-emerald-700 font-bold' : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-100/40'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setRxSelectedNeeds(rxSelectedNeeds.filter(n => n !== need.title));
                              } else {
                                setRxSelectedNeeds([...rxSelectedNeeds, need.title]);
                              }
                            }}
                            className="mt-0.5 rounded text-emerald-600 w-3.5 h-3.5"
                          />
                          <div>
                            <span>{need.title}</span>
                            {need.description && <span className={`block text-[10px] ${isChecked ? 'text-emerald-100' : 'text-slate-500'}`}>{need.description}</span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <input 
                      type="text" 
                      placeholder="إضافة تلبية/مستلزم آخر..."
                      value={customRxNeedInput}
                      onChange={e => setCustomRxNeedInput(e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (customRxNeedInput.trim()) {
                          setRxSelectedNeeds([...rxSelectedNeeds, customRxNeedInput.trim()]);
                          setCustomRxNeedInput('');
                        }
                      }}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs"
                    >
                      + إضافة
                    </button>
                  </div>
                </div>

                <button 
                  onClick={printRx}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> معاينة وطباعة الروشتة الفورية
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Prescription Header & Layout Settings */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h6 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders size={18} className="text-blue-600" /> إعدادات وترويسة الروشتة الرسمية
                </h6>
                <button
                  type="button"
                  onClick={saveRxSettings}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs"
                >
                  <Save size={14} /> حفظ الإعدادات
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Facility Type Selector */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Building size={16} className="text-blue-600" /> نوع المنشأة الطبية في ترويسة الروشتة:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, facilityType: 'clinic' })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        (settingsForm.facilityType || 'clinic') === 'clinic'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Stethoscope size={18} className="mx-auto mb-1" />
                      <span className="block text-xs font-bold">عيادة خاصة</span>
                      <span className="text-[10px] opacity-80 block">طبيب منفرد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, facilityType: 'center' })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settingsForm.facilityType === 'center'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 size={18} className="mx-auto mb-1" />
                      <span className="block text-xs font-bold">مركز طبي</span>
                      <span className="text-[10px] opacity-80 block">تخصصات متعدة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, facilityType: 'hospital' })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settingsForm.facilityType === 'hospital'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Hospital size={18} className="mx-auto mb-1" />
                      <span className="block text-xs font-bold">مستشفى عام</span>
                      <span className="text-[10px] opacity-80 block">كافة الأقسام</span>
                    </button>
                  </div>
                </div>

                {/* Specialty Header Config */}
                <div className={`p-3.5 rounded-xl border ${!isDeveloper ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      التخصص أو الأقسام المطبوعة في ترويسة الروشتة (Printed Specialty Header)
                    </label>
                    {!isDeveloper ? (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Lock size={12} className="text-amber-700" /> متاح للمطور الرئيسي فقط
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ صلاحية المطور نشطة
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <select
                      disabled={!isDeveloper}
                      value={MEDICAL_SPECIALTIES.some(s => s.name === settingsForm.specialty) ? settingsForm.specialty : ''}
                      onChange={e => {
                        if (isDeveloper && e.target.value) {
                          setSettingsForm({ ...settingsForm, specialty: e.target.value });
                        }
                      }}
                      className={`w-1/2 px-3 py-2 border rounded-xl text-xs font-bold text-slate-800 ${
                        !isDeveloper 
                          ? 'bg-slate-200/80 text-slate-500 border-slate-300 cursor-not-allowed' 
                          : 'bg-white border-slate-200 focus:outline-none focus:border-blue-500'
                      }`}
                    >
                      <option value="">اختر تخصص رئيسي...</option>
                      {MEDICAL_SPECIALTIES.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      disabled={!isDeveloper}
                      value={settingsForm.specialty ?? ''}
                      onChange={e => {
                        if (isDeveloper) {
                          setSettingsForm({ ...settingsForm, specialty: e.target.value });
                        }
                      }}
                      placeholder={!isDeveloper ? "تعديل التخصص متاح للمطور فقط..." : "أو اكتب اسم التخصص / الأقسام بدقة..."}
                      className={`w-1/2 px-3 py-2 border rounded-xl text-xs font-bold text-slate-800 ${
                        !isDeveloper 
                          ? 'bg-slate-200/80 text-slate-500 border-slate-300 cursor-not-allowed' 
                          : 'bg-white border-slate-200 focus:outline-none focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {!isDeveloper && (
                    <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-300/70 flex items-center gap-1.5 mt-2">
                      <ShieldAlert size={15} className="text-amber-700 shrink-0" />
                      إعداد وتعديل تخصص المنشأة محمي ومتاح حصرياً للمطور الرئيسي ولا يجوز تعديله من قبل الطبيب أو موظفي المنشأة.
                    </div>
                  )}
                </div>

                {/* Specialty Preset Templates */}
                <div className={!isDeveloper ? 'opacity-60 pointer-events-none' : ''}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">نماذج وقوالب جاهزة حسب التخصص والمنشأة:</label>
                    {!isDeveloper && (
                      <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                        <Lock size={10} /> مقفلة
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.keys(PRESET_SPECIALTY_TEMPLATES).map(key => {
                      const names: Record<string, string> = {
                        general: 'عيادة باطنة',
                        hospital: 'مستشفى عام',
                        center: 'مركز أوعية وسكر',
                        pediatrics: 'عيادة أطفال',
                        dental: 'مركز أسنان',
                        cardio: 'مركز قلب',
                        ortho: 'عيادة عظام',
                        derma: 'عيادة جلدية'
                      };
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={!isDeveloper}
                          onClick={() => applySpecialtyTemplate(key)}
                          className={`px-2 py-1.5 border text-slate-700 text-[11px] font-bold rounded-lg transition-colors text-center truncate ${
                            !isDeveloper 
                              ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400' 
                              : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                          }`}
                        >
                          {names[key] || key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Header Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطبيب أو المدير الفني</label>
                    <input 
                      type="text" 
                      value={settingsForm.doctorName ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, doctorName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اللقب والدرجات العلمية للطبيب</label>
                    <input 
                      type="text" 
                      value={settingsForm.doctorTitle ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, doctorTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                      placeholder="استشاري أول - دكتوراه ومدرس الجراحة - زميل الكلية الملكية..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنشأة أو العيادة</label>
                    <input 
                      type="text" 
                      value={settingsForm.headerTitle ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, headerTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">السطر التوضيحي للترويسة (Subtitle)</label>
                    <input 
                      type="text" 
                      value={settingsForm.headerSubtitle ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, headerSubtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المنشأة / العيادة</label>
                    <input 
                      type="text" 
                      value={settingsForm.clinicAddress ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, clinicAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">أرقام الهواتف والحجز والاستعلام</label>
                    <input 
                      type="text" 
                      value={settingsForm.clinicPhones ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, clinicPhones: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تعليمات وتنبيهات أسفل الروشتة (Footer Notes)</label>
                    <textarea 
                      rows={3}
                      value={settingsForm.notesFooter ?? ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, notesFooter: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Styling Options */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Palette size={15} className="text-blue-600" /> خيارات المظهر والألوان والتخطيط:
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">لون السمة الرئيسي</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={settingsForm.themeColor} 
                          onChange={e => setSettingsForm({ ...settingsForm, themeColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono font-semibold text-slate-700">{settingsForm.themeColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">رمز الـ Rx</label>
                      <select
                        value={settingsForm.rxSymbolStyle}
                        onChange={e => setSettingsForm({ ...settingsForm, rxSymbolStyle: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        <option value="modern">عصري كلاسيكي (Modern Rx)</option>
                        <option value="caduceus">رمز الطب العالمي (Caduceus)</option>
                        <option value="classic">كتابة لاتينية (Classic Rx)</option>
                        <option value="minimal">بسيط وناعم (Minimal)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.showQrCode}
                        onChange={e => setSettingsForm({ ...settingsForm, showQrCode: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span>إظهار رمز التحقق الرقمي (QR Code للتحقق من صحة الروشتة)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.showWatermark}
                        onChange={e => setSettingsForm({ ...settingsForm, showWatermark: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span>إظهار العلامة المائية في خلفية الروشتة</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.showPatientAgeAndPhone}
                        onChange={e => setSettingsForm({ ...settingsForm, showPatientAgeAndPhone: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span>إظهار سن ورقم هاتف المريض في الترويسة</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.showDiagnosis}
                        onChange={e => setSettingsForm({ ...settingsForm, showDiagnosis: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span>إظهار خانة التشخيص الطبي</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={saveRxSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  <Save size={16} /> حفظ إعدادات الروشتة وتطبيقها فوراً
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Live Prescription Paper Preview & Print Target */}
        <div className="xl:col-span-7">
          <div 
            className="bg-white border-2 rounded-2xl p-8 min-h-[750px] relative shadow-lg print:fixed print:inset-0 print:z-[9999] print:m-0 print:w-full print:h-full print:border-0 print:shadow-none print:rounded-none flex flex-col justify-between"
            style={{ borderColor: settingsForm.themeColor }}
          >
            {/* Watermark */}
            {settingsForm.showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <Stethoscope size={350} strokeWidth={1} style={{ color: settingsForm.themeColor }} />
              </div>
            )}

            <div>
              {/* Prescription Header */}
              <div className="flex justify-between items-start border-b-2 pb-5 mb-5 relative" style={{ borderColor: `${settingsForm.themeColor}30` }}>
                <div className="flex-1 pr-1">
                  <h1 className="text-2xl font-black m-0" style={{ color: settingsForm.themeColor }}>
                    {settingsForm.doctorName || 'د. صبري الديب'}
                  </h1>
                  <p className="text-sm font-bold text-slate-700 m-0 mt-0.5">
                    {settingsForm.doctorTitle || 'استشاري أول'}
                  </p>
                  <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{settingsForm.specialty || 'تخصص عام'}</span>
                    <span>{settingsForm.headerSubtitle}</span>
                  </div>
                </div>

                <div className="text-left flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: settingsForm.themeColor }}>
                      {settingsForm.headerTitle || 'رعاية ERP'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">{settingsForm.clinicPhones}</span>
                  {currentClinic?.taxId && settingsForm.showTaxAndVat && (
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">الرقم الضريبي: {currentClinic.taxId}</span>
                  )}
                </div>
              </div>

              {/* Patient Bar */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">اسم المريض:</span>
                  <strong className="text-slate-900 text-sm font-black">{rxPatient || '................................'}</strong>
                </div>
                
                {settingsForm.showPatientAgeAndPhone && (
                  <>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">العمر / السن:</span>
                      <strong className="text-slate-800">{patientAge || '---'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">الهاتف:</span>
                      <strong className="text-slate-800">{patientPhone || '---'}</strong>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-slate-500 block text-[10px] font-bold">التاريخ:</span>
                  <strong className="text-slate-800 font-mono">{getFormattedDateTime()}</strong>
                </div>
              </div>

              {/* Diagnosis if enabled */}
              {settingsForm.showDiagnosis && rxDiag && (
                <div className="mb-5 px-3 py-2 bg-blue-50/50 border-r-4 rounded-l-lg border-blue-600 text-xs">
                  <strong className="text-blue-900 ml-1">التشخيص الطبي:</strong>
                  <span className="text-slate-800 font-bold">{rxDiag}</span>
                </div>
              )}

              {/* Rx Body & Drugs */}
              <div className="min-h-[360px] relative">
                {/* Rx Symbol */}
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <span 
                    className="text-4xl font-serif font-black italic tracking-tighter" 
                    style={{ color: settingsForm.themeColor }}
                  >
                    ℞
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prescription Medicines</span>
                </div>

                {activeDrugs.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl">
                    <span className="text-sm font-bold text-slate-400">لا توجد أدوية مضافة حالياً في الروشتة</span>
                  </div>
                ) : (
                  <ul className="space-y-4 pr-3">
                    {activeDrugs.map((d, i) => (
                      <li key={i} className="border-b border-slate-100 pb-3 last:border-0 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-slate-400 font-mono">{i + 1}.</span>
                            <strong className="text-base font-black text-slate-900 font-serif tracking-wide">{d.name}</strong>
                          </div>
                          <div className="pr-6 mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-md border border-blue-100">
                              {d.dose}
                            </span>
                            {d.instructions && (
                              <span className="text-slate-600 font-medium">
                                - {d.instructions}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {rxNotes && (
                  <div className="mt-4 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>إرشادات إضافية:</strong> {rxNotes}
                  </div>
                )}

                {rxSelectedNeeds.length > 0 && (
                  <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                    <strong className="block text-emerald-900 mb-1 border-b border-emerald-200/60 pb-1">
                      المستلزمات واحتياجات المريض الموصى بها ({settingsForm.specialty || 'التخصص'}):
                    </strong>
                    <ul className="list-disc pr-5 space-y-0.5 font-semibold text-slate-800">
                      {rxSelectedNeeds.map((need, i) => (
                        <li key={i}>{need}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Prescription Footer */}
            <div className="border-t-2 pt-4 mt-6 flex flex-col md:flex-row justify-between items-end gap-4" style={{ borderColor: `${settingsForm.themeColor}30` }}>
              <div className="text-[11px] text-slate-500 space-y-1 max-w-md">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={12} className="text-blue-600" />
                  {settingsForm.clinicAddress}
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={12} className="text-emerald-600" />
                  للاستعلام وحجز الاستشارات: {settingsForm.clinicPhones}
                </div>
                {settingsForm.notesFooter && (
                  <div className="whitespace-pre-line text-[10px] text-slate-400 font-semibold pt-1">
                    {settingsForm.notesFooter}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {settingsForm.showQrCode && (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-1 shadow-2xs">
                      <QrCode size={46} className="text-slate-800" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 block mt-0.5">تحقق رقمي ✓</span>
                  </div>
                )}

                <div className="text-center min-w-[130px] border-r border-slate-200 pr-4">
                  <span className="block text-[10px] text-slate-400 font-bold mb-1">توقيع وخاتم الطبيب</span>
                  <div className="h-9 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                    <strong className="text-xs font-serif font-black" style={{ color: settingsForm.themeColor }}>
                      {settingsForm.doctorName || 'د. الطبيب'}
                    </strong>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">ترخيص مزاولة المهنة معتمد</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      {/* EMR Patient Search Modal */}
      {showPatientSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">البحث الشامل عن المريض في الكشوفات والمواعيد</h3>
                  <p className="text-xs text-slate-500">اختر المريض لاستيراد بياناته وتلقائياً في الروشتة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPatientSearchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="my-4">
              <div className="relative">
                <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث باسم المريض، رقم الهاتف، أو التشخيص..."
                  value={patientSearchQuery}
                  onChange={e => setPatientSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {allClinicPatients
                .filter(p => {
                  if (!patientSearchQuery.trim()) return true;
                  const q = patientSearchQuery.trim().toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    (p.phone && p.phone.includes(q)) ||
                    (p.diagnosis && p.diagnosis.toLowerCase().includes(q)) ||
                    (p.source && p.source.toLowerCase().includes(q))
                  );
                })
                .map((patient, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      handlePatientSelect(patient.name);
                      setShowPatientSearchModal(false);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-blue-600 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600">{patient.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">{patient.source}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                        {patient.age && <span>العمر: {patient.age}</span>}
                        {patient.phone && <span>الهاتف: {patient.phone}</span>}
                        {patient.lastVisit && <span>تاريخ/آخر زيارة: {patient.lastVisit}</span>}
                        {patient.diagnosis && <span className="text-indigo-600 font-bold">التشخيص: {patient.diagnosis}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                    >
                      تحديد المريض ✓
                    </button>
                  </div>
                ))}

              {allClinicPatients.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا يوجد مرضى مسجلين في الكشوفات أو المواعيد حتى الآن.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPatientSearchModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
