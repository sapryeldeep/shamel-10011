export interface SpecialtyFieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
}

export const SPECIALTY_FIELDS_CONFIG: Record<string, SpecialtyFieldConfig[]> = {
  // 1. جراحة الأوعية الدموية
  vascular: [
    { key: 'arterialPulse', label: 'فحص النبض والتدفق الشرياني الطرفي', placeholder: 'Dorsalis Pedis / Posterior Tibial pulses (+2 / Normal / Absent)' },
    { key: 'duplexResult', label: 'نتيجة فحص الدوبلكس الشرياني / الوريدي', placeholder: 'Arterial / Venous Duplex findings, stenosis %, reflux...' },
    { key: 'ceapScore', label: 'تصنيف القصور الوريدي والدوالي (CEAP)', placeholder: 'C0 (No signs) - C6 (Active venous ulcer)' },
    { key: 'claudicationDistance', label: 'مسافة العرج المتقطع (Claudication Distance)', placeholder: 'متر / yards' },
    { key: 'aneurysmNotes', label: 'ملاحظات التمدد الشرياني والانسداد الوعائي', placeholder: 'Aneurysm diameter, thrombus, peripheral bypass status...' }
  ],

  // 2. القدم السكري
  diabetic_foot: [
    { key: 'wagnerGrade', label: 'تصنيف فاغنر للقرح (Wagner Ulcer Grade)', placeholder: 'Grade 0 (Skin intact) to Grade 5 (Gangrene of foot)' },
    { key: 'abiIndex', label: 'مؤشر الضغط الكاحلي العضدي (ABI Index)', placeholder: 'Normal (0.9 - 1.3) / Ischemic (< 0.8)' },
    { key: 'neuropathyExam', label: 'فحص الاعتلال العصبي السكري (Monofilament & Tuning Fork)', placeholder: '10g Monofilament loss, vibration perception threshold...' },
    { key: 'infectionOsteo', label: 'حالة الالتهاب البكتيري وعظام القدم (Osteomyelitis)', placeholder: 'Redness, pus, probe-to-bone test, X-ray bony changes...' },
    { key: 'offloadingDressing', label: 'خطة التضميد والتفريغ للضغط (Offloading & Dressing)', placeholder: 'Cast, shoe, silver dressing, foam, hydrogel...' },
    { key: 'debridementNotes', label: 'ملاحظات التنظيف والقص الجراحي للنسيج الميت', placeholder: 'Surgical / Sharp debridement details and wound bed...' }
  ],

  // 3. الباطنة العامة والجهاز الهضمي
  internal_medicine: [
    { key: 'abdominalExam', label: 'الفحص السريري للبطن والأحشاء', placeholder: 'Soft, lax, tenderness, organomegaly, ascites...' },
    { key: 'liverSpleen', label: 'حالة الكبد والطحال والجهاز الهضمي', placeholder: 'Hepatomegaly, splenomegaly, bowel sounds...' },
    { key: 'endoscopyFindings', label: 'نتائج مناظير الجهاز الهضمي (إن وجدت)', placeholder: 'Gastroscopy / Colonoscopy findings...' }
  ],

  // 4. أمراض القلب
  cardiology: [
    { key: 'ecgResult', label: 'نتائج تخطيط رسم القلب (ECG)', placeholder: 'NSR, ST elevation, T wave inversion, Arrhythmia...' },
    { key: 'echoEf', label: 'كفاءة عضلة القلب بالرسم الصوتي (Echo EF %)', placeholder: 'Ejection Fraction % (e.g. 55%)' },
    { key: 'nyhaClass', label: 'الدرجة الوظيفية للقصور (NYHA Class)', placeholder: 'Class I / Class II / Class III / Class IV' },
    { key: 'heartSounds', label: 'أصوات وصمامات القلب (Murmurs / Gallop)', placeholder: 'S1, S2, Murmur grade and location...' }
  ],

  // 5. العظام وجراحة العظام
  orthopedics: [
    { key: 'affectedBoneJoint', label: 'المفصل أو العظم المصاب', placeholder: 'Right Knee, Left Femur, Lumbar Spine...' },
    { key: 'rangeOfMotion', label: 'مدى الحركة المفصلية (ROM)', placeholder: 'Flexion, Extension, Limitation degrees...' },
    { key: 'deformitySwelling', label: 'التورم والتشوه الفزيائي', placeholder: 'Edema, Hematoma, Deformity, Crepitus...' },
    { key: 'xrayRadiology', label: 'نتائج الأشعة السينية والمقطعية', placeholder: 'Fracture line, displacement, joint space narrowing...' }
  ],

  // 6. الأطفال وحديثي الولادة
  pediatrics: [
    { key: 'childPercentiles', label: 'معدلات النمو (Growth Percentiles)', placeholder: 'Weight %, Height %, Head Circumference %' },
    { key: 'vaccineStatus', label: 'موقف التطعيمات واللقاحات', placeholder: 'Up to date / Missed vaccines...' },
    { key: 'milestones', label: 'التطور الحركي واللغوي (Milestones)', placeholder: 'Head control, sitting, walking, words...' }
  ],

  // 7. النساء والتوليد
  obgyn: [
    { key: 'gestationalAge', label: 'عمر الحمل بالأسابيع (Gestational Age)', placeholder: 'e.g. 28 weeks + 3 days' },
    { key: 'fundalHeight', label: 'ارتفاع قاع الرحم (Fundal Height cm)', placeholder: 'cm' },
    { key: 'fetalHeartRate', label: 'نبض الجنين (FHR bpm)', placeholder: '140 bpm' },
    { key: 'gpaHistory', label: 'تاريخ الحمل والولادة والإجهاض (G / P / A)', placeholder: 'G3 P2 A0' },
    { key: 'ultrasoundNotes', label: 'نتائج السونار التلفزيوني', placeholder: 'BPD, FL, Amniotic Fluid Index, Placenta position...' }
  ],

  // 8. العيون
  ophthalmology: [
    { key: 'visualAcuity', label: 'قياس حدة النظر (Visual Acuity OD / OS)', placeholder: 'Right (OD): 6/6 | Left (OS): 6/9' },
    { key: 'iopPressure', label: 'ضغط العين (Intraocular Pressure IOP)', placeholder: 'OD: 15 mmHg | OS: 16 mmHg' },
    { key: 'fundusRetina', label: 'فحص قاع العين والشبكية', placeholder: 'Optic disc, Macula, Retinal vessels, Diabetic retinopathy...' },
    { key: 'slitLamp', label: 'فحص المصباح الشقي (Slit Lamp)', placeholder: 'Cornea, Lens opacity, Anterior chamber...' }
  ],

  // 9. الجلدية والتجميل
  dermatology: [
    { key: 'lesionDescription', label: 'طبيعة وشكل الآفة الجلدية (Lesion Type)', placeholder: 'Macule, Papule, Plaque, Vesicle, Ulcer...' },
    { key: 'skinLocation', label: 'الموقع الفزيائي للجسم', placeholder: 'Face, Scalp, Trunk, Extremities...' },
    { key: 'fitzpatrickType', label: 'تصنيف نوع البشرة (Fitzpatrick Type)', placeholder: 'Type I / II / III / IV / V / VI' },
    { key: 'dermoscopyNotes', label: 'نتائج فحص منظار الجلدية (Dermoscopy)', placeholder: 'Pigment network, vascular patterns...' }
  ],

  // 10. طب الأسنان
  dentistry: [
    { key: 'toothNumbers', label: 'أرقام الأسنان المتأثرة (Tooth #)', placeholder: 'e.g. #16, #21, #36, #47' },
    { key: 'periodontalPocket', label: 'عمق جيوب اللثة وحالتها', placeholder: 'Normal (1-3mm) / Deep pockets (>4mm)' },
    { key: 'cariesRestoration', label: 'التسوس والتركيبات', placeholder: 'Caries class, root canal treatment needed, crown...' }
  ],

  // 11. الأنف والأذن والحنجرة
  ent: [
    { key: 'otoscopyExam', label: 'فحص الأذن والأغشية الطبلية (Otoscopy)', placeholder: 'Intact membrane, effusion, perforation, wax...' },
    { key: 'nasalExam', label: 'فحص الأنف والجيوب الأنفية', placeholder: 'Septal deviation, turbinate hypertrophy, polyps...' },
    { key: 'laryngoscopyExam', label: 'فحص الحنجرة والأوتار الصوتية', placeholder: 'Vocal cords mobility, nodules, inflammation...' }
  ],

  // 12. المسالك البولية
  urology: [
    { key: 'prostatePsa', label: 'حجم البروستاتا ومؤشر PSA', placeholder: 'Prostate volume, PSA level ng/ml...' },
    { key: 'kidneyStones', label: 'ملاحظات حصوات الكلى والمسالك', placeholder: 'Stone location, size in mm, hydronephrosis...' },
    { key: 'uroflowmetry', label: 'معدل تدفق البول (Uroflowmetry)', placeholder: 'Qmax ml/sec, Voided volume...' }
  ],

  // 13. المخ والأعصاب
  neurology: [
    { key: 'cranialNerves', label: 'فحص الأعصاب القحفية (Cranial Nerves I-XII)', placeholder: 'Intact / Cranial nerve palsy...' },
    { key: 'motorReflexes', label: 'القوة العضلية والمنعكسات (Motor & Reflexes)', placeholder: 'Power 5/5, DTRs normal / hyperreflexia...' },
    { key: 'gcsScale', label: 'مقياس غلاسكو للوعي (GCS Score)', placeholder: 'E4 V5 M6 = 15/15' }
  ],

  // 14. الصدر والجهاز التنفسي
  pulmonology: [
    { key: 'lungAuscultation', label: 'السماع السريري للرئة (Lung Auscultation)', placeholder: 'Clear vesicular / Wheezing / Crepitations...' },
    { key: 'spo2Oxygen', label: 'نسبة تشبع الأكسجين (SpO2 %)', placeholder: '98% on room air' },
    { key: 'spirometry', label: 'وظائف التنفس (Spirometry FEV1/FVC)', placeholder: 'FEV1 %, FVC %, FEV1/FVC ratio...' }
  ],

  // 15. التغذية والسمنة
  nutrition: [
    { key: 'bmiIndex', label: 'مؤشر كتلة الجسم (BMI Index)', placeholder: 'e.g. 28.5 kg/m² (Overweight)' },
    { key: 'bodyFatPercentage', label: 'نسبة الدهون والكتلة العضلية', placeholder: 'Fat %, Muscle mass %, Visceral fat level' },
    { key: 'dietaryPlan', label: 'النظام الغذائي والمقترحات', placeholder: 'Caloric intake goal, macronutrients breakdown...' }
  ]
};

export function getSpecialtyFields(specialtyKeyOrName: string): SpecialtyFieldConfig[] {
  if (!specialtyKeyOrName) return [];
  
  // Try direct match
  if (SPECIALTY_FIELDS_CONFIG[specialtyKeyOrName]) {
    return SPECIALTY_FIELDS_CONFIG[specialtyKeyOrName];
  }

  // Name matching
  if (specialtyKeyOrName.includes('أوعية') || specialtyKeyOrName.includes('vascular')) return SPECIALTY_FIELDS_CONFIG.vascular;
  if (specialtyKeyOrName.includes('قدم سكري') || specialtyKeyOrName.includes('سكري') || specialtyKeyOrName.includes('diabetic_foot')) return SPECIALTY_FIELDS_CONFIG.diabetic_foot;
  if (specialtyKeyOrName.includes('باطنة') || specialtyKeyOrName.includes('هضمي')) return SPECIALTY_FIELDS_CONFIG.internal_medicine;
  if (specialtyKeyOrName.includes('قلب') || specialtyKeyOrName.includes('cardiology')) return SPECIALTY_FIELDS_CONFIG.cardiology;
  if (specialtyKeyOrName.includes('عظام') || specialtyKeyOrName.includes('ortho')) return SPECIALTY_FIELDS_CONFIG.orthopedics;
  if (specialtyKeyOrName.includes('أطفال') || specialtyKeyOrName.includes('pedia')) return SPECIALTY_FIELDS_CONFIG.pediatrics;
  if (specialtyKeyOrName.includes('نساء') || specialtyKeyOrName.includes('توليد') || specialtyKeyOrName.includes('obgyn')) return SPECIALTY_FIELDS_CONFIG.obgyn;
  if (specialtyKeyOrName.includes('عيون') || specialtyKeyOrName.includes('ophthal')) return SPECIALTY_FIELDS_CONFIG.ophthalmology;
  if (specialtyKeyOrName.includes('جلدية') || specialtyKeyOrName.includes('تجميل')) return SPECIALTY_FIELDS_CONFIG.dermatology;
  if (specialtyKeyOrName.includes('أسنان') || specialtyKeyOrName.includes('dental')) return SPECIALTY_FIELDS_CONFIG.dentistry;
  if (specialtyKeyOrName.includes('أنف') || specialtyKeyOrName.includes('أذن') || specialtyKeyOrName.includes('حنجرة')) return SPECIALTY_FIELDS_CONFIG.ent;
  if (specialtyKeyOrName.includes('مسالك') || specialtyKeyOrName.includes('uro')) return SPECIALTY_FIELDS_CONFIG.urology;
  if (specialtyKeyOrName.includes('أعصاب') || specialtyKeyOrName.includes('neuro')) return SPECIALTY_FIELDS_CONFIG.neurology;
  if (specialtyKeyOrName.includes('صدر') || specialtyKeyOrName.includes('رئة')) return SPECIALTY_FIELDS_CONFIG.pulmonology;
  if (specialtyKeyOrName.includes('تغذية') || specialtyKeyOrName.includes('سمنة')) return SPECIALTY_FIELDS_CONFIG.nutrition;

  // Default custom notes field for other specialties
  return [
    { key: 'specialtyCustomNotes', label: 'ملاحظات وفحوصات تخصصية سريرية', placeholder: 'أدخل الملاحظات والنتائج التفصيلية لهذه الزيارة...' }
  ];
}
