import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Truck, Scissors, Bed, FlaskConical, Scan, Plus, Trash2, CheckCircle2, User, Clock, 
  AlertTriangle, Stethoscope, Volume2, HeartPulse, Droplet, Coins, Activity,
  Cpu, Waves, ShieldCheck, Droplets
} from 'lucide-react';
import { getFormattedDateTime, getTodayISO } from '../lib/utils';
import DoctorCallModal from '../components/DoctorCallModal';
import { 
  ErPatient, OrBooking, InpatientAdmission, HospLabOrder, RadOrder, IcuPatient, 
  BloodBankUnit, DoctorCommission, DialysisMachine, DialysisSession, WaterTreatmentLog 
} from '../types';

export default function HospitalOperations() {
  const { state, updateState, currentUser, logAction, postMedicalBillingToAccounting, addJournalEntry } = useAppContext();
  const [activeTab, setActiveTab] = useState<'er' | 'or' | 'inpatient' | 'lab' | 'radiology' | 'icu' | 'bloodBank' | 'commissions' | 'dialysis' | 'waterRO'>('er');
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);

  const getClinicId = () => currentUser?.clinicId || 'master';
  const cId = getClinicId();

  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);

  const allowICU = isMaster || (currentClinic?.allowICUModule !== false);
  const allowBloodBank = isMaster || (currentClinic?.allowBloodBankModule !== false);
  const allowDialysis = isMaster || (currentClinic?.allowDialysisModule !== false);
  const allowCommissions = isMaster || (currentClinic?.allowDoctorCommissions !== false);

  // Dialysis Machine State
  const [diaMachCode, setDiaMachCode] = useState('');
  const [diaMachBrand, setDiaMachBrand] = useState('Fresenius Medical Care');
  const [diaMachIso, setDiaMachIso] = useState<'Negative' | 'HBV_Positive' | 'HCV_Positive'>('Negative');
  const [diaMachShift, setDiaMachShift] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night_Emergency'>('Morning');

  // Dialysis Session State
  const [diaPatName, setDiaPatName] = useState('');
  const [diaPatAge, setDiaPatAge] = useState('');
  const [diaMachSel, setDiaMachSel] = useState('');
  const [diaFilter, setDiaFilter] = useState('High-Flux FX80');
  const [diaAccess, setDiaAccess] = useState<'AV_Fistula' | 'Permcath' | 'Temp_Catheter' | 'AV_Graft'>('AV_Fistula');
  const [diaPreWeight, setDiaPreWeight] = useState<number>(75);
  const [diaPostWeight, setDiaPostWeight] = useState<number>(72);
  const [diaDryWeight, setDiaDryWeight] = useState<number>(72);
  const [diaUfTarget, setDiaUfTarget] = useState<number>(3.0);
  const [diaFlowQb, setDiaFlowQb] = useState<number>(300);
  const [diaHeparin, setDiaHeparin] = useState<number>(3500);
  const [diaCost, setDiaCost] = useState<number>(1200);

  // Water Treatment RO State
  const [roInspector, setRoInspector] = useState('م. أحمد الشافعي');
  const [roConductivity, setRoConductivity] = useState<number>(4.5);
  const [roFreeChlorine, setRoFreeChlorine] = useState<number>(0.0);
  const [roWaterTemp, setRoWaterTemp] = useState<number>(22);
  const [roPressure, setRoPressure] = useState<number>(14.0);
  const [roEndotoxin, setRoEndotoxin] = useState<boolean>(true);
  const [roNotes, setRoNotes] = useState('الفحص الدوري السليم لمعايير الجودة.');

  // ICU State
  const [icuPat, setIcuPat] = useState('');
  const [icuAgeVal, setIcuAgeVal] = useState('');
  const [icuBedVal, setIcuBedVal] = useState('');
  const [icuVentVal, setIcuVentVal] = useState<'None' | 'Invasive' | 'Non-Invasive'>('None');
  const [icuSpo2Val, setIcuSpo2Val] = useState<number>(98);
  const [icuPulseVal, setIcuPulseVal] = useState<number>(82);
  const [icuCondVal, setIcuCondVal] = useState<'Critical' | 'Severe' | 'Improving'>('Improving');
  const [icuCostVal, setIcuCostVal] = useState<number>(1500);

  // Blood Bank State
  const [bloodTypeSel, setBloodTypeSel] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [bloodCountSel, setBloodCountSel] = useState<number>(12);

  // Commissions State
  const [commDocVal, setCommDocVal] = useState('');
  const [commOpVal, setCommOpVal] = useState('OR Surgery');
  const [commPatVal, setCommPatVal] = useState('');
  const [commTotalVal, setCommTotalVal] = useState<number>(3000);
  const [commPctVal, setCommPctVal] = useState<number>(15);

  // ER State
  const [erName, setErName] = useState('');
  const [erAge, setErAge] = useState('');
  const [erPhone, setErPhone] = useState('');
  const [erSeverity, setErSeverity] = useState<'Critical' | 'Urgent' | 'Stable'>('Urgent');
  const [erReason, setErReason] = useState('');

  // OR State
  const [orPatient, setOrPatient] = useState('');
  const [orSurgery, setOrSurgery] = useState('');
  const [orSurgeon, setOrSurgeon] = useState('');
  const [orDate, setOrDate] = useState('');
  const [orTime, setOrTime] = useState('');
  const [orRoom, setOrRoom] = useState('غرفة عمليات (1)');
  const [orCost, setOrCost] = useState<number | ''>('');

  // Inpatient State
  const [inpName, setInpName] = useState('');
  const [inpWard, setInpWard] = useState('General Ward');
  const [inpBed, setInpBed] = useState('');
  const [inpDoctor, setInpDoctor] = useState('');
  const [inpCost, setInpCost] = useState<number | ''>('');

  // Lab State
  const [labPatient, setLabPatient] = useState('');
  const [labTestName, setLabTestName] = useState('');
  const [labResult, setLabResult] = useState('');
  const [labFileObj, setLabFileObj] = useState<{ name: string; dataUrl: string; type: string; size: number } | null>(null);
  const [labCost, setLabCost] = useState<number | ''>('');

  // Radiology State
  const [radPatient, setRadPatient] = useState('');
  const [radType, setRadType] = useState('');
  const [radReport, setRadReport] = useState('');
  const [radFileObj, setRadFileObj] = useState<{ name: string; dataUrl: string; type: string; size: number } | null>(null);
  const [radCost, setRadCost] = useState<number | ''>('');

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLabFileObj({
        name: file.name,
        dataUrl: evt.target?.result as string,
        type: file.type,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setRadFileObj({
        name: file.name,
        dataUrl: evt.target?.result as string,
        type: file.type,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  // ER Handlers
  const addErPatient = () => {
    if (!erName.trim()) return alert('يرجى كتابة اسم المصاب');
    const newEr: ErPatient = {
      id: Date.now().toString(),
      clinicId: cId,
      name: erName,
      age: erAge,
      phone: erPhone,
      severity: erSeverity,
      reason: erReason || 'حالة طوارئ عاجلة',
      date: getFormattedDateTime()
    };
    const currentList = state.erStore?.[cId] || [];
    updateState({ erStore: { ...state.erStore, [cId]: [...currentList, newEr] } });
    logAction(
      'استقبال حالة طوارئ ER',
      `تم استقبال حالة طوارئ للمريض «${erName}» بدرجة خطورة (${erSeverity}) - السبب: ${erReason || 'طوارئ عاجلة'}.`,
      'er',
      { operationType: 'create', targetName: erName, targetId: newEr.id, severity: erSeverity === 'Critical' ? 'critical' : 'warning' }
    );
    setErName(''); setErAge(''); setErPhone(''); setErReason('');
  };

  const removeErPatient = (id: string | number) => {
    const currentList = state.erStore?.[cId] || [];
    const erToDelete = currentList.find(e => String(e.id) === String(id));
    updateState({ erStore: { ...state.erStore, [cId]: currentList.filter(e => String(e.id) !== String(id)) } });
    logAction(
      'إنهاء/حذف حالة طوارئ ER',
      `تم إنهاء/حذف حالة الطوارئ للمريض «${erToDelete?.name || id}».`,
      'er',
      { operationType: 'delete', targetId: String(id), targetName: erToDelete?.name }
    );
  };

  // OR Handlers
  const addOrBooking = () => {
    if (!orPatient.trim() || !orSurgery.trim()) return alert('يرجى كتابة اسم المريض ونوع الجراحة');
    const costValue = orCost !== '' ? Number(orCost) : 0;
    const newOr: OrBooking = {
      id: Date.now().toString(),
      clinicId: cId,
      patient: orPatient,
      surgery: orSurgery,
      surgeon: orSurgeon || 'الجراح المسؤول',
      date: orDate || new Date().toISOString().split('T')[0],
      time: orTime || '10:00 AM',
      room: orRoom,
      cost: costValue > 0 ? costValue : undefined
    };
    const currentList = state.orStore?.[cId] || [];
    updateState({ orStore: { ...state.orStore, [cId]: [...currentList, newOr] } });
    
    // Post to general ledger
    if (costValue > 0) {
      postMedicalBillingToAccounting(cId, orPatient, 'surgery', costValue, `تكلفة الجراحة والعمليات: ${orSurgery}`);
    }

    logAction(
      'حجز غرفة عمليات OR',
      `تم حجز جراحة «${orSurgery}» للمريض «${orPatient}» مع د/ «${orSurgeon || 'الجراح المسؤول'}» (${orRoom}) بمبلغ ${costValue} ج.م.`,
      'medical',
      { operationType: 'create', targetName: orPatient, targetId: newOr.id }
    );
    setOrPatient(''); setOrSurgery(''); setOrSurgeon(''); setOrCost('');
  };

  const removeOrBooking = (id: string | number) => {
    const currentList = state.orStore?.[cId] || [];
    const orToDelete = currentList.find(o => String(o.id) === String(id));
    updateState({ orStore: { ...state.orStore, [cId]: currentList.filter(o => String(o.id) !== String(id)) } });
    logAction(
      'إلغاء حجز عمليات OR',
      `تم إلغاء حجز الجراحة للمريض «${orToDelete?.patient || id}».`,
      'medical',
      { operationType: 'delete', targetId: String(id), targetName: orToDelete?.patient }
    );
  };

  // Inpatient Handlers
  const addInpatientAdmission = () => {
    if (!inpName.trim()) return alert('يرجى إدخال اسم المريض');
    const costValue = inpCost !== '' ? Number(inpCost) : 0;
    const newInp: InpatientAdmission = {
      id: Date.now().toString(),
      clinicId: cId,
      name: inpName,
      ward: inpWard,
      bed: inpBed || 'سرير 1',
      doctor: inpDoctor || 'الطبيب المعالج',
      date: getFormattedDateTime(),
      cost: costValue > 0 ? costValue : undefined
    };
    const currentList = state.inpatientStore?.[cId] || [];
    updateState({ inpatientStore: { ...state.inpatientStore, [cId]: [...currentList, newInp] } });

    // Post to general ledger
    if (costValue > 0) {
      postMedicalBillingToAccounting(cId, inpName, 'inpatient', costValue, `تكلفة حجز الإقامة والتنويم: ${inpWard} - ${inpBed || 'سرير 1'}`);
    }

    logAction(
      'تنويم مريض (إقامة داخلية)',
      `تم تنويم المريض «${inpName}» بقسم «${inpWard}» سرير «${inpBed || '1'}» بمبلغ ${costValue} ج.م.`,
      'medical',
      { operationType: 'create', targetName: inpName, targetId: newInp.id }
    );
    setInpName(''); setInpBed(''); setInpDoctor(''); setInpCost('');
  };

  const removeInpatient = (id: string | number) => {
    const currentList = state.inpatientStore?.[cId] || [];
    const inpToDelete = currentList.find(i => String(i.id) === String(id));
    updateState({ inpatientStore: { ...state.inpatientStore, [cId]: currentList.filter(i => String(i.id) !== String(id)) } });
    logAction(
      'خروج مريض (إقامة داخلية)',
      `تم تسجيل خروج المريض «${inpToDelete?.name || id}» من الإقامة الداخلية.`,
      'medical',
      { operationType: 'delete', targetId: String(id), targetName: inpToDelete?.name }
    );
  };

  // Lab Handlers
  const addLabOrder = () => {
    if (!labPatient.trim() || !labTestName.trim()) return alert('يرجى كتابة اسم المريض واختيار التحليل');
    const costValue = labCost !== '' ? Number(labCost) : 0;
    const newLab: HospLabOrder = {
      id: Date.now().toString(),
      clinicId: cId,
      patient: labPatient,
      testName: labTestName,
      result: labResult || 'قيد التحليل والمعالجة',
      fileData: labFileObj?.dataUrl,
      fileName: labFileObj?.name,
      fileType: labFileObj?.type,
      fileSize: labFileObj?.size,
      date: getFormattedDateTime(),
      cost: costValue > 0 ? costValue : undefined
    };
    const currentList = state.hospLabStore?.[cId] || [];
    updateState({ hospLabStore: { ...state.hospLabStore, [cId]: [...currentList, newLab] } });

    // Post to general ledger
    if (costValue > 0) {
      postMedicalBillingToAccounting(cId, labPatient, 'lab', costValue, `تكلفة الفحوصات والتحاليل المخبرية: ${labTestName}`);
    }

    logAction(
      'طلب فحص معملي',
      `تم تسجيل طلب فحص «${labTestName}» للمريض «${labPatient}» بمبلغ ${costValue} ج.م.`,
      'lab',
      { operationType: 'create', targetName: labPatient, targetId: newLab.id }
    );
    setLabPatient(''); setLabResult(''); setLabFileObj(null); setLabCost('');
  };

  const removeLabOrder = (id: string | number) => {
    const currentList = state.hospLabStore?.[cId] || [];
    const labToDelete = currentList.find(l => String(l.id) === String(id));
    updateState({ hospLabStore: { ...state.hospLabStore, [cId]: currentList.filter(l => String(l.id) !== String(id)) } });
    logAction(
      'حذف فحص معملي',
      `تم حذف فحص «${labToDelete?.testName || ''}» للمريض «${labToDelete?.patient || id}».`,
      'lab',
      { operationType: 'delete', targetId: String(id), targetName: labToDelete?.patient }
    );
  };

  // Rad Handlers
  const addRadOrder = () => {
    if (!radPatient.trim() || !radType.trim()) return alert('يرجى إدخال اسم المريض ونوع الأشعة');
    const costValue = radCost !== '' ? Number(radCost) : 0;
    const newRad: RadOrder = {
      id: Date.now().toString(),
      clinicId: cId,
      patient: radPatient,
      type: radType,
      report: radReport || 'تقرير قيد الإصدار',
      fileData: radFileObj?.dataUrl,
      fileName: radFileObj?.name,
      fileType: radFileObj?.type,
      fileSize: radFileObj?.size,
      date: getFormattedDateTime(),
      cost: costValue > 0 ? costValue : undefined
    };
    const currentList = state.radStore?.[cId] || [];
    updateState({ radStore: { ...state.radStore, [cId]: [...currentList, newRad] } });

    // Post to general ledger
    if (costValue > 0) {
      postMedicalBillingToAccounting(cId, radPatient, 'rad', costValue, `تكلفة الأشعة والسونار: ${radType}`);
    }

    logAction(
      'طلب فحص أشعة',
      `تم تسجيل طلب فحص أشعة «${radType}» للمريض «${radPatient}» بمبلغ ${costValue} ج.م.`,
      'medical',
      { operationType: 'create', targetName: radPatient, targetId: newRad.id }
    );
    setRadPatient(''); setRadType(''); setRadReport(''); setRadFileObj(null); setRadCost('');
  };

  const removeRadOrder = (id: string | number) => {
    const currentList = state.radStore?.[cId] || [];
    const radToDelete = currentList.find(r => String(r.id) === String(id));
    updateState({ radStore: { ...state.radStore, [cId]: currentList.filter(r => String(r.id) !== String(id)) } });
    logAction(
      'حذف فحص أشعة',
      `تم حذف فحص الأشعة «${radToDelete?.type || ''}» للمريض «${radToDelete?.patient || id}».`,
      'medical',
      { operationType: 'delete', targetId: String(id), targetName: radToDelete?.patient }
    );
  };

  // ICU Handlers
  const addIcuPatient = () => {
    if (!icuPat.trim() || !icuBedVal.trim()) return alert('يرجى إدخال اسم المريض ورقم السرير');
    const newIcu: IcuPatient = {
      id: `icu_${Date.now()}`,
      clinicId: cId,
      patientName: icuPat,
      age: icuAgeVal,
      bedNumber: icuBedVal,
      ventilatorStatus: icuVentVal,
      oxygenSaturation: Number(icuSpo2Val) || 98,
      heartRate: Number(icuPulseVal) || 82,
      condition: icuCondVal,
      dateAdded: getFormattedDateTime(),
      costPerDay: Number(icuCostVal) || 1500
    };
    const currentList = state.icuStore?.[cId] || [];
    updateState({ icuStore: { ...state.icuStore, [cId]: [...currentList, newIcu] } });

    // Post to general ledger automatically
    postMedicalBillingToAccounting(cId, icuPat, 'inpatient', Number(icuCostVal), `إقامة يومية بالعناية المركزة (ICU) - سرير ${icuBedVal}`);

    logAction(
      'تسجيل مريض بالعناية المركزة ICU',
      `تم نقل المريض «${icuPat}» لسرير العناية المركزة رقم (${icuBedVal}) - درجة الخطورة: ${icuCondVal}.`,
      'medical',
      { operationType: 'create', targetName: icuPat, targetId: newIcu.id }
    );
    setIcuPat(''); setIcuAgeVal(''); setIcuBedVal(''); setIcuVentVal('None'); setIcuSpo2Val(98); setIcuPulseVal(82); setIcuCondVal('Improving'); setIcuCostVal(1500);
  };

  const removeIcuPatient = (id: string) => {
    const currentList = state.icuStore?.[cId] || [];
    const icuToDelete = currentList.find(i => i.id === id);
    updateState({ icuStore: { ...state.icuStore, [cId]: currentList.filter(i => i.id !== id) } });
    logAction(
      'إنهاء إقامة مريض بالعناية المركزة',
      `تم إخراج المريض «${icuToDelete?.patientName || id}» من العناية المركزة بنجاح.`,
      'medical',
      { operationType: 'delete', targetId: id, targetName: icuToDelete?.patientName }
    );
  };

  // Blood Bank Handlers
  const addBloodBankUnit = () => {
    const currentList = state.bloodBankStore?.[cId] || [];
    const existing = currentList.find(b => b.bloodType === bloodTypeSel);
    let updatedList;
    if (existing) {
      updatedList = currentList.map(b => b.bloodType === bloodTypeSel ? { ...b, stockCount: b.stockCount + Number(bloodCountSel), lastTestedDate: getTodayISO() } : b);
    } else {
      const newUnit: BloodBankUnit = {
        id: `bb_${Date.now()}`,
        clinicId: cId,
        bloodType: bloodTypeSel,
        stockCount: Number(bloodCountSel),
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastTestedDate: getTodayISO()
      };
      updatedList = [...currentList, newUnit];
    }
    updateState({ bloodBankStore: { ...state.bloodBankStore, [cId]: updatedList } });
    logAction('تحديث مخزون بنك الدم', `تم إضافة عدد ${bloodCountSel} وحدة من فصيلة الدم «${bloodTypeSel}» في بنك الدم المركزي.`, 'pharmacy');
    alert(`تمت إضافة الوحدات وتصنيفها في بنك الدم المركزي بنجاح!`);
  };

  const dispenseBloodUnit = (bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-') => {
    const currentList = state.bloodBankStore?.[cId] || [];
    const existing = currentList.find(b => b.bloodType === bloodType);
    if (!existing || existing.stockCount <= 0) {
      return alert('عذراً! لا يوجد مخزون كافي من هذه الفصيلة في بنك الدم حالياً.');
    }
    const updatedList = currentList.map(b => b.bloodType === bloodType ? { ...b, stockCount: b.stockCount - 1 } : b);
    updateState({ bloodBankStore: { ...state.bloodBankStore, [cId]: updatedList } });

    // Post cost of blood bag to ledger
    postMedicalBillingToAccounting(cId, 'مريض طوارئ/عمليات', 'surgery', 250, `صرف كيس دم فصيلة ${bloodType} من بنك الدم المركزي`);

    logAction('صرف كيس دم', `تم صرف كيس دم فصيلة «${bloodType}» لحالة طوارئ/عمليات كبرى.`, 'pharmacy');
    alert(`تم صرف كيس الدم فصيلة ${bloodType} وتوليد الترحيل المالي بنجاح!`);
  };

  // Doctors' Commissions Handlers
  const addCommission = () => {
    if (!commDocVal.trim() || !commPatVal.trim()) return alert('يرجى كتابة اسم الطبيب واسم المريض');
    const earned = Math.round(Number(commTotalVal) * (Number(commPctVal) / 100));
    const newComm: DoctorCommission = {
      id: `comm_${Date.now()}`,
      clinicId: cId,
      doctorName: commDocVal,
      operationType: commOpVal,
      patientName: commPatVal,
      totalAmount: Number(commTotalVal),
      commissionPercentage: Number(commPctVal),
      commissionEarned: earned,
      status: 'pending',
      date: getTodayISO()
    };
    const currentList = state.doctorCommissionsStore?.[cId] || [];
    updateState({ doctorCommissionsStore: { ...state.doctorCommissionsStore, [cId]: [...currentList, newComm] } });
    logAction('تسجيل عمولة طبيب', `تم تسجيل عمولة للأستاذ الدكتور «${commDocVal}» بقيمة ${earned} ج.م عن عملية «${commOpVal}» للمريض «${commPatVal}».`, 'accounting');
    setCommDocVal(''); setCommPatVal('');
    alert(`تم تسجيل العمولة واستحقاق الطبيب د. ${commDocVal} بنجاح!`);
  };

  const payDoctorCommission = (id: string) => {
    const currentList = state.doctorCommissionsStore?.[cId] || [];
    const target = currentList.find(c => c.id === id);
    if (!target) return;
    if (target.status === 'paid') return alert('العمولة مسددة بالفعل!');

    // Post directly to double-entry accounting!
    addJournalEntry(cId, {
      entryNumber: `DOC-PAY-${Date.now().toString().slice(-6)}`,
      date: getTodayISO(),
      description: `صرف أتعاب ونسبة الطبيب: ${target.doctorName} عن المريض ${target.patientName}`,
      referenceType: 'voucher',
      referenceId: id,
      lines: [
        {
          id: '1',
          accountId: `${cId}_acc_5101`,
          accountCode: '5101',
          accountName: 'أتعاب ونسب الأطباء والاستشاريين',
          debit: target.commissionEarned,
          credit: 0,
          note: `مدين: صرف نسبة أتعاب د. ${target.doctorName}`
        },
        {
          id: '2',
          accountId: `${cId}_acc_1101`,
          accountCode: '1101',
          accountName: 'الخزينة الرئيسية (النقدية بالصندوق)',
          debit: 0,
          credit: target.commissionEarned,
          note: `دائن: صرف نقدي من الخزينة الرئيسية`
        }
      ],
      totalDebit: target.commissionEarned,
      totalCredit: target.commissionEarned
    });

    const updatedList = currentList.map(c => c.id === id ? { ...c, status: 'paid' as const } : c);
    updateState({ doctorCommissionsStore: { ...state.doctorCommissionsStore, [cId]: updatedList } });
    logAction('سداد عمولة طبيب', `تم صرف وتسديد أتعاب الطبيب «${target.doctorName}» بمبلغ ${target.commissionEarned} ج.م نقداً من الخزينة الرئيسية.`, 'accounting');
    alert(`تم صرف أتعاب الدكتور «${target.doctorName}» بقيمة ${target.commissionEarned} ج.م وترحيل القيد المزدوج للخزينة بنجاح!`);
  };

  // Dialysis Handlers
  const addDialysisMachine = () => {
    if (!diaMachCode.trim()) return alert('يرجى إدخال كود الماكينة أو السرير');
    const newMach: DialysisMachine = {
      id: `m_${Date.now()}`,
      clinicId: cId,
      machineCode: diaMachCode,
      brand: diaMachBrand,
      isolationCategory: diaMachIso,
      shift: diaMachShift,
      status: 'Ready',
      lastSterilizationDate: getFormattedDateTime()
    };
    const currentList = state.dialysisMachinesStore?.[cId] || [];
    updateState({ dialysisMachinesStore: { ...state.dialysisMachinesStore, [cId]: [...currentList, newMach] } });
    logAction('إضافة ماكينة غسيل كلوي', `تم إضافة ماكينة الكلى «${diaMachCode}» - فئة العزل: (${diaMachIso})`, 'medical');
    setDiaMachCode('');
  };

  const startDialysisSession = () => {
    if (!diaPatName.trim() || !diaMachSel.trim()) return alert('يرجى اختيار المريض وماكينة الغسيل الكلوي');
    const costValue = Number(diaCost) || 1200;
    const newSession: DialysisSession = {
      id: `dia_${Date.now()}`,
      clinicId: cId,
      patientName: diaPatName,
      patientAge: diaPatAge || '45 سنة',
      machineCode: diaMachSel,
      shift: diaMachShift,
      dialyserFilter: diaFilter,
      vascularAccess: diaAccess,
      preWeight: Number(diaPreWeight) || 75,
      postWeight: Number(diaPostWeight) || 72,
      dryWeight: Number(diaDryWeight) || 72,
      ufTarget: Number(diaUfTarget) || 3.0,
      bloodFlowQB: Number(diaFlowQb) || 300,
      heparinDose: Number(diaHeparin) || 3500,
      ktvAdequacy: 1.4,
      sessionCost: costValue,
      status: 'Ongoing',
      date: getTodayISO()
    };
    const currentList = state.dialysisSessionsStore?.[cId] || [];
    updateState({ dialysisSessionsStore: { ...state.dialysisSessionsStore, [cId]: [...currentList, newSession] } });

    // Update machine status to In_Session
    const machList = state.dialysisMachinesStore?.[cId] || [];
    const updatedMachList = machList.map(m => m.machineCode === diaMachSel ? { ...m, status: 'In_Session' as const, assignedPatient: diaPatName } : m);
    updateState({ dialysisMachinesStore: { ...state.dialysisMachinesStore, [cId]: updatedMachList } });

    // Auto post session cost to Accounting Ledger
    postMedicalBillingToAccounting(cId, diaPatName, 'clinic', costValue, `جلسة غسيل كلوي دموي (Hemodialysis) - ماكينة ${diaMachSel}`);

    logAction('بدء جلسة غسيل كلوي', `بدء جلسة غسيل كلوي للمريض «${diaPatName}» على ماكينة ${diaMachSel} بمبلغ ${costValue} ج.م.`, 'medical');
    setDiaPatName(''); setDiaPatAge('');
  };

  const completeDialysisSession = (sessionId: string, machineCode: string) => {
    const currentList = state.dialysisSessionsStore?.[cId] || [];
    const updatedList = currentList.map(s => s.id === sessionId ? { ...s, status: 'Completed' as const } : s);
    updateState({ dialysisSessionsStore: { ...state.dialysisSessionsStore, [cId]: updatedList } });

    // Set machine to Sterilization
    const machList = state.dialysisMachinesStore?.[cId] || [];
    const updatedMachList = machList.map(m => m.machineCode === machineCode ? { ...m, status: 'Sterilization' as const, assignedPatient: undefined, lastSterilizationDate: getFormattedDateTime() } : m);
    updateState({ dialysisMachinesStore: { ...state.dialysisMachinesStore, [cId]: updatedMachList } });

    logAction('إتمام جلسة غسيل كلوي', `تم إتمام ونزع خطوط الغسيل الكلوي للجلسة ${sessionId} وإحالة الماكينة للتعقيم.`, 'medical');
  };

  const addWaterTreatmentLog = () => {
    const newLog: WaterTreatmentLog = {
      id: `ro_${Date.now()}`,
      clinicId: cId,
      inspectorName: roInspector || 'مهندس الصيانة',
      conductivity: Number(roConductivity) || 4.5,
      freeChlorine: Number(roFreeChlorine) || 0.0,
      waterTemp: Number(roWaterTemp) || 22,
      roPressureBar: Number(roPressure) || 14,
      endotoxinPassed: roEndotoxin,
      notes: roNotes || 'فحص معايير الجودة السليم',
      status: (Number(roConductivity) < 15 && Number(roFreeChlorine) === 0 && roEndotoxin) ? 'Passed' : 'Warning',
      timestamp: getFormattedDateTime()
    };
    const currentList = state.waterTreatmentLogsStore?.[cId] || [];
    updateState({ waterTreatmentLogsStore: { ...state.waterTreatmentLogsStore, [cId]: [...currentList, newLog] } });
    logAction('تسجيل فحص محطة معالجة مياه RO', `تسجيل قراءات الموصلية (${roConductivity} µS/cm) والكلور (${roFreeChlorine} mg/L) محطة الغسيل الكلوي.`, 'medical');
    alert('تم تسجيل القراءات الدورية لمحطة معالجة مياه RO بنجاح!');
  };

  const erList = state.erStore?.[cId] || [];
  const orList = state.orStore?.[cId] || [];
  const inpatientList = state.inpatientStore?.[cId] || [];
  const labList = state.hospLabStore?.[cId] || [];
  const radList = state.radStore?.[cId] || [];
  const icuList = state.icuStore?.[cId] || [];
  const bloodBankList = state.bloodBankStore?.[cId] || [];
  const commissionList = state.doctorCommissionsStore?.[cId] || [];
  const dialysisMachinesList = state.dialysisMachinesStore?.[cId] || [];
  const dialysisSessionsList = state.dialysisSessionsStore?.[cId] || [];
  const waterTreatmentLogsList = state.waterTreatmentLogsStore?.[cId] || [];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('er')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'er' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Truck size={18} className="text-rose-600" /> قسم الطوارئ (ER)
          </button>

          <button
            onClick={() => setActiveTab('or')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'or' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scissors size={18} className="text-amber-600" /> غرف العمليات (OR)
          </button>

          <button
            onClick={() => setActiveTab('inpatient')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'inpatient' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bed size={18} className="text-blue-600" /> الإقامة والأسرة (Inpatient)
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'lab' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FlaskConical size={18} className="text-emerald-600" /> المعمل والتحاليل (LIS)
          </button>

          <button
            onClick={() => setActiveTab('radiology')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'radiology' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scan size={18} className="text-indigo-600" /> الأشعة التشخيصية (PACS)
          </button>

          {allowICU && (
            <button
              onClick={() => setActiveTab('icu')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === 'icu' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HeartPulse size={18} className="text-rose-600" /> العناية المركزة (ICU)
            </button>
          )}

          {allowBloodBank && (
            <button
              onClick={() => setActiveTab('bloodBank')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === 'bloodBank' ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Droplet size={18} className="text-red-600" /> بنك الدم المركزي
            </button>
          )}

          {allowDialysis && (
            <>
              <button
                onClick={() => setActiveTab('dialysis')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'dialysis' ? 'bg-cyan-50 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Cpu size={18} className="text-cyan-600" /> وحدات ومكائن الغسيل الكلوي (Dialysis)
              </button>

              <button
                onClick={() => setActiveTab('waterRO')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === 'waterRO' ? 'bg-teal-50 text-teal-800 border border-teal-300' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Waves size={18} className="text-teal-600" /> محطة معالجة المياه (RO Water Plant)
              </button>
            </>
          )}

          {allowCommissions && (
            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === 'commissions' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Coins size={18} className="text-emerald-600" /> أتعاب وعمولات الأطباء
            </button>
          )}
        </div>

        {/* Doctor Calling Trigger */}
        <button
          onClick={() => setDoctorModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
        >
          <Stethoscope size={18} />
          <span>نداء صوتي على طبيب 📢</span>
        </button>
      </div>

      {/* 1. ER Tab */}
      {activeTab === 'er' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-rose-700 mb-4 flex items-center gap-2 text-base">
              <Truck size={20} className="text-rose-600" /> تسجيل حالة طوارئ وإسعاف
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المصاب / المريض</label>
                <input
                  type="text"
                  value={erName}
                  onChange={e => setErName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="أدخل الاسم..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">العمر</label>
                  <input
                    type="text"
                    value={erAge}
                    onChange={e => setErAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={erPhone}
                    onChange={e => setErPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">درجة الخطورة والتصنيف</label>
                <select
                  value={erSeverity}
                  onChange={e => setErSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="Critical">حرج للغاية (Red - إنعاش فوري)</option>
                  <option value="Urgent">عاجل (Yellow - ملاحظة سريرية)</option>
                  <option value="Stable">مستقر (Green - كشف طوارئ)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">سبب الإصابة / الشكوى</label>
                <input
                  type="text"
                  value={erReason}
                  onChange={e => setErReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="حادث سير، أزمة قلبية..."
                />
              </div>
              <button
                onClick={addErPatient}
                className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> دخول طوارئ فوري
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base">حالات الطوارئ المسجلة الحالية</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">المريض</th>
                    <th className="px-4 py-3">العمر</th>
                    <th className="px-4 py-3">الخطورة</th>
                    <th className="px-4 py-3">السبب</th>
                    <th className="px-4 py-3">التوقيت</th>
                    <th className="px-4 py-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {erList.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-slate-400">لا توجد حالات طوارئ نشطة</td></tr>
                  ) : erList.map((e, idx) => (
                    <tr key={e.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{e.name}</td>
                      <td className="px-4 py-3">{e.age || '--'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          e.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          e.severity === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {e.severity === 'Critical' ? 'حرج Red' : e.severity === 'Urgent' ? 'عاجل Yellow' : 'مستقر Green'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{e.reason}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{e.date}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeErPatient(e.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. OR Tab */}
      {activeTab === 'or' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-amber-700 mb-4 flex items-center gap-2 text-base">
              <Scissors size={20} className="text-amber-600" /> جدولة عملية جراحية
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={orPatient}
                  onChange={e => setOrPatient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="اسم المريض..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع الجراحة</label>
                <input
                  type="text"
                  value={orSurgery}
                  onChange={e => setOrSurgery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="استئصال، قيصرية، قسطرة..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الجراح المسؤول</label>
                <input
                  type="text"
                  value={orSurgeon}
                  onChange={e => setOrSurgeon(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="د. اسم الجراح"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={orDate}
                    onChange={e => setOrDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الغرفة</label>
                  <input
                    type="text"
                    value={orRoom}
                    onChange={e => setOrRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">التكلفة المالية والرسوم (تسمع تلقائياً بالحسابات)</label>
                <input
                  type="number"
                  value={orCost}
                  onChange={e => setOrCost(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-teal-700 font-bold"
                  placeholder="ج.م. مثال: 4500"
                />
              </div>
              <button
                onClick={addOrBooking}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> حجز وجدولة العملية
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base">جدول العمليات الجراحية المجدولة</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">المريض</th>
                    <th className="px-4 py-3">نوع الجراحة</th>
                    <th className="px-4 py-3">الجراح</th>
                    <th className="px-4 py-3">الموعد</th>
                    <th className="px-4 py-3">الغرفة</th>
                    <th className="px-4 py-3">الرسوم</th>
                    <th className="px-4 py-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {orList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-400">لا توجد عمليات مجدولة</td></tr>
                  ) : orList.map((o, idx) => (
                    <tr key={o.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{o.patient}</td>
                      <td className="px-4 py-3 text-amber-700 font-medium">{o.surgery}</td>
                      <td className="px-4 py-3">{o.surgeon}</td>
                      <td className="px-4 py-3 text-xs">{o.date}</td>
                      <td className="px-4 py-3">{o.room}</td>
                      <td className="px-4 py-3 font-bold text-teal-600">{o.cost ? `${o.cost} ج.م.` : '--'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeOrBooking(o.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Inpatient Tab */}
      {activeTab === 'inpatient' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-blue-700 mb-4 flex items-center gap-2 text-base">
              <Bed size={20} className="text-blue-600" /> تسكين مريض بالإقامة والأسرة
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={inpName}
                  onChange={e => setInpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="اسم المريض..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">القسم الداخلي</label>
                <select
                  value={inpWard}
                  onChange={e => setInpWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="General Ward">إقامة عادية (General)</option>
                  <option value="ICU">عناية مركزة (ICU)</option>
                  <option value="NICU">حضانات أطفال (NICU)</option>
                  <option value="CCU">رعاية قلب مركزة (CCU)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الغرفة / السرير</label>
                  <input
                    type="text"
                    value={inpBed}
                    onChange={e => setInpBed(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="غرفة 204 - سرير 2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الطبيب المشرف</label>
                  <input
                    type="text"
                    value={inpDoctor}
                    onChange={e => setInpDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">رسوم التنويم والسرير اليومية (إلى الحسابات)</label>
                <input
                  type="number"
                  value={inpCost}
                  onChange={e => setInpCost(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-teal-700"
                  placeholder="ج.م. مثال: 1200"
                />
              </div>
              <button
                onClick={addInpatientAdmission}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> تسكين المريض
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base">المرضى المقيمون بالأسرة حالياً</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">المريض</th>
                    <th className="px-4 py-3">القسم</th>
                    <th className="px-4 py-3">الغرفة / السرير</th>
                    <th className="px-4 py-3">الطبيب المعالج</th>
                    <th className="px-4 py-3">تاريخ الدخول</th>
                    <th className="px-4 py-3">الرسوم اليومية</th>
                    <th className="px-4 py-3 text-center">خروج</th>
                  </tr>
                </thead>
                <tbody>
                  {inpatientList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-400">لا يوجد مرضى مقيمين حالياً</td></tr>
                  ) : inpatientList.map((i, idx) => (
                    <tr key={i.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{i.name}</td>
                      <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{i.ward}</span></td>
                      <td className="px-4 py-3">{i.bed}</td>
                      <td className="px-4 py-3">{i.doctor}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{i.date}</td>
                      <td className="px-4 py-3 font-bold text-teal-600">{i.cost ? `${i.cost} ج.م.` : '--'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeInpatient(i.id)} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded hover:bg-emerald-100">
                          تصريح خروج
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Lab Tab */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-emerald-700 mb-4 flex items-center gap-2 text-base">
              <FlaskConical size={20} className="text-emerald-600" /> طلب فحص مخبري جديد (LIS)
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={labPatient}
                  onChange={e => setLabPatient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="اسم المريض..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع التحليل من الدليل</label>
                <select
                  value={labTestName}
                  onChange={e => {
                    const val = e.target.value;
                    setLabTestName(val);
                    // Autofill price if matched from labSettingsList
                    const matched = (state.labSettingsList || []).find(t => t.name === val);
                    if (matched) {
                      setLabCost(Number(matched.price));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">اختر التحليل...</option>
                  {(state.labSettingsList || []).map((t, idx) => (
                    <option key={idx} value={t.name}>{t.name} ({t.price} EGP)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">رسوم التحليل الماليّة (إلى الحسابات)</label>
                <input
                  type="number"
                  value={labCost}
                  onChange={e => setLabCost(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-teal-700"
                  placeholder="ج.م. مثال: 450"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نتيجة الفحص المخبري</label>
                <textarea
                  value={labResult}
                  onChange={e => setLabResult(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20"
                  placeholder="أدخل النتائج والتقرير المخبري..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">إرفاق ملف النتيجة / PDF / صورة الفحص:</label>
                <input
                  type="file"
                  onChange={handleLabFileChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                {labFileObj && (
                  <span className="text-[11px] text-emerald-600 font-bold block mt-1">✓ تم رفع: {labFileObj.name}</span>
                )}
              </div>
              <button
                onClick={addLabOrder}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} /> حفظ وإرسال النتيجة
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base">سجل الفحوصات والنتائج المخبرية</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">المريض</th>
                    <th className="px-4 py-3">التحليل</th>
                    <th className="px-4 py-3">النتيجة</th>
                    <th className="px-4 py-3">الملف المرفق</th>
                    <th className="px-4 py-3">الرسوم</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {labList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-400">لا توجد فحوصات مسجلة</td></tr>
                  ) : labList.map((l, idx) => (
                    <tr key={l.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{l.patient}</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">{l.testName}</td>
                      <td className="px-4 py-3 text-slate-700">{l.result}</td>
                      <td className="px-4 py-3">
                        {l.fileData ? (
                          <a href={l.fileData} target="_blank" rel="noreferrer" download={l.fileName || 'Lab_Result.pdf'} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-100 transition-colors inline-block">
                            📄 {l.fileName || 'تحميل الملف'}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">لا يوجد ملف</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-600">{l.cost ? `${l.cost} ج.م.` : '--'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{l.date}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeLabOrder(l.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Radiology Tab */}
      {activeTab === 'radiology' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-indigo-700 mb-4 flex items-center gap-2 text-base">
              <Scan size={20} className="text-indigo-600" /> طلب فحص أشعة وتقرير (PACS)
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={radPatient}
                  onChange={e => setRadPatient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="اسم المريض..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع الفحص الإشعاعي</label>
                <input
                  type="text"
                  value={radType}
                  onChange={e => setRadType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="رنين مغناطيسي MRI، مقطعية CT، أشعة سينية X-Ray..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">تكلفة فحص الأشعة (إلى الحسابات)</label>
                <input
                  type="number"
                  value={radCost}
                  onChange={e => setRadCost(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-teal-700"
                  placeholder="ج.م. مثال: 850"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">تقرير استشاري الأشعة</label>
                <textarea
                  value={radReport}
                  onChange={e => setRadReport(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20"
                  placeholder="تقرير الحالة الإشعاعية والتشخيص..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">إرفاق صورة الأشعة / الملف الإشعاعي:</label>
                <input
                  type="file"
                  onChange={handleRadFileChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {radFileObj && (
                  <span className="text-[11px] text-indigo-600 font-bold block mt-1">✓ تم رفع: {radFileObj.name}</span>
                )}
              </div>
              <button
                onClick={addRadOrder}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} /> حفظ التقرير الإشعاعي
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base">أرشيف تقارير الأشعة التشخيصية</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">المريض</th>
                    <th className="px-4 py-3">نوع الأشعة</th>
                    <th className="px-4 py-3">التقرير</th>
                    <th className="px-4 py-3">الملف المرفق</th>
                    <th className="px-4 py-3">الرسوم</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {radList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-400">لا توجد تقارير أشعة</td></tr>
                  ) : radList.map((r, idx) => (
                    <tr key={r.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{r.patient}</td>
                      <td className="px-4 py-3 text-indigo-700 font-bold">{r.type}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{r.report}</td>
                      <td className="px-4 py-3">
                        {r.fileData ? (
                          <a href={r.fileData} target="_blank" rel="noreferrer" download={r.fileName || 'Radiology_Scan.png'} className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold hover:bg-indigo-100 transition-colors inline-block">
                            🖼️ {r.fileName || 'تحميل الأشعة'}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">لا يوجد ملف</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-600">{r.cost ? `${r.cost} ج.م.` : '--'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{r.date}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeRadOrder(r.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. ICU Tab */}
      {activeTab === 'icu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-rose-700 mb-4 flex items-center gap-2 text-base">
              <HeartPulse size={20} className="text-rose-600 animate-pulse" /> دخول الرعاية المركزة (ICU Admission)
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={icuPat}
                  onChange={e => setIcuPat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="اسم المريض بالكامل..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">العمر</label>
                  <input
                    type="text"
                    value={icuAgeVal}
                    onChange={e => setIcuAgeVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="مثال: 45 سنة"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">رقم السرير بالرعاية</label>
                  <input
                    type="text"
                    value={icuBedVal}
                    onChange={e => setIcuBedVal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-rose-600"
                    placeholder="رقم السرير..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">جهاز التنفس الصناعي (Ventilator)</label>
                <select
                  value={icuVentVal}
                  onChange={e => setIcuVentVal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
                >
                  <option value="None">بدون دعم تنفس (None)</option>
                  <option value="Invasive">تنفس صناعي اختراقي (Invasive Vent)</option>
                  <option value="Non-Invasive">تنفس صناعي غير اختراقي (Non-Invasive Vent)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نسبة الأكسجين (SpO2 %)</label>
                  <input
                    type="number"
                    value={icuSpo2Val}
                    onChange={e => setIcuSpo2Val(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                    placeholder="مثال: 95"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نبض القلب (Heart Rate)</label>
                  <input
                    type="number"
                    value={icuPulseVal}
                    onChange={e => setIcuPulseVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-rose-600"
                    placeholder="مثال: 80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">درجة استقرار الحالة</label>
                <select
                  value={icuCondVal}
                  onChange={e => setIcuCondVal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
                >
                  <option value="Critical">حالة حرجة جداً (Critical) 🚨</option>
                  <option value="Severe">حالة غير مستقرة (Severe) ⚠️</option>
                  <option value="Improving">حالة مستقرة / تتحسن (Improving) ✓</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">رسوم الإقامة اليومية بالرعاية (ج.م.)</label>
                <input
                  type="number"
                  value={icuCostVal}
                  onChange={e => setIcuCostVal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-teal-700"
                  placeholder="ج.م."
                />
              </div>
              <button
                onClick={addIcuPatient}
                className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} /> تسكين بالسرير وترحيل الفاتورة
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base flex items-center gap-2">
              <Activity size={18} className="text-rose-600" /> لوحة المتابعة اللحظية لوحدة العناية المركزة (ICU Live Dashboard)
            </h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {icuList.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <HeartPulse size={40} className="mx-auto text-slate-300 mb-2" />
                  لا يوجد مرضى منومين في وحدة العناية المركزة حالياً.
                </div>
              ) : icuList.map((i, idx) => (
                <div key={i.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative shadow-sm hover:border-rose-300 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      سرير رقم {i.bedNumber}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                      i.condition === 'Critical' ? 'bg-red-100 text-red-800 animate-pulse' :
                      i.condition === 'Severe' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {i.condition === 'Critical' ? '🔴 حرجة جداً' : i.condition === 'Severe' ? '🟡 غير مستقرة' : '🟢 مستقرة'}
                    </span>
                  </div>

                  <h6 className="font-bold text-slate-800 text-sm">{i.patientName}</h6>
                  <p className="text-[11px] text-slate-400 mt-1">العمر: {i.age} | تاريخ الدخول: {i.dateAdded}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400">الأكسجين</p>
                      <p className={`text-xs font-extrabold ${i.oxygenSaturation < 93 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                        {i.oxygenSaturation}% SpO2
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400">النبض</p>
                      <p className="text-xs font-extrabold text-rose-600">{i.heartRate} bpm</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-400">التنفس الصناعي</p>
                      <p className="text-[10px] font-bold text-indigo-700 truncate">{i.ventilatorStatus === 'None' ? 'لا يوجد' : i.ventilatorStatus}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">رسوم السرير: <span className="font-extrabold text-slate-700">{i.costPerDay} ج.م.</span></span>
                    <button
                      onClick={() => removeIcuPatient(i.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      إنهاء التسكين والسرير
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Blood Bank Tab */}
      {activeTab === 'bloodBank' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-red-700 mb-4 flex items-center gap-2 text-base">
              <Droplet size={20} className="text-red-600" /> شحن رصيد بنك الدم المركزي
            </h6>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اختر فصيلة الدم</label>
                <select
                  value={bloodTypeSel}
                  onChange={e => setBloodTypeSel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-extrabold text-slate-700"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">عدد الأكياس / الوحدات المضافة</label>
                <input
                  type="number"
                  value={bloodCountSel}
                  onChange={e => setBloodCountSel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800"
                  placeholder="أدخل عدد الوحدات..."
                />
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-800 font-semibold leading-relaxed">
                تنبيه: جميع عينات الدم المضافة تخضع آلياً لفحص الأجسام المضادة وفيروسات الكبد الوبائي ومناعة السيروم قبل إضافتها للرصيد الاستراتيجي. صلاحية الكيس الموحدة هي 35 يوماً من تاريخ التبرع.
              </div>
              <button
                onClick={addBloodBankUnit}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} /> شحن وإيداع كيس الدم
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base flex items-center gap-2">
              <Droplet size={18} className="text-red-600 animate-pulse" /> رصيد بنك الدم والاستهلاك الفوري للحالات الطارئة
            </h6>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => {
                const item = bloodBankList.find(b => b.bloodType === type);
                const count = item ? item.stockCount : 0;
                const isCritical = count < 5;

                return (
                  <div key={type} className={`p-4 rounded-2xl border transition-all text-center ${
                    isCritical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-2">
                      {type}
                    </div>
                    <div className="text-2xl font-black text-slate-800">{count}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">أكياس دم جاهزة</div>

                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isCritical ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'
                      }`}>
                        {isCritical ? 'مخزون حرج! 🚨' : 'مخزون آمن ✓'}
                      </span>
                    </div>

                    <button
                      onClick={() => dispenseBloodUnit(type as any)}
                      disabled={count <= 0}
                      className={`w-full mt-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        count <= 0 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm'
                      }`}
                    >
                      صرف كيس طارئ 🩸
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">✓ الترحيل المالي التلقائي:</span> عند صرف كيس دم طارئ، يقوم النظام تلقائياً بتوليد قيد إيرادات مستهلكات جراحية بقيمة <span className="font-bold text-teal-600">250 ج.م</span> وترحيله لحساب المنشأة وإثبات تكلفة المواد وصرفها من المخزون.
            </div>
          </div>
        </div>
      )}

      {/* 8. Doctor Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-teal-700 mb-4 flex items-center gap-2 text-base">
              <Coins size={20} className="text-teal-600" /> تسجيل استحقاق وعمولة طبيب
            </h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم الاستشاري / الطبيب المعالج</label>
                <input
                  type="text"
                  value={commDocVal}
                  onChange={e => setCommDocVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="أدخل اسم الطبيب المعالج..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع العملية أو الخدمة الطبية</label>
                <select
                  value={commOpVal}
                  onChange={e => setCommOpVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
                >
                  <option value="OR Surgery">جراحة كبرى بغرفة العمليات (OR Surgery)</option>
                  <option value="Inpatient Daily Visit">كشف مرور التنويم اليومي (Ward Inpatient)</option>
                  <option value="Outpatient Consultation">استشارة عيادات خارجية (Outpatient Clinic)</option>
                  <option value="Critical Care ICU Supervision">إشراف عظام ورعاية مركزة (ICU Supervision)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={commPatVal}
                  onChange={e => setCommPatVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="اسم المريض..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">إجمالي الفاتورة (ج.م.)</label>
                  <input
                    type="number"
                    value={commTotalVal}
                    onChange={e => setCommTotalVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نسبة الطبيب (%)</label>
                  <input
                    type="number"
                    value={commPctVal}
                    onChange={e => setCommPctVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-teal-600"
                  />
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-600">القيمة المستحقة المباشرة للطبيب:</span>
                <p className="text-base font-extrabold text-teal-600 mt-1">
                  {Math.round(commTotalVal * (commPctVal / 100))} ج.م.
                </p>
              </div>
              <button
                onClick={addCommission}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} /> قيد وإثبات مستحق الأتعاب
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h6 className="font-bold text-slate-800 mb-4 text-base">كشف مستحقات الأطباء والترحيل المحاسبي المباشر للخزينة</h6>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">اسم الطبيب</th>
                    <th className="px-4 py-3">المريض / العملية</th>
                    <th className="px-4 py-3 text-center">القيمة الإجمالية</th>
                    <th className="px-4 py-3 text-center">النسبة</th>
                    <th className="px-4 py-3 text-center">أتعاب الطبيب</th>
                    <th className="px-4 py-3 text-center">حالة الصرف</th>
                    <th className="px-4 py-3 text-center">الإجراء المالي</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">لا توجد سجلات عمولات أو أتعاب مسجلة حالياً.</td></tr>
                  ) : commissionList.map((c, idx) => (
                    <tr key={c.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">أ.د. {c.doctorName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <span className="font-semibold text-indigo-600 block">{c.operationType}</span>
                        المريض: {c.patientName}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{c.totalAmount} ج.م.</td>
                      <td className="px-4 py-3 text-center text-teal-600 font-bold">{c.commissionPercentage}%</td>
                      <td className="px-4 py-3 text-center font-black text-slate-800">{c.commissionEarned} ج.م.</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {c.status === 'paid' ? '✓ تم الصرف والمقاصة' : 'قيد الانتظار'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.status === 'pending' ? (
                          <button
                            onClick={() => payDoctorCommission(c.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-sm flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Coins size={11} /> صرف وترحيل القيد المحاسبي
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">صُرف مسبقاً (قيد مزدوج)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Dialysis Unit Tab */}
      {activeTab === 'dialysis' && (
        <div className="space-y-6">
          {/* Top Dialysis Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold">إجمالي مكائن الكلى</p>
                <h4 className="text-xl font-black text-slate-800 mt-1">{dialysisMachinesList.length} ماكينة</h4>
              </div>
              <div className="p-3 bg-cyan-50 text-cyan-700 rounded-xl">
                <Cpu size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold">الجلسات النشطة الآن</p>
                <h4 className="text-xl font-black text-amber-600 mt-1">
                  {dialysisSessionsList.filter(s => s.status === 'Ongoing').length} جلسة
                </h4>
              </div>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <Activity size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold">المكائن الجاهزة للخدمة</p>
                <h4 className="text-xl font-black text-emerald-600 mt-1">
                  {dialysisMachinesList.filter(m => m.status === 'Ready').length} جاهزة
                </h4>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold">مكائن قيد التعقيم</p>
                <h4 className="text-xl font-black text-indigo-600 mt-1">
                  {dialysisMachinesList.filter(m => m.status === 'Sterilization').length} تحت التعقيم
                </h4>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Start New Session Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h6 className="font-bold text-cyan-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                <Activity size={20} className="text-cyan-600" /> بدء جلسة غسيل كلوي (Hemodialysis)
              </h6>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المريض</label>
                <input
                  type="text"
                  value={diaPatName}
                  onChange={e => setDiaPatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                  placeholder="اسم المريض الثلاثي..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">العمر</label>
                  <input
                    type="text"
                    value={diaPatAge}
                    onChange={e => setDiaPatAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="مثال: 52 سنة"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اختيار الماكينة</label>
                  <select
                    value={diaMachSel}
                    onChange={e => setDiaMachSel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="">-- اختر ماكينة متفرغة --</option>
                    {dialysisMachinesList.map(m => (
                      <option key={m.id} value={m.machineCode} disabled={m.status !== 'Ready'}>
                        {m.machineCode} ({m.isolationCategory === 'Negative' ? 'خالي' : m.isolationCategory}) - {m.status === 'Ready' ? 'جاهزة ✓' : m.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نوع الفلتر Dialyser</label>
                  <select
                    value={diaFilter}
                    onChange={e => setDiaFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="High-Flux FX80">High-Flux FX80</option>
                    <option value="High-Flux FX60">High-Flux FX60</option>
                    <option value="Low-Flux F6">Low-Flux F6</option>
                    <option value="Low-Flux F8">Low-Flux F8</option>
                    <option value="HDF Hemodiafiltration">HDF Hemodiafiltration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الوصلة الشريانية/القسطرة</label>
                  <select
                    value={diaAccess}
                    onChange={e => setDiaAccess(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="AV_Fistula">وصلة شريانية وريدية AV Fistula</option>
                    <option value="Permcath">قسطرة دائمة Permcath</option>
                    <option value="Temp_Catheter">قسطرة مؤقتة Temporary Catheter</option>
                    <option value="AV_Graft">رقعة شريانية AV Graft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">الوزن قبل (kg)</label>
                  <input
                    type="number"
                    value={diaPreWeight}
                    onChange={e => setDiaPreWeight(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">الوزن الجاف (kg)</label>
                  <input
                    type="number"
                    value={diaDryWeight}
                    onChange={e => setDiaDryWeight(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">هدف السحب UF (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={diaUfTarget}
                    onChange={e => setDiaUfTarget(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-cyan-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">معدل تدفق الدم QB (ml/min)</label>
                  <input
                    type="number"
                    value={diaFlowQb}
                    onChange={e => setDiaFlowQb(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">جرعة الهيبارين (IU)</label>
                  <input
                    type="number"
                    value={diaHeparin}
                    onChange={e => setDiaHeparin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">تكلفة الجلسة (للترحيل المالي)</label>
                <input
                  type="number"
                  value={diaCost}
                  onChange={e => setDiaCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>

              <button
                onClick={startDialysisSession}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> بدء الجلسة وترحيل التكلفة للحسابات
              </button>

              {/* Add Machine Sub-form */}
              <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu size={14} className="text-slate-500" /> إضافة ماكينة غسيل كلوي جديدة
                </p>
                <input
                  type="text"
                  value={diaMachCode}
                  onChange={e => setDiaMachCode(e.target.value)}
                  placeholder="كود الماكينة مثل: M-05 (Fresenius)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={diaMachIso}
                    onChange={e => setDiaMachIso(e.target.value as any)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  >
                    <option value="Negative">خالي من الفيروسات (Negative)</option>
                    <option value="HCV_Positive">عزل فيروس سي (HCV+)</option>
                    <option value="HBV_Positive">عزل فيروس بي (HBV+)</option>
                  </select>
                  <button
                    onClick={addDialysisMachine}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                  >
                    + إضافة الماكينة
                  </button>
                </div>
              </div>
            </div>

            {/* Sessions Archive & Live Monitoring */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h6 className="font-bold text-slate-800 mb-4 text-base flex items-center justify-between">
                <span>سجل ومتابعة جلسات الغسيل الكلوي (Dialysis Sessions Log)</span>
                <span className="text-xs bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full border border-cyan-200 font-mono">
                  {dialysisSessionsList.length} جلسة مسجلة
                </span>
              </h6>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">المريض</th>
                      <th className="px-3 py-2.5">الماكينة</th>
                      <th className="px-3 py-2.5">الفلتر والوصلة</th>
                      <th className="px-3 py-2.5">السحب UF</th>
                      <th className="px-3 py-2.5">تدفق الدم QB</th>
                      <th className="px-3 py-2.5">التكلفة</th>
                      <th className="px-3 py-2.5">الحالة</th>
                      <th className="px-3 py-2.5 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dialysisSessionsList.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-6 text-slate-400">لا توجد جلسات غسيل كلوي مسجلة حالياً.</td></tr>
                    ) : (
                      dialysisSessionsList.map(s => (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3 font-bold text-slate-800">
                            {s.patientName}
                            <span className="block text-[10px] text-slate-400 font-normal">{s.patientAge}</span>
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-cyan-800">{s.machineCode}</td>
                          <td className="px-3 py-3 text-[11px]">
                            <span className="font-bold text-slate-700 block">{s.dialyserFilter}</span>
                            <span className="text-slate-400">{s.vascularAccess === 'AV_Fistula' ? 'AV Fistula' : s.vascularAccess}</span>
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-cyan-700">{s.ufTarget} L</td>
                          <td className="px-3 py-3 font-mono">{s.bloodFlowQB} mL/min</td>
                          <td className="px-3 py-3 font-bold text-emerald-700">{s.sessionCost} ج.م.</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'Ongoing' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {s.status === 'Ongoing' ? '⏳ جارية الآن' : '✓ مكتملة'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {s.status === 'Ongoing' ? (
                              <button
                                onClick={() => completeDialysisSession(s.id, s.machineCode)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer"
                              >
                                إتمام ونزع الخطوط
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">مكتملة ومُعقمة</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. RO Water Treatment System Tab */}
      {activeTab === 'waterRO' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-400/30 text-teal-300">
                <Waves size={32} />
              </div>
              <div>
                <h5 className="font-extrabold text-lg">محطة معالجة مياه الغسيل الكلوي (RO Water Treatment Plant)</h5>
                <p className="text-xs text-teal-200 mt-1">الرقابة الفنية الدورية لقراءات الموصلية الكهربائية (Conductivity) ونسبة الكلور والسموم البكتيرية لضمان سلامة المرضى.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-teal-950/80 px-4 py-2 rounded-xl border border-teal-800 text-center">
                <span className="text-[10px] text-teal-300 block font-bold">الموصلية القياسية</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">&lt; 15 µS/cm</span>
              </div>
              <div className="bg-teal-950/80 px-4 py-2 rounded-xl border border-teal-800 text-center">
                <span className="text-[10px] text-teal-300 block font-bold">الكلور الحر</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">0.0 mg/L</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inspection Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h6 className="font-bold text-teal-800 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
                <Droplets size={20} className="text-teal-600" /> تسجيل قراءات الفحص الدوري للمياه
              </h6>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم الكيميائي / مهندس الصيانة والتعقيم</label>
                <input
                  type="text"
                  value={roInspector}
                  onChange={e => setRoInspector(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الموصلية Conductivity (µS/cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roConductivity}
                    onChange={e => setRoConductivity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-teal-700"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">يجب ألا تتجاوز 15</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الكلور الحر Free Chlorine (mg/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={roFreeChlorine}
                    onChange={e => setRoFreeChlorine(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-teal-700"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">يجب أن تكون 0.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">درجة الحرارة (°C)</label>
                  <input
                    type="number"
                    value={roWaterTemp}
                    onChange={e => setRoWaterTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ضغط المشتت RO (Bar)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roPressure}
                    onChange={e => setRoPressure(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">اختبار السموم البكتيرية (Endotoxin Test)</p>
                  <p className="text-[10px] text-slate-500">سليم وخالي من الميكروبات</p>
                </div>
                <button
                  onClick={() => setRoEndotoxin(!roEndotoxin)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    roEndotoxin ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {roEndotoxin ? 'اجتاز الاختبار ✓' : 'راسب 🛑'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات الفحص والتعقيم</label>
                <textarea
                  value={roNotes}
                  onChange={e => setRoNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs h-16"
                />
              </div>

              <button
                onClick={addWaterTreatmentLog}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={16} /> اعتماد القراءات وحفظ التقرير
              </button>
            </div>

            {/* Logs Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h6 className="font-bold text-slate-800 mb-4 text-base">سجل الفحوصات والرقابة الفنية لمحطة المياه (RO Logs)</h6>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">التاريخ والوقت</th>
                      <th className="px-3 py-2.5">المسؤول</th>
                      <th className="px-3 py-2.5">الموصلية (µS/cm)</th>
                      <th className="px-3 py-2.5">الكلور (mg/L)</th>
                      <th className="px-3 py-2.5">السموم البكتيرية</th>
                      <th className="px-3 py-2.5">النتيجة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterTreatmentLogsList.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-6 text-slate-400">لا توجد سجلات فحص مياه مسجلة.</td></tr>
                    ) : (
                      waterTreatmentLogsList.map(w => (
                        <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3 font-mono text-slate-500">{w.timestamp}</td>
                          <td className="px-3 py-3 font-bold text-slate-800">{w.inspectorName}</td>
                          <td className="px-3 py-3 font-mono font-bold text-teal-700">{w.conductivity}</td>
                          <td className="px-3 py-3 font-mono font-bold text-teal-700">{w.freeChlorine}</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.endotoxinPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {w.endotoxinPassed ? 'خالي ✓' : 'ملوث 🛑'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              w.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {w.status === 'Passed' ? 'مطابق للمعايير ✓' : 'تحذير/صيانة'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <DoctorCallModal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
      />
    </div>
  );
}
