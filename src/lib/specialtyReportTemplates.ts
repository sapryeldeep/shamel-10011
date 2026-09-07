import { ReportTemplate } from '../types';

export const DEFAULT_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'rt_ortho_1',
    templateName: 'تقرير خشونة مفصل الركبة (Knee Osteoarthritis)',
    specialtyKey: 'orthopedics',
    chiefComplaint: 'ألم مزمن بالركبة يزداد مع المجهود وصعود السلم، مع تيبس صباحي.',
    medicalHistory: 'لا يوجد تاريخ لكسور سابقة. المريض لا يعاني من أمراض مزمنة تمنع العلاج التحفظي.',
    physicalExamination: 'تورم خفيف بالركبة، ألم عند الضغط على خط المفصل (Joint line tenderness)، مدى الحركة (ROM) محدود نسبياً مع سماع طقطقة (Crepitus).',
    diagnosis: 'خشونة بمفصل الركبة من الدرجة المتوسطة (Moderate Knee Osteoarthritis).',
    treatmentPlan: '1. أدوية مضادة للالتهاب ومسكنات.\n2. جلسات علاج طبيعي لتقوية العضلة الرباعية.\n3. تقليل الوزن وتجنب إجهاد المفصل.\n4. المتابعة بعد شهر لتقييم الحاجة لحقن المفصل.'
  },
  {
    id: 'rt_ortho_2',
    templateName: 'تقرير متابعة ما بعد الجبس (Post-Cast Removal)',
    specialtyKey: 'orthopedics',
    chiefComplaint: 'مراجعة لفك الجبس بعد التئام الكسر.',
    medicalHistory: 'تاريخ كسر سابق تم علاجه تحفظياً بوضع جبس لمدة 6 أسابيع.',
    physicalExamination: 'التئام سريري جيد، لا يوجد ألم عند الضغط على مكان الكسر، تيبس بسيط في المفصل المجاور.',
    diagnosis: 'التئام كسر (Healed Fracture).',
    treatmentPlan: '1. فك الجبس بنجاح.\n2. البدء في برنامج علاج طبيعي مكثف لاستعادة مدى الحركة.\n3. تجنب الأحمال الثقيلة لمدة 4 أسابيع.'
  },
  {
    id: 'rt_cardio_1',
    templateName: 'تقرير فحص موجات صوتية على القلب (Echocardiogram)',
    specialtyKey: 'cardiology',
    chiefComplaint: 'خفقان ونهجان مع المجهود.',
    medicalHistory: 'مريض ضغط دم مرتفع مزمن.',
    physicalExamination: 'النبض منتظم، ضغط الدم منتظم، لا يوجد تورم بالقدمين.',
    diagnosis: 'تضخم بسيط في عضلة البطين الأيسر (Mild LVH) مع كفاءة انقباضية طبيعية (LVEF ~60%).',
    treatmentPlan: '1. الاستمرار على أدوية الضغط الحالية.\n2. تقليل الملح في الطعام.\n3. متابعة دورية بعد 6 أشهر.'
  },
  {
    id: 'rt_cardio_2',
    templateName: 'تقرير متابعة ضغط الدم الشرياني (Hypertension Follow-up)',
    specialtyKey: 'cardiology',
    chiefComplaint: 'صداع متكرر وعدم انتظام في قراءات ضغط الدم.',
    medicalHistory: 'ارتفاع مزمن في ضغط الدم، لا يوجد تاريخ لمرض سكري.',
    physicalExamination: 'ضغط الدم الحالي أعلى من المعدل الطبيعي (150/95). باقي الفحص السريري طبيعي.',
    diagnosis: 'ارتفاع ضغط دم غير متحكم به (Uncontrolled Hypertension).',
    treatmentPlan: '1. تعديل جرعات أدوية الضغط (إضافة مدر للبول).\n2. عمل تحاليل وظائف كلى ورسم قلب.\n3. قياس الضغط مرتين يومياً وتدوينه.\n4. المتابعة بعد أسبوعين.'
  },
  {
    id: 'rt_vasc_1',
    templateName: 'تقرير تقييم القدم السكري (Diabetic Foot Assessment)',
    specialtyKey: 'vascular',
    chiefComplaint: 'قرحة غير ملتئمة بأسفل القدم مع تنميل.',
    medicalHistory: 'مريض سكري مزمن (غير منتظم).',
    physicalExamination: 'قرحة عصبية (Neuropathic ulcer) بالقدم، النبض الطرفي محسوس وضعيف (Palpable but weak pedal pulses)، فقدان للإحساس الوقائي.',
    diagnosis: 'قرحة قدم سكري عصبية المنشأ (Neuropathic Diabetic Foot Ulcer).',
    treatmentPlan: '1. غيار معقم يومي باستخدام ضمادات الفضة.\n2. تخفيف الأحمال عن القدم (Offloading) بحذاء طبي مخصص.\n3. ضبط مستويات السكر بالدم.\n4. مضاد حيوي واسع المجال لحين ظهور نتيجة المزرعة.'
  },
  {
    id: 'rt_vasc_2',
    templateName: 'تقرير فحص دوالي الساقين (Varicose Veins)',
    specialtyKey: 'vascular',
    chiefComplaint: 'ألم وثقل بالساقين مع ظهور أوردة متضخمة.',
    medicalHistory: 'طبيعة عمل تتطلب الوقوف لفترات طويلة.',
    physicalExamination: 'دوالي واضحة بالساق، تورم خفيف بالكاحل، لا يوجد تغيرات جلدية أو قرح.',
    diagnosis: 'دوالي الساقين الأولية (Primary Varicose Veins).',
    treatmentPlan: '1. ارتداء شراب دوالي طبي متدرج الضغط أثناء العمل.\n2. أدوية مقوية لجدران الأوردة.\n3. رفع الساقين عند الراحة.\n4. عمل أشعة دوبلكس وريدي لتقييم الصمامات وتحديد الحاجة للتدخل.'
  },
  {
    id: 'rt_im_1',
    templateName: 'تقرير التهاب المعدة والقولون (Gastroenteritis / IBS)',
    specialtyKey: 'internal_medicine',
    chiefComplaint: 'آلام متكررة بالبطن مع انتفاخ وغثيان.',
    medicalHistory: 'تاريخ من القولون العصبي، لا يوجد نزيف معوي.',
    physicalExamination: 'ألم بسيط عند الضغط على منطقة البطن (Mild epigastric/colonic tenderness)، لا يوجد تضخم بالكبد أو الطحال.',
    diagnosis: 'التهاب بالمعدة وتهيج بالقولون العصبي (Gastritis & Irritable Bowel Syndrome).',
    treatmentPlan: '1. أدوية مثبطة لإفراز حمض المعدة ومضادات للتقلصات.\n2. نظام غذائي مسلوق وتجنب المهيجات والمقليات.\n3. عمل تحليل جرثومة المعدة (H. pylori) وتحليل براز.'
  },
  {
    id: 'rt_neuro_1',
    templateName: 'تقرير الصداع النصفي (Migraine)',
    specialtyKey: 'neurology',
    chiefComplaint: 'صداع نابض متكرر بنصف الرأس مصحوب بغثيان وحساسية للضوء.',
    medicalHistory: 'تاريخ عائلي للصداع النصفي، لا توجد أمراض مزمنة أخرى.',
    physicalExamination: 'فحص الأعصاب القحفية سليم، فحص قاع العين طبيعي، لا توجد علامات عصبية بؤرية.',
    diagnosis: 'صداع نصفي كلاسيكي (Classic Migraine without aura).',
    treatmentPlan: '1. مسكنات نوعية (Triptans) عند بداية النوبة.\n2. أدوية وقائية (Prophylactic) لتقليل معدل النوبات.\n3. تجنب محفزات الصداع (الإجهاد، السهر، الكافيين المفرط).'
  },
  {
    id: 'rt_dental_1',
    templateName: 'تقرير علاج جذور / عصب (Endodontic Treatment)',
    specialtyKey: 'dentistry',
    chiefComplaint: 'ألم شديد ومستمر بالسن مع حساسية للمشروبات الباردة والساخنة.',
    medicalHistory: 'لا يوجد موانع للتخدير الموضعي.',
    physicalExamination: 'تسوس عميق واصل للعصب، ألم عند الطرق (Percussion test positive).',
    diagnosis: 'التهاب العصب غير المرتجع (Irreversible Pulpitis).',
    treatmentPlan: '1. البدء في علاج الجذور (Pulpectomy).\n2. تنظيف وتوسيع القنوات ووضع حشو مؤقت.\n3. وصف مضاد حيوي ومسكن.\n4. موعد لاستكمال حشو العصب.'
  },
  {
    id: 'rt_dental_2',
    templateName: 'تقرير خلع جراحي (Surgical Extraction)',
    specialtyKey: 'dentistry',
    chiefComplaint: 'ألم وتورم بمنطقة ضرس العقل.',
    medicalHistory: 'لا يوجد مشاكل في النزيف أو التجلط.',
    physicalExamination: 'ضرس عقل مدفون جزئياً مع التهاب باللثة المحيطة (Pericoronitis).',
    diagnosis: 'ضرس عقل منطمر (Impacted Wisdom Tooth).',
    treatmentPlan: '1. وصف مضاد حيوي ومضمضة لحين زوال الالتهاب.\n2. تحويل لعمل أشعة بانوراما.\n3. تحديد موعد للخلع الجراحي.'
  },
  {
    id: 'rt_pedia_1',
    templateName: 'تقرير متابعة نمو وتطور الطفل (Well-Child Visit)',
    specialtyKey: 'pediatrics',
    chiefComplaint: 'زيارة روتينية لمتابعة النمو والتطعيمات.',
    medicalHistory: 'ولادة طبيعية، لا يوجد تاريخ مرضي.',
    physicalExamination: 'الوزن، الطول، ومحيط الرأس على منحنيات النمو الطبيعية. التطور الحركي والذهني مناسب للعمر.',
    diagnosis: 'طفل سليم، نمو طبيعي (Healthy child, normal growth).',
    treatmentPlan: '1. إعطاء التطعيمات المقررة للعمر.\n2. نصائح للأم بخصوص التغذية السليمة وإدخال الأطعمة الصلبة.\n3. المتابعة الدورية القادمة.'
  },
  {
    id: 'rt_pedia_2',
    templateName: 'تقرير التهاب لوزتين حاد (Acute Tonsillitis)',
    specialtyKey: 'pediatrics',
    chiefComplaint: 'ارتفاع في درجة الحرارة وصعوبة في البلع.',
    medicalHistory: 'تكرار التهاب اللوزتين 3 مرات هذا العام.',
    physicalExamination: 'تضخم واحمرار باللوزتين مع وجود صديد (Exudate)، تضخم بالغدد الليمفاوية بالرقبة.',
    diagnosis: 'التهاب حاد باللوزتين (Acute Follicular Tonsillitis).',
    treatmentPlan: '1. مضاد حيوي مناسب (شراب) لمدة 7-10 أيام.\n2. خافض حرارة ومسكن عند اللزوم.\n3. الإكثار من السوائل.'
  },
  {
    id: 'rt_obgyn_1',
    templateName: 'تقرير متابعة حمل (Antenatal Care - ANC)',
    specialtyKey: 'obgyn',
    chiefComplaint: 'متابعة دورية للحمل في الثلث الثاني.',
    medicalHistory: 'حمل سابق طبيعي، لا توجد مضاعفات.',
    physicalExamination: 'ضغط الدم طبيعي، الوزن مناسب للحمل. نبض الجنين مسموع وحركته جيدة.',
    diagnosis: 'حمل طبيعي مستقر (Uncomplicated Pregnancy).',
    treatmentPlan: '1. عمل سونار لتقييم نمو الجنين (BPD, FL, AC) وكمية السائل الأمينوسي.\n2. الاستمرار على الفيتامينات والحديد.\n3. عمل تحاليل صورة دم وسكر بول.'
  },
  {
    id: 'rt_ophthal_1',
    templateName: 'تقرير فحص قاع العين وقوة الإبصار (Comprehensive Eye Exam)',
    specialtyKey: 'ophthalmology',
    chiefComplaint: 'ضعف تدريجي في الرؤية وصعوبة في القراءة.',
    medicalHistory: 'مريض سكري.',
    physicalExamination: 'حدة الإبصار (Visual Acuity) متأثرة. ضغط العين طبيعي. فحص قاع العين يظهر تغيرات سكرية طفيفة بالشبكية.',
    diagnosis: 'اعتلال شبكية سكري مبكر مع طول نظر شيخوخي (Mild NPDR & Presbyopia).',
    treatmentPlan: '1. وصف نظارة طبية للقراءة.\n2. تحويل لطبيب الباطنة لضبط السكر.\n3. متابعة دورية لقاع العين كل 6 أشهر لمنع تدهور الشبكية.'
  }
];

export function getReportTemplatesForSpecialty(specialtyKey: string): ReportTemplate[] {
  const genericTemplates = DEFAULT_REPORT_TEMPLATES.filter(t => t.specialtyKey === 'general_hospital' || t.specialtyKey === 'internal_medicine');
  if (!specialtyKey) return genericTemplates;
  
  const specialized = DEFAULT_REPORT_TEMPLATES.filter(t => t.specialtyKey === specialtyKey);
  
  return specialized.length > 0 ? specialized : genericTemplates;
}
