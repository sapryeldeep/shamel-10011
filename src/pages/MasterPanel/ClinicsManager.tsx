import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Clinic, User } from '../../types';
import { getFormattedDateTime } from '../../lib/utils';

// Sub-components
import ClinicMetricsBanner from './components/ClinicMetricsBanner';
import ClinicFormCard, { CLINIC_MODULES } from './components/ClinicFormCard';
import ClinicsTable from './components/ClinicsTable';
import ClinicVoucherModal from './components/ClinicVoucherModal';
import ClinicQuickEditModal from './components/ClinicQuickEditModal';
import ClinicDeleteModals from './components/ClinicDeleteModals';

export default function ClinicsManager() {
  const { state, updateState, logAction, switchClinicContext, currentUser, purgeCloudDatabase } = useAppContext();
  const navigate = useNavigate();
  
  // Form State
  const [name, setName] = useState('');
  const [docName, setDocName] = useState('');
  const [systemType, setSystemType] = useState<'clinic' | 'center' | 'hospital'>('clinic');
  const [specialty, setSpecialty] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [contractPrice, setContractPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [expiry, setExpiry] = useState('');
  const [modules, setModules] = useState<string[]>(CLINIC_MODULES.map(m => m.id));
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowChatbot, setAllowChatbot] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Per-clinic database custom server states
  const [dbType, setDbType] = useState<'cloud_firebase' | 'local_sql' | 'external_sql'>('cloud_firebase');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [dbName, setDbName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Handover Voucher Modal State
  const [voucherModalClinic, setVoucherModalClinic] = useState<Clinic | null>(null);
  const [voucherAdminUser, setVoucherAdminUser] = useState<User | null>(null);

  // In-App Confirmation Modal for Deletion
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);
  const [showDeleteAllClinicsModal, setShowDeleteAllClinicsModal] = useState(false);

  // Quick Account Edit Modal State
  const [quickEditClinic, setQuickEditClinic] = useState<Clinic | null>(null);

  // Password Visibility Toggle Map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Success Notification
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'clinic' | 'hospital' | 'active' | 'expired'>('all');

  const togglePasswordVisibility = (clinicId: string) => {
    const idStr = String(clinicId);
    setVisiblePasswords(prev => ({ ...prev, [idStr]: !prev[idStr] }));
  };

  const toggleClinicFeature = (c: Clinic, feature: 'allowWhatsApp' | 'allowPrinting' | 'allowChatbot') => {
    const cIdStr = String(c.id);
    const updatedClinics = state.clinics.map(item => {
      if (String(item.id) === cIdStr) {
        const currentVal = item[feature] !== false;
        return { ...item, [feature]: !currentVal };
      }
      return item;
    });
    updateState({ clinics: updatedClinics });
    logAction('تغيير صلاحيات المنشأة', `تم تعديل خاصية ${feature} للمنشأة: ${c.name}`);
  };

  const generateRandomCredentials = () => {
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') || 'clinic';
    const randNum = Math.floor(100 + Math.random() * 900);
    const suggestedUsername = `dr.${cleanName || 'admin'}${randNum}`;
    const suggestedPassword = Math.random().toString(36).slice(-6) + Math.floor(10 + Math.random() * 90);
    
    if (!adminUsername) setAdminUsername(suggestedUsername);
    if (!adminPass) setAdminPass(suggestedPassword);
  };

  const setPresetExpiry = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setExpiry(d.toISOString().split('T')[0]);
  };

  const setPermanentExpiry = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 20); // 20 years
    setExpiry(d.toISOString().split('T')[0]);
  };

  const openQuickEdit = (c: Clinic) => {
    setQuickEditClinic(c);
  };

  const saveQuickEdit = (updatedData: {
    name: string;
    docName: string;
    username: string;
    pass: string;
    expiryDate: string;
    status: 'active' | 'suspended';
    allowWhatsApp: boolean;
    allowPrinting: boolean;
    allowChatbot: boolean;
    geminiApiKey: string;
  }) => {
    if (!quickEditClinic) return;

    const cIdStr = String(quickEditClinic.id);
    const oldUsername = quickEditClinic.ownerUsername;

    // Check username conflict with other clinics
    const conflict = state.users.find(u => 
      (u.username || '').trim().toLowerCase() === updatedData.username.toLowerCase() && 
      String(u.clinicId) !== cIdStr
    );
    if (conflict) {
      return alert(`اسم المستخدم "${updatedData.username}" مستخدم بالفعل لحساب آخر! يرجى اختيار اسم آخر.`);
    }

    // 1. Update Clinic
    const updatedClinics = state.clinics.map(c => String(c.id) === cIdStr ? {
      ...c,
      name: updatedData.name,
      docName: updatedData.docName,
      expiryDate: updatedData.expiryDate,
      status: updatedData.status,
      ownerUsername: updatedData.username,
      ownerPass: updatedData.pass,
      allowWhatsApp: updatedData.allowWhatsApp,
      allowPrinting: updatedData.allowPrinting,
      allowChatbot: updatedData.allowChatbot,
      geminiApiKey: updatedData.geminiApiKey
    } : c);

    // 2. Update Admin User in users array
    let updatedUsers = [...state.users];
    const existingAdminUser = state.users.find(u => 
      String(u.clinicId) === cIdStr && 
      (u.username === oldUsername || u.role === 'doctor')
    );

    let targetAdminUser: User;
    if (existingAdminUser) {
      targetAdminUser = {
        ...existingAdminUser,
        name: updatedData.docName || updatedData.name,
        username: updatedData.username,
        pass: updatedData.pass,
        clinicId: cIdStr,
        role: existingAdminUser.role || 'doctor'
      };
      updatedUsers = updatedUsers.map(u => String(u.id) === String(existingAdminUser.id) ? targetAdminUser : u);
    } else {
      targetAdminUser = {
        id: Date.now().toString(),
        name: updatedData.docName || updatedData.name,
        username: updatedData.username,
        pass: updatedData.pass,
        role: 'doctor',
        clinicId: cIdStr,
        phone: '--'
      };
      updatedUsers.push(targetAdminUser);
    }

    updateState({ clinics: updatedClinics, users: updatedUsers });
    logAction('تعديل سريع لحساب منشأة', `تم تحديث بيانات دخول المنشأة: ${updatedData.name} (اسم الدخول: ${updatedData.username})`);
    
    setActionSuccessMsg(`تم حفظ وتحديث اسم المستخدم وكلمة المرور للمنشأة (${updatedData.name}) بنجاح!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    setQuickEditClinic(null);
  };

  const printVoucherSlipDirectly = (clinicObj: Clinic, userObj: User) => {
    const slipWin = window.open('', '_blank');
    if (!slipWin) return;
    slipWin.document.write(`
      <html dir="rtl">
      <head>
        <title>وثيقة تسليم ترخيص المنشأة الطبية - ${clinicObj.name}</title>
        <style>
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
          .voucher { border: 2px solid #2563eb; padding: 30px; max-width: 600px; margin: auto; border-radius: 16px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #1d4ed8; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .cred-box { background: #f0fdf4; border: 1.5px dashed #16a34a; border-radius: 12px; padding: 15px; margin: 20px 0; }
          .row-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .row-item:last-child { border-bottom: none; }
          .highlight { font-weight: bold; color: #0f172a; font-family: monospace; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .seal { display: inline-block; border: 2px solid #2563eb; color: #2563eb; font-weight: bold; padding: 4px 15px; border-radius: 8px; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="voucher">
          <div class="header">
            <h2 class="title">منظومة شامل للمستشفيات والعيادات (ERP)</h2>
            <div class="subtitle">وثيقة اعتماد وتسليم ترخيص النظام وحساب الإدارة الرئيسي</div>
            <div class="seal">ترخيص تشغيل معتمد ✓</div>
          </div>

          <div class="row-item"><span>اسم المنشأة الطبية:</span><strong>${clinicObj.name}</strong></div>
          <div class="row-item"><span>نوع المنشأة والتخصص:</span><span>${clinicObj.systemType === 'hospital' ? 'مستشفى' : 'عيادة / مركز'} - ${clinicObj.specialty || 'عام'}</span></div>
          <div class="row-item"><span>الطبيب / المدير المسؤول:</span><strong>${clinicObj.docName || '--'}</strong></div>
          <div class="row-item"><span>تاريخ الاعتماد والتسليم:</span><span>${getFormattedDateTime()}</span></div>
          <div class="row-item"><span>تاريخ انتهاء صلاحية الترخيص:</span><span style="color: #2563eb; font-weight: bold;">${clinicObj.expiryDate}</span></div>

          <div class="cred-box">
            <div style="font-weight: bold; color: #166534; margin-bottom: 10px; font-size: 14px;">🔐 بيانات حساب المدير الرئيسي (Clinic Admin):</div>
            <div class="row-item"><span>اسم المستخدم (Username):</span><span class="highlight">${userObj.username}</span></div>
            <div class="row-item"><span>كلمة المرور (Password):</span><span class="highlight">${userObj.pass}</span></div>
            <div class="row-item"><span>رابط تسجيل الدخول:</span><span style="direction: ltr; font-size: 12px;">${window.location.origin}</span></div>
          </div>

          <div style="font-size: 12px; color: #475569; line-height: 1.6;">
            <strong>توجيهات الإدارة:</strong><br/>
            - من خلال هذا الحساب، يمكن لمدير المنشأة إنشاء حسابات خاصة بالموظفين (الاستقبال، التمريض، الأطباء، الصيدلية، المعمل) وتحديد صلاحيات كل موظف.<br/>
            - يرجى الحفاظ على سرية بيانات الدخول.
          </div>

          <div class="footer">
            توقيع المطور والمسؤول الفني: <strong>م/ صبري الديب (Sapry El-Deeb)</strong><br/>
            هاتف: 01065826742 | بريد: sapry.eldeep@gmail.com
          </div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    slipWin.document.close();
  };

  const saveClinic = (printAfterSave: boolean = false) => {
    if (!name.trim()) return alert('يرجى إدخال اسم المنشأة الطبية');
    if (!adminUsername.trim() || !adminPass.trim()) {
      return alert('يرجى تحديد اسم مستخدم وكلمة مرور لمدير المنشأة لتمكينه من الدخول وإنشاء موظفيه');
    }

    const effectiveExpiry = expiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    if (editingId) {
      const editingIdStr = String(editingId);
      const targetClinic = state.clinics.find(c => String(c.id) === editingIdStr);

      // Check username conflict with other clinics
      const conflict = state.users.find(u => 
        (u.username || '').trim().toLowerCase() === adminUsername.trim().toLowerCase() && 
        String(u.clinicId) !== editingIdStr
      );
      if (conflict) {
        return alert(`اسم المستخدم "${adminUsername}" مستخدم بالفعل لحساب آخر! يرجى اختيار اسم مستخدم مختلف.`);
      }

      // 1. Update Clinic
      const updatedClinics = state.clinics.map(c => String(c.id) === editingIdStr ? {
        ...c,
        name: name.trim(),
        docName: docName.trim(),
        systemType,
        specialty: specialty.trim(),
        specialties: selectedSpecialties,
        phone: phone.trim(),
        expiryDate: effectiveExpiry,
        modules,
        status,
        contractPrice: Number(contractPrice) || 0,
        notes: notes.trim(),
        ownerUsername: adminUsername.trim(),
        ownerPass: adminPass.trim(),
        allowWhatsApp,
        allowPrinting,
        allowChatbot,
        geminiApiKey: geminiApiKey.trim(),
        dbType,
        dbHost: dbHost.trim(),
        dbPort: dbPort.trim(),
        dbUser: dbUser.trim(),
        dbPass: dbPass.trim(),
        dbName: dbName.trim()
      } : c);

      // 2. Update or find Clinic Admin User
      let existingAdminUser = state.users.find(u => 
        String(u.clinicId) === editingIdStr && 
        (u.username === targetClinic?.ownerUsername || u.role === 'doctor')
      );
      let updatedUsers = [...state.users];

      let targetAdminUser: User;
      if (existingAdminUser) {
        targetAdminUser = {
          ...existingAdminUser,
          name: docName.trim() || name.trim(),
          username: adminUsername.trim(),
          pass: adminPass.trim(),
          phone: phone.trim() || existingAdminUser.phone,
          clinicId: editingIdStr,
          role: existingAdminUser.role || 'doctor'
        };
        updatedUsers = updatedUsers.map(u => String(u.id) === String(existingAdminUser!.id) ? targetAdminUser : u);
      } else {
        targetAdminUser = {
          id: Date.now().toString(),
          name: docName.trim() || name.trim(),
          username: adminUsername.trim(),
          pass: adminPass.trim(),
          role: 'doctor',
          clinicId: editingIdStr,
          phone: phone.trim() || '--'
        };
        updatedUsers.push(targetAdminUser);
      }

      updateState({ clinics: updatedClinics, users: updatedUsers });
      logAction('تعديل منشأة طبية', `تم تعديل بيانات منشأة: ${name}`);
      
      const editedClinicObj = updatedClinics.find(c => String(c.id) === editingIdStr)!;
      
      setActionSuccessMsg(`تم حفظ تعديلات المنشأة (${name}) وحساب المدير بنجاح!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);

      if (printAfterSave) {
        printVoucherSlipDirectly(editedClinicObj, targetAdminUser);
      }

      resetForm();
    } else {
      // Create New Clinic
      const conflict = state.users.find(u => 
        (u.username || '').trim().toLowerCase() === adminUsername.trim().toLowerCase()
      );
      if (conflict) {
        return alert(`اسم المستخدم "${adminUsername}" مستخدم بالفعل لحساب آخر! يرجى اختيار اسم مستخدم جديد لمدير المنشأة لضمان عدم تداخل الحسابات.`);
      }

      const newClinicId = Date.now().toString();
      const newClinic: Clinic = {
        id: newClinicId,
        name: name.trim(),
        docName: docName.trim(),
        systemType,
        specialty: specialty.trim(),
        specialties: selectedSpecialties,
        phone: phone.trim(),
        daysCount: 0,
        expiryDate: effectiveExpiry,
        modules,
        status: 'active',
        contractPrice: Number(contractPrice) || 0,
        notes: notes.trim(),
        ownerUsername: adminUsername.trim(),
        ownerPass: adminPass.trim(),
        allowWhatsApp,
        allowPrinting,
        allowChatbot,
        geminiApiKey: geminiApiKey.trim(),
        dbType,
        dbHost: dbHost.trim(),
        dbPort: dbPort.trim(),
        dbUser: dbUser.trim(),
        dbPass: dbPass.trim(),
        dbName: dbName.trim()
      };

      // Create Admin User Account for this clinic
      const newAdminUser: User = {
        id: (Date.now() + 1).toString(),
        name: docName.trim() || `مدير ${name.trim()}`,
        username: adminUsername.trim(),
        pass: adminPass.trim(),
        role: 'doctor',
        clinicId: newClinicId,
        phone: phone.trim() || '--'
      };

      updateState({
        clinics: [...state.clinics, newClinic],
        users: [...state.users, newAdminUser]
      });

      logAction('إنشاء منشأة جديدة وتوليد حساب', `تم إنشاء منشأة: ${name} وتوليد حساب المدير: ${adminUsername}`);
      
      setActionSuccessMsg(`تم إنشاء منشأة (${name}) وتوليد حساب المدير بنجاح!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);

      if (printAfterSave) {
        printVoucherSlipDirectly(newClinic, newAdminUser);
      } else {
        setVoucherModalClinic(newClinic);
        setVoucherAdminUser(newAdminUser);
      }

      resetForm();
    }
  };

  const editClinic = (c: Clinic) => {
    const cIdStr = String(c.id);
    setEditingId(cIdStr);
    setName(c.name);
    setDocName(c.docName || '');
    setSystemType(c.systemType || 'clinic');
    setSpecialty(c.specialty || '');
    setSelectedSpecialties(c.specialties || []);
    setPhone(c.phone || '');
    setExpiry(c.expiryDate || '');
    setContractPrice(c.contractPrice || '');
    setNotes(c.notes || '');
    setModules(c.modules || CLINIC_MODULES.map(m => m.id));
    setStatus(c.status || 'active');
    setAllowWhatsApp(c.allowWhatsApp !== false);
    setAllowPrinting(c.allowPrinting !== false);
    setAllowChatbot(c.allowChatbot !== false);
    setGeminiApiKey(c.geminiApiKey || '');

    // Load Database configuration if existing
    setDbType(c.dbType || 'cloud_firebase');
    setDbHost(c.dbHost || '');
    setDbPort(c.dbPort || '');
    setDbUser(c.dbUser || '');
    setDbPass(c.dbPass || '');
    setDbName(c.dbName || '');

    const adminUser = state.users.find(u => String(u.clinicId) === cIdStr && (u.username === c.ownerUsername || u.role === 'doctor'));
    setAdminUsername(adminUser?.username || c.ownerUsername || '');
    setAdminPass(adminUser?.pass || c.ownerPass || '');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setDocName(''); setSpecialty(''); setPhone(''); setExpiry(''); 
    setSelectedSpecialties([]);
    setAdminUsername(''); setAdminPass(''); setContractPrice(''); setNotes('');
    setSystemType('clinic'); setStatus('active');
    setAllowWhatsApp(true); setAllowPrinting(true); setAllowChatbot(true); setGeminiApiKey('');
    setModules(CLINIC_MODULES.map(m => m.id));
    setDbType('cloud_firebase');
    setDbHost(''); setDbPort(''); setDbUser(''); setDbPass(''); setDbName('');
  };

  const downloadClinicData = (clinicId: string) => {
    const clinic = state.clinics.find(c => String(c.id) === String(clinicId));
    if (!clinic) return;

    const cIdStr = String(clinicId);
    
    const clinicData = {
      clinicInfo: clinic,
      users: state.users.filter(u => String(u.clinicId) === cIdStr),
      queue: state.queue[cIdStr] || [],
      archive: state.archive[cIdStr] || [],
      appointments: state.appointments[cIdStr] || [],
      erPatients: state.erStore[cIdStr] || [],
      orBookings: state.orStore[cIdStr] || [],
      inpatients: state.inpatientStore[cIdStr] || [],
      hospLabOrders: state.hospLabStore[cIdStr] || [],
      radOrders: state.radStore[cIdStr] || [],
      staff: state.staffDirectory[cIdStr] || [],
      payroll: state.payrollStore[cIdStr] || [],
      insuranceClaims: state.insuranceStore[cIdStr] || [],
      vitals: state.vitalsStore[cIdStr] || {},
      labs: state.labStore[cIdStr] || [],
      prescriptions: state.rxStore[cIdStr] || [],
      expenses: state.expensesStore[cIdStr] || [],
      rxSettings: state.rxSettingsStore[cIdStr] || {},
      queueDisplaySettings: state.queueDisplaySettingsStore[cIdStr] || {},
      whatsappSettings: state.whatsappSettingsStore[cIdStr] || {},
      patientStatusHistory: state.patientStatusHistoryStore[cIdStr] || [],
      globalDrugs: state.drugs,
      globalServices: state.services,
      globalDepartments: state.departments,
      globalInventory: state.inventory,
      globalReports: state.reports.filter(r => r.clinicId === cIdStr),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clinicData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `clinic_backup_${clinic.name}_${getFormattedDateTime().replace(/[: /]/g, '_')}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    
    logAction('تصدير بيانات المنشأة', `تم تنزيل نسخة احتياطية لبيانات المنشأة: ${clinic.name}`);
  };

  const confirmDeleteClinic = (c: Clinic) => {
    if (!c) return;
    const cIdStr = String(c.id);

    const updatedClinics = state.clinics.filter(item => String(item.id) !== cIdStr);
    const updatedUsers = state.users.filter(u => String(u.clinicId) !== cIdStr && u.username !== c.ownerUsername);
    const updatedDepartments = (state.departments || []).filter(d => String(d.clinicId) !== cIdStr);

    const updatedQueue = { ...state.queue };
    delete updatedQueue[cIdStr];
    delete updatedQueue[c.id];

    const updatedArchive = { ...state.archive };
    delete updatedArchive[cIdStr];
    delete updatedArchive[c.id];

    const updatedAppointments = { ...state.appointments };
    delete updatedAppointments[cIdStr];
    delete updatedAppointments[c.id];

    const updatedRxStore = { ...state.rxSettingsStore };
    delete updatedRxStore[cIdStr];
    delete updatedRxStore[c.id];

    const updatedErStore = { ...state.erStore };
    delete updatedErStore[cIdStr];
    delete updatedErStore[c.id];

    const updatedOrStore = { ...state.orStore };
    delete updatedOrStore[cIdStr];
    delete updatedOrStore[c.id];

    const updatedInpatientStore = { ...state.inpatientStore };
    delete updatedInpatientStore[cIdStr];
    delete updatedInpatientStore[c.id];

    const updatedStaffDirectory = { ...state.staffDirectory };
    delete updatedStaffDirectory[cIdStr];
    delete updatedStaffDirectory[c.id];

    const updatedPayrollStore = { ...state.payrollStore };
    delete updatedPayrollStore[cIdStr];
    delete updatedPayrollStore[c.id];

    const updatedInsuranceStore = { ...state.insuranceStore };
    delete updatedInsuranceStore[cIdStr];
    delete updatedInsuranceStore[c.id];

    const updatedInventory = (state.inventory || []).filter(i => String(i.clinicId) !== cIdStr);
    const updatedPatients = (state.patients || []).filter(p => String(p.clinicId) !== cIdStr);

    if (currentUser && String(currentUser.clinicId) === cIdStr) {
      switchClinicContext('master');
    }

    updateState({ 
      clinics: updatedClinics,
      users: updatedUsers,
      departments: updatedDepartments,
      queue: updatedQueue,
      archive: updatedArchive,
      appointments: updatedAppointments,
      rxSettingsStore: updatedRxStore,
      erStore: updatedErStore,
      orStore: updatedOrStore,
      inpatientStore: updatedInpatientStore,
      staffDirectory: updatedStaffDirectory,
      payrollStore: updatedPayrollStore,
      insuranceStore: updatedInsuranceStore,
      inventory: updatedInventory,
      patients: updatedPatients
    });

    if (editingId && String(editingId) === cIdStr) {
      resetForm();
    }
    if (quickEditClinic && String(quickEditClinic.id) === cIdStr) {
      setQuickEditClinic(null);
    }
    if (voucherModalClinic && String(voucherModalClinic.id) === cIdStr) {
      setVoucherModalClinic(null);
    }

    logAction('حذف منشأة طبية', `تم حذف المنشأة: ${c.name} وجميع بياناتها وحساباتها`);
    setActionSuccessMsg(`تم حذف المنشأة الطبية (${c.name}) وكافة حساباتها وبياناتها التابعة بنجاح!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    setDeleteTarget(null);
  };

  const openVoucherForClinic = (c: Clinic) => {
    const cIdStr = String(c.id);
    const adminUser = state.users.find(u => String(u.clinicId) === cIdStr && (u.username === c.ownerUsername || u.role === 'doctor'));
    setVoucherModalClinic(c);
    setVoucherAdminUser(adminUser || {
      id: '0',
      name: c.docName || c.name,
      username: c.ownerUsername || 'غير مسجل',
      pass: c.ownerPass || 'غير مسجل',
      role: 'doctor',
      clinicId: cIdStr
    });
  };

  // Real-time KPI Counters
  const totalClinicsCount = state.clinics.length;
  const clinicsCount = state.clinics.filter(c => c.systemType === 'clinic' || !c.systemType).length;
  const hospitalsCount = state.clinics.filter(c => c.systemType === 'hospital').length;
  const activeCount = state.clinics.filter(c => new Date(c.expiryDate).getTime() >= new Date().setHours(0,0,0,0)).length;
  const expiredCount = state.clinics.filter(c => new Date(c.expiryDate).getTime() < new Date().setHours(0,0,0,0)).length;

  // Filtered Clinics List
  const filteredClinics = state.clinics.filter(c => {
    if (filterType === 'clinic' && c.systemType === 'hospital') return false;
    if (filterType === 'hospital' && c.systemType !== 'hospital') return false;
    if (filterType === 'active' && new Date(c.expiryDate).getTime() < new Date().setHours(0,0,0,0)) return false;
    if (filterType === 'expired' && new Date(c.expiryDate).getTime() >= new Date().setHours(0,0,0,0)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchDoc = c.docName?.toLowerCase().includes(q);
      const matchPhone = c.phone?.includes(q);
      const matchSpec = c.specialty?.toLowerCase().includes(q);
      const matchUser = c.ownerUsername?.toLowerCase().includes(q);
      return matchName || matchDoc || matchPhone || matchSpec || matchUser;
    }
    return true;
  });

  const quickAdminUser = quickEditClinic 
    ? state.users.find(u => String(u.clinicId) === String(quickEditClinic.id) && (u.username === quickEditClinic.ownerUsername || u.role === 'doctor')) || null 
    : null;

  return (
    <div>
      {/* Real-time KPI Metrics Banner */}
      <ClinicMetricsBanner clinics={state.clinics} users={state.users} />

      {/* Provisioning Form Card */}
      <ClinicFormCard
        editingId={editingId}
        name={name}
        setName={setName}
        docName={docName}
        setDocName={setDocName}
        systemType={systemType}
        setSystemType={setSystemType}
        specialty={specialty}
        setSpecialty={setSpecialty}
        selectedSpecialties={selectedSpecialties}
        setSelectedSpecialties={setSelectedSpecialties}
        phone={phone}
        setPhone={setPhone}
        adminUsername={adminUsername}
        setAdminUsername={setAdminUsername}
        adminPass={adminPass}
        setAdminPass={setAdminPass}
        contractPrice={contractPrice}
        setContractPrice={setContractPrice}
        notes={notes}
        setNotes={setNotes}
        expiry={expiry}
        setExpiry={setExpiry}
        modules={modules}
        setModules={setModules}
        allowWhatsApp={allowWhatsApp}
        setAllowWhatsApp={setAllowWhatsApp}
        allowPrinting={allowPrinting}
        setAllowPrinting={setAllowPrinting}
        allowChatbot={allowChatbot}
        setAllowChatbot={setAllowChatbot}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        dbType={dbType}
        setDbType={setDbType}
        dbHost={dbHost}
        setDbHost={setDbHost}
        dbPort={dbPort}
        setDbPort={setDbPort}
        dbUser={dbUser}
        setDbUser={setDbUser}
        dbPass={dbPass}
        setDbPass={setDbPass}
        dbName={dbName}
        setDbName={setDbName}
        generateRandomCredentials={generateRandomCredentials}
        setPresetExpiry={setPresetExpiry}
        setPermanentExpiry={setPermanentExpiry}
        saveClinic={saveClinic}
        resetForm={resetForm}
        actionSuccessMsg={actionSuccessMsg}
      />

      {/* Clinics Directory & Licensing Table */}
      <ClinicsTable
        clinics={state.clinics}
        filteredClinics={filteredClinics}
        users={state.users}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        totalClinicsCount={totalClinicsCount}
        clinicsCount={clinicsCount}
        hospitalsCount={hospitalsCount}
        activeCount={activeCount}
        expiredCount={expiredCount}
        visiblePasswords={visiblePasswords}
        togglePasswordVisibility={togglePasswordVisibility}
        toggleClinicFeature={toggleClinicFeature}
        onEnterClinic={(id) => {
          switchClinicContext(id);
          navigate('/');
        }}
        onOpenVoucher={openVoucherForClinic}
        onOpenQuickEdit={openQuickEdit}
        onEditClinic={editClinic}
        onDownloadClinicData={downloadClinicData}
        onDeleteClinic={(c) => setDeleteTarget(c)}
        onOpenDeleteAllModal={() => setShowDeleteAllClinicsModal(true)}
      />

      {/* Quick Account Edit Modal */}
      <ClinicQuickEditModal
        clinic={quickEditClinic}
        adminUser={quickAdminUser}
        onClose={() => setQuickEditClinic(null)}
        onSave={saveQuickEdit}
      />

      {/* Delete Modals */}
      <ClinicDeleteModals
        deleteTarget={deleteTarget}
        onCancelDeleteTarget={() => setDeleteTarget(null)}
        onConfirmDeleteTarget={confirmDeleteClinic}
        showDeleteAllModal={showDeleteAllClinicsModal}
        totalClinicsCount={state.clinics.length}
        onCloseDeleteAllModal={() => setShowDeleteAllClinicsModal(false)}
        onConfirmDeleteAll={async () => {
          await purgeCloudDatabase();
          if (currentUser && currentUser.role !== 'master_admin') {
            switchClinicContext('master');
          }
          logAction('تصفير وتطهير السحابي والمنشآت', 'تم مسح كافة المنشآت والسيرفر السحابي وتجهيز النظام لبيع اشتراكات جديدة');
          setShowDeleteAllClinicsModal(false);
        }}
      />

      {/* Handover & License Voucher Modal */}
      <ClinicVoucherModal
        clinic={voucherModalClinic}
        adminUser={voucherAdminUser}
        onClose={() => setVoucherModalClinic(null)}
      />
    </div>
  );
}
