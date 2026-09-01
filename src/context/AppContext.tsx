import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFormattedDateTime, getTodayISO } from '../lib/utils';
import { 
  User, Clinic, PatientQueueItem, Appointment, Expense, Drug, DiagnosisProtocol, Service, Department, 
  ClinicalReport, AccountingTransaction, Invoice, AuditLog, AuditOperationType, InsuranceCompany, InventoryItem,
  ErPatient, OrBooking, InpatientAdmission, HospLabOrder, RadOrder, StaffMember, 
  PayrollTransaction, InsuranceClaim, LabSettingItem, PrescriptionSettings, QueueDisplaySettings,
  WhatsAppSettings, PatientStatusRecord, Account, JournalEntry, Voucher
} from '../types';
import { generateDefaultChartOfAccounts } from '../lib/accountingDefaults';
import { db } from '../lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { AppState, defaultState, defaultDiagnosisProtocols, defaultRxSettings, defaultQueueDisplaySettings, defaultWhatsAppSettings } from './defaults';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, pass: string) => string | null;
  logout: () => void;
  switchClinicContext: (clinicId: string) => void;
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  logAction: (
    action: string, 
    details: string, 
    category?: AuditLog['category'],
    options?: {
      operationType?: AuditOperationType;
      targetId?: string;
      targetName?: string;
      severity?: 'info' | 'warning' | 'danger' | 'success';
      metadata?: Record<string, any>;
      clinicIdOverride?: string;
      clinicNameOverride?: string;
      userOverride?: { id: string; name: string; role?: string };
    }
  ) => void;
  purgeCloudDatabase: () => Promise<void>;
  deletePatient: (patientName: string) => void;
  editPatient: (oldName: string, updatedData: { name: string; phone: string; age?: string; allergies?: string; chronicDiseases?: string }) => void;
  archiveAndResetQueue: (targetClinicId?: string) => void;
  addAccount: (clinicId: string, account: Omit<Account, 'id' | 'createdAt' | 'clinicId'>) => void;
  editAccount: (clinicId: string, accountId: string, updates: Partial<Account>) => void;
  deleteAccount: (clinicId: string, accountId: string) => void;
  addJournalEntry: (clinicId: string, entry: Omit<JournalEntry, 'id' | 'createdAt' | 'clinicId' | 'createdBy' | 'createdByName'>) => void;
  editJournalEntry: (clinicId: string, entryId: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (clinicId: string, entryId: string) => void;
  addVoucher: (clinicId: string, voucher: Omit<Voucher, 'id' | 'createdAt' | 'clinicId' | 'createdBy' | 'createdByName'>) => void;
  editVoucher: (clinicId: string, voucherId: string, updates: Partial<Voucher>) => void;
  deleteVoucher: (clinicId: string, voucherId: string) => void;
  checkPasswordUniqueness: (password: string, excludeUserId?: string) => { isUnique: boolean; conflictUser?: User };
  changeUserPassword: (userId: string, newPassword: string) => string | null;
  postMedicalBillingToAccounting: (
    clinicId: string,
    patientName: string,
    billingType: 'consultation' | 'surgery' | 'inpatient' | 'lab' | 'rad' | 'payment',
    amount: number,
    description: string
  ) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    const dbRef = ref(db, 'shamelHospitalPlatformV2');
    
    // 1. Check local storage for initial offline state fallback
    const offlineState = localStorage.getItem('shamelOfflineState');
    if (offlineState) {
      try {
        const parsed = JSON.parse(offlineState);
        setState({
          ...defaultState,
          ...parsed,
          databaseConfig: {
            ...defaultState.databaseConfig,
            ...(parsed.databaseConfig || {})
          }
        });
      } catch (e) {
        console.error("Failed to load offline state", e);
      }
    }

    // 2. Listen to Firebase Realtime Database
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mergedState: AppState = {
          ...defaultState,
          ...data,
          databaseConfig: {
            ...defaultState.databaseConfig,
            ...(data.databaseConfig || {})
          },
          users: data.users || defaultState.users,
          clinics: data.clinics || [],
          drugs: data.drugs || defaultState.drugs,
          services: data.services || defaultState.services,
          inventory: data.inventory || defaultState.inventory,
          labSettingsList: data.labSettingsList || defaultState.labSettingsList,
          queue: data.queue || {},
          archive: data.archive || {},
          appointments: data.appointments || {},
          expensesStore: data.expensesStore || {},
          erStore: data.erStore || {},
          orStore: data.orStore || {},
          inpatientStore: data.inpatientStore || {},
          hospLabStore: data.hospLabStore || {},
          radStore: data.radStore || {},
          staffDirectory: data.staffDirectory || {},
          payrollStore: data.payrollStore || {},
          insuranceStore: data.insuranceStore || {},
          vitalsStore: data.vitalsStore || {},
          labStore: data.labStore || {},
          rxStore: data.rxStore || {},
          rxSettingsStore: data.rxSettingsStore || defaultState.rxSettingsStore,
          queueDisplaySettingsStore: data.queueDisplaySettingsStore || defaultState.queueDisplaySettingsStore,
          whatsappSettingsStore: data.whatsappSettingsStore || defaultState.whatsappSettingsStore,
          diagnosisProtocols: data.diagnosisProtocols || defaultDiagnosisProtocols,
          patientStatusHistoryStore: data.patientStatusHistoryStore || {}
        };
        
        // Ensure master admin exists
        if (!mergedState.users.some(u => u.username === 'sapry eldeep')) {
          mergedState.users.unshift(defaultState.users[0]);
        }

        // Automatic Daily Queue Rollover to Archive
        const todayISO = getTodayISO();
        let hasPastQueueItems = false;
        const rolledQueue = { ...(mergedState.queue || {}) };
        const rolledArchive = { ...(mergedState.archive || {}) };

        Object.keys(rolledQueue).forEach(cId => {
          const items = rolledQueue[cId] || [];
          const oldItems = items.filter(item => item.isoDate && item.isoDate < todayISO);
          if (oldItems.length > 0) {
            hasPastQueueItems = true;
            // Keep only items registered today
            rolledQueue[cId] = items.filter(item => !item.isoDate || item.isoDate >= todayISO);
            
            const existingArc = rolledArchive[cId] || [];
            const existingIds = new Set(existingArc.map(a => String(a.id)));
            const uniqueOld = oldItems.map(item => ({
              ...item,
              date: item.date && item.date.length > 5 ? item.date : (item.date || getFormattedDateTime())
            })).filter(item => !existingIds.has(String(item.id)));

            rolledArchive[cId] = [...uniqueOld, ...existingArc];
          }
        });

        if (hasPastQueueItems) {
          mergedState.queue = rolledQueue;
          mergedState.archive = rolledArchive;
          set(dbRef, JSON.parse(JSON.stringify(mergedState)));
        }

        setState(mergedState);
        // Save latest state to local storage for offline use
        localStorage.setItem('shamelOfflineState', JSON.stringify(mergedState));
      } else {
        set(dbRef, JSON.parse(JSON.stringify(defaultState)));
      }
    });
    
    // Check local storage for session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Sync offline changes when internet comes back
    const handleOnline = () => {
      const pendingState = localStorage.getItem('shamelOfflineState');
      if (pendingState) {
        set(ref(db, 'shamelHospitalPlatformV2'), JSON.parse(pendingState));
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const login = (username: string, pass: string) => {
    const uLower = username.trim().toLowerCase();
    const isDevUsername = uLower === 'sapry eldeep' || uLower === 'master' || uLower === 'sapry.eldeep@gmail.com' || uLower === 'admin.master' || uLower === 'sapry';
    const isDevPass = pass === '159632' || pass === 'master123' || pass === 'master';

    if (isDevUsername && isDevPass) {
      const masterUser: User = {
        id: 'master',
        name: 'صبري الديب (المطور الرئيسي)',
        username: uLower,
        pass: pass,
        role: 'master_admin',
        clinicId: 'master',
        perms: []
      };
      setCurrentUser(masterUser);
      localStorage.setItem('currentUser', JSON.stringify(masterUser));
      return null;
    }

    const user = state.users.find(u => u.username?.trim().toLowerCase() === uLower && u.pass === pass);
    if (user) {
      const clinic = state.clinics.find(c => c.id === user.clinicId);
      if (user.role !== 'master_admin' && clinic) {
        const today = new Date().setHours(0,0,0,0);
        if (clinic.status === 'suspended') return 'عفواً، تم إيقاف حساب هذه المنشأة. يرجى التواصل مع الدعم الفني.';
        const expiryDate = new Date(clinic.expiryDate).setHours(0,0,0,0);
        if (today > expiryDate) {
          return "عفواً، لقد انتهت صلاحية اشتراك هذه المنشأة. يرجى التواصل مع المطور (Sapry El-Deeb) لتجديد الاشتراك أو استعادة الخدمة.";
        }
      }
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return null;
    }
    return "بيانات الدخول غير صحيحة!";
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchClinicContext = (clinicId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, clinicId };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const updateState = (newState: Partial<AppState>) => {
    const updated = { ...state, ...newState };
    setState(updated);
    
    // Save to local storage for offline fallback immediately
    localStorage.setItem('shamelOfflineState', JSON.stringify(updated));
    
    // Sync with Firebase safely using update() instead of set() to prevent data loss
    if (navigator.onLine) {
      import('firebase/database').then(({ update, ref }) => {
        try {
          const cleanUpdates = JSON.parse(JSON.stringify(newState)); // Send only what changed
          update(ref(db, 'shamelHospitalPlatformV2'), cleanUpdates).catch(err => {
            console.error("Firebase Sync Error", err);
          });
        } catch (err) {
          console.error("Firebase Sanitize Error", err);
        }
      });
    }
  };

  const purgeCloudDatabase = async () => {
    localStorage.removeItem('shamelOfflineState');
    localStorage.removeItem('medical_app_state_v2');

    const masterDevUser: User = {
      id: 'master',
      name: 'صبري الديب (المطور الرئيسي)',
      username: 'sapry eldeep',
      pass: '159632',
      role: 'master_admin',
      clinicId: 'master',
      perms: []
    };

    const cleanPayload: AppState = {
      users: [masterDevUser],
      clinics: [],
      queue: {},
      archive: {},
      appointments: {},
      drugs: defaultState.drugs,
      services: defaultState.services,
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
      staffDirectory: {},
      payrollStore: {},
      insuranceStore: {},
      labSettingsList: defaultState.labSettingsList,
      vitalsStore: {},
      labStore: {},
      rxStore: {},
      rxSettingsStore: { 'master': defaultRxSettings },
      queueDisplaySettingsStore: { 'master': defaultQueueDisplaySettings },
      whatsappSettingsStore: { 'master': defaultWhatsAppSettings },
      diagnosisProtocols: defaultDiagnosisProtocols,
      patientStatusHistoryStore: {}
    };

    setState(cleanPayload);
    localStorage.setItem('shamelOfflineState', JSON.stringify(cleanPayload));

    try {
      await set(ref(db, 'shamelHospitalPlatformV2'), cleanPayload);
      await remove(ref(db, 'shamelHospitalPlatform')).catch(() => {});
      await remove(ref(db, 'shamelHospitalPlatformV1')).catch(() => {});
      console.log("Cloud Database Wiped Clean Successfully");
    } catch (err) {
      console.error("Cloud Database Wipe Error:", err);
    }
  };

  const logAction = (
    action: string, 
    details: string, 
    category: AuditLog['category'] = 'system',
    options?: {
      operationType?: AuditOperationType;
      targetId?: string;
      targetName?: string;
      severity?: 'info' | 'warning' | 'danger' | 'success';
      metadata?: Record<string, any>;
      clinicIdOverride?: string;
      clinicNameOverride?: string;
      userOverride?: { id: string; name: string; role?: string };
    }
  ) => {
    const user = options?.userOverride || currentUser;
    if (!user) return;

    const effectiveClinicId = options?.clinicIdOverride || user.clinicId;
    const clinic = state.clinics.find(c => String(c.id) === String(effectiveClinicId));

    // Determine CRUD operation type
    let opType: AuditOperationType = options?.operationType || 'process';
    if (!options?.operationType) {
      const actLower = action.toLowerCase();
      if (actLower.includes('حذف') || actLower.includes('إلغاء') || actLower.includes('مسح') || actLower.includes('تفريغ')) {
        opType = 'delete';
      } else if (actLower.includes('إضافة') || actLower.includes('إنشاء') || actLower.includes('تسجيل') || actLower.includes('حجز') || actLower.includes('جديد')) {
        opType = 'create';
      } else if (actLower.includes('تعديل') || actLower.includes('تحديث') || actLower.includes('تغيير') || actLower.includes('ترقية')) {
        opType = 'update';
      } else if (actLower.includes('دخول') || actLower.includes('خروج') || actLower.includes('أمان') || actLower.includes('صلاحية')) {
        opType = 'auth';
      } else if (actLower.includes('استعراض') || actLower.includes('عرض') || actLower.includes('قراءة')) {
        opType = 'read';
      } else {
        opType = 'process';
      }
    }

    // Determine severity
    let severity: 'info' | 'warning' | 'danger' | 'success' = options?.severity || 'info';
    if (!options?.severity) {
      if (opType === 'delete') severity = 'danger';
      else if (opType === 'create') severity = 'success';
      else if (opType === 'update') severity = 'warning';
      else if (opType === 'auth') severity = 'info';
      else severity = 'info';
    }

    const newLog: AuditLog = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      clinicId: effectiveClinicId,
      clinicName: options?.clinicNameOverride || (effectiveClinicId === 'master' ? 'الإدارة المركزية (المطور)' : (clinic?.name || 'منشأة طبية')),
      action,
      operationType: opType,
      category,
      details,
      targetId: options?.targetId,
      targetName: options?.targetName,
      severity,
      metadata: options?.metadata
    };

    updateState({ auditLogs: [newLog, ...(state.auditLogs || [])] });
  };

  // Accounting Helpers
  const addAccount = (clinicId: string, accountData: Omit<Account, 'id' | 'createdAt' | 'clinicId'>) => {
    const currentAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);
    const newAccount: Account = {
      ...accountData,
      id: `${clinicId}_acc_${Date.now()}`,
      clinicId,
      createdAt: new Date().toISOString()
    };
    const updatedStore = {
      ...(state.accountsStore || {}),
      [clinicId]: [...currentAccounts, newAccount]
    };
    updateState({ accountsStore: updatedStore });
    logAction('إضافة حساب مالي', `تمت إضافة حساب جديد «${accountData.name}» برمز «${accountData.code}».`, 'accounting');
  };

  const editAccount = (clinicId: string, accountId: string, updates: Partial<Account>) => {
    const currentAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);
    const updatedAccounts = currentAccounts.map(acc => acc.id === accountId ? { ...acc, ...updates } : acc);
    const updatedStore = {
      ...(state.accountsStore || {}),
      [clinicId]: updatedAccounts
    };
    updateState({ accountsStore: updatedStore });
    logAction('تعديل حساب مالي', `تم تعديل بيانات الحساب المالي كود «${updates.code || accountId}».`, 'accounting');
  };

  const deleteAccount = (clinicId: string, accountId: string) => {
    const currentAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);
    const accountToDelete = currentAccounts.find(a => a.id === accountId);
    if (accountToDelete?.isSystemAccount) {
      alert('لا يمكن حذف الحسابات النظامية الأساسية حفاظاً على توازن الشجرة المحاسبية!');
      return;
    }
    const updatedAccounts = currentAccounts.filter(acc => acc.id !== accountId);
    const updatedStore = {
      ...(state.accountsStore || {}),
      [clinicId]: updatedAccounts
    };
    updateState({ accountsStore: updatedStore });
    logAction('حذف حساب مالي', `تم حذف الحساب المالي «${accountToDelete?.name || accountId}».`, 'accounting');
  };

  const addJournalEntry = (clinicId: string, entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'clinicId' | 'createdBy' | 'createdByName'>) => {
    const currentEntries = state.journalEntriesStore?.[clinicId] || [];
    const newEntry: JournalEntry = {
      ...entryData,
      id: `jv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      clinicId,
      createdBy: currentUser?.id || 'sys',
      createdByName: currentUser?.name || 'المستخدم',
      createdAt: new Date().toISOString()
    };

    const updatedEntries = [newEntry, ...currentEntries];
    const currentAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);

    // Dynamic Recalculation
    const resetAccounts = currentAccounts.map(acc => ({
      ...acc,
      currentBalance: Number(acc.openingBalance) || 0
    }));

    updatedEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const targetAcc = resetAccounts.find(a => a.id === line.accountId || a.code === line.accountCode);
        if (targetAcc) {
          if (targetAcc.type === 'asset' || targetAcc.type === 'expense') {
            targetAcc.currentBalance = (Number(targetAcc.currentBalance) || 0) + (Number(line.debit) || 0) - (Number(line.credit) || 0);
          } else {
            targetAcc.currentBalance = (Number(targetAcc.currentBalance) || 0) + (Number(line.credit) || 0) - (Number(line.debit) || 0);
          }
        }
      });
    });

    const updatedEntriesStore = {
      ...(state.journalEntriesStore || {}),
      [clinicId]: updatedEntries
    };
    const updatedAccountsStore = {
      ...(state.accountsStore || {}),
      [clinicId]: resetAccounts
    };

    updateState({
      journalEntriesStore: updatedEntriesStore,
      accountsStore: updatedAccountsStore
    });
    logAction('قيد محاسبي جديد', `تم تسجيل قيد يومية رقم «${newEntry.entryNumber}» بمبلغ إجمالي ${newEntry.totalDebit}.`, 'accounting');
  };

  const editJournalEntry = (clinicId: string, entryId: string, updates: Partial<JournalEntry>) => {
    const currentEntries = state.journalEntriesStore?.[clinicId] || [];
    const updatedEntries = currentEntries.map(entry => entry.id === entryId ? { ...entry, ...updates } : entry);

    const currentAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);

    const resetAccounts = currentAccounts.map(acc => ({
      ...acc,
      currentBalance: Number(acc.openingBalance) || 0
    }));

    updatedEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const targetAcc = resetAccounts.find(a => a.id === line.accountId || a.code === line.accountCode);
        if (targetAcc) {
          if (targetAcc.type === 'asset' || targetAcc.type === 'expense') {
            targetAcc.currentBalance = (Number(targetAcc.currentBalance) || 0) + (Number(line.debit) || 0) - (Number(line.credit) || 0);
          } else {
            targetAcc.currentBalance = (Number(targetAcc.currentBalance) || 0) + (Number(line.credit) || 0) - (Number(line.debit) || 0);
          }
        }
      });
    });

    const updatedEntriesStore = {
      ...(state.journalEntriesStore || {}),
      [clinicId]: updatedEntries
    };
    const updatedAccountsStore = {
      ...(state.accountsStore || {}),
      [clinicId]: resetAccounts
    };

    updateState({
      journalEntriesStore: updatedEntriesStore,
      accountsStore: updatedAccountsStore
    });

    const matchedEntry = currentEntries.find(e => e.id === entryId);
    logAction('تعديل قيد محاسبي', `تم تعديل قيد اليومية رقم «${matchedEntry?.entryNumber || entryId}».`, 'accounting');
  };

  const deleteJournalEntry = (clinicId: string, entryId: string) => {
    const currentEntries = state.journalEntriesStore?.[clinicId] || [];
    const updatedEntries = currentEntries.filter(entry => entry.id !== entryId);

    const currentAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);

    const resetAccounts = currentAccounts.map(acc => ({
      ...acc,
      currentBalance: Number(acc.openingBalance) || 0
    }));

    updatedEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const targetAcc = resetAccounts.find(a => a.id === line.accountId || a.code === line.accountCode);
        if (targetAcc) {
          if (targetAcc.type === 'asset' || targetAcc.type === 'expense') {
            targetAcc.currentBalance = (Number(targetAcc.currentBalance) || 0) + (Number(line.debit) || 0) - (Number(line.credit) || 0);
          } else {
            targetAcc.currentBalance = (Number(targetAcc.currentBalance) || 0) + (Number(line.credit) || 0) - (Number(line.debit) || 0);
          }
        }
      });
    });

    const updatedEntriesStore = {
      ...(state.journalEntriesStore || {}),
      [clinicId]: updatedEntries
    };
    const updatedAccountsStore = {
      ...(state.accountsStore || {}),
      [clinicId]: resetAccounts
    };

    updateState({
      journalEntriesStore: updatedEntriesStore,
      accountsStore: updatedAccountsStore
    });

    const matchedEntry = currentEntries.find(e => e.id === entryId);
    logAction('حذف قيد محاسبي', `تم حذف قيد اليومية رقم «${matchedEntry?.entryNumber || entryId}».`, 'accounting');
  };

  const addVoucher = (clinicId: string, voucherData: Omit<Voucher, 'id' | 'createdAt' | 'clinicId' | 'createdBy' | 'createdByName'>) => {
    const currentVouchers = state.vouchersStore?.[clinicId] || [];
    const newVoucher: Voucher = {
      ...voucherData,
      id: `vouch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      clinicId,
      createdBy: currentUser?.id || 'sys',
      createdByName: currentUser?.name || 'المستخدم',
      createdAt: new Date().toISOString()
    };

    // Automatically generate double-entry Journal Entry for this Voucher
    const isReceipt = voucherData.type === 'receipt';
    const lines = isReceipt ? [
      {
        id: '1',
        accountId: voucherData.treasuryAccountId,
        accountCode: '1101',
        accountName: voucherData.treasuryAccountName,
        debit: voucherData.amount,
        credit: 0,
        note: `سند قبض نقدي/بنكي من ${voucherData.beneficiary}`
      },
      {
        id: '2',
        accountId: voucherData.accountId,
        accountCode: '4101',
        accountName: voucherData.accountName,
        debit: 0,
        credit: voucherData.amount,
        note: voucherData.notes || `تحصيل إيرادات/مستحقات`
      }
    ] : [
      {
        id: '1',
        accountId: voucherData.accountId,
        accountCode: '5201',
        accountName: voucherData.accountName,
        debit: voucherData.amount,
        credit: 0,
        note: voucherData.notes || `سداد مصروف/مستحقات`
      },
      {
        id: '2',
        accountId: voucherData.treasuryAccountId,
        accountCode: '1101',
        accountName: voucherData.treasuryAccountName,
        debit: 0,
        credit: voucherData.amount,
        note: `سند صرف نقدي/بنكي إلى ${voucherData.beneficiary}`
      }
    ];

    addJournalEntry(clinicId, {
      entryNumber: `JV-${newVoucher.voucherNumber}`,
      date: voucherData.date,
      description: `${isReceipt ? 'سند قبض' : 'سند صرف'} - ${voucherData.beneficiary} - ${voucherData.notes}`,
      referenceType: 'voucher',
      referenceId: newVoucher.id,
      lines,
      totalDebit: voucherData.amount,
      totalCredit: voucherData.amount,
      isPosted: true
    });

    const updatedVouchersStore = {
      ...(state.vouchersStore || {}),
      [clinicId]: [newVoucher, ...currentVouchers]
    };
    updateState({ vouchersStore: updatedVouchersStore });
    logAction(
      isReceipt ? 'سند قبض مالي' : 'سند صرف مالي',
      `تم إصدار ${isReceipt ? 'سند قبض' : 'سند صرف'} رقم «${newVoucher.voucherNumber}» بقيمة ${newVoucher.amount} لصالح «${newVoucher.beneficiary}».`,
      'accounting'
    );
  };

  const editVoucher = (clinicId: string, voucherId: string, updates: Partial<Voucher>) => {
    const currentVouchers = state.vouchersStore?.[clinicId] || [];
    const matchedVoucher = currentVouchers.find(v => v.id === voucherId);
    if (!matchedVoucher) return;

    const updatedVoucher = { ...matchedVoucher, ...updates };
    const updatedVouchers = currentVouchers.map(v => v.id === voucherId ? updatedVoucher : v);

    // Find and update associated journal entry
    const currentEntries = state.journalEntriesStore?.[clinicId] || [];
    const associatedEntry = currentEntries.find(e => e.referenceId === voucherId && e.referenceType === 'voucher');

    if (associatedEntry) {
      const isReceipt = updatedVoucher.type === 'receipt';
      const lines = isReceipt ? [
        {
          id: '1',
          accountId: updatedVoucher.treasuryAccountId,
          accountCode: '1101',
          accountName: updatedVoucher.treasuryAccountName,
          debit: updatedVoucher.amount,
          credit: 0,
          note: `سند قبض نقدي/بنكي من ${updatedVoucher.beneficiary}`
        },
        {
          id: '2',
          accountId: updatedVoucher.accountId,
          accountCode: '4101',
          accountName: updatedVoucher.accountName,
          debit: 0,
          credit: updatedVoucher.amount,
          note: updatedVoucher.notes || `تحصيل إيرادات/مستحقات`
        }
      ] : [
        {
          id: '1',
          accountId: updatedVoucher.accountId,
          accountCode: '5201',
          accountName: updatedVoucher.accountName,
          debit: updatedVoucher.amount,
          credit: 0,
          note: updatedVoucher.notes || `سداد مصروف/مستحقات`
        },
        {
          id: '2',
          accountId: updatedVoucher.treasuryAccountId,
          accountCode: '1101',
          accountName: updatedVoucher.treasuryAccountName,
          debit: 0,
          credit: updatedVoucher.amount,
          note: `سند صرف نقدي/بنكي إلى ${updatedVoucher.beneficiary}`
        }
      ];

      editJournalEntry(clinicId, associatedEntry.id, {
        entryNumber: `JV-${updatedVoucher.voucherNumber}`,
        date: updatedVoucher.date,
        description: `${isReceipt ? 'سند قبض' : 'سند صرف'} - ${updatedVoucher.beneficiary} - ${updatedVoucher.notes}`,
        lines,
        totalDebit: updatedVoucher.amount,
        totalCredit: updatedVoucher.amount
      });
    }

    const updatedVouchersStore = {
      ...(state.vouchersStore || {}),
      [clinicId]: updatedVouchers
    };
    updateState({ vouchersStore: updatedVouchersStore });
    logAction('تعديل سند مالي', `تم تعديل السند المالي رقم «${updatedVoucher.voucherNumber}».`, 'accounting');
  };

  const deleteVoucher = (clinicId: string, voucherId: string) => {
    const currentVouchers = state.vouchersStore?.[clinicId] || [];
    const matchedVoucher = currentVouchers.find(v => v.id === voucherId);
    if (!matchedVoucher) return;

    const updatedVouchers = currentVouchers.filter(v => v.id !== voucherId);

    // Find and delete associated journal entry
    const currentEntries = state.journalEntriesStore?.[clinicId] || [];
    const associatedEntry = currentEntries.find(e => e.referenceId === voucherId && e.referenceType === 'voucher');

    if (associatedEntry) {
      deleteJournalEntry(clinicId, associatedEntry.id);
    }

    const updatedVouchersStore = {
      ...(state.vouchersStore || {}),
      [clinicId]: updatedVouchers
    };
    updateState({ vouchersStore: updatedVouchersStore });
    logAction('حذف سند مالي', `تم حذف السند المالي رقم «${matchedVoucher.voucherNumber}».`, 'accounting');
  };

  const deletePatient = (patientName: string) => {
    if (!patientName) return;

    // 1. Queue
    const newQueue: Record<string, PatientQueueItem[]> = {};
    Object.keys(state.queue || {}).forEach(cId => {
      newQueue[cId] = (state.queue[cId] || []).filter(item => item.name !== patientName);
    });

    // 2. Archive
    const newArchive: Record<string, PatientQueueItem[]> = {};
    Object.keys(state.archive || {}).forEach(cId => {
      newArchive[cId] = (state.archive[cId] || []).filter(item => item.name !== patientName);
    });

    // 3. Appointments
    const newAppointments: Record<string, Appointment[]> = {};
    Object.keys(state.appointments || {}).forEach(cId => {
      newAppointments[cId] = (state.appointments[cId] || []).filter(item => item.name !== patientName);
    });

    // 4. Reports
    const newReports = (state.reports || []).filter(r => r.patientName !== patientName);

    // 5. Patient Status History
    const newStatusHistory: Record<string, PatientStatusRecord[]> = {};
    Object.keys(state.patientStatusHistoryStore || {}).forEach(cId => {
      newStatusHistory[cId] = (state.patientStatusHistoryStore[cId] || []).filter(r => r.patientName !== patientName);
    });

    // 6. Medical Alerts
    const newMedicalAlerts = { ...(state.medicalAlertsStore || {}) };
    delete newMedicalAlerts[patientName];

    // 7. Rx Store
    const newRxStore = { ...(state.rxStore || {}) };
    delete newRxStore[patientName];

    // 8. ER Store
    const newErStore: Record<string, ErPatient[]> = {};
    Object.keys(state.erStore || {}).forEach(cId => {
      newErStore[cId] = (state.erStore[cId] || []).filter(p => p.patientName !== patientName);
    });

    // 9. OR Store
    const newOrStore: Record<string, OrBooking[]> = {};
    Object.keys(state.orStore || {}).forEach(cId => {
      newOrStore[cId] = (state.orStore[cId] || []).filter(p => p.patient !== patientName);
    });

    // 10. Inpatient Store
    const newInpatientStore: Record<string, InpatientAdmission[]> = {};
    Object.keys(state.inpatientStore || {}).forEach(cId => {
      newInpatientStore[cId] = (state.inpatientStore[cId] || []).filter(p => p.patientName !== patientName);
    });

    // 11. Hosp Lab Store
    const newHospLabStore: Record<string, HospLabOrder[]> = {};
    Object.keys(state.hospLabStore || {}).forEach(cId => {
      newHospLabStore[cId] = (state.hospLabStore[cId] || []).filter(p => p.patient !== patientName);
    });

    // 12. Rad Store
    const newRadStore: Record<string, RadOrder[]> = {};
    Object.keys(state.radStore || {}).forEach(cId => {
      newRadStore[cId] = (state.radStore[cId] || []).filter(p => p.patient !== patientName);
    });

    updateState({
      queue: newQueue,
      archive: newArchive,
      appointments: newAppointments,
      reports: newReports,
      patientStatusHistoryStore: newStatusHistory,
      medicalAlertsStore: newMedicalAlerts,
      rxStore: newRxStore,
      erStore: newErStore,
      orStore: newOrStore,
      inpatientStore: newInpatientStore,
      hospLabStore: newHospLabStore,
      radStore: newRadStore
    });

    logAction('حذف مريض', `تم حذف المريض «${patientName}» وكافة سجلاته الطبية والزيارات بالكامل.`);
  };

  const editPatient = (oldName: string, updatedData: { name: string; phone: string; age?: string; allergies?: string; chronicDiseases?: string }) => {
    if (!oldName || !updatedData.name.trim()) return;
    const newName = updatedData.name.trim();
    const newPhone = updatedData.phone.trim();
    const newAge = updatedData.age ? updatedData.age.trim() : '';

    // 1. Queue
    const newQueue: Record<string, PatientQueueItem[]> = {};
    Object.keys(state.queue || {}).forEach(cId => {
      newQueue[cId] = (state.queue[cId] || []).map(item => item.name === oldName ? {
        ...item,
        name: newName,
        phone: newPhone,
        age: newAge || item.age
      } : item);
    });

    // 2. Archive
    const newArchive: Record<string, PatientQueueItem[]> = {};
    Object.keys(state.archive || {}).forEach(cId => {
      newArchive[cId] = (state.archive[cId] || []).map(item => item.name === oldName ? {
        ...item,
        name: newName,
        phone: newPhone,
        age: newAge || item.age
      } : item);
    });

    // 3. Appointments
    const newAppointments: Record<string, Appointment[]> = {};
    Object.keys(state.appointments || {}).forEach(cId => {
      newAppointments[cId] = (state.appointments[cId] || []).map(item => item.name === oldName ? {
        ...item,
        name: newName,
        phone: newPhone
      } : item);
    });

    // 4. Reports
    const newReports = (state.reports || []).map(r => r.patientName === oldName ? { ...r, patientName: newName } : r);

    // 5. Patient Status History
    const newStatusHistory: Record<string, PatientStatusRecord[]> = {};
    Object.keys(state.patientStatusHistoryStore || {}).forEach(cId => {
      newStatusHistory[cId] = (state.patientStatusHistoryStore[cId] || []).map(r => r.patientName === oldName ? {
        ...r,
        patientName: newName
      } : r);
    });

    // 6. Medical Alerts
    const newMedicalAlerts = { ...(state.medicalAlertsStore || {}) };
    if (oldName !== newName) {
      const existingAlerts = newMedicalAlerts[oldName] || {};
      delete newMedicalAlerts[oldName];
      newMedicalAlerts[newName] = {
        allergies: updatedData.allergies !== undefined ? updatedData.allergies : existingAlerts.allergies,
        chronicDiseases: updatedData.chronicDiseases !== undefined ? updatedData.chronicDiseases : existingAlerts.chronicDiseases
      };
    } else {
      newMedicalAlerts[newName] = {
        allergies: updatedData.allergies !== undefined ? updatedData.allergies : newMedicalAlerts[newName]?.allergies,
        chronicDiseases: updatedData.chronicDiseases !== undefined ? updatedData.chronicDiseases : newMedicalAlerts[newName]?.chronicDiseases
      };
    }

    // 7. Rx Store
    const newRxStore = { ...(state.rxStore || {}) };
    if (oldName !== newName && newRxStore[oldName]) {
      newRxStore[newName] = newRxStore[oldName];
      delete newRxStore[oldName];
    }

    // 8. Hospital Stores
    const newErStore: Record<string, ErPatient[]> = {};
    Object.keys(state.erStore || {}).forEach(cId => {
      newErStore[cId] = (state.erStore[cId] || []).map(p => p.patientName === oldName ? { ...p, patientName: newName, phone: newPhone, age: newAge || p.age } : p);
    });

    const newOrStore: Record<string, OrBooking[]> = {};
    Object.keys(state.orStore || {}).forEach(cId => {
      newOrStore[cId] = (state.orStore[cId] || []).map(p => p.patient === oldName ? { ...p, patient: newName } : p);
    });

    const newInpatientStore: Record<string, InpatientAdmission[]> = {};
    Object.keys(state.inpatientStore || {}).forEach(cId => {
      newInpatientStore[cId] = (state.inpatientStore[cId] || []).map(p => p.patientName === oldName ? { ...p, patientName: newName, phone: newPhone, age: newAge || p.age } : p);
    });

    const newHospLabStore: Record<string, HospLabOrder[]> = {};
    Object.keys(state.hospLabStore || {}).forEach(cId => {
      newHospLabStore[cId] = (state.hospLabStore[cId] || []).map(p => p.patient === oldName ? { ...p, patient: newName } : p);
    });

    const newRadStore: Record<string, RadOrder[]> = {};
    Object.keys(state.radStore || {}).forEach(cId => {
      newRadStore[cId] = (state.radStore[cId] || []).map(p => p.patient === oldName ? { ...p, patient: newName } : p);
    });

    updateState({
      queue: newQueue,
      archive: newArchive,
      appointments: newAppointments,
      reports: newReports,
      patientStatusHistoryStore: newStatusHistory,
      medicalAlertsStore: newMedicalAlerts,
      rxStore: newRxStore,
      erStore: newErStore,
      orStore: newOrStore,
      inpatientStore: newInpatientStore,
      hospLabStore: newHospLabStore,
      radStore: newRadStore
    });

    logAction('تعديل مريض', `تم تعديل بيانات المريض «${oldName}» إلى «${newName}».`);
  };

  const archiveAndResetQueue = (targetClinicId?: string) => {
    const todayStr = getTodayISO();
    const nowDateTime = getFormattedDateTime();

    const newQueue = { ...(state.queue || {}) };
    const newArchive = { ...(state.archive || {}) };

    const clinicKeys = targetClinicId && targetClinicId !== 'master' 
      ? [targetClinicId] 
      : Array.from(new Set([...Object.keys(newQueue), ...state.clinics.map(c => c.id)]));

    if (clinicKeys.length === 0) {
      clinicKeys.push('default', 'master');
    }

    let totalArchived = 0;

    clinicKeys.forEach(cId => {
      const currentItems = newQueue[cId] || [];
      if (currentItems.length > 0) {
        totalArchived += currentItems.length;
        const preparedItems = currentItems.map(item => ({
          ...item,
          isoDate: item.isoDate || todayStr,
          date: item.date && item.date.length > 5 ? item.date : nowDateTime
        }));

        const existingArchive = newArchive[cId] || [];
        const existingIds = new Set(existingArchive.map(a => String(a.id)));
        const uniqueNewItems = preparedItems.filter(p => !existingIds.has(String(p.id)));

        newArchive[cId] = [...uniqueNewItems, ...existingArchive];
        newQueue[cId] = [];
      }
    });

    updateState({
      queue: newQueue,
      archive: newArchive
    });

    logAction(
      'تصفير وأرشفة طابور اليوم',
      `تم تصفير وأرشفة طابور اليوم بنجاح (${totalArchived} مريض) وحفظ البيانات بالتاريخ والوقت لجميع التخصصات.`
    );
  };

  const checkPasswordUniqueness = (password: string, excludeUserId?: string): { isUnique: boolean; conflictUser?: User } => {
    const trimmedPass = (password || '').trim();
    if (!trimmedPass) return { isUnique: true };
    const conflict = state.users.find(u => 
      u.pass && u.pass.trim() === trimmedPass && 
      (!excludeUserId || String(u.id) !== String(excludeUserId))
    );
    return {
      isUnique: !conflict,
      conflictUser: conflict
    };
  };

  const changeUserPassword = (userId: string, newPassword: string): string | null => {
    const check = checkPasswordUniqueness(newPassword, userId);
    if (!check.isUnique) {
      return `عفواً، تم اكتشاف تطابق في كلمة المرور مع حساب آخر («${check.conflictUser?.name}»)! لأمان الخصوصية ومنع تداخل البيانات، يرجى اختيار كلمة مرور فريدة وقوية.`;
    }
    const updatedUsers = state.users.map(u => u.id === userId ? { ...u, pass: newPassword.trim() } : u);
    updateState({ users: updatedUsers });
    
    // If the changed user is the logged-in user, sync current session
    if (currentUser && currentUser.id === userId) {
      const updatedSession = { ...currentUser, pass: newPassword.trim() };
      setCurrentUser(updatedSession);
      localStorage.setItem('currentUser', JSON.stringify(updatedSession));
    }
    logAction('تغيير كلمة المرور الشخصية', `تم تغيير كلمة المرور للمستخدم بنجاح وأرشفة كود التشفير المحدث.`);
    return null;
  };

  const postMedicalBillingToAccounting = (
    clinicId: string,
    patientName: string,
    billingType: 'consultation' | 'surgery' | 'inpatient' | 'lab' | 'rad' | 'payment',
    amount: number,
    description: string
  ) => {
    if (amount <= 0) return;

    // 1. Map billing type to proper debit/credit accounts
    let debitAccountCode = '1104'; // default to Patient Receivable
    let debitAccountName = 'حسابات المرضى والعملاء (المدينون)';
    
    let creditAccountCode = '4101'; // default to Clinic Visit Revenue
    let creditAccountName = 'إيرادات الكشوفات والاستشارات الطبية';

    if (billingType === 'consultation') {
      debitAccountCode = '1102'; // Reception Cash Drawer
      debitAccountName = 'خزينة الاستقبال وعيادات الكشف';
      creditAccountCode = '4101';
      creditAccountName = 'إيرادات الكشوفات والاستشارات الطبية';
    } else if (billingType === 'payment') {
      debitAccountCode = '1101'; // Main Cash / Safe
      debitAccountName = 'الخزينة الرئيسية (النقدية بالصندوق)';
      creditAccountCode = '1104'; // Credit the Receivable
      creditAccountName = 'حسابات المرضى والعملاء (المدينون)';
    } else if (billingType === 'surgery') {
      creditAccountCode = '4102';
      creditAccountName = 'إيرادات العمليات الجراحية والمناظير';
    } else if (billingType === 'inpatient') {
      creditAccountCode = '4104';
      creditAccountName = 'إيرادات الإقامة والتنويم والأجنحة';
    } else if (billingType === 'lab') {
      creditAccountCode = '4106';
      creditAccountName = 'إيرادات الفحوصات والتحاليل المخبرية';
    } else if (billingType === 'rad') {
      creditAccountCode = '4107';
      creditAccountName = 'إيرادات وحدة الأشعة والسونار';
    }

    // Get account IDs if they exist in accountsStore
    const clinicAccounts = state.accountsStore?.[clinicId] || generateDefaultChartOfAccounts(clinicId);
    const debitAcc = clinicAccounts.find(a => a.code === debitAccountCode);
    const creditAcc = clinicAccounts.find(a => a.code === creditAccountCode);

    const debitAccId = debitAcc ? debitAcc.id : `${clinicId}_acc_${debitAccountCode}`;
    const creditAccId = creditAcc ? creditAcc.id : `${clinicId}_acc_${creditAccountCode}`;

    // Create a Journal Entry
    addJournalEntry(clinicId, {
      entryNumber: `MED-INV-${Date.now().toString().slice(-6)}`,
      date: getTodayISO(),
      description: `تكامل تلقائي للمريض: ${patientName} - ${description}`,
      referenceType: 'invoice',
      referenceId: `med_inv_${Date.now()}`,
      lines: [
        {
          id: '1',
          accountId: debitAccId,
          accountCode: debitAccountCode,
          accountName: debitAcc ? debitAcc.name : debitAccountName,
          debit: amount,
          credit: 0,
          note: `مدين: ${description}`
        },
        {
          id: '2',
          accountId: creditAccId,
          accountCode: creditAccountCode,
          accountName: creditAcc ? creditAcc.name : creditAccountName,
          debit: 0,
          credit: amount,
          note: `دائن: ${description}`
        }
      ],
      totalDebit: amount,
      totalCredit: amount,
      isPosted: true
    });
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      switchClinicContext, 
      state, 
      updateState, 
      logAction, 
      purgeCloudDatabase, 
      deletePatient, 
      editPatient, 
      archiveAndResetQueue,
      addAccount,
      editAccount,
      deleteAccount,
      addJournalEntry,
      editJournalEntry,
      deleteJournalEntry,
      addVoucher,
      editVoucher,
      deleteVoucher,
      checkPasswordUniqueness,
      changeUserPassword,
      postMedicalBillingToAccounting
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

