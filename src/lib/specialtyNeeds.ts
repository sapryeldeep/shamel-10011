export interface PatientNeedItem {
  id: string;
  category: 'supplies' | 'equipment' | 'diet_lifestyle' | 'tests' | 'care_instruction';
  title: string;
  description?: string;
}

export interface SpecialtyNeedsConfig {
  specialtyKey: string;
  specialtyName: string;
  defaultNeeds: PatientNeedItem[];
  commonInstructions: string[];
}

export const SPECIALTY_PATIENT_NEEDS: Record<string, PatientNeedItem[]> = {
  // 1. جراحة الأوعية الدموية (Vascular Surgery)
  vascular: [
    { id: 'v1', category: 'supplies', title: 'شراب دوالي طبي متدرج الضغط (Class 2 / Class 3)', description: 'يلبس عند الاستيقاظ صباحاً وقبل المشي' },
    { id: 'v2', category: 'equipment', title: 'جهاز فحص ضغط الدم الشرياني الكاحلي (Monofilament & ABPI Pocket)', description: 'لمتابعة التغذية الدموية للأطراف' },
    { id: 'v3', category: 'supplies', title: 'غيارات معقمة وضمادات فضة للأوعية الدموية (Silver Dressings)', description: 'للتقرحات الوريدية والشريانية' },
    { id: 'v4', category: 'tests', title: 'متابعة الدوبلكس الشرياني والوريدي (Arterial / Venous Duplex)', description: 'كل 3 أشهر لمتابعة نفاذية الشرايين والدعامات' },
    { id: 'v5', category: 'care_instruction', title: 'رفع الأطراف السفلية عند الاستلقاء فوق مستوى القلب', description: 'لتخفيف التورم الوريدي والاحتقان' }
  ],

  // 2. العناية بالقدم السكري (Diabetic Foot)
  diabetic_foot: [
    { id: 'df1', category: 'supplies', title: 'حذاء قدم سكري طبي مخصص (Diabetic Custom Offloading Footwear)', description: 'بدون خياطة داخلية ونعل ماص للصدمات' },
    { id: 'df2', category: 'equipment', title: 'جهاز قياس السكر بالدم الرقمي (Glucometer) وشكّاكات معقمة', description: 'قياس صائم وفاطر يومياً' },
    { id: 'df3', category: 'supplies', title: 'ضمادات نسيجية هيدروجيل وفضة (Hydrogel & Foam Dressings)', description: 'لتنظيف وترطيب الجرح وتسريع الالتئام' },
    { id: 'df4', category: 'care_instruction', title: 'فحص القدمين يومياً بالمرآة وتجفيف بين الأصابع جيدا', description: 'تجنب غمر القدم بالماء الساخن أو المشي حافياً نهائياً' },
    { id: 'df5', category: 'tests', title: 'تحليل السكر التراكمي (HbA1c) وفحص عظام القدم الأشعة', description: 'مطلوب كل 3 أشهر' }
  ],

  // 3. الباطنة العامة والجهاز الهضمي (Internal Medicine & Gastroenterology)
  internal_medicine: [
    { id: 'im1', category: 'diet_lifestyle', title: 'نظام غذائي قليل الدهون والألياف المتهرئة / مهدئ للقولون', description: 'تجنب الأطعمة الحارة والمقليات والغازات' },
    { id: 'im2', category: 'supplies', title: 'مطهرات معدية ومكملات بروبيوتيك (Probiotics)', description: 'لتوازن الميكروبيوم الهضمي' },
    { id: 'im3', category: 'tests', title: 'تحليل جرثومة المعدة (H. Pylori) ووظائف كبد وكلى', description: 'فحص دوري سنوي' }
  ],

  // 4. أمراض القلب والأوعية الدموية (Cardiology)
  cardiology: [
    { id: 'c1', category: 'equipment', title: 'جهاز قياس ضغط الدم الإلكتروني المعتمد (BP Monitor)', description: 'قياس مرتين يومياً (صباحاً ومساءً)' },
    { id: 'c2', category: 'supplies', title: 'دفتر سجل متابعة الضغط والنبض اليومي', description: 'تسجيل القراءات لعرضها على الطبيب' },
    { id: 'c3', category: 'diet_lifestyle', title: 'حمية قليلة الصوديوم (Salt-restricted Diet)', description: 'أقل من 2 جرام ملح طعام يومياً' },
    { id: 'c4', category: 'care_instruction', title: 'ملاحظة علامات ضيق التنفس أو تورم القدمين فوراً', description: 'التواصل المباشر في حال زيادة الوزن الفجائية' }
  ],

  // 5. جراحة العظام والمفاصل (Orthopedics)
  orthopedics: [
    { id: 'o1', category: 'equipment', title: 'حزام ظهر طبي / مشد ركبة مفصلي (Lumbosacral / Knee Brace)', description: 'لتثبيت المفصل عند الحركة' },
    { id: 'o2', category: 'equipment', title: 'عكاز طبي ثلاثي أو مشاية (Walker / Crutches)', description: 'لتخفيف الحمل عن الطرف المصاب' },
    { id: 'o3', category: 'supplies', title: 'كمادات جيل باردة ودافئة (Hot/Cold Gel Pack)', description: 'للتبادل عند التورم والألم' },
    { id: 'o4', category: 'care_instruction', title: 'جلسات علاج طبيعي وتأهيل حركي (Physiotherapy)', description: '3 جلسات أسبوعياً حسب الخطة' }
  ],

  // 6. الأطفال وحديثي الولادة (Pediatrics)
  pediatrics: [
    { id: 'p1', category: 'supplies', title: 'محقن مدرج دقيق لجرعات أدوية الشراب (Oral Syringe)', description: 'لإعطاء الجرعة بالمليلتر بالضبط' },
    { id: 'p2', category: 'equipment', title: 'جهاز قياس حرارة الأذن الرقمي أو الجبهة (Digital Thermometer)', description: 'قياس عند الشعور بالسخونة' },
    { id: 'p3', category: 'supplies', title: 'محلول جفاف معتمد (ORAL Rehydration Salts)', description: 'عند أعراض الإسهال أو القيء' },
    { id: 'p4', category: 'care_instruction', title: 'جدول التطعيمات الدورية وتتبع منحنى النمو', description: 'إحضار كارت التطعيمات في كل زيارة' }
  ],

  // 7. النساء والتوليد (OB/GYN)
  obgyn: [
    { id: 'ob1', category: 'supplies', title: 'مكملات حمض الفوليك والحديد والكالسيوم للحوامل', description: 'حسب الثلث الحالي من الحمل' },
    { id: 'ob2', category: 'equipment', title: 'شريط قياس حركة الجنين ومتابعة ركلات الجنين', description: 'تسجيل 10 ركلات يومياً بعد الأسبوع 28' },
    { id: 'ob3', category: 'tests', title: 'سونار تفصيلي رباعي الأبعاد (4D Ultrasound) وفحوصات الدم', description: 'متابعة نمو الجنين والسائل الأمنيوسي' }
  ],

  // 8. العيون وجراحة الشبكية (Ophthalmology)
  ophthalmology: [
    { id: 'oph1', category: 'supplies', title: 'قطرات مرطبة خالية من المواد الحافظة (Preservative-free Artificial Tears)', description: 'كل 4 ساعات' },
    { id: 'oph2', category: 'supplies', title: 'نظارة شمسية طبية بحماية UV400', description: 'تستخدم بعد عمليات الليزك أو توسيع حدقة العين' },
    { id: 'oph3', category: 'care_instruction', title: 'تجنب حك العين أو إدخال الماء لمدة أسبوع بعد الجراحة', description: 'الالتزام بجدول القطرات الحيوية' }
  ],

  // 9. الجلدية والتجميل (Dermatology)
  dermatology: [
    { id: 'd1', category: 'supplies', title: 'واقي شمس واسع الطيف SPF 50+ خالي من الزيوت', description: 'يجدد كل ساعتين عند التعرض للشمس' },
    { id: 'd2', category: 'supplies', title: 'غسول للبشرة الحساسة وكريم مرهم مرمم للجلد (Repair Cream)', description: 'بعد جلسات الليزر أو التقشير' },
    { id: 'd3', category: 'care_instruction', title: 'تجنب التعرض الحراري المباشر والماء الساخن', description: 'الامتناع عن تقشير القشور يدوياً' }
  ],

  // 10. طب وجراحة الأسنان (Dentistry)
  dentistry: [
    { id: 'den1', category: 'supplies', title: 'مضمضة مطهرة بالكلورهيكسيدين (Chlorhexidine Mouthwash 0.12%)', description: 'مرتين يومياً لمدة 7 أيام بعد الجراحة' },
    { id: 'den2', category: 'supplies', title: 'فرشاة أسنان ناعمة جداً (Ultra Soft) وخيط أسنان طبي', description: 'لتنظيف ما حول التركيبات واللثة' },
    { id: 'den3', category: 'care_instruction', title: 'تجنب المشروبات الساخنة والتدخين والمضمضة القوية أول 24 ساعة', description: 'وضغط الشاش لمدة ساعة كاملة بعد الخلع' }
  ],

  // 11. الأنف والأذن والحنجرة (ENT)
  ent: [
    { id: 'ent1', category: 'supplies', title: 'بخاخ غسيل الأنف بمحلول البحر الفسيولوجي (Seawater Nasal Spray)', description: '3 مرات يومياً قبل القطرات' },
    { id: 'ent2', category: 'equipment', title: 'سدادات أذن طبية مضادة للماء (Waterproof Earplugs)', description: 'تستعمل أثناء الاستحمام عند وجود ثقب بطبلة الأذن' },
    { id: 'ent3', category: 'care_instruction', title: 'تجنب التمخط الشديد أو تنظيف الأذن بأعواد القطن', description: 'حماية الأذن من وصول الماء' }
  ],

  // 12. المسالك البولية (Urology)
  urology: [
    { id: 'u1', category: 'care_instruction', title: 'شرب ما لا يقل عن 3 لترات ماء يومياً', description: 'لتفتيت الحصوات وتطهير مجرى البول' },
    { id: 'u2', category: 'supplies', title: 'فوار مطهر ومذيب للحصوات (Uralyt / Coli-Urodinal)', description: 'حسب حمضية وقلوية البول' },
    { id: 'u3', category: 'tests', title: 'تحليل ومزرعة بول وسونار على الكليتين والمثانة', description: 'لتقييم الارتجاع والحصوات' }
  ],

  // 13. المخ والأعصاب (Neurology)
  neurology: [
    { id: 'n1', category: 'supplies', title: 'فيتامينات ب المركبة للأعصاب (Vitamin B Complex B1, B6, B12)', description: 'لدعم الغلاف النخاعيني للأعصاب' },
    { id: 'n2', category: 'equipment', title: 'سجل تتبع نوبات الصداع أو التشنجات (Seizure / Headaches Diary)', description: 'تسجيل التوقيت والأعراض والشدة' },
    { id: 'n3', category: 'care_instruction', title: 'الانتظام الصارم في مواعيد أدوية الأعصاب والصرع دون تأخير', description: 'عدم إيقاف الدواء فجأة تحت أي ظرف' }
  ],

  // 14. الصدر والجهاز التنفسي (Pulmonology)
  pulmonology: [
    { id: 'pul1', category: 'equipment', title: 'جهاز استنشاق البخار (Nebulizer Compressor)', description: 'جلسات موسع الشعب عند الأزمات' },
    { id: 'pul2', category: 'supplies', title: 'قمع استنشاق البخاخات للأطفال والبالغين (Spacer Instrument)', description: 'لضمان وصول الدواء للرئتين' },
    { id: 'pul3', category: 'equipment', title: 'جهاز قياس تشبع الأكسجين بالدم (Pulse Oximeter Pocket)', description: 'متابعة النسبة أعلى من 95%' }
  ],

  // 15. التغذية والسمنة (Nutrition)
  nutrition: [
    { id: 'nut1', category: 'equipment', title: 'ميزان ذكي رقمي وشريط قياس محيط الخصر', description: 'وزن أسبوعي صباحاً على معدة فارغة' },
    { id: 'nut2', category: 'supplies', title: 'مكملات الـ البروتين والألياف الفائقة (Whey / Fiber Supplements)', description: 'حسب الخطة الغذائية' },
    { id: 'nut3', category: 'diet_lifestyle', title: 'جدول الماكروز والسعرات الحرارية اليومي', description: 'الالتزام بشرب 3 لتر ماء ومشاة 30 دقيقة' }
  ],

  // 16. أمراض الكلى والغسيل الكلوي (Nephrology & Hemodialysis Hospital)
  nephrology: [
    { id: 'neph1', category: 'supplies', title: 'فلاتر غسيل دموي عالية النفاذية F70/F80 High-Flux Dialyzers', description: 'فلتر معقم أحادي الاستخدام للجلسة' },
    { id: 'neph2', category: 'supplies', title: 'وصلات دم شريانية ووريدية معقمة للغسيل (AV Bloodlines)', description: 'تركيب معقم مع مضخة الجلسة' },
    { id: 'neph3', category: 'supplies', title: 'إبر فستولا شريانية ووريدية مقاس 16G/17G معقمة', description: 'للوصول الوعائي أثناء الجلسة' },
    { id: 'neph4', category: 'supplies', title: 'حقيبة غيار معقم ومطهرات قسطرة الغسيل (Permcath Care Kit)', description: 'للغيار والتطهير لمنع العدوى البكتيرية' },
    { id: 'neph5', category: 'equipment', title: 'ميزان حساس دقيق وتسجيل الوزن الجاف (Dry Weight Tracker)', description: 'قياس الوزن قبل وبعد كل جلسة غسيل لتحديد كمية السحب' },
    { id: 'neph6', category: 'diet_lifestyle', title: 'نظام غذائي مخصص لمرضى الغسيل الكلوي (Low Sodium/Potassium/Phosphorus)', description: 'تقييد السوائل (500 مل + كمية البول) وتجنب الموز والموالح والتمر' },
    { id: 'neph7', category: 'tests', title: 'فحوصات كفاءة الغسيل (Kt/V) وتحليل يوريا وسيروم فيروسات دوري', description: 'تحاليل كيمياء الدم شهرياً وفحص الفيروسات الكبدية' }
  ]
};

export function getPatientNeedsForSpecialty(specialtyKeyOrName: string): PatientNeedItem[] {
  if (!specialtyKeyOrName) return SPECIALTY_PATIENT_NEEDS.internal_medicine;
  
  // Direct match
  if (SPECIALTY_PATIENT_NEEDS[specialtyKeyOrName]) {
    return SPECIALTY_PATIENT_NEEDS[specialtyKeyOrName];
  }

  // Name matching
  if (specialtyKeyOrName.includes('كلى') || specialtyKeyOrName.includes('غسيل') || specialtyKeyOrName.includes('nephro') || specialtyKeyOrName.includes('dialysis')) return SPECIALTY_PATIENT_NEEDS.nephrology;
  if (specialtyKeyOrName.includes('أوعية') || specialtyKeyOrName.includes('vascular')) return SPECIALTY_PATIENT_NEEDS.vascular;
  if (specialtyKeyOrName.includes('قدم سكري') || specialtyKeyOrName.includes('سكري') || specialtyKeyOrName.includes('diabetic_foot')) return SPECIALTY_PATIENT_NEEDS.diabetic_foot;
  if (specialtyKeyOrName.includes('باطنة') || specialtyKeyOrName.includes('هضمي')) return SPECIALTY_PATIENT_NEEDS.internal_medicine;
  if (specialtyKeyOrName.includes('قلب') || specialtyKeyOrName.includes('cardiology')) return SPECIALTY_PATIENT_NEEDS.cardiology;
  if (specialtyKeyOrName.includes('عظام') || specialtyKeyOrName.includes('ortho')) return SPECIALTY_PATIENT_NEEDS.orthopedics;
  if (specialtyKeyOrName.includes('أطفال') || specialtyKeyOrName.includes('pedia')) return SPECIALTY_PATIENT_NEEDS.pediatrics;
  if (specialtyKeyOrName.includes('نساء') || specialtyKeyOrName.includes('توليد') || specialtyKeyOrName.includes('obgyn')) return SPECIALTY_PATIENT_NEEDS.obgyn;
  if (specialtyKeyOrName.includes('عيون') || specialtyKeyOrName.includes('ophthal')) return SPECIALTY_PATIENT_NEEDS.ophthalmology;
  if (specialtyKeyOrName.includes('جلدية') || specialtyKeyOrName.includes('تجميل')) return SPECIALTY_PATIENT_NEEDS.dermatology;
  if (specialtyKeyOrName.includes('أسنان') || specialtyKeyOrName.includes('dental')) return SPECIALTY_PATIENT_NEEDS.dentistry;
  if (specialtyKeyOrName.includes('أنف') || specialtyKeyOrName.includes('أذن') || specialtyKeyOrName.includes('حنجرة')) return SPECIALTY_PATIENT_NEEDS.ent;
  if (specialtyKeyOrName.includes('مسالك') || specialtyKeyOrName.includes('uro')) return SPECIALTY_PATIENT_NEEDS.urology;
  if (specialtyKeyOrName.includes('أعصاب') || specialtyKeyOrName.includes('neuro')) return SPECIALTY_PATIENT_NEEDS.neurology;
  if (specialtyKeyOrName.includes('صدر') || specialtyKeyOrName.includes('رئة')) return SPECIALTY_PATIENT_NEEDS.pulmonology;
  if (specialtyKeyOrName.includes('تغذية') || specialtyKeyOrName.includes('سمنة')) return SPECIALTY_PATIENT_NEEDS.nutrition;

  return SPECIALTY_PATIENT_NEEDS.internal_medicine;
}
