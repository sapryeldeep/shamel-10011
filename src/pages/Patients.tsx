import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, History, FileText, Phone, AlertTriangle, Activity, Paperclip, Printer, DollarSign, Plus, Trash2, MessageCircle, TrendingUp, Stethoscope, Clock, CheckCircle2, Calendar, User, Edit3, UserPlus, X, Save, FileSpreadsheet } from 'lucide-react';
import { DEFAULT_CLINICAL_STATES } from "../lib/constants";
import { PatientQueueItem, PatientStatusRecord } from '../types';
import { getFormattedDateTime, getTodayISO } from '../lib/utils';
import { exportToExcel, printReport, exportToPdf } from '../lib/exportUtils';

export default function Patients() {
  const { state, updateState, currentUser, deletePatient, editPatient, logAction, postMedicalBillingToAccounting } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePatient, setActivePatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'history' | 'vitals' | 'files'>('timeline');

  // Medical Alert Banner state
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [isEditingAlerts, setIsEditingAlerts] = useState(false);

  // Edit Patient Modal State
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatientName, setEditingPatientName] = useState('');
  const [editFormName, setEditFormName] = useState('');
  const [editFormPhone, setEditFormPhone] = useState('');
  const [editFormAge, setEditFormAge] = useState('');
  const [editFormAllergies, setEditFormAllergies] = useState('');
  const [editFormChronic, setEditFormChronic] = useState('');

  // Add Patient Modal State
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientService, setNewPatientService] = useState('كشف جديد');
  const [newPatientPrice, setNewPatientPrice] = useState('150');
  const [patientToDeleteName, setPatientToDeleteName] = useState<string | null>(null);

  // Vitals & Specialty Exam State
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [temp, setTemp] = useState('37.0');
  const [spo2, setSpo2] = useState('98%');
  const [specialtyNote, setSpecialtyNote] = useState('');

  // Patient Visit & Health Status Tracking State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusVisitType, setStatusVisitType] = useState('كشف ومتابعة عيادات');
  const [statusClinicalState, setStatusClinicalState] = useState<string>('improving');
  const [statusDiagnosisNotes, setStatusDiagnosisNotes] = useState('');
  const [statusTreatmentResponse, setStatusTreatmentResponse] = useState('');
  const [statusNextDate, setStatusNextDate] = useState('');

  // Payment Collector State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);

  // File Attachments
  const [fileTitle, setFileTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [patientFiles, setPatientFiles] = useState<{ id: string; name: string; title: string; url: string; date: string }[]>([]);

  const getClinicId = () => {
    return currentUser?.clinicId === 'master' ? 'master' : currentUser?.clinicId || 'master';
  };

  const getAllRecords = (): PatientQueueItem[] => {
    const cId = getClinicId();
    let records: PatientQueueItem[] = [];
    if (cId === 'master') {
      records = [
        ...(Object.values(state.queue).flat() as PatientQueueItem[]),
        ...(Object.values(state.archive).flat() as PatientQueueItem[])
      ];
    } else {
      records = [
        ...((state.queue[cId] || []) as PatientQueueItem[]),
        ...((state.archive[cId] || []) as PatientQueueItem[])
      ];
    }
    return records;
  };

  const allRecords = getAllRecords();

  const uniquePatientsMap = new Map<string, { name: string; phone: string; due: number; age?: string }>();
  allRecords.forEach(p => {
    if (!uniquePatientsMap.has(p.name)) {
      uniquePatientsMap.set(p.name, { name: p.name, phone: p.phone, due: 0, age: p.age });
    }
    const current = uniquePatientsMap.get(p.name)!;
    current.due += (Number(p.total) || 0) - (Number(p.paid) || 0);
  });

  const uniquePatients = Array.from(uniquePatientsMap.values())
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.phone && p.phone.includes(searchQuery)));

  const activeRecords = activePatient ? allRecords.filter(r => r.name === activePatient) : [];
  const currentPatientObj = activePatient ? uniquePatients.find(p => p.name === activePatient) : null;
  
  let totalReq = 0, totalPaid = 0, totalDue = 0;
  activeRecords.forEach(r => {
    totalReq += Number(r.total) || 0;
    totalPaid += Number(r.paid) || 0;
    totalDue += (Number(r.total) || 0) - (Number(r.paid) || 0);
  });

  // Calculate Combined Patient Visits & Historical Status Tracking (Last 5 Visits)
  const getCombinedVisitsForActivePatient = () => {
    if (!activePatient) return [];
    const cId = getClinicId() === 'master' ? (state.clinics[0]?.id || 'default') : getClinicId();
    
    // 1. Logged status records
    let statusRecords: PatientStatusRecord[] = [];
    if (getClinicId() === 'master') {
      statusRecords = (Object.values(state.patientStatusHistoryStore || {}) as PatientStatusRecord[][]).flat().filter(r => r.patientName === activePatient);
    } else {
      statusRecords = (state.patientStatusHistoryStore?.[cId] || []).filter(r => r.patientName === activePatient);
    }

    // 2. Clinical reports
    const patientReports = (state.reports || []).filter(r => r.patientName === activePatient);

    // 3. Queue / Archive visits
    const patientQueueVisits = activeRecords.filter(r => !r.service.includes('سداد دفعة'));

    const mapStatusLabel = (st: string) => {
      const statesList = state.clinics.find(c => c.id === currentUser?.clinicId)?.customClinicalStates || DEFAULT_CLINICAL_STATES;
      const found = statesList.find(s => s.id === st);
      return found ? found.label : (st || 'مستقرة (Stable)');
    };

    const combined: {
      id: string;
      rawDate: string;
      date: string;
      visitType: string;
      clinicalStatus: string;
      statusLabel: string;
      diagnosisNotes: string;
      treatmentResponse?: string;
      vitalSigns?: { bp?: string; hr?: string; temp?: string; spo2?: string };
      doctorName?: string;
      nextFollowUpDate?: string;
      source: 'logged_status' | 'report' | 'queue_visit';
    }[] = [];

    // Add logged status records
    statusRecords.forEach(r => {
      combined.push({
        id: r.id,
        rawDate: r.isoDate || r.date,
        date: r.date,
        visitType: r.visitType || 'كشف ومتابعة عيادات',
        clinicalStatus: r.clinicalStatus || 'stable',
        statusLabel: mapStatusLabel(r.clinicalStatus || 'stable'),
        diagnosisNotes: r.diagnosisNotes,
        treatmentResponse: r.treatmentResponse,
        vitalSigns: r.vitalSigns,
        doctorName: r.doctorName,
        nextFollowUpDate: r.nextFollowUpDate,
        source: 'logged_status'
      });
    });

    // Add clinical reports
    patientReports.forEach(rep => {
      combined.push({
        id: `rep_${rep.id}`,
        rawDate: rep.date,
        date: rep.date,
        visitType: rep.specialtyName ? `تقرير ${rep.specialtyName}` : 'تقرير عيادة تخصصية',
        clinicalStatus: 'improving',
        statusLabel: mapStatusLabel('improving'),
        diagnosisNotes: `${rep.diagnosis ? `التشخيص: ${rep.diagnosis}` : ''} ${rep.treatmentPlan ? ` | الخطة: ${rep.treatmentPlan}` : ''}`.trim() || rep.chiefComplaint || 'تقرير طبي تخصصي',
        treatmentResponse: rep.medicalHistory || 'تم إجراء الفحص واستكمال الخطة العلاجية بنجاح',
        vitalSigns: { bp: rep.vitalSigns?.bp, hr: rep.vitalSigns?.hr, temp: rep.vitalSigns?.temp },
        doctorName: rep.doctorName,
        source: 'report'
      });
    });

    // Add queue/archive records if not already present
    patientQueueVisits.forEach(q => {
      const dateKey = q.isoDate || q.date;
      const hasSameDate = combined.some(c => c.rawDate === dateKey);
      if (!hasSameDate) {
        combined.push({
          id: `q_${q.id}`,
          rawDate: dateKey,
          date: q.date || q.isoDate,
          visitType: q.service || 'زيارة عيادة خارجية',
          clinicalStatus: q.status === 'done' ? 'stable' : 'under_observation',
          statusLabel: mapStatusLabel(q.status === 'done' ? 'stable' : 'under_observation'),
          diagnosisNotes: `خدمة العيادة: ${q.service} - الحالة: ${q.status === 'done' ? 'تم الكشف' : 'قيد الانتظار'}`,
          treatmentResponse: `إجمالي الكشف: ${q.total} EGP - المدفوع: ${q.paid} EGP`,
          source: 'queue_visit'
        });
      }
    });

    // Sort descending by date
    combined.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));

    return combined;
  };

  const allPatientVisits = getCombinedVisitsForActivePatient();
  const last5Visits = allPatientVisits.slice(0, 5);
  const latestVisitStatus = last5Visits.length > 0 ? last5Visits[0] : null;

  // Add a new Status / Visit Record
  const addStatusRecord = () => {
    if (!activePatient) return;
    if (!statusDiagnosisNotes.trim()) {
      return alert('يرجى كتابة تشخيص الزيارة وملاحظات التطور السريري للمريض!');
    }

    const cId = getClinicId() === 'master' ? (state.clinics[0]?.id || 'default') : getClinicId();
    const newRecord: PatientStatusRecord = {
      id: Date.now().toString(),
      patientName: activePatient,
      clinicId: cId,
      date: getFormattedDateTime(),
      isoDate: getTodayISO(),
      visitType: statusVisitType || 'كشف ومتابعة عيادات',
      clinicalStatus: statusClinicalState,
      diagnosisNotes: statusDiagnosisNotes.trim(),
      treatmentResponse: statusTreatmentResponse.trim(),
      vitalSigns: { bp, hr, temp, spo2 },
      doctorName: currentUser?.name || 'طبيب العيادة',
      nextFollowUpDate: statusNextDate
    };

    const currentHistory = state.patientStatusHistoryStore?.[cId] || [];
    updateState({
      patientStatusHistoryStore: {
        ...state.patientStatusHistoryStore,
        [cId]: [newRecord, ...currentHistory]
      }
    });

    setStatusDiagnosisNotes('');
    setStatusTreatmentResponse('');
    setStatusNextDate('');
    setShowStatusModal(false);
    alert('تم تسجبل وتحديث الحالة السريرية والزيارة الجديدة بنجاح!');
  };

  const removeStatusRecord = (recordId: string) => {
    if (!confirm('هل أنت متأكد من حذف سجل الزيارة هذا؟')) return;
    const cId = getClinicId() === 'master' ? (state.clinics[0]?.id || 'default') : getClinicId();
    const currentHistory = state.patientStatusHistoryStore?.[cId] || [];
    const updated = currentHistory.filter(r => r.id !== recordId);
    
    updateState({
      patientStatusHistoryStore: {
        ...state.patientStatusHistoryStore,
        [cId]: updated
      }
    });
  };

  // Handle Payment Collection
  const collectPayment = () => {
    if (payAmount <= 0 || !activePatient) return alert('يرجى إدخال مبلغ صحيح');
    const cId = getClinicId() === 'master' ? (state.clinics[0]?.id || 'default') : getClinicId();
    
    // Add payment entry to archive as a financial settlement
    const paymentRecord: PatientQueueItem = {
      id: Date.now().toString(),
      name: activePatient,
      age: currentPatientObj?.age || '',
      phone: currentPatientObj?.phone || '--',
      service: 'سداد دفعة نقدية / تسوية حساب',
      total: 0,
      paid: payAmount,
      due: -payAmount,
      status: 'done',
      isoDate: getTodayISO(),
      date: getFormattedDateTime()
    };

    const currentArchive = state.archive[cId] || [];
    updateState({
      archive: {
        ...state.archive,
        [cId]: [...currentArchive, paymentRecord]
      }
    });

    // Auto post cash collection / outpatient fee to accounting double entry books
    postMedicalBillingToAccounting(cId, activePatient, 'outpatient', payAmount, 'سداد دفعة كشف/متابعة من مريض العيادة الخارجيّة');

    setPayAmount(0);
    setShowPayModal(false);
    alert('تم تحصيل الدفعة بنجاح، وترحيل القيد المحاسبي المزدوج إلى النظام المالي التابع للمركز تلقائياً!');
  };

  // Add File Attachment
  const [selectedFileObj, setSelectedFileObj] = useState<{ name: string; dataUrl: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedFileObj({
        name: file.name,
        dataUrl: evt.target?.result as string
      });
      if (!fileTitle) setFileTitle(file.name);
    };
    reader.readAsDataURL(file);
  };

  const addFile = () => {
    if (!fileTitle.trim() || (!fileUrl.trim() && !selectedFileObj) || !activePatient) {
      return alert('يرجى اختار ملف مرفق أو إدخال رابط الملف وتحديد العنوان');
    }
    const finalUrl = selectedFileObj ? selectedFileObj.dataUrl : fileUrl;
    const newFile = {
      id: Date.now().toString(),
      name: activePatient,
      title: fileTitle,
      url: finalUrl,
      fileName: selectedFileObj?.name,
      date: getFormattedDateTime()
    };
    setPatientFiles([...patientFiles, newFile]);
    setFileTitle('');
    setFileUrl('');
    setSelectedFileObj(null);
  };

  const removeFile = (fileId: string) => {
    setPatientFiles(patientFiles.filter(f => f.id !== fileId));
  };

  const sendWhatsAppReminder = (phone?: string) => {
    if (!activePatient) return;
    const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
    if (currentClinic?.allowWhatsApp === false) {
      return alert('عفواً، تم إيقاف خدمة إرسال تذكيرات الواتساب لهذه المنشأة من قبل المطور العام. يرجى التواصل مع المطور لتفعيل الخدمة.');
    }

    const patientPhone = phone || currentPatientObj?.phone;
    if (!patientPhone) {
      return alert('يرجى تسجيل رقم هاتف المريض لتتمكن من إرسال رسالة التذكير عبر الواتساب.');
    }

    const clinicKey = currentUser?.clinicId || 'default';
    const waSettings = state.whatsappSettingsStore?.[clinicKey] || {
      reminderTemplate: 'مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic} - {doctor}. نتمنى لكم دوام الصحة والعافية.',
      autoIncludeMap: true
    };

    if (waSettings.enableReminders === false) {
      return alert('تذكيرات الواتساب معطلة حالياً في إعدادات المنشأة. يرجى تفعيلها من صفحة الإعدادات.');
    }

    const clinicName = currentClinic ? currentClinic.name : 'العيادة';
    const doctorName = currentClinic?.docName ? `د/ ${currentClinic.docName}` : '';

    let message = waSettings.reminderTemplate || 'مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic}.';
    message = message
      .replace(/{patient}/g, activePatient)
      .replace(/{clinic}/g, clinicName)
      .replace(/{doctor}/g, doctorName)
      .replace(/{date}/g, getTodayISO())
      .replace(/{time}/g, '--');

    const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Print Comprehensive Medical Report
  const printMedicalReport = () => {
    if (!activePatient) return;

    const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
    if (currentClinic?.allowPrinting === false) {
      return alert('عفواً، تم إيقاف خدمة الطباعة والتحميل لهذه المنشأة من قبل المطور العام. يرجى التواصل مع المطور لتفعيل الصلاحية.');
    }

    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html dir="rtl">
      <head>
        <title>تقرير طبي شامل - ${activePatient}</title>
        <style>
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1e293b; }
          .report-box { border: 2px solid #2563eb; padding: 25px; border-radius: 12px; max-width: 800px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
          .vital-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center; }
          .vital-val { font-size: 16px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; font-size: 13px; }
          th { background: #f1f5f9; }
          .alert-box { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 10px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="report-box">
          <div class="header">
            <h2 style="color: #2563eb; margin: 0;">شامل للمستشفيات والعيادات التخصصية</h2>
            <p style="margin: 5px 0; color: #64748b;">تقرير الحالة الطبية الشامل وسجل الفحوصات</p>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
            <div><strong>اسم المريض:</strong> ${activePatient}</div>
            <div><strong>رقم الهاتف:</strong> ${currentPatientObj?.phone || '--'}</div>
            <div><strong>تاريخ التقرير:</strong> ${getFormattedDateTime()}</div>
          </div>
          
          ${allergies || chronicDiseases ? `
            <div class="alert-box">
              <strong>⚠️ تنبيه طبي حرج:</strong><br/>
              ${allergies ? `الحساسية الدوائية والغذائية: ${allergies}<br/>` : ''}
              ${chronicDiseases ? `الأمراض المزمنة: ${chronicDiseases}` : ''}
            </div>
          ` : ''}

          <h4 style="margin: 20px 0 5px 0; color: #1e293b;">العلامات الحيوية الأخيرة (Vital Signs):</h4>
          <div class="vitals-grid">
            <div class="vital-card"><div>ضغط الدم BP</div><div class="vital-val">${bp}</div></div>
            <div class="vital-card"><div>نبض القلب HR</div><div class="vital-val">${hr} bpm</div></div>
            <div class="vital-card"><div>الحرارة Temp</div><div class="vital-val">${temp} °C</div></div>
            <div class="vital-card"><div>الأكسجين SpO2</div><div class="vital-val">${spo2}</div></div>
          </div>

          ${specialtyNote ? `
            <h4 style="margin: 15px 0 5px 0;">ملاحظات الفحص السريري:</h4>
            <p style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 13px;">${specialtyNote}</p>
          ` : ''}

          <h4 style="margin: 20px 0 5px 0; color: #1e293b;">🩺 سجل آخر 5 زيارات وتطور الحالة الطبيّة للمريض:</h4>
          <table>
            <thead>
              <tr>
                <th>تاريخ الزيارة</th>
                <th>نوع الإجراء</th>
                <th>الحالة السريرية</th>
                <th>التشخيص وملاحظات التطور</th>
                <th>العلامات الحيوية</th>
              </tr>
            </thead>
            <tbody>
              ${last5Visits.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: #94a3b8;">لا توجد زيارات سابقة مسجلة للمريض</td></tr>
              ` : last5Visits.map(v => `
                <tr>
                  <td>${v.date}</td>
                  <td>${v.visitType}</td>
                  <td><strong>${v.statusLabel}</strong></td>
                  <td>${v.diagnosisNotes} ${v.treatmentResponse ? `<br/><small style="color: #2563eb;">(${v.treatmentResponse})</small>` : ''}</td>
                  <td>${v.vitalSigns ? `BP: ${v.vitalSigns.bp || '--'} | HR: ${v.vitalSigns.hr || '--'}` : '--'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h4 style="margin: 20px 0 5px 0;">سجل المعاملات والمالية:</h4>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الخدمة / الكشف</th>
                <th>المطلوب</th>
                <th>المدفوع</th>
              </tr>
            </thead>
            <tbody>
              ${activeRecords.map(r => `
                <tr>
                  <td>${r.isoDate || r.date}</td>
                  <td>${r.service}</td>
                  <td>${r.total} EGP</td>
                  <td>${r.paid} EGP</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 13px;">
            <div>توقيع الطبيب المعالج: ........................</div>
            <div>ختم العيادة / المستشفى: ........................</div>
          </div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleOpenEditModal = (pName: string) => {
    const pObj = uniquePatients.find(p => p.name === pName);
    const alertData = state.medicalAlertsStore?.[pName] || {};
    setEditingPatientName(pName);
    setEditFormName(pName);
    setEditFormPhone(pObj?.phone || '');
    setEditFormAge(pObj?.age || '');
    setEditFormAllergies(alertData.allergies || '');
    setEditFormChronic(alertData.chronicDiseases || '');
    setShowEditPatientModal(true);
  };

  const handleSavePatientEdit = () => {
    if (!editFormName.trim()) return alert('يرجى كتابة اسم المريض');
    editPatient(editingPatientName, {
      name: editFormName.trim(),
      phone: editFormPhone.trim(),
      age: editFormAge.trim(),
      allergies: editFormAllergies.trim(),
      chronicDiseases: editFormChronic.trim()
    });

    if (activePatient === editingPatientName) {
      setActivePatient(editFormName.trim());
      setAllergies(editFormAllergies.trim());
      setChronicDiseases(editFormChronic.trim());
    }

    setShowEditPatientModal(false);
  };

  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const allowPatientDeletion = isMaster || (currentClinic?.allowPatientDeletion !== false);
  const allowPrinting = isMaster || (currentClinic?.allowPrinting !== false);
  const allowExcel = isMaster || (currentClinic?.allowExcelExport !== false);
  const allowPdf = isMaster || (currentClinic?.allowPdfExport !== false);

  const handleDeletePatientConfirm = (pName: string) => {
    if (!pName) return;
    if (!allowPatientDeletion) {
      alert('عذراً، قام المطور بإيقاف صلاحية حذف ملفات المرضى لهذه المنشأة لدواعي الحماية والرقابة.');
      return;
    }
    setPatientToDeleteName(pName);
  };

  const handleAddNewPatient = () => {
    if (!newPatientName.trim()) return alert('يرجى كتابة اسم المريض الجديد');
    const cId = getClinicId() === 'master' ? (state.clinics[0]?.id || 'default') : getClinicId();
    const newRecord: PatientQueueItem = {
      id: Date.now(),
      name: newPatientName.trim(),
      phone: newPatientPhone.trim(),
      age: newPatientAge.trim() || '30',
      service: newPatientService || 'كشف جديد',
      total: Number(newPatientPrice) || 150,
      paid: Number(newPatientPrice) || 150,
      due: 0,
      status: 'done',
      date: new Date().toLocaleDateString('ar-EG'),
      isoDate: new Date().toISOString()
    };

    const currentQueue = state.queue[cId] || [];
    updateState({
      queue: {
        ...state.queue,
        [cId]: [newRecord, ...currentQueue]
      }
    });

    logAction(
      'إضافة مريض جديد',
      `تم فتح ملف مريض جديد باسم «${newPatientName.trim()}» هاتف «${newPatientPhone.trim() || 'بدون'}».`,
      'patients',
      { operationType: 'create', targetName: newPatientName.trim(), targetId: String(newRecord.id) }
    );

    setActivePatient(newPatientName.trim());
    setShowAddPatientModal(false);
    setNewPatientName('');
    setNewPatientPhone('');
    setNewPatientAge('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Sidebar: Patient Directory */}
      <div className="xl:col-span-1 h-full flex flex-col">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h6 className="font-bold text-slate-800 flex items-center gap-2">
                <Search size={18} className="text-blue-600" /> دليل وسجلات المرضى
              </h6>
              <div className="flex items-center gap-1">
                {allowExcel && (
                  <button
                    type="button"
                    onClick={() => {
                      exportToExcel(
                        uniquePatients,
                        [
                          { key: 'name', label: 'اسم المريض' },
                          { key: 'phone', label: 'رقم الهاتف' },
                          { key: 'age', label: 'العمر' },
                          { key: 'due', label: 'المتبقي (EGP)' }
                        ],
                        'دليل_المرضى_الشامل'
                      );
                    }}
                    title="تصدير إكسيل Excel"
                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FileSpreadsheet size={14} />
                    <span className="hidden sm:inline">Excel</span>
                  </button>
                )}
                {allowPdf && (
                  <button
                    type="button"
                    onClick={() => {
                      exportToPdf({
                        title: 'دليل وسجلات المرضى (PDF)',
                        subtitle: `إجمالي المرضى المسجلين: ${uniquePatients.length}`,
                        columns: [
                          { key: 'name', label: 'اسم المريض' },
                          { key: 'phone', label: 'رقم الهاتف' },
                          { key: 'due', label: 'المستحقات', format: (val) => val > 0 ? `متبقي ${val}` : 'خالص' }
                        ],
                        data: uniquePatients
                      });
                    }}
                    title="تصدير PDF"
                    className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FileText size={14} />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                )}
                {allowPrinting && (
                  <button
                    type="button"
                    onClick={() => {
                      printReport({
                        title: 'دليل وسجلات المرضى',
                        subtitle: `إجمالي المرضى المسجلين: ${uniquePatients.length}`,
                        columns: [
                          { key: 'name', label: 'اسم المريض' },
                          { key: 'phone', label: 'رقم الهاتف' },
                          { key: 'due', label: 'المستحقات', format: (val) => val > 0 ? `متبقي ${val}` : 'خالص' }
                        ],
                        data: uniquePatients
                      });
                    }}
                    title="طباعة الدليل"
                    className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">طباعة</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <UserPlus size={14} /> مريض جديد
                </button>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {uniquePatients.length === 0 ? (
              <div className="text-center p-4 text-sm text-slate-400">لا توجد نتائج مطابقة</div>
            ) : (
              uniquePatients.map((p, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePatient(p.name)}
                  className={`p-3 border-b border-slate-50 cursor-pointer rounded-lg mb-1 transition-colors group relative ${
                    activePatient === p.name ? 'bg-blue-50 border-blue-100 shadow-sm' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <strong className="block text-sm text-slate-800 truncate">{p.name}</strong>
                      <span className="text-xs text-slate-500 block truncate">{p.phone || 'بدون رقم'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.due > 0 ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">متبقي {p.due}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">خالص</span>
                      )}
                      
                      <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(p.name);
                          }}
                          title="تعديل المريض"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100/80 rounded-md transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePatientConfirm(p.name);
                          }}
                          title="حذف المريض"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/80 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Patient Comprehensive Profile */}
      <div className="xl:col-span-2 h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
          {!activePatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full min-h-[300px]">
              <FileText size={64} className="mb-4 text-slate-200" />
              <h5 className="font-medium text-slate-500">اختر مريضاً من القائمة الجانبية</h5>
              <p className="text-sm mt-2 text-slate-400">لعرض الملف الطبي الشامل، العلامات الحيوية، والحسابات التفصيلية</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header Profile */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-5 flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{activePatient}</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Phone size={14} /> {currentPatientObj?.phone || 'بدون رقم'}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => handleOpenEditModal(activePatient)}
                    className="px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                    title="تعديل بيانات المريض والتنبيهات الطبية"
                  >
                    <Edit3 size={16} /> تعديل المريض
                  </button>
                  <button 
                    onClick={() => handleDeletePatientConfirm(activePatient)}
                    className="px-3 py-2 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                    title="حذف المريض نهائياً من النظام والتخزين السحابي والمحلي"
                  >
                    <Trash2 size={16} /> حذف المريض
                  </button>
                  <button 
                    onClick={() => sendWhatsAppReminder()}
                    className="px-3.5 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    title="إرسال تذكير بالواتساب لهذا المريض"
                  >
                    <MessageCircle size={16} /> تذكير واتساب
                  </button>
                  <button 
                    onClick={printMedicalReport}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    <Printer size={16} /> تقرير طبي شامل
                  </button>
                  <button 
                    onClick={() => setShowPayModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <DollarSign size={16} /> تحصيل دفعة نقدية
                  </button>
                </div>
              </div>

              {/* Medical Alert Banner */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-rose-800 text-xs flex items-center gap-1.5">
                    <AlertTriangle size={16} className="text-rose-600" /> تنبيه طبي حرج (الحساسية والأمراض المزمنة)
                  </span>
                  <button 
                    onClick={() => setIsEditingAlerts(!isEditingAlerts)}
                    className="text-xs text-rose-700 font-bold underline"
                  >
                    {isEditingAlerts ? 'تم الحفظ' : 'تعديل التنبيهات'}
                  </button>
                </div>
                {isEditingAlerts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <input
                      type="text"
                      placeholder="الحساسية الدوائية (مثل: بنسلين، سلفا)..."
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="الأمراض المزمنة (ضغط، سكر، قلب)..."
                      value={chronicDiseases}
                      onChange={e => setChronicDiseases(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-rose-900 font-medium">
                    {allergies || chronicDiseases ? (
                      <div>
                        {allergies && <div>• الحساسية: <span className="font-bold">{allergies}</span></div>}
                        {chronicDiseases && <div>• الأمراض المزمنة: <span className="font-bold">{chronicDiseases}</span></div>}
                      </div>
                    ) : (
                      <span className="text-slate-400">لا توجد حساسيات دوائية أو أمراض مزمنة مسجلة للمريض</span>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                  <span className="block text-xs font-bold text-slate-500 mb-1">إجمالي المطالبات</span>
                  <strong className="text-lg text-slate-800">{totalReq} EGP</strong>
                </div>
                <div className="p-4 border border-emerald-100/50 rounded-xl bg-emerald-50/50 text-center">
                  <span className="block text-xs font-bold text-emerald-600 mb-1">المدفوعات</span>
                  <strong className="text-lg text-emerald-700">{totalPaid} EGP</strong>
                </div>
                <div className="p-4 border border-red-100/50 rounded-xl bg-red-50/50 text-center">
                  <span className="block text-xs font-bold text-red-600 mb-1">المتبقي</span>
                  <strong className="text-lg text-red-700">{totalDue} EGP</strong>
                </div>
              </div>

              {/* Profile Internal Tabs */}
              <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-2 px-3 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'timeline' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <TrendingUp size={16} /> تتبع الحالة التاريخية (آخر 5 زيارات)
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 px-3 text-sm font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  سجل الماليات والخدمات
                </button>
                <button
                  onClick={() => setActiveTab('vitals')}
                  className={`pb-2 px-3 text-sm font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'vitals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  العلامات الحيوية والفحص
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`pb-2 px-3 text-sm font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'files' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  المرفقات والتقارير
                </button>
              </div>

              {/* Tab 0: Historical Status & Last 5 Visits Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex justify-between items-center flex-wrap gap-2 p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 rounded-xl border border-blue-100">
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        سجل التتبع السريري وتطور علاج المريض (آخر 5 زيارات)
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        عرض تطور الحالة الصحية والتشخيص وملاحظات الطبيب عبر الزيارات الأخيرة
                      </p>
                    </div>
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={15} /> تسجيل زيارة وحالة جديدة
                    </button>
                  </div>

                  {/* Summary Metric Strip */}
                  {latestVisitStatus && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">الحالة السريرية الحالية</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          latestVisitStatus.clinicalStatus === 'stable' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          latestVisitStatus.clinicalStatus === 'improving' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          latestVisitStatus.clinicalStatus === 'under_observation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          latestVisitStatus.clinicalStatus === 'requires_followup' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {latestVisitStatus.statusLabel}
                        </span>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">إجمالي الزيارات المسجلة</span>
                        <strong className="text-xs text-slate-800">{allPatientVisits.length} زيارات في السجل</strong>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">تاريخ أحدث زيارة</span>
                        <strong className="text-xs text-slate-700">{latestVisitStatus.date}</strong>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">موعد المتابعة المتوقع</span>
                        <strong className="text-xs text-blue-700">{latestVisitStatus.nextFollowUpDate || 'غير محدد'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Last 5 Visits Cards */}
                  <div className="space-y-3">
                    {last5Visits.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-xl">
                        <Clock size={36} className="mx-auto text-slate-300 mb-2" />
                        <h6 className="font-bold text-slate-700 text-sm">لا توجد زيارات سابقة مسجلة لهذا المريض حتى الآن</h6>
                        <p className="text-xs text-slate-400 mt-1 mb-3">يمكنك تسجيل أحدث كشف أو حالة سريرية لمتابعة تطور العلاج</p>
                        <button
                          onClick={() => setShowStatusModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                          تسجيل أول زيارة للمريض
                        </button>
                      </div>
                    ) : (
                      last5Visits.map((v, idx) => (
                        <div 
                          key={v.id} 
                          className="relative pl-3 border-r-4 border-blue-500 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                        >
                          {/* Visit Card Header */}
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[11px] rounded-md border border-blue-200/50">
                                الزيارة #{allPatientVisits.length - idx} {idx === 0 ? '(الأحدث)' : ''}
                              </span>
                              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                <Calendar size={13} className="text-slate-400" /> {v.date}
                              </span>
                              <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md border border-slate-200">
                                {v.visitType}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                v.clinicalStatus === 'stable' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                v.clinicalStatus === 'improving' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                v.clinicalStatus === 'under_observation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                v.clinicalStatus === 'requires_followup' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {v.statusLabel}
                              </span>

                              {v.source === 'logged_status' && (
                                <button
                                  onClick={() => removeStatusRecord(v.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="حذف هذا السجل"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Diagnosis & Notes */}
                          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 text-xs">
                            <strong className="text-slate-800 block mb-1">التشخيص وملاحظات السجل السريري:</strong>
                            <p className="text-slate-600 leading-relaxed font-medium">{v.diagnosisNotes}</p>
                          </div>

                          {/* Treatment Response */}
                          {v.treatmentResponse && (
                            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 text-xs">
                              <strong className="text-blue-900 block mb-0.5">استجابة العلاج والتوصيات:</strong>
                              <p className="text-blue-800 leading-relaxed">{v.treatmentResponse}</p>
                            </div>
                          )}

                          {/* Card Footer: Vitals & Doctor */}
                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              {v.vitalSigns?.bp && <span>ضغط الدم: <strong className="text-slate-700">{v.vitalSigns.bp}</strong></span>}
                              {v.vitalSigns?.hr && <span>النبض: <strong className="text-slate-700">{v.vitalSigns.hr} bpm</strong></span>}
                              {v.vitalSigns?.temp && <span>الحرارة: <strong className="text-slate-700">{v.vitalSigns.temp} °C</strong></span>}
                            </div>
                            <div className="flex items-center gap-3">
                              {v.doctorName && <span>الطبيب المعالج: <strong className="text-slate-700">{v.doctorName}</strong></span>}
                              {v.nextFollowUpDate && <span>المتابعة القادمة: <strong className="text-blue-600">{v.nextFollowUpDate}</strong></span>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 1: Visits History */}
              {activeTab === 'history' && (
                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-sm text-right text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold">التاريخ</th>
                        <th className="px-4 py-3 font-semibold">الإجراء / الخدمة</th>
                        <th className="px-4 py-3 font-semibold">المطلوب</th>
                        <th className="px-4 py-3 font-semibold">المدفوع</th>
                        <th className="px-4 py-3 font-semibold">المتبقي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRecords.map(r => (
                        <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-xs">{r.isoDate || r.date}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{r.service}</td>
                          <td className="px-4 py-3">{r.total}</td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">{r.paid}</td>
                          <td className="px-4 py-3 text-red-600 font-bold">{r.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Vitals & Exam */}
              {activeTab === 'vitals' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">ضغط الدم (BP)</label>
                      <input
                        type="text"
                        value={bp}
                        onChange={e => setBp(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">نبض القلب (HR)</label>
                      <input
                        type="text"
                        value={hr}
                        onChange={e => setHr(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">الحرارة (°C)</label>
                      <input
                        type="text"
                        value={temp}
                        onChange={e => setTemp(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">تشبع الأكسجين (SpO2)</label>
                      <input
                        type="text"
                        value={spo2}
                        onChange={e => setSpo2(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات الفحص والتشخيص السريري التخصصي</label>
                    <textarea
                      value={specialtyNote}
                      onChange={e => setSpecialtyNote(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-28"
                      placeholder="كتابة تقرير الفحص التخصصي، تشخيص الحالة، وتوصيات الطبيب المعالج..."
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Attachments & Files */}
              {activeTab === 'files' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h6 className="font-bold text-xs text-slate-700">إضافة مرفق / نتيجة تحليل أو أشعة كملف مباشر</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="عنوان الملف (مثال: أشعة سينية / تحليل CBC)..."
                        value={fileTitle}
                        onChange={e => setFileTitle(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <div className="flex flex-col justify-center">
                        <label className="text-[11px] font-bold text-slate-600 mb-1">رفع ملف مباشر (PDF, صورة, تقرير):</label>
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {selectedFileObj && (
                          <span className="text-[10px] text-emerald-600 font-bold mt-1">✓ تم اختيار: {selectedFileObj.name}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={addFile}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} /> رفع وحفظ المرفق
                    </button>
                  </div>

                  <div className="space-y-2">
                    {patientFiles.filter(f => f.name === activePatient).length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">لا توجد ملفات مرفقة لهذا المريض حالياً</div>
                    ) : (
                      patientFiles.filter(f => f.name === activePatient).map(f => (
                        <div key={f.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Paperclip size={16} className="text-blue-600" />
                            <div>
                              <strong className="text-xs text-slate-800 block">{f.title}</strong>
                              <small className="text-[10px] text-slate-400">{f.date}</small>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a 
                              href={f.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              download={f.fileName || `${f.title}.png`}
                              className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                            >
                              عرض / تحميل الملف
                            </a>
                            <button
                              onClick={() => removeFile(f.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف المرفق"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Status & Visit Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h6 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Stethoscope size={20} className="text-blue-600" />
                تسجيل زيارة وتتبع حالة صحية جديدة
              </h6>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
              <input type="text" readOnly value={activePatient || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">نوع الزيارة / الإجراء</label>
                <select
                  value={statusVisitType}
                  onChange={e => setStatusVisitType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value="كشف ومتابعة عيادات">كشف ومتابعة عيادات</option>
                  <option value="كشف استشاري تخصصي">كشف استشاري تخصصي</option>
                  <option value="استشارة عاجلة">استشارة عاجلة</option>
                  <option value="جلسة غسيل كلوي HD">جلسة غسيل كلوي HD</option>
                  <option value="كشف طوارئ ER">كشف طوارئ ER</option>
                  <option value="متابعة نتائج الفحوصات والتحاليل">متابعة نتائج الفحوصات</option>
                  <option value="فحص وتقييم شامل">فحص وتقييم شامل</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الحالة السريرية للمريض</label>
                <select
                  value={statusClinicalState}
                  onChange={e => setStatusClinicalState(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                >
                  {(state.clinics.find(c => c.id === currentUser?.clinicId)?.customClinicalStates || DEFAULT_CLINICAL_STATES).map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">التشخيص وملاحظات السجل السريري *</label>
              <textarea
                rows={3}
                placeholder="اكتب التشخيص وملاحظات تطور الحالة والعلاج..."
                value={statusDiagnosisNotes}
                onChange={e => setStatusDiagnosisNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">استجابة العلاج والتوصيات الطبية</label>
              <textarea
                rows={2}
                placeholder="ملاحظات الاستجابة للعلاج والأدوية والتوصيات..."
                value={statusTreatmentResponse}
                onChange={e => setStatusTreatmentResponse(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Vitals snapshot fields */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">العلامات الحيوية للزيارة (اختياري)</label>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="BP (120/80)"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-center"
                />
                <input
                  type="text"
                  placeholder="HR (72)"
                  value={hr}
                  onChange={e => setHr(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-center"
                />
                <input
                  type="text"
                  placeholder="Temp (37.0)"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-center"
                />
                <input
                  type="text"
                  placeholder="SpO2 (98%)"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ المتابعة / الاستشارة القادمة (اختياري)</label>
              <input
                type="date"
                value={statusNextDate}
                onChange={e => setStatusNextDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button 
                onClick={addStatusRecord}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
              >
                حفظ وتسجيل الزيارة
              </button>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <h6 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-600" /> تحصيل دفعة نقدية
            </h6>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
              <input type="text" readOnly value={activePatient || ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">المبلغ المحصل (EGP)</label>
              <input 
                type="number" 
                min="0"
                value={payAmount} 
                onChange={e => setPayAmount(Number(e.target.value))} 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-600"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={collectPayment}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
              >
                تأكيد التحصيل
              </button>
              <button 
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditPatientModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h6 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" /> تعديل بيانات المريض
              </h6>
              <button
                type="button"
                onClick={() => setShowEditPatientModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المريض بالكامل *</label>
                <input
                  type="text"
                  value={editFormName}
                  onChange={e => setEditFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  placeholder="أدخل الاسم الثلاثي/الرباعي"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editFormPhone}
                    onChange={e => setEditFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="01xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">العمر / السن</label>
                  <input
                    type="text"
                    value={editFormAge}
                    onChange={e => setEditFormAge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="مثال: 45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1 flex items-center gap-1">
                  <AlertTriangle size={13} /> الحساسية الدوائية والغذائية
                </label>
                <textarea
                  rows={2}
                  value={editFormAllergies}
                  onChange={e => setEditFormAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-rose-400"
                  placeholder="مثال: حساسية البنسلين، أسبيرين..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">الأمراض المزمنة والتنبيهات الطبية</label>
                <textarea
                  rows={2}
                  value={editFormChronic}
                  onChange={e => setEditFormChronic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  placeholder="مثال: ضغط الدم، السكري، أمراض القلب..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSavePatientEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save size={16} /> حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={() => setShowEditPatientModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h6 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" /> إضافة مريض جديد إلى النظام
              </h6>
              <button
                type="button"
                onClick={() => setShowAddPatientModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المريض بالكامل *</label>
                <input
                  type="text"
                  value={newPatientName}
                  onChange={e => setNewPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  placeholder="أدخل الاسم الثلاثي/الرباعي"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newPatientPhone}
                    onChange={e => setNewPatientPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="01xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">العمر / السن</label>
                  <input
                    type="text"
                    value={newPatientAge}
                    onChange={e => setNewPatientAge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    placeholder="مثال: 35"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نوع الكشف / الخدمة</label>
                  <input
                    type="text"
                    value={newPatientService}
                    onChange={e => setNewPatientService(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رسوم الكشف (EGP)</label>
                  <input
                    type="number"
                    value={newPatientPrice}
                    onChange={e => setNewPatientPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAddNewPatient}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserPlus size={16} /> إضافة المريض وتأكيد التسجيل
              </button>
              <button
                type="button"
                onClick={() => setShowAddPatientModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Patient Confirmation Modal (100% Reliable in iframe) */}
      {patientToDeleteName && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h6 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Trash2 size={20} className="text-rose-600" /> تأكيد حذف المريض
              </h6>
              <button
                type="button"
                onClick={() => setPatientToDeleteName(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-sm text-rose-800">
                <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                <span>تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه</span>
              </div>
              <p className="leading-relaxed">
                أنت على وشك حذف المريض <strong className="text-slate-900 font-extrabold text-sm bg-white/80 px-2 py-0.5 rounded border border-rose-200 inline-block my-1">{patientToDeleteName}</strong> وكافة سجلاته الطبية والروشتات والزيارات التاريخية والمواعيد نهائياً من النظام.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (patientToDeleteName) {
                    deletePatient(patientToDeleteName);
                    if (activePatient === patientToDeleteName) {
                      setActivePatient(null);
                    }
                    setPatientToDeleteName(null);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 size={16} /> نعم، تأكيد الحذف النهائي
              </button>
              <button
                type="button"
                onClick={() => setPatientToDeleteName(null)}
                className="px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
