import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Users, UserCheck, Briefcase, Truck, Search, Eye, Plus, Printer, FileSpreadsheet, 
  ArrowUpRight, ArrowDownLeft, DollarSign, Receipt, CreditCard, ShieldCheck, Filter,
  Calendar, Building2, CheckCircle2, ChevronRight, FileText, AlertCircle
} from 'lucide-react';
import { Account, JournalEntry, Voucher, StaffMember, PatientQueueItem } from '../../types';
import { exportToExcel, printReport } from '../../lib/exportUtils';
import { getTodayISO } from '../../lib/utils';

interface LinkedSubLedgersHubProps {
  targetClinicId: string;
  currentClinicName: string;
  allowEditDelete: boolean;
  allowPrinting: boolean;
  allowExcel: boolean;
}

export default function LinkedSubLedgersHub({
  targetClinicId,
  currentClinicName,
  allowEditDelete,
  allowPrinting,
  allowExcel
}: LinkedSubLedgersHubProps) {
  const { state, addVoucher, addJournalEntry, logAction } = useAppContext();

  const [subTab, setSubTab] = useState<'patients' | 'doctors' | 'staff' | 'suppliers'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Quick Action Modal states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutEntity, setPayoutEntity] = useState<{ id: string; name: string; type: 'doctor' | 'staff' | 'patient' | 'supplier' } | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutType, setPayoutType] = useState<'payment' | 'receipt'>('payment');
  const [payoutNotes, setPayoutNotes] = useState('');

  // 1. Fetch Tenant-Isolated Data
  const accounts = useMemo(() => state.accountsStore?.[targetClinicId] || [], [state.accountsStore, targetClinicId]);
  const journalEntries = useMemo(() => state.journalEntriesStore?.[targetClinicId] || [], [state.journalEntriesStore, targetClinicId]);
  const vouchers = useMemo(() => state.vouchersStore?.[targetClinicId] || [], [state.vouchersStore, targetClinicId]);
  const staffList = useMemo(() => state.staffDirectory?.[targetClinicId] || [], [state.staffDirectory, targetClinicId]);
  
  // Treasury Accounts for payouts
  const treasuryAccounts = useMemo(() => 
    accounts.filter(a => a.code.startsWith('1101') || a.code.startsWith('1102') || a.code.startsWith('1103')),
  [accounts]);

  // ================= 2. PATIENTS LEDGER COMPUTATION =================
  const patientsLedger = useMemo(() => {
    const patientMap = new Map<string, {
      name: string;
      phone: string;
      totalBilled: number;
      totalPaid: number;
      balance: number;
      lastVisit: string;
      transactionsCount: number;
    }>();

    // Helper to register or update patient
    const updatePatientRecord = (name: string, phone: string, date: string, billed: number, paid: number) => {
      if (!name || name.trim() === '') return;
      const cleanName = name.trim();
      const existing = patientMap.get(cleanName) || {
        name: cleanName,
        phone: phone || 'غير مخصص',
        totalBilled: 0,
        totalPaid: 0,
        balance: 0,
        lastVisit: date || getTodayISO(),
        transactionsCount: 0
      };

      existing.totalBilled += billed;
      existing.totalPaid += paid;
      existing.balance = existing.totalBilled - existing.totalPaid;
      existing.transactionsCount += (billed > 0 || paid > 0 ? 1 : 0);
      if (date && date > existing.lastVisit) existing.lastVisit = date;

      patientMap.set(cleanName, existing);
    };

    // Process visits from Queue & Archive
    const queueItems = state.queue?.[targetClinicId] || [];
    const archiveItems = state.archive?.[targetClinicId] || [];
    [...queueItems, ...archiveItems].forEach(item => {
      const isPaid = item.status === 'completed' || item.status === 'in_exam';
      const visitFee = Number(item.price) || 0;
      updatePatientRecord(item.name, item.phone || '', item.date || getTodayISO(), visitFee, isPaid ? visitFee : 0);
    });

    // Process ER Patients
    const erPatients = state.erStore?.[targetClinicId] || [];
    erPatients.forEach(er => {
      const billed = er.services?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 50;
      updatePatientRecord(er.patientName, er.phone || '', er.entryTime || getTodayISO(), billed, billed);
    });

    // Process Surgeries
    const surgeries = state.orStore?.[targetClinicId] || [];
    surgeries.forEach(or => {
      const billed = Number(or.estimatedCost) || 0;
      updatePatientRecord(or.patient, '', or.date || getTodayISO(), billed, billed);
    });

    // Process Inpatients
    const inpatients = state.inpatientStore?.[targetClinicId] || [];
    inpatients.forEach(ip => {
      const billed = Number(ip.totalBill) || 0;
      const paid = Number(ip.paidAmount) || 0;
      updatePatientRecord(ip.patientName, ip.phone || '', ip.admissionDate || getTodayISO(), billed, paid);
    });

    // Process Vouchers linked to patients
    vouchers.forEach(v => {
      if (v.beneficiary) {
        if (v.type === 'receipt') {
          updatePatientRecord(v.beneficiary, '', v.date, 0, Number(v.amount) || 0);
        }
      }
    });

    return Array.from(patientMap.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [state.queue, state.archive, state.erStore, state.orStore, state.inpatientStore, vouchers, targetClinicId]);

  // ================= 3. DOCTORS LEDGER COMPUTATION =================
  const doctorsLedger = useMemo(() => {
    // Collect doctors for this clinic
    const clinicUsers = state.users.filter(u => String(u.clinicId) === String(targetClinicId) && u.role === 'doctor');
    const doctorStaff = staffList.filter(s => s.role === 'طبيب' || s.role === 'جراح' || s.role === 'استشاري');

    const doctorMap = new Map<string, {
      id: string;
      name: string;
      specialty: string;
      phone: string;
      consultationsEarned: number;
      surgeriesEarned: number;
      totalEarned: number;
      totalPaidOut: number;
      accruedBalance: number;
    }>();

    // Register doctors
    clinicUsers.forEach(u => {
      doctorMap.set(u.name.trim(), {
        id: u.id,
        name: u.name.trim(),
        specialty: 'طبيب معالج / استشاري',
        phone: u.phone || 'غير مسجل',
        consultationsEarned: 0,
        surgeriesEarned: 0,
        totalEarned: 0,
        totalPaidOut: 0,
        accruedBalance: 0
      });
    });

    doctorStaff.forEach(s => {
      if (!doctorMap.has(s.name.trim())) {
        doctorMap.set(s.name.trim(), {
          id: s.id,
          name: s.name.trim(),
          specialty: s.specialty || s.department || 'طبيب أخصائي',
          phone: s.phone || 'غير مسجل',
          consultationsEarned: 0,
          surgeriesEarned: 0,
          totalEarned: 0,
          totalPaidOut: 0,
          accruedBalance: 0
        });
      }
    });

    // Process doctor shares from visits
    const queueItems = state.queue?.[targetClinicId] || [];
    const archiveItems = state.archive?.[targetClinicId] || [];
    [...queueItems, ...archiveItems].forEach(item => {
      if (item.doctorName) {
        const dName = item.doctorName.trim();
        const doc = doctorMap.get(dName);
        if (doc) {
          const visitPrice = Number(item.price) || 0;
          const share = visitPrice * 0.7; // default 70% doctor share or fixed fee
          doc.consultationsEarned += share;
          doc.totalEarned += share;
        }
      }
    });

    // Process OR Surgeries
    const surgeries = state.orStore?.[targetClinicId] || [];
    surgeries.forEach(or => {
      if (or.surgeon) {
        const dName = or.surgeon.trim();
        const doc = doctorMap.get(dName);
        if (doc) {
          const surgCost = Number(or.estimatedCost) || 0;
          const surgeonFee = surgCost * 0.6; // 60% surgeon share
          doc.surgeriesEarned += surgeonFee;
          doc.totalEarned += surgeonFee;
        }
      }
    });

    // Process payouts from Vouchers
    vouchers.forEach(v => {
      if (v.type === 'payment' && v.beneficiary) {
        const bName = v.beneficiary.trim();
        const doc = doctorMap.get(bName);
        if (doc) {
          doc.totalPaidOut += Number(v.amount) || 0;
        }
      }
    });

    // Calculate net balance
    doctorMap.forEach(doc => {
      doc.accruedBalance = doc.totalEarned - doc.totalPaidOut;
    });

    return Array.from(doctorMap.values());
  }, [state.users, staffList, state.queue, state.archive, state.orStore, vouchers, targetClinicId]);

  // ================= 4. STAFF & PAYROLL LEDGER COMPUTATION =================
  const staffLedger = useMemo(() => {
    return staffList.map(s => {
      const basicSalary = Number(s.basicSalary) || 0;
      const allowances = Number(s.allowances) || 0;
      const grossSalary = basicSalary + allowances;

      // Find vouchers for this staff
      const staffVouchers = vouchers.filter(v => v.beneficiary?.trim() === s.name.trim());
      const paidSalaries = staffVouchers
        .filter(v => v.type === 'payment' && (v.notes?.includes('راتب') || v.notes?.includes('استحقاق') || v.notes?.includes('مسير')))
        .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

      const loansAndAdvances = staffVouchers
        .filter(v => v.type === 'payment' && (v.notes?.includes('سلفة') || v.notes?.includes('عهدة')))
        .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

      const netAccrued = grossSalary - paidSalaries;

      return {
        id: s.id,
        name: s.name,
        role: s.role,
        department: s.department,
        basicSalary,
        allowances,
        grossSalary,
        paidSalaries,
        loansAndAdvances,
        netAccrued
      };
    });
  }, [staffList, vouchers]);

  // Filtered entries according to subTab and search
  const filteredPatients = patientsLedger.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm)
  );

  const filteredDoctors = doctorsLedger.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaff = staffLedger.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected entity details
  const selectedPatient = useMemo(() => 
    patientsLedger.find(p => p.name === selectedEntityId) || null,
  [patientsLedger, selectedEntityId]);

  const selectedDoctor = useMemo(() => 
    doctorsLedger.find(d => d.id === selectedEntityId || d.name === selectedEntityId) || null,
  [doctorsLedger, selectedEntityId]);

  const selectedStaffMember = useMemo(() => 
    staffLedger.find(s => s.id === selectedEntityId || s.name === selectedEntityId) || null,
  [staffLedger, selectedEntityId]);

  // Execute quick payout
  const handleExecutePayout = () => {
    if (!payoutEntity || payoutAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح وبيانات الجهة!');
      return;
    }

    if (treasuryAccounts.length === 0) {
      alert('لا توجد حسابات خزينة متاحة في النظام المحاسبي لهذه المنشأة!');
      return;
    }

    const defaultTreasury = treasuryAccounts[0];
    const vouchPrefix = payoutType === 'payment' ? 'PV' : 'RV';
    const vouchNum = `${vouchPrefix}-${Date.now().toString().slice(-5)}`;

    let targetAccCode = '2103'; // Accrued salaries / fees
    let targetAccName = 'رواتب وأجور وأتعاب مستحقة';

    if (payoutEntity.type === 'doctor') {
      targetAccCode = '2102';
      targetAccName = 'أتعاب ونسب أطباء مستحقة الدفع';
    } else if (payoutEntity.type === 'patient') {
      targetAccCode = '1104';
      targetAccName = 'حسابات المرضى والعملاء (المدينون)';
    }

    const matchedAcc = accounts.find(a => a.code === targetAccCode);

    addVoucher(targetClinicId, {
      type: payoutType,
      voucherNumber: vouchNum,
      date: getTodayISO(),
      amount: payoutAmount,
      accountId: matchedAcc?.id || `${targetClinicId}_acc_${targetAccCode}`,
      accountName: matchedAcc?.name || targetAccName,
      treasuryAccountId: defaultTreasury.id,
      treasuryAccountName: defaultTreasury.name,
      beneficiary: payoutEntity.name,
      paymentMethod: 'cash',
      notes: payoutNotes || `سداد مستحقات مالية وترحيل للحساب المالي • ${payoutEntity.name}`
    });

    logAction(
      'صرف / تحصيل مستحقات محاسبية',
      `تم إصدار ${payoutType === 'payment' ? 'سند صرف' : 'سند قبض'} بمبلغ ${payoutAmount} لصالح «${payoutEntity.name}».`,
      'accounting'
    );

    alert(`تم تسديد القيد والسند المحاسبي بنجاح لصالح ${payoutEntity.name}`);
    setShowPayoutModal(false);
    setPayoutAmount(0);
    setPayoutNotes('');
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* 1. Header Banner & Sub-Tabs Navigation */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-400/30">
              <ShieldCheck size={14} /> الربط والتكامل المحاسبي الشامل
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>كشوف الحسابات المترابطة والذمم الطبية</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              إدارة وتحليل أرصدة المرضى، أتعاب الأطباء، مستحقات الموظفين والرواتب مع الربط بالدليل المحاسبي المنفصل لـ «{currentClinicName}»
            </p>
          </div>

          {/* Sub-Tab Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
            <button
              onClick={() => { setSubTab('patients'); setSelectedEntityId(null); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subTab === 'patients' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users size={15} /> حسابات المرضى ({patientsLedger.length})
            </button>

            <button
              onClick={() => { setSubTab('doctors'); setSelectedEntityId(null); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subTab === 'doctors' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck size={15} /> أتعاب الأطباء ({doctorsLedger.length})
            </button>

            <button
              onClick={() => { setSubTab('staff'); setSelectedEntityId(null); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subTab === 'staff' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Briefcase size={15} /> رواتب الموظفين ({staffLedger.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search & Toolbar Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              subTab === 'patients' ? 'البحث عن مريض بالاسم أو الهاتف...' :
              subTab === 'doctors' ? 'البحث عن طبيب بالاسم أو التخصص...' : 'البحث عن موظف بالاسم أو المسمى الوظيفي...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {allowExcel && (
            <button
              onClick={() => {
                if (subTab === 'patients') {
                  exportToExcel(patientsLedger, [
                    { key: 'name', label: 'اسم المريض' },
                    { key: 'phone', label: 'رقم الهاتف' },
                    { key: 'totalBilled', label: 'إجمالي الفواتير والخدمات' },
                    { key: 'totalPaid', label: 'إجمالي المسدد' },
                    { key: 'balance', label: 'الرصيد المستحق (المدين)' },
                    { key: 'lastVisit', label: 'تاريخ آخر زيارة' }
                  ], `حسابات_المرضى_${currentClinicName}`);
                } else if (subTab === 'doctors') {
                  exportToExcel(doctorsLedger, [
                    { key: 'name', label: 'اسم الطبيب' },
                    { key: 'specialty', label: 'التخصص' },
                    { key: 'consultationsEarned', label: 'أتعاب الكشوفات' },
                    { key: 'surgeriesEarned', label: 'أتعاب الجراحات' },
                    { key: 'totalEarned', label: 'إجمالي المستحق' },
                    { key: 'totalPaidOut', label: 'إجمالي المدفوع' },
                    { key: 'accruedBalance', label: 'المتبقي المباشر' }
                  ], `أتعاب_الأطباء_${currentClinicName}`);
                } else {
                  exportToExcel(staffLedger, [
                    { key: 'name', label: 'اسم الموظف' },
                    { key: 'role', label: 'الوظيفة' },
                    { key: 'department', label: 'القسم' },
                    { key: 'basicSalary', label: 'الراتب الأساسي' },
                    { key: 'allowances', label: 'البدلات' },
                    { key: 'grossSalary', label: 'الإجمالي' },
                    { key: 'paidSalaries', label: 'المدفوع' },
                    { key: 'netAccrued', label: 'الصافي المستحق' }
                  ], `مسير_الرواتب_${currentClinicName}`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" /> تصدير Excel
            </button>
          )}

          {allowPrinting && (
            <button
              onClick={() => {
                const title = subTab === 'patients' ? 'تقرير أرصدة وحسابات المرضى' : subTab === 'doctors' ? 'تقرير أتعاب ومستحقات الأطباء' : 'تقرير الرواتب ومستحقات الموظفين';
                const data = subTab === 'patients' ? patientsLedger : subTab === 'doctors' ? doctorsLedger : staffLedger;
                printReport({
                  title,
                  subtitle: `المنظومة المحاسبية المترابطة • ${currentClinicName}`,
                  facilityName: currentClinicName,
                  columns: subTab === 'patients' ? [
                    { key: 'name', label: 'اسم المريض' },
                    { key: 'phone', label: 'الهاتف' },
                    { key: 'totalBilled', label: 'إجمالي الفواتير' },
                    { key: 'totalPaid', label: 'المسدد' },
                    { key: 'balance', label: 'الرصيد المتبقي' }
                  ] : subTab === 'doctors' ? [
                    { key: 'name', label: 'اسم الطبيب' },
                    { key: 'specialty', label: 'التخصص' },
                    { key: 'totalEarned', label: 'إجمالي المستحق' },
                    { key: 'totalPaidOut', label: 'المدفوع' },
                    { key: 'accruedBalance', label: 'المتبقي' }
                  ] : [
                    { key: 'name', label: 'الاسم' },
                    { key: 'role', label: 'الوظيفة' },
                    { key: 'grossSalary', label: 'إجمالي الراتب' },
                    { key: 'paidSalaries', label: 'المدفوع' },
                    { key: 'netAccrued', label: 'المتبقي' }
                  ],
                  data
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Printer size={15} className="text-blue-600" /> طباعة التقارير
            </button>
          )}
        </div>
      </div>

      {/* 3. SUB-TAB VIEW CONTENT */}

      {/* ================ A. PATIENTS SUB-LEDGER ================ */}
      {subTab === 'patients' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> كشف حسابات وضمانات المراجعين ({filteredPatients.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="p-3.5">اسم المريض</th>
                    <th className="p-3.5">رقم الهاتف</th>
                    <th className="p-3.5">تاريخ آخر زيارة</th>
                    <th className="p-3.5 text-center">إجمالي الخدمات والفواتير</th>
                    <th className="p-3.5 text-center">إجمالي المقبوضات</th>
                    <th className="p-3.5 text-center">الرصيد (مدين / متبقي)</th>
                    <th className="p-3.5 text-center">الجرائم والأعمال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        لا توجد سجلات مرضى أو حسابات مخصصة مطابقة للبحث
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{p.name}</td>
                        <td className="p-3.5 dir-ltr text-right">{p.phone}</td>
                        <td className="p-3.5 text-slate-500">{p.lastVisit}</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{p.totalBilled.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-emerald-600">{p.totalPaid.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                            p.balance > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {p.balance > 0 ? `مطلوب: ${p.balance.toLocaleString()} EGP` : 'خالص الحساب ✓'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedEntityId(p.name)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Eye size={13} /> كشف الحساب
                            </button>
                            <button
                              onClick={() => {
                                setPayoutEntity({ id: p.name, name: p.name, type: 'patient' });
                                setPayoutType('receipt');
                                setPayoutAmount(p.balance > 0 ? p.balance : 0);
                                setShowPayoutModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Plus size={13} /> سند تحصيل
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient Detailed Ledger View Modal / Drawer */}
          {selectedPatient && (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-blue-600">كشف حساب مريض تفصيلي</span>
                  <h3 className="text-lg font-bold text-slate-800">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500">رقم الهاتف: {selectedPatient.phone} • آخر زيارة: {selectedPatient.lastVisit}</p>
                </div>
                <button 
                  onClick={() => setSelectedEntityId(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  إغلاق التقرير ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">إجمالي الخدمات المطلوبة</span>
                  <span className="text-base font-bold text-slate-800">{selectedPatient.totalBilled.toLocaleString()} EGP</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">إجمالي المسدد والمحصل</span>
                  <span className="text-base font-bold text-emerald-600">{selectedPatient.totalPaid.toLocaleString()} EGP</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">صافي الرصيد المتبقي</span>
                  <span className={`text-base font-bold ${selectedPatient.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {selectedPatient.balance.toLocaleString()} EGP
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================ B. DOCTORS SUB-LEDGER ================ */}
      {subTab === 'doctors' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserCheck size={16} className="text-blue-600" /> كشف أتعاب واستحقاقات الكادر الطبي والاستشاريين ({filteredDoctors.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="p-3.5">اسم الطبيب / الجراح</th>
                    <th className="p-3.5">التخصص القسم</th>
                    <th className="p-3.5 text-center">أتعاب الكشوفات</th>
                    <th className="p-3.5 text-center">أتعاب الجراحات</th>
                    <th className="p-3.5 text-center">إجمالي المستحق</th>
                    <th className="p-3.5 text-center">المسدد بالسندات</th>
                    <th className="p-3.5 text-center">الرصيد المتبقي</th>
                    <th className="p-3.5 text-center">إجراءات المالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لا يوجد أطباء مسجلين أو مطابقين لشروط البحث
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((d, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{d.name}</td>
                        <td className="p-3.5 text-slate-600">{d.specialty}</td>
                        <td className="p-3.5 text-center font-bold text-slate-700">{d.consultationsEarned.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-purple-700">{d.surgeriesEarned.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-blue-700">{d.totalEarned.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-emerald-600">{d.totalPaidOut.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                            d.accruedBalance > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {d.accruedBalance.toLocaleString()} EGP
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setPayoutEntity({ id: d.id, name: d.name, type: 'doctor' });
                              setPayoutType('payment');
                              setPayoutAmount(d.accruedBalance > 0 ? d.accruedBalance : 0);
                              setShowPayoutModal(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all mx-auto"
                          >
                            <DollarSign size={13} /> صرف أتعاب
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================ C. STAFF & PAYROLL SUB-LEDGER ================ */}
      {subTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" /> كشف مسير رواتب وسلف الموظفين والتمريض والإدارة ({filteredStaff.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="p-3.5">اسم الموظف</th>
                    <th className="p-3.5">المسمى الوظيفي</th>
                    <th className="p-3.5 text-center">الراتب الأساسي</th>
                    <th className="p-3.5 text-center">البدلات</th>
                    <th className="p-3.5 text-center">إجمالي الاستحقاق</th>
                    <th className="p-3.5 text-center">الرواتب المسددة</th>
                    <th className="p-3.5 text-center">السلف والعهد</th>
                    <th className="p-3.5 text-center">الصافي المتبقي</th>
                    <th className="p-3.5 text-center">إجراءات الصرف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        لا يوجد موظفين مسجلين في دليل الكادر لهذه المنشأة
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">{s.name}</td>
                        <td className="p-3.5 text-slate-600">{s.role}</td>
                        <td className="p-3.5 text-center">{s.basicSalary.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center">{s.allowances.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-blue-700">{s.grossSalary.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-emerald-600">{s.paidSalaries.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-rose-600">{s.loansAndAdvances.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{s.netAccrued.toLocaleString()} EGP</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setPayoutEntity({ id: s.id, name: s.name, type: 'staff' });
                              setPayoutType('payment');
                              setPayoutAmount(s.netAccrued > 0 ? s.netAccrued : 0);
                              setShowPayoutModal(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all mx-auto"
                          >
                            <DollarSign size={13} /> صرف راتب / سلفة
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXECUTE PAYOUT / RECEIPT MODAL */}
      {showPayoutModal && payoutEntity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={18} className="text-blue-600" /> إصدار سند محاسبي سريح
              </h3>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">الجهة / المستفيد:</span>
                <span className="font-bold text-slate-900">{payoutEntity.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">النوع:</span>
                <span className="font-bold text-blue-700">
                  {payoutEntity.type === 'doctor' ? 'طبيب / استشاري' : payoutEntity.type === 'staff' ? 'موظف / كادر' : 'مريض / مراجع'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع العملية المحاسبية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutType('payment')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      payoutType === 'payment' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    سند صرف (Payment PV)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutType('receipt')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      payoutType === 'receipt' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    سند قبض (Receipt RV)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (بالجنيه المصري EGP)</label>
                <input
                  type="number"
                  value={payoutAmount || ''}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بيان الملاحظات والشرح المحاسبي</label>
                <textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="مثال: صرف أتعاب عن العمليات، سداد راتب شهر..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecutePayout}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
              >
                تأكيد وإصدار السند ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
