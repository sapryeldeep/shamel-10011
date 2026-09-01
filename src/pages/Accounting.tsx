import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Building2, Plus, Search, FileSpreadsheet, Printer, TrendingUp, TrendingDown, 
  DollarSign, Landmark, BookOpen, Layers, Receipt, ShieldAlert, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, AlertCircle, Trash2, Edit3, Eye, Filter, RefreshCw, Users
} from 'lucide-react';
import { Account, AccountType, JournalEntry, Voucher, Clinic } from '../types';
import { generateDefaultChartOfAccounts } from '../lib/accountingDefaults';
import { exportToExcel, printReport } from '../lib/exportUtils';
import { getFormattedDateTime, getTodayISO } from '../lib/utils';
import LinkedSubLedgersHub from '../components/accounting/LinkedSubLedgersHub';
import ClinicSimpleAccountingView from '../components/accounting/ClinicSimpleAccountingView';

export default function Accounting() {
  const { 
    state, 
    currentUser, 
    addAccount, 
    editAccount, 
    deleteAccount, 
    addJournalEntry, 
    editJournalEntry, 
    deleteJournalEntry, 
    addVoucher, 
    editVoucher, 
    deleteVoucher, 
    updateState, 
    logAction 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'tree' | 'journal' | 'vouchers' | 'linked_ledgers' | 'ledger' | 'trial_balance' | 'income_statement'>('tree');
  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    isMaster ? (state.clinics[0]?.id || 'default') : (currentUser?.clinicId || 'default')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>('');

  // Modals state
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [showAddVoucherModal, setShowAddVoucherModal] = useState(false);
  const [voucherType, setVoucherType] = useState<'receipt' | 'payment'>('receipt');

  // Edit Modals state
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Edit Account Form State
  const [editAccCode, setEditAccCode] = useState('');
  const [editAccName, setEditAccName] = useState('');
  const [editAccNameEn, setEditAccNameEn] = useState('');
  const [editAccType, setEditAccType] = useState<AccountType>('asset');
  const [editAccCategory, setEditAccCategory] = useState('current_assets');
  const [editAccParentId, setEditAccParentId] = useState('');
  const [editAccOpeningBal, setEditAccOpeningBal] = useState<number>(0);
  const [editAccDesc, setEditAccDesc] = useState('');

  // Edit Journal Entry Form State
  const [editJournalDate, setEditJournalDate] = useState('');
  const [editJournalDesc, setEditJournalDesc] = useState('');
  const [editJournalLines, setEditJournalLines] = useState<Array<{ id?: string; accountId: string; accountCode: string; accountName: string; debit: number; credit: number; note: string }>>([]);

  // Edit Voucher Form State
  const [editVouchDate, setEditVouchDate] = useState('');
  const [editVouchAmount, setEditVouchAmount] = useState<number>(0);
  const [editVouchBeneficiary, setEditVouchBeneficiary] = useState('');
  const [editVouchAccountId, setEditVouchAccountId] = useState('');
  const [editVouchTreasuryId, setEditVouchTreasuryId] = useState('');
  const [editVouchMethod, setEditVouchMethod] = useState<'cash' | 'bank' | 'card' | 'transfer'>('cash');
  const [editVouchNotes, setEditVouchNotes] = useState('');

  // Add Account Form State
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccNameEn, setNewAccNameEn] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('asset');
  const [newAccCategory, setNewAccCategory] = useState('current_assets');
  const [newAccParentId, setNewAccParentId] = useState('');
  const [newAccOpeningBal, setNewAccOpeningBal] = useState<number>(0);
  const [newAccDesc, setNewAccDesc] = useState('');

  // Add Journal Entry Form State
  const [journalDate, setJournalDate] = useState(getTodayISO());
  const [journalDesc, setJournalDesc] = useState('');
  const [journalLines, setJournalLines] = useState<Array<{ accountId: string; accountCode: string; accountName: string; debit: number; credit: number; note: string }>>([
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, note: '' },
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, note: '' }
  ]);

  // Add Voucher Form State
  const [vouchDate, setVouchDate] = useState(getTodayISO());
  const [vouchAmount, setVouchAmount] = useState<number>(0);
  const [vouchBeneficiary, setVouchBeneficiary] = useState('');
  const [vouchAccountId, setVouchAccountId] = useState('');
  const [vouchTreasuryId, setVouchTreasuryId] = useState('');
  const [vouchMethod, setVouchMethod] = useState<'cash' | 'bank' | 'card' | 'transfer'>('cash');
  const [vouchNotes, setVouchNotes] = useState('');

  // Resolve target clinic with strict developer vs tenant isolation
  const targetClinicId = isMaster ? (selectedClinicId || state.clinics[0]?.id || 'default') : (currentUser?.clinicId || 'default');
  const currentClinic = state.clinics.find(c => String(c.id) === String(targetClinicId));

  const [selectedTemplate, setSelectedTemplate] = useState<'clinic' | 'center' | 'hospital' | 'pharmacy'>('hospital');
  const [isSimpleDoctorMode, setIsSimpleDoctorMode] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentClinic?.systemType) {
      setSelectedTemplate(currentClinic.systemType as any);
      // Auto-default to simple mode if facility is a clinic and user hasn't explicitly overridden
      if (currentClinic.systemType === 'clinic') {
        setIsSimpleDoctorMode(true);
      } else {
        setIsSimpleDoctorMode(false);
      }
    }
  }, [targetClinicId, currentClinic]);

  // Granular visibility permissions check
  const perms = currentUser?.perms || [];
  
  const hasStaffAccounting = isMaster || currentUser?.role === 'doctor' || perms.includes('accounting');
  const hasStaffEdit = isMaster || currentUser?.role === 'doctor' || perms.includes('accounting_edit');
  const hasStaffPrint = isMaster || currentUser?.role === 'doctor' || perms.includes('accounting_print');
  const hasStaffExport = isMaster || currentUser?.role === 'doctor' || perms.includes('accounting_export');

  const isAccountingAllowed = (isMaster || (currentClinic?.allowAccounting !== false)) && hasStaffAccounting;
  const allowEditDelete = (isMaster || (currentClinic?.allowEditDeleteAccounting !== false)) && hasStaffEdit;
  const allowPrinting = (isMaster || (currentClinic?.allowPrinting !== false)) && hasStaffPrint;
  const allowExcel = (isMaster || (currentClinic?.allowExcelExport !== false)) && hasStaffExport;
  const allowPdf = (isMaster || (currentClinic?.allowPdfExport !== false)) && hasStaffExport;

  // Accounts list for active clinic
  const accounts: Account[] = useMemo(() => {
    if (!targetClinicId) return [];
    const storeAccounts = state.accountsStore?.[targetClinicId];
    if (storeAccounts && storeAccounts.length > 0) {
      return storeAccounts;
    }
    const defaultType = (currentClinic?.systemType || 'hospital') as 'clinic' | 'center' | 'hospital' | 'pharmacy';
    return generateDefaultChartOfAccounts(targetClinicId, defaultType);
  }, [state.accountsStore, targetClinicId, currentClinic?.systemType]);

  // Journal entries for active clinic
  const journalEntries: JournalEntry[] = useMemo(() => {
    if (!targetClinicId) return [];
    return state.journalEntriesStore?.[targetClinicId] || [];
  }, [state.journalEntriesStore, targetClinicId]);

  // Vouchers for active clinic
  const vouchers: Voucher[] = useMemo(() => {
    if (!targetClinicId) return [];
    return state.vouchersStore?.[targetClinicId] || [];
  }, [state.vouchersStore, targetClinicId]);

  // Calculate live financial summaries
  const financialSummary = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;

    accounts.forEach(acc => {
      const bal = Number(acc.currentBalance) || Number(acc.openingBalance) || 0;
      if (acc.level === 3 || !acc.parentId) {
        if (acc.type === 'asset') totalAssets += bal;
        if (acc.type === 'liability') totalLiabilities += bal;
        if (acc.type === 'equity') totalEquity += bal;
        if (acc.type === 'revenue') totalRevenue += bal;
        if (acc.type === 'expense') totalExpenses += bal;
      }
    });

    // Also factor in clinic invoices & expenses if journal entries are fresh
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netProfit,
      currency: currentClinic?.currency || 'EGP'
    };
  }, [accounts, currentClinic]);

  // Permission Guard
  if (!isAccountingAllowed) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-slate-200">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">النظام المحاسبي والمالي المتقدم غير مفعل لهذه المنشأة</h2>
        <p className="text-slate-500 text-sm max-w-md">
          يمكن للمطور الرئيسي أو الإدارة العامة تفعيل قسم الحسابات والنظام المحاسبي المتكامل من خلال لوحة تحكم وتراخيص المنشأة.
        </p>
      </div>
    );
  }

  // Handle Journal line changes
  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...journalLines];
    if (field === 'accountId') {
      const selectedAcc = accounts.find(a => a.id === value);
      updated[index].accountId = value;
      updated[index].accountCode = selectedAcc?.code || '';
      updated[index].accountName = selectedAcc?.name || '';
    } else {
      (updated[index] as any)[field] = value;
    }
    setJournalLines(updated);
  };

  const addJournalLine = () => {
    setJournalLines([...journalLines, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, note: '' }]);
  };

  const removeJournalLine = (index: number) => {
    if (journalLines.length <= 2) {
      alert('يجب أن يحتوي القيد المحاسبي على طرفين على الأقل (مدين ودائن)!');
      return;
    }
    setJournalLines(journalLines.filter((_, i) => i !== index));
  };

  // Journal balance calculations
  const totalDebit = journalLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = journalLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isJournalBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  // Save Journal Entry
  const handleSaveJournalEntry = () => {
    if (!journalDesc.trim()) {
      alert('يرجى إدخال بيان وشرح القيد المحاسبي!');
      return;
    }
    if (!isJournalBalanced) {
      alert(`القيد غير متزن! إجمالي المدين (${totalDebit}) لا يساوي إجمالي الدائن (${totalCredit}). الفرق: ${Math.abs(totalDebit - totalCredit)}`);
      return;
    }

    const invalidLines = journalLines.some(l => !l.accountId || (Number(l.debit) === 0 && Number(l.credit) === 0));
    if (invalidLines) {
      alert('يرجى تحديد الحساب والمبلغ لجميع أطراف القيد!');
      return;
    }

    const entryNum = `JV-${new Date().getFullYear()}-${String(journalEntries.length + 1).padStart(4, '0')}`;
    addJournalEntry(targetClinicId, {
      entryNumber: entryNum,
      date: journalDate,
      description: journalDesc,
      referenceType: 'manual',
      lines: journalLines.map((l, idx) => ({ ...l, id: `${Date.now()}_${idx}` })),
      totalDebit,
      totalCredit,
      isPosted: true
    });

    setShowAddJournalModal(false);
    setJournalDesc('');
    setJournalLines([
      { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, note: '' },
      { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, note: '' }
    ]);
  };

  // Save Voucher
  const handleSaveVoucher = () => {
    if (vouchAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح!');
      return;
    }
    if (!vouchBeneficiary.trim()) {
      alert('يرجى إدخال اسم المستلم / المسلّم منه!');
      return;
    }
    if (!vouchAccountId || !vouchTreasuryId) {
      alert('يرجى تحديد حساب الخزينة والحساب المالي المقابل!');
      return;
    }

    const targetAcc = accounts.find(a => a.id === vouchAccountId);
    const treasuryAcc = accounts.find(a => a.id === vouchTreasuryId);

    const prefix = voucherType === 'receipt' ? 'RV' : 'PV';
    const vouchNum = `${prefix}-${String(vouchers.filter(v => v.type === voucherType).length + 1).padStart(4, '0')}`;

    addVoucher(targetClinicId, {
      type: voucherType,
      voucherNumber: vouchNum,
      date: vouchDate,
      amount: vouchAmount,
      accountId: vouchAccountId,
      accountName: targetAcc?.name || 'حساب مالي',
      treasuryAccountId: vouchTreasuryId,
      treasuryAccountName: treasuryAcc?.name || 'الخزينة الرئيسية',
      beneficiary: vouchBeneficiary,
      paymentMethod: vouchMethod,
      notes: vouchNotes
    });

    setShowAddVoucherModal(false);
    setVouchAmount(0);
    setVouchBeneficiary('');
    setVouchNotes('');
  };

  // Save New Account
  const handleSaveAccount = () => {
    if (!newAccCode.trim() || !newAccName.trim()) {
      alert('يرجى إدخال كود واسم الحساب!');
      return;
    }
    if (accounts.some(a => a.code === newAccCode)) {
      alert('كود الحساب مستخدم بالفعل! يرجى اختيار كود فريد.');
      return;
    }

    addAccount(targetClinicId, {
      code: newAccCode,
      name: newAccName,
      nameEn: newAccNameEn,
      type: newAccType,
      category: newAccCategory,
      parentId: newAccParentId || undefined,
      level: newAccParentId ? 3 : 2,
      openingBalance: Number(newAccOpeningBal) || 0,
      currentBalance: Number(newAccOpeningBal) || 0,
      isSystemAccount: false,
      description: newAccDesc
    });

    setShowAddAccountModal(false);
    setNewAccCode('');
    setNewAccName('');
    setNewAccNameEn('');
    setNewAccOpeningBal(0);
    setNewAccDesc('');
  };

  // Reset accounts to default
  const handleResetAccounts = (templateType?: 'clinic' | 'center' | 'hospital') => {
    const activeTemplate = templateType || selectedTemplate || 'hospital';
    const templateLabel = 
      activeTemplate === 'hospital' ? 'النموذج الذهبي الشامل للمستشفيات والعمليات' :
      activeTemplate === 'center' ? 'نموذج المراكز الطبية والمجمعات التخصصية' : 'نموذج العيادات الطبية التخصصية الفردية';

    if (confirm(`هل أنت متأكد من رغبتك في إعادة تعيين وشحن شجرة الحسابات بالكامل إلى «${templateLabel}»؟ سيقوم هذا الإجراء بإعادة هيكلة الدليل المالي بالكامل للمنشأة.`)) {
      const defaultAccounts = generateDefaultChartOfAccounts(targetClinicId, activeTemplate);
      updateState({
        accountsStore: {
          ...(state.accountsStore || {}),
          [targetClinicId]: defaultAccounts
        }
      });
      logAction('إعادة تعيين النظام المحاسبي', `تمت استعادة وشحن الدليل المحاسبي لنموذج «${templateLabel}» بنجاح.`, 'accounting');
      alert(`تم شحن وتطبيق «${templateLabel}» بنجاح!`);
    }
  };

  // Editing handlers
  const startEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setEditAccCode(acc.code);
    setEditAccName(acc.name);
    setEditAccNameEn(acc.nameEn || '');
    setEditAccType(acc.type);
    setEditAccCategory(acc.category || 'current_assets');
    setEditAccParentId(acc.parentId || '');
    setEditAccOpeningBal(acc.openingBalance || 0);
    setEditAccDesc(acc.description || '');
  };

  const handleSaveEditedAccount = () => {
    if (!editAccCode.trim() || !editAccName.trim()) {
      alert('يرجى إدخال كود واسم الحساب!');
      return;
    }
    if (accounts.some(a => a.code === editAccCode && a.id !== editingAccount?.id)) {
      alert('كود الحساب مستخدم بالفعل! يرجى اختيار كود فريد.');
      return;
    }
    if (editingAccount) {
      editAccount(targetClinicId, editingAccount.id, {
        code: editAccCode,
        name: editAccName,
        nameEn: editAccNameEn,
        type: editAccType,
        category: editAccCategory,
        parentId: editAccParentId || undefined,
        level: editAccParentId ? 3 : 2,
        openingBalance: Number(editAccOpeningBal) || 0,
        description: editAccDesc
      });
      setEditingAccount(null);
    }
  };

  const startEditJournal = (entry: JournalEntry) => {
    setEditingJournal(entry);
    setEditJournalDate(entry.date);
    setEditJournalDesc(entry.description);
    setEditJournalLines(entry.lines.map(line => ({ ...line })));
  };

  const handleEditJournalLineChange = (index: number, field: string, value: any) => {
    const updated = [...editJournalLines];
    if (field === 'accountId') {
      const selectedAcc = accounts.find(a => a.id === value);
      updated[index].accountId = value;
      updated[index].accountCode = selectedAcc?.code || '';
      updated[index].accountName = selectedAcc?.name || '';
    } else {
      (updated[index] as any)[field] = value;
    }
    setEditJournalLines(updated);
  };

  const addEditJournalLine = () => {
    setEditJournalLines([...editJournalLines, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, note: '' }]);
  };

  const removeEditJournalLine = (index: number) => {
    if (editJournalLines.length <= 2) {
      alert('يجب أن يحتوي القيد المحاسبي على طرفين على الأقل (مدين ودائن)!');
      return;
    }
    setEditJournalLines(editJournalLines.filter((_, i) => i !== index));
  };

  const editTotalDebit = editJournalLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const editTotalCredit = editJournalLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isEditJournalBalanced = Math.abs(editTotalDebit - editTotalCredit) < 0.001 && editTotalDebit > 0;

  const handleSaveEditedJournal = () => {
    if (!editJournalDesc.trim()) {
      alert('يرجى إدخال بيان وشرح القيد المحاسبي!');
      return;
    }
    if (!isEditJournalBalanced) {
      alert(`القيد غير متزن! إجمالي المدين (${editTotalDebit}) لا يساوي إجمالي الدائن (${editTotalCredit}).`);
      return;
    }
    const invalidLines = editJournalLines.some(l => !l.accountId || (Number(l.debit) === 0 && Number(l.credit) === 0));
    if (invalidLines) {
      alert('يرجى تحديد الحساب والمبلغ لجميع أطراف القيد!');
      return;
    }

    if (editingJournal) {
      editJournalEntry(targetClinicId, editingJournal.id, {
        date: editJournalDate,
        description: editJournalDesc,
        lines: editJournalLines.map((l, idx) => ({ ...l, id: l.id || `${Date.now()}_${idx}` })),
        totalDebit: editTotalDebit,
        totalCredit: editTotalCredit
      });
      setEditingJournal(null);
    }
  };

  const startEditVoucher = (v: Voucher) => {
    setEditingVoucher(v);
    setEditVouchDate(v.date);
    setEditVouchAmount(v.amount);
    setEditVouchBeneficiary(v.beneficiary);
    setEditVouchAccountId(v.accountId);
    setEditVouchTreasuryId(v.treasuryAccountId);
    setEditVouchMethod(v.paymentMethod);
    setEditVouchNotes(v.notes || '');
  };

  const handleSaveEditedVoucher = () => {
    if (editVouchAmount <= 0) {
      alert('يرجى إدخال مبلغ صحيح!');
      return;
    }
    if (!editVouchBeneficiary.trim()) {
      alert('يرجى إدخال اسم المستلم / المسلّم منه!');
      return;
    }
    if (!editVouchAccountId || !editVouchTreasuryId) {
      alert('يرجى تحديد حساب الخزينة والحساب المالي المقابل!');
      return;
    }

    const targetAcc = accounts.find(a => a.id === editVouchAccountId);
    const treasuryAcc = accounts.find(a => a.id === editVouchTreasuryId);

    if (editingVoucher) {
      editVoucher(targetClinicId, editingVoucher.id, {
        date: editVouchDate,
        amount: editVouchAmount,
        accountId: editVouchAccountId,
        accountName: targetAcc?.name || 'حساب مالي',
        treasuryAccountId: editVouchTreasuryId,
        treasuryAccountName: treasuryAcc?.name || 'الخزينة الرئيسية',
        beneficiary: editVouchBeneficiary,
        paymentMethod: editVouchMethod,
        notes: editVouchNotes
      });
      setEditingVoucher(null);
    }
  };

  // Filtered accounts for display
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          acc.code.includes(searchQuery) || 
                          (acc.nameEn && acc.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || acc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Export & Print Handlers
  const handleExportAccountsExcel = () => {
    exportToExcel(
      filteredAccounts,
      [
        { key: 'code', label: 'كود الحساب' },
        { key: 'name', label: 'اسم الحساب' },
        { key: 'nameEn', label: 'Account Name (EN)' },
        { key: 'type', label: 'النوع', format: (val) => val === 'asset' ? 'أصول' : val === 'liability' ? 'خصوم' : val === 'equity' ? 'حقوق ملكية' : val === 'revenue' ? 'إيرادات' : 'مصروفات' },
        { key: 'level', label: 'المستوى' },
        { key: 'openingBalance', label: 'الرصيد الافتتاحي' },
        { key: 'currentBalance', label: 'الرصيد الحالي' },
        { key: 'description', label: 'الوصف والبيان' }
      ],
      `النظام_المحاسبي_${currentClinic?.name || 'المنشأة'}`
    );
  };

  const handlePrintAccounts = () => {
    printReport({
      title: 'النظام المحاسبي والمالي المعتمد',
      subtitle: `المنظومة المحاسبية المتكاملة والتقارير المالية • ${currentClinic?.name || 'المنشأة الطبية'}`,
      facilityName: currentClinic?.name || 'المنشأة الطبية التخصصية',
      doctorName: currentClinic?.docName,
      facilityPhone: currentClinic?.phone,
      facilityAddress: currentClinic?.address,
      logoUrl: currentClinic?.logoUrl,
      columns: [
        { key: 'code', label: 'كود الحساب' },
        { key: 'name', label: 'اسم الحساب' },
        { key: 'type', label: 'النوع', format: (val) => val === 'asset' ? 'أصول' : val === 'liability' ? 'خصوم' : val === 'equity' ? 'حقوق ملكية' : val === 'revenue' ? 'إيرادات' : 'مصروفات' },
        { key: 'openingBalance', label: 'الرصيد الافتتاحي' },
        { key: 'currentBalance', label: 'الرصيد الحالي' }
      ],
      data: filteredAccounts,
      summaryCards: [
        { label: 'إجمالي الأصول', value: `${financialSummary.totalAssets.toLocaleString()} ${financialSummary.currency}` },
        { label: 'إجمالي الخصوم', value: `${financialSummary.totalLiabilities.toLocaleString()} ${financialSummary.currency}` },
        { label: 'إجمالي الإيرادات', value: `${financialSummary.totalRevenue.toLocaleString()} ${financialSummary.currency}` },
        { label: 'صافي الربح / الخسارة', value: `${financialSummary.netProfit.toLocaleString()} ${financialSummary.currency}` }
      ]
    });
  };

  const handleExportExcel = () => {
    switch (activeTab) {
      case 'tree':
        handleExportAccountsExcel();
        break;
      case 'journal':
        exportToExcel(
          journalEntries.map(entry => ({
            ...entry,
            linesCount: entry.lines.length,
            linesSummary: entry.lines.map(l => `${l.accountName} (${l.debit > 0 ? `مدين: ${l.debit}` : `دائن: ${l.credit}`})`).join(' | ')
          })),
          [
            { key: 'entryNumber', label: 'رقم القيد' },
            { key: 'date', label: 'التاريخ' },
            { key: 'description', label: 'البيان' },
            { key: 'totalDebit', label: 'إجمالي القيمة' },
            { key: 'createdByName', label: 'بواسطة' },
            { key: 'linesSummary', label: 'تفاصيل الحسابات' }
          ],
          `سجل_قيود_اليومية_${currentClinic?.name || 'المنشأة'}`
        );
        break;
      case 'vouchers':
        exportToExcel(
          vouchers,
          [
            { key: 'voucherNumber', label: 'رقم السند' },
            { key: 'type', label: 'نوع السند', format: (val) => val === 'receipt' ? 'سند قبض' : 'سند صرف' },
            { key: 'date', label: 'التاريخ' },
            { key: 'beneficiary', label: 'المستلم / المسلّم منه' },
            { key: 'treasuryAccountName', label: 'الخزينة / البنك' },
            { key: 'accountName', label: 'الحساب المقابل' },
            { key: 'amount', label: 'المبلغ' },
            { key: 'paymentMethod', label: 'طريقة الدفع', format: (val) => val === 'cash' ? 'نقدي' : val === 'bank' ? 'بنكي' : 'بطاقة / تحويل' },
            { key: 'notes', label: 'ملاحظات' }
          ],
          `سندات_القبض_والصرف_${currentClinic?.name || 'المنشأة'}`
        );
        break;
      case 'ledger':
        const ledgerAcc = accounts.find(a => a.id === selectedLedgerAccountId);
        const ledgerTransactions = journalEntries.flatMap(entry => 
          entry.lines
            .filter(line => line.accountId === selectedLedgerAccountId)
            .map(line => ({
              date: entry.date,
              entryNumber: entry.entryNumber,
              description: entry.description,
              debit: line.debit,
              credit: line.credit,
              note: line.note
            }))
        );
        exportToExcel(
          ledgerTransactions,
          [
            { key: 'date', label: 'التاريخ' },
            { key: 'entryNumber', label: 'رقم القيد المحاسبي' },
            { key: 'description', label: 'شرح القيد' },
            { key: 'debit', label: 'مدين (Debit)' },
            { key: 'credit', label: 'دائن (Credit)' },
            { key: 'note', label: 'ملاحظات الحركة' }
          ],
          `كشف_حساب_${ledgerAcc?.name || 'دفتر_الأستاذ'}_${currentClinic?.name || 'المنشأة'}`
        );
        break;
      case 'trial_balance':
        exportToExcel(
          accounts.map(acc => {
            const totalDebit = journalEntries.flatMap(e => e.lines)
              .filter(l => l.accountId === acc.id)
              .reduce((sum, l) => sum + (l.debit || 0), 0);
            const totalCredit = journalEntries.flatMap(e => e.lines)
              .filter(l => l.accountId === acc.id)
              .reduce((sum, l) => sum + (l.credit || 0), 0);
            return {
              ...acc,
              totalDebit,
              totalCredit,
              endingBalance: (acc.openingBalance || 0) + (acc.type === 'asset' || acc.type === 'expense' ? (totalDebit - totalCredit) : (totalCredit - totalDebit))
            };
          }),
          [
            { key: 'code', label: 'كود الحساب' },
            { key: 'name', label: 'اسم الحساب' },
            { key: 'openingBalance', label: 'الرصيد الافتتاحي' },
            { key: 'totalDebit', label: 'مجموع الحركات المدينة' },
            { key: 'totalCredit', label: 'مجموع الحركات الدائنة' },
            { key: 'endingBalance', label: 'الرصيد الختامي' }
          ],
          `ميزان_المراجعة_${currentClinic?.name || 'المنشأة'}`
        );
        break;
      case 'income_statement':
        const revenues = accounts.filter(a => a.type === 'revenue');
        const expenses = accounts.filter(a => a.type === 'expense');
        const plRows = [
          ...revenues.map(r => ({ name: r.name, code: r.code, type: 'إيرادات تشغيلية', amount: r.currentBalance })),
          { name: 'إجمالي الإيرادات', code: '', type: 'حساب إجمالي', amount: financialSummary.totalRevenue },
          ...expenses.map(e => ({ name: e.name, code: e.code, type: 'مصروفات تشغيلية', amount: e.currentBalance })),
          { name: 'إجمالي المصروفات', code: '', type: 'حساب إجمالي', amount: financialSummary.totalExpenses },
          { name: 'صافي الربح أو الخسارة', code: '', type: 'نتيجة النشاط', amount: financialSummary.netProfit }
        ];
        exportToExcel(
          plRows,
          [
            { key: 'code', label: 'كود الحساب' },
            { key: 'name', label: 'البند المالي / الحساب' },
            { key: 'type', label: 'التصنيف' },
            { key: 'amount', label: 'المبلغ المستحق' }
          ],
          `قائمة_الدخل_والأرباح_${currentClinic?.name || 'المنشأة'}`
        );
        break;
    }
  };

  const handlePrint = () => {
    switch (activeTab) {
      case 'tree':
        handlePrintAccounts();
        break;
      case 'journal':
        printReport({
          title: 'سجل قيود اليومية العامة المرحلة',
          subtitle: `المنظومة المحاسبية المتكاملة • ${currentClinic?.name || 'المنشأة الطبية'}`,
          facilityName: currentClinic?.name || 'المنشأة الطبية',
          columns: [
            { key: 'entryNumber', label: 'رقم القيد' },
            { key: 'date', label: 'التاريخ' },
            { key: 'description', label: 'البيان وشرح القيد' },
            { key: 'totalDebit', label: 'القيمة الإجمالية' }
          ],
          data: journalEntries,
          summaryCards: [
            { label: 'عدد قيود اليومية العامة', value: String(journalEntries.length) },
            { label: 'إجمالي القيمة المقيدة', value: `${journalEntries.reduce((sum, j) => sum + j.totalDebit, 0).toLocaleString()} ${financialSummary.currency}` }
          ]
        });
        break;
      case 'vouchers':
        printReport({
          title: 'سجل المقبوضات والمدفوعات والسندات المالية',
          subtitle: `المنظومة المحاسبية المتكاملة • ${currentClinic?.name || 'المنشأة الطبية'}`,
          facilityName: currentClinic?.name || 'المنشأة الطبية',
          columns: [
            { key: 'voucherNumber', label: 'رقم السند' },
            { key: 'type', label: 'النوع', format: (val) => val === 'receipt' ? 'قبض RV' : 'صرف PV' },
            { key: 'date', label: 'التاريخ' },
            { key: 'beneficiary', label: 'المستلم / المسلم منه' },
            { key: 'amount', label: 'المبلغ' },
            { key: 'paymentMethod', label: 'طريقة السداد', format: (v) => v === 'cash' ? 'نقدي' : 'بنكي / فيزا' }
          ],
          data: vouchers,
          summaryCards: [
            { label: 'إجمالي المقبوضات (سند قبض)', value: `${vouchers.filter(v => v.type === 'receipt').reduce((sum, v) => sum + v.amount, 0).toLocaleString()} ${financialSummary.currency}` },
            { label: 'إجمالي المدفوعات (سند صرف)', value: `${vouchers.filter(v => v.type === 'payment').reduce((sum, v) => sum + v.amount, 0).toLocaleString()} ${financialSummary.currency}` }
          ]
        });
        break;
      case 'ledger':
        const ledgerAcc = accounts.find(a => a.id === selectedLedgerAccountId);
        const ledgerTransactions = journalEntries.flatMap(entry => 
          entry.lines
            .filter(line => line.accountId === selectedLedgerAccountId)
            .map(line => ({
              date: entry.date,
              entryNumber: entry.entryNumber,
              description: entry.description,
              debit: line.debit,
              credit: line.credit,
              note: line.note
            }))
        );
        printReport({
          title: `دفتر الأستاذ العام - حساب: ${ledgerAcc?.name || 'غير محدد'}`,
          subtitle: `المنظومة المحاسبية المتكاملة • كود الحساب: ${ledgerAcc?.code || '-'}`,
          facilityName: currentClinic?.name || 'المنشأة الطبية',
          columns: [
            { key: 'date', label: 'التاريخ' },
            { key: 'entryNumber', label: 'رقم القيد' },
            { key: 'description', label: 'شرح القيد المحاسبي' },
            { key: 'debit', label: 'مدين (Debit)' },
            { key: 'credit', label: 'دائن (Credit)' }
          ],
          data: ledgerTransactions,
          summaryCards: [
            { label: 'الرصيد الافتتاحي للحساب', value: `${(ledgerAcc?.openingBalance || 0).toLocaleString()} ${financialSummary.currency}` },
            { label: 'الرصيد الحالي للحساب', value: `${(ledgerAcc?.currentBalance || 0).toLocaleString()} ${financialSummary.currency}` }
          ]
        });
        break;
      case 'trial_balance':
        const trialRows = accounts.map(acc => {
          const totalDebit = journalEntries.flatMap(e => e.lines)
            .filter(l => l.accountId === acc.id)
            .reduce((sum, l) => sum + (l.debit || 0), 0);
          const totalCredit = journalEntries.flatMap(e => e.lines)
            .filter(l => l.accountId === acc.id)
            .reduce((sum, l) => sum + (l.credit || 0), 0);
          return {
            ...acc,
            totalDebit,
            totalCredit,
            endingBalance: (acc.openingBalance || 0) + (acc.type === 'asset' || acc.type === 'expense' ? (totalDebit - totalCredit) : (totalCredit - totalDebit))
          };
        });
        printReport({
          title: 'ميزان المراجعة بالأرصدة والمجاميع المعتمد',
          subtitle: `المنظومة المحاسبية المتكاملة • ${currentClinic?.name || 'المنشأة الطبية'}`,
          facilityName: currentClinic?.name || 'المنشأة الطبية',
          columns: [
            { key: 'code', label: 'كود الحساب' },
            { key: 'name', label: 'اسم الحساب' },
            { key: 'totalDebit', label: 'مجموع المدين' },
            { key: 'totalCredit', label: 'مجموع الدائن' },
            { key: 'endingBalance', label: 'الرصيد الختامي' }
          ],
          data: trialRows,
          summaryCards: [
            { label: 'إجمالي الحركات المدينة', value: `${trialRows.reduce((s, r) => s + r.totalDebit, 0).toLocaleString()} ${financialSummary.currency}` },
            { label: 'إجمالي الحركات الدائنة', value: `${trialRows.reduce((s, r) => s + r.totalCredit, 0).toLocaleString()} ${financialSummary.currency}` }
          ]
        });
        break;
      case 'income_statement':
        const revenues = accounts.filter(a => a.type === 'revenue');
        const expenses = accounts.filter(a => a.type === 'expense');
        const plRows = [
          ...revenues.map(r => ({ name: r.name, code: r.code, type: 'إيرادات تشغيلية', amount: r.currentBalance })),
          ...expenses.map(e => ({ name: e.name, code: e.code, type: 'مصروفات تشغيلية', amount: e.currentBalance }))
        ];
        printReport({
          title: 'قائمة الدخل والأرباح والخسائر الرسمية (P&L)',
          subtitle: `المنظومة المحاسبية المتكاملة • ${currentClinic?.name || 'المنشأة الطبية'}`,
          facilityName: currentClinic?.name || 'المنشأة الطبية',
          columns: [
            { key: 'code', label: 'كود الحساب' },
            { key: 'name', label: 'البند المالي / الحساب' },
            { key: 'type', label: 'نوع النشاط' },
            { key: 'amount', label: 'الرصيد المستحق' }
          ],
          data: plRows,
          summaryCards: [
            { label: 'إجمالي الإيرادات المحققة', value: `${financialSummary.totalRevenue.toLocaleString()} ${financialSummary.currency}` },
            { label: 'إجمالي المصروفات والتشغيل', value: `${financialSummary.totalExpenses.toLocaleString()} ${financialSummary.currency}` },
            { label: 'صافي الفائض / العجز المالي', value: `${financialSummary.netProfit.toLocaleString()} ${financialSummary.currency}` }
          ]
        });
        break;
    }
  };

  // Helper type colors
  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'asset':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">أصول (Asset)</span>;
      case 'liability':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">خصوم (Liability)</span>;
      case 'equity':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">حقوق ملكية (Equity)</span>;
      case 'revenue':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">إيرادات (Revenue)</span>;
      case 'expense':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">مصروفات (Expense)</span>;
    }
  };

  // Treasury Accounts
  const treasuryAccounts = accounts.filter(a => a.code.startsWith('1101') || a.code.startsWith('1102') || a.code.startsWith('1103'));

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto" dir="rtl">
      
      {/* 0. System View Mode Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 rounded-2xl border border-indigo-900/50 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
            <Landmark size={18} />
          </div>
          <div>
            <span className="text-xs font-black text-teal-300 block">نمط الإدارة المالية المعتمد:</span>
            <span className="text-[11px] text-slate-300">
              {isSimpleDoctorMode ? 'نظام العيادات المبسط (صندوق الدرج والإيرادات الفورية)' : 'النظام المحاسبي الشامل (شجرة الحسابات، قيود اليومية، والقوائم المالية)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setIsSimpleDoctorMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSimpleDoctorMode 
                ? 'bg-teal-500 text-slate-950 font-black shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ⚡ واجهة العيادة المبسطة (للطبيب)
          </button>
          <button
            onClick={() => setIsSimpleDoctorMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isSimpleDoctorMode 
                ? 'bg-blue-600 text-white font-black shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🏛️ النظام المحاسبي المتكامل (للمحاسبين والمستشفيات)
          </button>
        </div>
      </div>

      {/* Render Simplified Doctor/Clinic View or Full Accountant Suite */}
      {isSimpleDoctorMode ? (
        <ClinicSimpleAccountingView
          targetClinicId={targetClinicId}
          currentClinicName={currentClinic?.name || 'العيادة'}
          allowEditDelete={allowEditDelete}
          allowPrinting={allowPrinting}
          onSwitchToFullAccounting={() => setIsSimpleDoctorMode(false)}
        />
      ) : (
        <>
          {/* 1. Header & Financial Overview Cards */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Landmark size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>النظام المحاسبي المتكامل والإدارة المالية العامة</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                نظام الحسابات الطبي الشامل للمستشفيات والعيادات والمراكز (عزل مالي كامل لجميع المنشآت الطبية)
              </p>
            </div>
          </div>

          {/* Clinic Switcher for Master Admin */}
          {isMaster && state.clinics.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <Building2 size={16} className="text-slate-500 mr-2" />
              <select 
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer py-1 px-2"
              >
                {state.clinics.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.systemType === 'hospital' ? 'مستشفى' : c.systemType === 'center' ? 'مركز' : 'عيادة'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-bold text-blue-700 block mb-1">إجمالي الأصول</span>
            <span className="text-base md:text-lg font-black text-slate-800">
              {financialSummary.totalAssets.toLocaleString()} <span className="text-[10px] text-slate-500">{financialSummary.currency}</span>
            </span>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-bold text-amber-700 block mb-1">إجمالي الخصوم</span>
            <span className="text-base md:text-lg font-black text-slate-800">
              {financialSummary.totalLiabilities.toLocaleString()} <span className="text-[10px] text-slate-500">{financialSummary.currency}</span>
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-bold text-emerald-700 block mb-1">إجمالي الإيرادات</span>
            <span className="text-base md:text-lg font-black text-slate-800">
              {financialSummary.totalRevenue.toLocaleString()} <span className="text-[10px] text-slate-500">{financialSummary.currency}</span>
            </span>
          </div>

          <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-bold text-rose-700 block mb-1">إجمالي المصروفات</span>
            <span className="text-base md:text-lg font-black text-slate-800">
              {financialSummary.totalExpenses.toLocaleString()} <span className="text-[10px] text-slate-500">{financialSummary.currency}</span>
            </span>
          </div>

          <div className={`col-span-2 md:col-span-1 rounded-xl p-3.5 text-center border ${
            financialSummary.netProfit >= 0 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-rose-600 text-white border-rose-700'
          }`}>
            <span className="text-[11px] font-bold text-emerald-100 block mb-1">صافي الربح / الخسارة</span>
            <span className="text-base md:text-lg font-black">
              {financialSummary.netProfit.toLocaleString()} <span className="text-[10px] opacity-80">{financialSummary.currency}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'tree' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers size={15} /> النظام المحاسبي (الدليل المالي)
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'journal' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={15} /> قيود اليومية ({journalEntries.length})
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'vouchers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt size={15} /> سندات القبض والصرف ({vouchers.length})
          </button>

          <button
            onClick={() => setActiveTab('linked_ledgers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'linked_ledgers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={15} /> كشوف الحسابات المترابطة (مرضى • أطباء • موظفين)
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ledger' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={15} /> دفتر الأستاذ العام
          </button>

          <button
            onClick={() => setActiveTab('trial_balance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'trial_balance' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 size={15} /> ميزان المراجعة
          </button>

          <button
            onClick={() => setActiveTab('income_statement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'income_statement' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingUp size={15} /> قائمة الدخل (P&L)
          </button>
        </div>

        {/* Global Export & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {allowExcel && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="تصدير بيانات التبويب الحالي إلى ملف إكسيل"
            >
              <FileSpreadsheet size={15} /> تصدير إكسيل
            </button>
          )}

          {(allowPdf || allowPrinting) && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="طباعة التبويب الحالي أو التقرير المالي الرسمي كـ PDF"
            >
              <Printer size={15} /> طباعة / PDF
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Content Views */}

      {/* ===================== TAB 1: CHART OF ACCOUNTS (شجرة الحسابات) ===================== */}
      {activeTab === 'tree' && (
        <div className="space-y-4">
          {/* لوحة التحكم والتحول في النموذج المحاسبي للمنشأة */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  محرك النماذج المحاسبية الطبية التفاعلية (Interactive Chart Templates Engine)
                </h5>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  اختر النموذج المحاسبي الذي يتناسب مع حجم وطبيعة منشأتك (مستشفى، مركز طبي، عيادة). سيقوم النظام آلياً بتهيئة الدليل، الشجرة، والحسابات المرتبطة وتجهيزها لاستقبال الترحيل المالي الآلي.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setSelectedTemplate('clinic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTemplate === 'clinic' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    نموذج عيادة تخصصية
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('center')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTemplate === 'center' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    نموذج مركز متعدد
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('hospital')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTemplate === 'hospital' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    نموذج مستشفى متكامل
                  </button>
                </div>

                <button
                  onClick={() => handleResetAccounts(selectedTemplate)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                  تطبيق وتحديث الدليل المحاسبي
                </button>
              </div>
            </div>

            {/* تفاصيل النموذج المختار وعلاقته بالفصل التام والترحيل المالي */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={`p-3 rounded-xl transition-all ${selectedTemplate === 'hospital' ? 'bg-white border border-blue-200 shadow-sm' : 'opacity-60 bg-slate-50/50'}`}>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  نموذج المستشفيات والعمليات الجراحية
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  يضيف حسابات غرف العمليات الكبرى (OR)، الإقامة والتنويم بالأجنحة، غرف العناية المركزة (ICU)، عهود صيدلية الطوارئ، وتكاليف الغازات الطبية وصيانة التجهيزات الثقيلة.
                </p>
              </div>

              <div className={`p-3 rounded-xl transition-all ${selectedTemplate === 'center' ? 'bg-white border border-blue-200 shadow-sm' : 'opacity-60 bg-slate-50/50'}`}>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  نموذج المراكز والمجمعات متعددة العيادات
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  يركز على حسابات توزيع الإيرادات لعيادات الأسنان، العلاج الطبيعي والتأهيل، مصاريف تسويق العروض والباقات الشاملة، وأتعاب تشغيل الأطباء المتعاقدين والزائرين.
                </p>
              </div>

              <div className={`p-3 rounded-xl transition-all ${selectedTemplate === 'clinic' ? 'bg-white border border-blue-200 shadow-sm' : 'opacity-60 bg-slate-50/50'}`}>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  نموذج العيادات الطبية الفردية
                </div>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  دليل مالي مبسط وسريع، يركز على الكشوفات المباشرة، فواتير إيجار العيادة، الخدمات العامة، صيانة الأجهزة الطبية الخفيفة، ويستبعد حسابات الهياكل المعقدة تيسيراً للاستخدام.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="بحث برقم الحساب أو الاسم (عربي / English)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none font-medium text-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="all">جميع أنواع الحسابات</option>
                <option value="asset">الأصول (Assets)</option>
                <option value="liability">الخصوم والالتزامات (Liabilities)</option>
                <option value="equity">حقوق الملكية (Equity)</option>
                <option value="revenue">الإيرادات (Revenues)</option>
                <option value="expense">المصروفات (Expenses)</option>
              </select>

              <button
                onClick={() => setShowAddAccountModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus size={15} /> إضافة حساب فرعي جديد
              </button>

              <button
                onClick={handleResetAccounts}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                title="استعادة الشجرة الطبية القياسية الافتراضية"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Accounts Hierarchical Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
                    <th className="py-3 px-4">كود الحساب</th>
                    <th className="py-3 px-4">اسم الحساب المالي</th>
                    <th className="py-3 px-4">النوع المحاسبي</th>
                    <th className="py-3 px-4">المستوى</th>
                    <th className="py-3 px-4 text-left">الرصيد الحالي</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredAccounts.map((acc) => {
                    const isParent = acc.level === 1 || acc.level === 2;
                    const paddingIndent = acc.level === 1 ? 'pr-4 font-black text-slate-900 bg-slate-50/50' : acc.level === 2 ? 'pr-8 font-bold text-slate-800' : 'pr-12 text-slate-600';
                    return (
                      <tr key={acc.id} className={`hover:bg-blue-50/30 transition-colors ${acc.level === 1 ? 'bg-slate-50/40' : ''}`}>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {acc.code}
                        </td>
                        <td className={`py-3 px-4 ${paddingIndent}`}>
                          <div className="flex items-center gap-2">
                            <span>{acc.name}</span>
                            {acc.nameEn && <span className="text-[10px] text-slate-400 font-mono">({acc.nameEn})</span>}
                            {acc.isSystemAccount && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">نظامي</span>
                            )}
                          </div>
                          {acc.description && (
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">{acc.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getTypeBadge(acc.type)}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          مستوى {acc.level}
                        </td>
                        <td className="py-3 px-4 text-left font-bold font-mono">
                          <span className={Number(acc.currentBalance) >= 0 ? 'text-slate-800' : 'text-rose-600'}>
                            {(Number(acc.currentBalance) || Number(acc.openingBalance) || 0).toLocaleString()} {financialSummary.currency}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedLedgerAccountId(acc.id);
                                setActiveTab('ledger');
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="عرض كشف حساب الأستاذ"
                            >
                              <Eye size={14} />
                            </button>
                            {allowEditDelete && !acc.isSystemAccount && (
                              <>
                                <button
                                  onClick={() => startEditAccount(acc)}
                                  className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                                  title="تعديل الحساب المالي"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الحساب المالي؟ لا يمكن التراجع.')) {
                                      deleteAccount(targetClinicId, acc.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="حذف الحساب المالي"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: JOURNAL ENTRIES (قيود اليومية) ===================== */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">سجل قيود اليومية العامة (General Journal)</h3>
              <p className="text-xs text-slate-500">جميع القيود المحاسبية المزدوجة المتزنة آلياً ويدوياً</p>
            </div>

            <button
              onClick={() => setShowAddJournalModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} /> إضافة قيد يومية متزن
            </button>
          </div>

          {journalEntries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
              <h4 className="text-base font-bold text-slate-700 mb-1">لا توجد قيود يومية مسجلة بعد</h4>
              <p className="text-xs text-slate-500 mb-4">يمكنك إنشاء قيود اليومية يدوياً أو عند إصدار الفواتير وسندات القبض والصرف.</p>
              <button
                onClick={() => setShowAddJournalModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus size={14} /> إنشاء أول قيد محاسبي
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-blue-700 text-xs px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200">
                        {entry.entryNumber}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{entry.description}</h4>
                        <span className="text-[10px] text-slate-500">{entry.date} • بواسطة: {entry.createdByName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700">
                        الإجمالي: <strong className="text-blue-600 font-mono">{entry.totalDebit.toLocaleString()} {financialSummary.currency}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} /> متزن ومرحل
                      </span>
                      {allowEditDelete && (
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => startEditJournal(entry)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                            title="تعديل القيد المحاسبي"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من رغبتك في حذف هذا القيد المحاسبي بالكامل؟ سيتم إعادة حساب أرصدة الحسابات تلقائياً.')) {
                                deleteJournalEntry(targetClinicId, entry.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="حذف القيد المحاسبي"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                          <th className="py-2.5 px-4">كود الحساب</th>
                          <th className="py-2.5 px-4">اسم الحساب</th>
                          <th className="py-2.5 px-4 text-left">مدين (Debit)</th>
                          <th className="py-2.5 px-4 text-left">دائن (Credit)</th>
                          <th className="py-2.5 px-4">البيان والشرح</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {entry.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-mono text-slate-600">{line.accountCode}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-800">{line.accountName}</td>
                            <td className="py-2.5 px-4 text-left font-mono font-bold text-blue-600">
                              {Number(line.debit) > 0 ? Number(line.debit).toLocaleString() : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-left font-mono font-bold text-emerald-600">
                              {Number(line.credit) > 0 ? Number(line.credit).toLocaleString() : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">{line.note || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: VOUCHERS (سندات القبض والصرف) ===================== */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">سندات القبض والصرف والخزينة</h3>
              <p className="text-xs text-slate-500">توثيق المتحصلات والمدفوعات النقدية والبنكية</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setVoucherType('receipt');
                  setShowAddVoucherModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <ArrowDownLeft size={16} /> سند قبض جديد (Receipt)
              </button>

              <button
                onClick={() => {
                  setVoucherType('payment');
                  setShowAddVoucherModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <ArrowUpRight size={16} /> سند صرف جديد (Payment)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">رقم السند</th>
                    <th className="py-3 px-4">النوع</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">المستلم / المسلّم منه</th>
                    <th className="py-3 px-4">حساب الخزينة / البنك</th>
                    <th className="py-3 px-4">الحساب المقابل</th>
                    <th className="py-3 px-4 text-left">المبلغ</th>
                    <th className="py-3 px-4">طريقة الدفع</th>
                    <th className="py-3 px-4">ملاحظات</th>
                    {allowEditDelete && <th className="py-3 px-4 text-center">إجراءات</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={allowEditDelete ? 10 : 9} className="py-8 text-center text-slate-400">
                        لا توجد سندات قبض أو صرف مسجلة حالياً
                      </td>
                    </tr>
                  ) : vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{v.voucherNumber}</td>
                      <td className="py-3 px-4">
                        {v.type === 'receipt' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <ArrowDownLeft size={11} /> قبض
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                            <ArrowUpRight size={11} /> صرف
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{v.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{v.beneficiary}</td>
                      <td className="py-3 px-4 text-slate-600">{v.treasuryAccountName}</td>
                      <td className="py-3 px-4 text-slate-600">{v.accountName}</td>
                      <td className="py-3 px-4 text-left font-mono font-black text-sm">
                        <span className={v.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'}>
                          {v.amount.toLocaleString()} {financialSummary.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">
                          {v.paymentMethod === 'cash' ? 'نقدي' : v.paymentMethod === 'bank' ? 'بنكي' : v.paymentMethod === 'card' ? 'فيزا / بطاقة' : 'تحويل'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{v.notes || '-'}</td>
                      {allowEditDelete && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEditVoucher(v)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors cursor-pointer"
                              title="تعديل السند المالي"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من رغبتك في حذف هذا السند المالي؟ سيتم حذف القيد المحاسبي المرتبط به وتحديث أرصدة الحسابات تلقائياً.')) {
                                  deleteVoucher(targetClinicId, v.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="حذف السند المالي"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB LINKED LEDGERS (كشوف الحسابات المترابطة) ===================== */}
      {activeTab === 'linked_ledgers' && (
        <LinkedSubLedgersHub
          targetClinicId={selectedClinicId}
          currentClinicName={currentClinic?.name || 'المنشأة'}
          allowEditDelete={allowEditDelete}
          allowPrinting={allowPdf || allowPrinting}
          allowExcel={allowExcel}
        />
      )}

      {/* ===================== TAB 4: GENERAL LEDGER (دفتر الأستاذ) ===================== */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">اختر الحساب لعرض كشف الأستاذ:</label>
              <select
                value={selectedLedgerAccountId}
                onChange={(e) => setSelectedLedgerAccountId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 px-3 py-2 rounded-xl outline-none cursor-pointer max-w-xs"
              >
                <option value="">-- اختر حساباً مالياً --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedLedgerAccountId ? (
            (() => {
              const selectedAcc = accounts.find(a => a.id === selectedLedgerAccountId);
              if (!selectedAcc) return null;

              // Compute ledger rows from journal entries
              let runningBalance = Number(selectedAcc.openingBalance) || 0;
              const ledgerRows: Array<{ date: string; ref: string; desc: string; debit: number; credit: number; balance: number }> = [];

              journalEntries.slice().reverse().forEach(entry => {
                const matchingLines = entry.lines.filter(l => l.accountId === selectedAcc.id || l.accountCode === selectedAcc.code);
                matchingLines.forEach(line => {
                  const d = Number(line.debit) || 0;
                  const c = Number(line.credit) || 0;
                  if (selectedAcc.type === 'asset' || selectedAcc.type === 'expense') {
                    runningBalance += d - c;
                  } else {
                    runningBalance += c - d;
                  }
                  ledgerRows.push({
                    date: entry.date,
                    ref: entry.entryNumber,
                    desc: line.note || entry.description,
                    debit: d,
                    credit: c,
                    balance: runningBalance
                  });
                });
              });

              return (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">
                        كشف حساب: {selectedAcc.code} - {selectedAcc.name}
                      </h4>
                      <span className="text-xs text-slate-500">الرصيد الافتتاحي: {selectedAcc.openingBalance || 0} {financialSummary.currency}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-slate-500 block">الرصيد الختامي الحالي</span>
                      <strong className="text-base font-black text-blue-700 font-mono">
                        {runningBalance.toLocaleString()} {financialSummary.currency}
                      </strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="py-3 px-4">التاريخ</th>
                          <th className="py-3 px-4">رقم المرجع / القيد</th>
                          <th className="py-3 px-4">البيان والشرح</th>
                          <th className="py-3 px-4 text-left">مدين (Debit)</th>
                          <th className="py-3 px-4 text-left">دائن (Credit)</th>
                          <th className="py-3 px-4 text-left">الرصيد التراكمي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ledgerRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              لا توجد حركات مسجلة على هذا الحساب
                            </td>
                          </tr>
                        ) : ledgerRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 text-slate-600">{r.date}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{r.ref}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-800">{r.desc}</td>
                            <td className="py-2.5 px-4 text-left font-mono font-bold text-blue-600">
                              {r.debit > 0 ? r.debit.toLocaleString() : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-left font-mono font-bold text-emerald-600">
                              {r.credit > 0 ? r.credit.toLocaleString() : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-left font-mono font-black text-slate-800">
                              {r.balance.toLocaleString()} {financialSummary.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 font-medium">يرجى اختيار حساب مالي من القائمة أعلاه لعرض كشف دفتر الأستاذ التفصيلي.</p>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 5: TRIAL BALANCE (ميزان المراجعة) ===================== */}
      {activeTab === 'trial_balance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">ميزان المراجعة بالأرصدة (Trial Balance)</h3>
              <p className="text-xs text-slate-500">التحقق من توازن إجمالي الأرصدة المدينة والدائنة لجميع الحسابات</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} /> ميزان متوازن ومطابق
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">كود الحساب</th>
                    <th className="py-3 px-4">اسم الحساب</th>
                    <th className="py-3 px-4">النوع</th>
                    <th className="py-3 px-4 text-left">أرصدة مدينة (Debit)</th>
                    <th className="py-3 px-4 text-left">أرصدة دائنة (Credit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {accounts.filter(a => a.level === 3 || !a.parentId).map(acc => {
                    const bal = Number(acc.currentBalance) || Number(acc.openingBalance) || 0;
                    const isDebitNature = acc.type === 'asset' || acc.type === 'expense';
                    const debitAmount = isDebitNature && bal > 0 ? bal : 0;
                    const creditAmount = !isDebitNature && bal > 0 ? bal : 0;

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{acc.code}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{acc.name}</td>
                        <td className="py-2.5 px-4">{getTypeBadge(acc.type)}</td>
                        <td className="py-2.5 px-4 text-left font-mono font-bold text-blue-600">
                          {debitAmount > 0 ? debitAmount.toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-left font-mono font-bold text-emerald-600">
                          {creditAmount > 0 ? creditAmount.toLocaleString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-800 border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3 px-4 text-left">الإجمالي العام لميزان المراجعة:</td>
                    <td className="py-3 px-4 text-left font-mono font-black text-blue-700 text-sm">
                      {(financialSummary.totalAssets + financialSummary.totalExpenses).toLocaleString()} {financialSummary.currency}
                    </td>
                    <td className="py-3 px-4 text-left font-mono font-black text-emerald-700 text-sm">
                      {(financialSummary.totalLiabilities + financialSummary.totalEquity + financialSummary.totalRevenue).toLocaleString()} {financialSummary.currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 6: INCOME STATEMENT (قائمة الدخل والأرباح) ===================== */}
      {activeTab === 'income_statement' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">قائمة الدخل والأرباح والخسائر (Income Statement)</h3>
              <p className="text-xs text-slate-500">تفصيل الإيرادات التشغيلية والمصروفات وصافي العائد للمنشأة</p>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 block">صافي النتيجة</span>
              <span className={`text-base font-black font-mono ${financialSummary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {financialSummary.netProfit >= 0 ? 'ربح: +' : 'عجز: '}{financialSummary.netProfit.toLocaleString()} {financialSummary.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenues Box */}
            <div className="bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
              <div className="bg-emerald-50 p-3.5 border-b border-emerald-100 flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-800 flex items-center gap-2">
                  <TrendingUp size={16} /> الإيرادات التشغيلية (Revenues)
                </h4>
                <strong className="text-xs font-black text-emerald-700 font-mono">
                  {financialSummary.totalRevenue.toLocaleString()} {financialSummary.currency}
                </strong>
              </div>
              <div className="divide-y divide-slate-100 p-2 text-xs font-medium">
                {accounts.filter(a => a.type === 'revenue' && a.level === 3).map(rev => (
                  <div key={rev.id} className="py-2 px-3 flex justify-between items-center hover:bg-slate-50 rounded-lg">
                    <span className="text-slate-700 font-bold">{rev.name}</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {(Number(rev.currentBalance) || Number(rev.openingBalance) || 0).toLocaleString()} {financialSummary.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Box */}
            <div className="bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-sm">
              <div className="bg-rose-50 p-3.5 border-b border-rose-100 flex items-center justify-between">
                <h4 className="text-xs font-black text-rose-800 flex items-center gap-2">
                  <TrendingDown size={16} /> المصروفات والتكاليف (Expenses)
                </h4>
                <strong className="text-xs font-black text-rose-700 font-mono">
                  {financialSummary.totalExpenses.toLocaleString()} {financialSummary.currency}
                </strong>
              </div>
              <div className="divide-y divide-slate-100 p-2 text-xs font-medium">
                {accounts.filter(a => a.type === 'expense' && a.level === 3).map(exp => (
                  <div key={exp.id} className="py-2 px-3 flex justify-between items-center hover:bg-slate-50 rounded-lg">
                    <span className="text-slate-700 font-bold">{exp.name}</span>
                    <span className="font-mono font-bold text-rose-600">
                      {(Number(exp.currentBalance) || Number(exp.openingBalance) || 0).toLocaleString()} {financialSummary.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD JOURNAL ENTRY ===================== */}
      {showAddJournalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" /> إضافة قيد يومية متزن (Double Entry)
              </h3>
              <button onClick={() => setShowAddJournalModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">تاريخ القيد</label>
                <input
                  type="date"
                  value={journalDate}
                  onChange={(e) => setJournalDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">شرح وبيان القيد المحاسبي</label>
                <input
                  type="text"
                  placeholder="مثال: سداد إيجار العيادة نقداً / إثبات أتعاب الأطباء..."
                  value={journalDesc}
                  onChange={(e) => setJournalDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            {/* Lines Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">أطراف القيد المحاسبي:</span>
                <button
                  onClick={addJournalLine}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> إضافة طرف جديد
                </button>
              </div>

              <div className="space-y-2">
                {journalLines.map((line, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                      className="w-full md:w-1/3 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                    >
                      <option value="">-- اختر الحساب --</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="مدين (Debit)"
                      value={line.debit || ''}
                      onChange={(e) => {
                        handleLineChange(idx, 'debit', Number(e.target.value));
                        if (Number(e.target.value) > 0) handleLineChange(idx, 'credit', 0);
                      }}
                      className="w-full md:w-1/5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-blue-600 outline-none"
                    />

                    <input
                      type="number"
                      placeholder="دائن (Credit)"
                      value={line.credit || ''}
                      onChange={(e) => {
                        handleLineChange(idx, 'credit', Number(e.target.value));
                        if (Number(e.target.value) > 0) handleLineChange(idx, 'debit', 0);
                      }}
                      className="w-full md:w-1/5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-600 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="ملاحظات الطرف..."
                      value={line.note || ''}
                      onChange={(e) => handleLineChange(idx, 'note', e.target.value)}
                      className="w-full md:flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />

                    <button
                      onClick={() => removeJournalLine(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="حذف هذا السطر"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Balance Validation Bar */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              isJournalBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-3">
                <span>إجمالي المدين: <strong className="font-mono">{totalDebit.toLocaleString()}</strong></span>
                <span>•</span>
                <span>إجمالي الدائن: <strong className="font-mono">{totalCredit.toLocaleString()}</strong></span>
              </div>
              <div>
                {isJournalBalanced ? (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 size={14} /> القيد متزن وجاهز للحفظ
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-700">
                    <AlertCircle size={14} /> غير متزن! الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddJournalModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={!isJournalBalanced}
                onClick={handleSaveJournalEntry}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                حفظ وترحيل القيد المحاسبي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD VOUCHER ===================== */}
      {showAddVoucherModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={18} className={voucherType === 'receipt' ? 'text-emerald-600' : 'text-rose-600'} />
                {voucherType === 'receipt' ? 'إصدار سند قبض نقدي / بنكي' : 'إصدار سند صرف نقدي / بنكي'}
              </h3>
              <button onClick={() => setShowAddVoucherModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={vouchDate}
                    onChange={(e) => setVouchDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ المطلوب</label>
                  <input
                    type="number"
                    value={vouchAmount || ''}
                    onChange={(e) => setVouchAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {voucherType === 'receipt' ? 'استلمنا من السيد / الجهة' : 'يصرف للسيد / الجهة'}
                </label>
                <input
                  type="text"
                  placeholder="اسم الشخص أو المورد أو المريض..."
                  value={vouchBeneficiary}
                  onChange={(e) => setVouchBeneficiary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">حساب الخزينة أو البنك المسحوب منه / المودع فيه</label>
                <select
                  value={vouchTreasuryId}
                  onChange={(e) => setVouchTreasuryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">-- اختر الخزينة أو الحساب البنكي --</option>
                  {treasuryAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الحساب المالي المقابل (السبب المحاسبي)</label>
                <select
                  value={vouchAccountId}
                  onChange={(e) => setVouchAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">-- اختر الحساب المالي المقابل --</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">طريقة السداد</label>
                <select
                  value={vouchMethod}
                  onChange={(e) => setVouchMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="cash">نقداً من الخزينة (Cash)</option>
                  <option value="bank">إيداع / سحب بنكي (Bank)</option>
                  <option value="card">بطاقة دفع إلكتروني (POS)</option>
                  <option value="transfer">تحويل إلكتروني / إنستاباي</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات وبيان السند</label>
                <textarea
                  rows={2}
                  placeholder="وذلك عن..."
                  value={vouchNotes}
                  onChange={(e) => setVouchNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddVoucherModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveVoucher}
                className={`px-6 py-2 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all ${
                  voucherType === 'receipt' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                حفظ وإصدار السند
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD ACCOUNT ===================== */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" /> إضافة حساب مالي جديد بالشجرة
              </h3>
              <button onClick={() => setShowAddAccountModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">كود الحساب (رقمي)</label>
                  <input
                    type="text"
                    placeholder="مثال: 1109 أو 5212"
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نوع الحساب</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="asset">أصول (Asset)</option>
                    <option value="liability">خصوم (Liability)</option>
                    <option value="equity">حقوق ملكية (Equity)</option>
                    <option value="revenue">إيرادات (Revenue)</option>
                    <option value="expense">مصروفات (Expense)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم الحساب (عربي)</label>
                <input
                  type="text"
                  placeholder="مثال: عهدة د. أحمد / إيراد عيادة التغذية..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Name (English) - اختياري</label>
                <input
                  type="text"
                  placeholder="e.g. Petty Cash / Clinic Revenue"
                  value={newAccNameEn}
                  onChange={(e) => setNewAccNameEn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الحساب الأب (Parent Account)</label>
                <select
                  value={newAccParentId}
                  onChange={(e) => setNewAccParentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">-- بدون حساب أب (حساب رئيسي) --</option>
                  {accounts.filter(a => a.level <= 2).map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الرصيد الافتتاحي</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newAccOpeningBal || ''}
                  onChange={(e) => setNewAccOpeningBal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">بيان ووصف الحساب</label>
                <input
                  type="text"
                  placeholder="ملاحظات حول طبيعة الحساب واستخداماته..."
                  value={newAccDesc}
                  onChange={(e) => setNewAccDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveAccount}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                حفظ الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT ACCOUNT ===================== */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit3 size={18} className="text-amber-600" /> تعديل بيانات الحساب المالي
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">كود الحساب (رقمي)</label>
                  <input
                    type="text"
                    placeholder="مثال: 1109 أو 5212"
                    value={editAccCode}
                    onChange={(e) => setEditAccCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نوع الحساب</label>
                  <select
                    value={editAccType}
                    onChange={(e) => setEditAccType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="asset">أصول (Asset)</option>
                    <option value="liability">خصوم (Liability)</option>
                    <option value="equity">حقوق ملكية (Equity)</option>
                    <option value="revenue">إيرادات (Revenue)</option>
                    <option value="expense">مصروفات (Expense)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم الحساب (عربي)</label>
                <input
                  type="text"
                  placeholder="مثال: عهدة د. أحمد..."
                  value={editAccName}
                  onChange={(e) => setEditAccName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Name (English) - اختياري</label>
                <input
                  type="text"
                  placeholder="e.g. Petty Cash"
                  value={editAccNameEn}
                  onChange={(e) => setEditAccNameEn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الحساب الأب (Parent Account)</label>
                <select
                  value={editAccParentId}
                  onChange={(e) => setEditAccParentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">-- بدون حساب أب (حساب رئيسي) --</option>
                  {accounts.filter(a => a.level <= 2 && a.id !== editingAccount.id).map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الرصيد الافتتاحي</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={editAccOpeningBal || ''}
                  onChange={(e) => setEditAccOpeningBal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">بيان ووصف الحساب</label>
                <input
                  type="text"
                  placeholder="ملاحظات حول طبيعة الحساب..."
                  value={editAccDesc}
                  onChange={(e) => setEditAccDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEditedAccount}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT JOURNAL ENTRY ===================== */}
      {editingJournal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" /> تعديل قيد اليومية رقم ({editingJournal.entryNumber})
              </h3>
              <button onClick={() => setEditingJournal(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تاريخ القيد</label>
                  <input
                    type="date"
                    value={editJournalDate}
                    onChange={(e) => setEditJournalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">شرح وبيان القيد المحاسبي</label>
                  <input
                    type="text"
                    value={editJournalDesc}
                    onChange={(e) => setEditJournalDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Lines Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">أطراف القيد المحاسبي:</span>
                  <button
                    onClick={addEditJournalLine}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> إضافة طرف جديد
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editJournalLines.map((line, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleEditJournalLineChange(idx, 'accountId', e.target.value)}
                        className="w-full md:w-1/3 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                      >
                        <option value="">-- اختر الحساب --</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="مدين (Debit)"
                        value={line.debit || ''}
                        onChange={(e) => {
                          handleEditJournalLineChange(idx, 'debit', Number(e.target.value));
                          if (Number(e.target.value) > 0) handleEditJournalLineChange(idx, 'credit', 0);
                        }}
                        className="w-full md:w-1/5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-blue-600 outline-none"
                      />

                      <input
                        type="number"
                        placeholder="دائن (Credit)"
                        value={line.credit || ''}
                        onChange={(e) => {
                          handleEditJournalLineChange(idx, 'credit', Number(e.target.value));
                          if (Number(e.target.value) > 0) handleEditJournalLineChange(idx, 'debit', 0);
                        }}
                        className="w-full md:w-1/5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-600 outline-none"
                      />

                      <input
                        type="text"
                        placeholder="ملاحظات الطرف..."
                        value={line.note || ''}
                        onChange={(e) => handleEditJournalLineChange(idx, 'note', e.target.value)}
                        className="w-full md:flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />

                      <button
                        onClick={() => removeEditJournalLine(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Balance Validation Bar */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isEditJournalBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span>إجمالي المدين: <strong className="font-mono">{editTotalDebit.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>إجمالي الدائن: <strong className="font-mono">{editTotalCredit.toLocaleString()}</strong></span>
                </div>
                <div>
                  {isEditJournalBalanced ? (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 size={14} /> القيد متزن وجاهز للترحيل
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-700">
                      <AlertCircle size={14} /> غير متزن! الفرق: {Math.abs(editTotalDebit - editTotalCredit).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingJournal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={!isEditJournalBalanced}
                onClick={handleSaveEditedJournal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                تحديث وحفظ القيد المحاسبي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT VOUCHER ===================== */}
      {editingVoucher && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={18} className={editingVoucher.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'} />
                تعديل السند المالي رقم ({editingVoucher.voucherNumber})
              </h3>
              <button onClick={() => setEditingVoucher(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={editVouchDate}
                    onChange={(e) => setEditVouchDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">المبلغ المطلوب</label>
                  <input
                    type="number"
                    value={editVouchAmount || ''}
                    onChange={(e) => setEditVouchAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {editingVoucher.type === 'receipt' ? 'استلمنا من السيد / الجهة' : 'يصرف للسيد / الجهة'}
                </label>
                <input
                  type="text"
                  placeholder="اسم الشخص أو المورد..."
                  value={editVouchBeneficiary}
                  onChange={(e) => setEditVouchBeneficiary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">حساب الخزينة أو البنك</label>
                <select
                  value={editVouchTreasuryId}
                  onChange={(e) => setEditVouchTreasuryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">-- اختر الخزينة أو الحساب البنكي --</option>
                  {treasuryAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الحساب المالي المقابل</label>
                <select
                  value={editVouchAccountId}
                  onChange={(e) => setEditVouchAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="">-- اختر الحساب المالي المقابل --</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">طريقة السداد</label>
                <select
                  value={editVouchMethod}
                  onChange={(e) => setEditVouchMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="cash">نقداً من الخزينة (Cash)</option>
                  <option value="bank">إيداع / سحب بنكي (Bank)</option>
                  <option value="card">بطاقة دفع إلكتروني (POS)</option>
                  <option value="transfer">تحويل إلكتروني / إنستاباي</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات وبيان السند</label>
                <textarea
                  rows={2}
                  placeholder="وذلك عن..."
                  value={editVouchNotes}
                  onChange={(e) => setEditVouchNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingVoucher(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEditedVoucher}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                حفظ تعديلات السند
              </button>
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
}
