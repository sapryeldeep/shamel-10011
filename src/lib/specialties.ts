export interface SpecialtyDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const MEDICAL_SPECIALTIES: SpecialtyDefinition[] = [
  { id: 'vascular', name: 'جراحة الأوعية الدموية', category: 'surgical', description: 'أمراض وتدخلات الشرايين والأوردة والقسطرة الطرفية' },
  { id: 'diabetic_foot', name: 'العناية بالقدم السكري وقدم السكر', category: 'specialized', description: 'ترميم وقروح وتدفق الدم للقدم السكري' },
  { id: 'internal_medicine', name: 'الباطنة العامة والجهاز الهضمي', category: 'medical', description: 'الأمراض الباطنية والكبد والجهاز الهضمي والمناظير' },
  { id: 'cardiology', name: 'أمراض القلب والأوعية الدموية', category: 'medical', description: 'تخطيط القلب واعتلال العضلة والقسطرة القلبية' },
  { id: 'orthopedics', name: 'العظام وجراحة العظام والمفاصل', category: 'surgical', description: 'الكسور والتشوهات والمفاصل الصناعية والعمود الفقري' },
  { id: 'pediatrics', name: 'الأطفال وحديثي الولادة', category: 'medical', description: 'رعاية مبتسري الولادة والنمو والتطعيمات' },
  { id: 'obgyn', name: 'النساء والتوليد والعقم', category: 'surgical', description: 'متابعة الحمل والولادة والجراحة النسائية والحقن المجهري' },
  { id: 'ophthalmology', name: 'العيون وجراحة الشبكية والليزك', category: 'surgical', description: 'فحص حدة النظر وضغط العين وجراحات الماء الأبيض' },
  { id: 'dermatology', name: 'الجلدية والتجميل والليزر', category: 'medical', description: 'أمراض البشرة والشعر والتجميل والليزر' },
  { id: 'ent', name: 'الأنف والأذن والحنجرة', category: 'surgical', description: 'أمراض السمع والجيوب الأنفية واللحمية والأوتار' },
  { id: 'urology', name: 'المسالك البولية والذكورة', category: 'surgical', description: 'حصوات الكلى والبروستاتا والضعف الجنسي والعقم' },
  { id: 'neurology', name: 'المخ والأعصاب والعمود الفقري', category: 'medical', description: 'السكتات الدماغية والصرع والأعصاب الطرفية' },
  { id: 'oncology', name: 'طب وجراحة الأورام', category: 'specialized', description: 'العلاج الكيميائي والإشعاعي والجراحي للأورام' },
  { id: 'psychiatry', name: 'الطب النفسي وعلاج الإدمان', category: 'medical', description: 'الاضطرابات النفسية والسلوكية والاستشارات' },
  { id: 'dentistry', name: 'طب وجراحة الأسنان', category: 'dental', description: 'حشو الأسنان والتركيبات والتقويم وزراعة الأسنان' },
  { id: 'pulmonology', name: 'الصدر والجهاز التنفسي', category: 'medical', description: 'حساسية الصدر وربو الشعب والتهابات الرئة' },
  { id: 'nephrology', name: 'أمراض الكلى والغسيل الكلوي', category: 'medical', description: 'القصور الكلوي المزمن والغسيل المزمن' },
  { id: 'rheumatology', name: 'الروماتيزم والعلاج الطبيعي', category: 'medical', description: 'أمراض المفاصل المناعية والترميم والتأهيل الحركي' },
  { id: 'endocrinology', name: 'الغدد الصماء والسكري', category: 'medical', description: 'اضطرابات الغدة الدرقية والنخامية والسكري' },
  { id: 'general_surgery', name: 'الجراحة العامة والمناظير', category: 'surgical', description: 'الفتق والمرارة والأورام والمناظير الجراحية' },
  { id: 'icu_emergency', name: 'الطوارئ والعناية المركزة', category: 'emergency', description: 'الحالات الحادة والصدمات والتنفس الصناعي' },
  { id: 'nutrition', name: 'التغذية العلاجية وعلاج السمنة', category: 'specialized', description: 'أنظمة التغذية السريرية وتكميم المعدة' },
  { id: 'plastic_surgery', name: 'جراحة التجميل والحروق', category: 'surgical', description: 'ترميم الجروح والحروق وجراحات التجميل' },
  { id: 'hematology', name: 'أمراض الدم والمناعة', category: 'medical', description: 'أنواع الانيميا واعتلال الصفائح والمناعة' },
  { id: 'general_hospital', name: 'متعدد التخصصات / كتابة حرة', category: 'general', description: 'متاح لكافة التخصصات الطبية أو التدوين الحر' }
];

export function getSpecialtyName(idOrName: string): string {
  const found = MEDICAL_SPECIALTIES.find(s => s.id === idOrName || s.name === idOrName);
  return found ? found.name : (idOrName || 'عام');
}
