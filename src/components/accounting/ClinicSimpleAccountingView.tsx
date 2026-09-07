import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Minus, Wallet, 
  Receipt, Stethoscope, FileText, Calendar, Clock, CheckCircle2, 
  Printer, ArrowUpRight, ArrowDownLeft, Filter, RefreshCw
} from 'lucide-react';
import { Account, Voucher, JournalEntry } from '../../types';
import { getTodayISO } from '../../lib/utils';
import { printReport } from '../../lib/exportUtils';

interface ClinicSimpleAccountingViewProps {
  targetClinicId: string;
  currentClinicName: string;
  allowEditDelete: boolean;
  allowPrinting: boolean;
  onSwitchToFullAccounting: () => void;
}

export default function ClinicSimpleAccountingView({
  targetClinicId,
  currentClinicName,
  allowEditDelete,
  allowPrinting,
  onSwitchToFullAccounting
}: ClinicSimpleAccountingViewProps) {
  const { state, addVoucher, logAction } = useAppContext();

  // Date filters
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [filterType, setFilterType] = useState<'all' | 'receipt' | 'payment'>('all');

  // Quick Action Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'receipt' | 'payment'>('receipt');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('كشوفات وزيارات');
  const [beneficiary, setBeneficiary] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Get clinic vouchers & queue
  const vouchers = useMemo(() => state.vouchersStore?.[targetClinicId] || [], [state.vouchersStore, targetClinicId]);
  const accounts = useMemo(() => state.accountsStore?.[targetClinicId] || [], [state.accountsStore, targetClinicId]);

  // Queue visits for income calculation
  const queueItems = useMemo(() => state.queue?.[targetClinicId] || [], [state.queue, targetClinicId]);
  const archiveItems = useMemo(() => state.archive?.[targetClinicId] || [], [state.archive, targetClinicId]);

  // Combined visits for income
  const todayVisits = useMemo(() => {
    const all = [...queueItems, ...archiveItems];
    return all.filter(v => v.date === selectedDate || (!v.date && selectedDate === getTodayISO()));
  }, [queueItems, archiveItems, selectedDate]);

  const totalVisitRevenue = useMemo(() => {
    return todayVisits.reduce((sum, v) => sum + (Number(v.price) || 0), 0);
  }, [todayVisits]);

  // Today Vouchers
  const todayVouchers = useMemo(() => {
    return vouchers.filter(v => v.date === selectedDate);
  }, [vouchers, selectedDate]);

  const todayReceipts = useMemo(() => {
    return todayVouchers
      .filter(v => v.type === 'receipt')
      .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  }, [todayVouchers]);

  const todayPayments = useMemo(() => {
    return todayVouchers
      .filter(v => v.type === 'payment')
      .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  }, [todayVouchers]);

  // Total Net Income for Selected Day
  const totalDayIncome = totalVisitRevenue + todayReceipts;
  const totalDayExpenses = todayPayments;
  const netDayCash = totalDayIncome - totalDayExpenses;

  // Treasury Accounts
  const defaultTreasury = useMemo(() => {
    return accounts.find(a => a.code.startsWith('1101')) || accounts[0];
  }, [accounts]);

  // Categories presets
  const receiptCategories = ['كشوفات وزيارات عيادة', 'استشارات ومتابعات', 'فحوصات وخدمات طبية', 'إيرادات أخرى'];
  const paymentCategories = ['إيجار العيادة', 'مستلزمات وأدوات طبية', 'صيانة ومستلزمات', 'رواتب الكادر والتمريض', 'سحب أرباح الدكتور (مسحوبات)', 'كهرباء ومرافق'];

  const handleSaveTransaction = () => {
    if (amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح!');
      return;
    }

    const vouchPrefix = modalType === 'receipt' ? 'RV' : 'PV';
    const vouchNum = `${vouchPrefix}-${Date.now().toString().slice(-5)}`;

    // Account mapping
    let matchedAcc = accounts.find(a => a.name.includes(category));
    if (!matchedAcc) {
      matchedAcc = accounts.find(a => modalType === 'receipt' ? a.type === 'revenue' : a.type === 'expense') || accounts[0];
    }

    addVoucher(targetClinicId, {
      type: modalType,
      voucherNumber: vouchNum,
      date: selectedDate,
      amount,
      accountId: matchedAcc?.id || 'default_acc',
      accountName: matchedAcc?.name || category,
      treasuryAccountId: defaultTreasury?.id || 'treasury_1',
      treasuryAccountName: defaultTreasury?.name || 'صندوق العيادة الرئيسي',
      beneficiary: beneficiary || (modalType === 'receipt' ? 'مريض / مراجع' : 'مصروف عيادة'),
      paymentMethod: 'cash',
      notes: `${category} • ${notes}`
    });

    logAction(
      modalType === 'receipt' ? 'إضافة إيراد عيادة' : 'إضافة مصروف عيادة',
      `تم تسليط ${modalType === 'receipt' ? 'سند قبض' : 'سند صرف'} بمبلغ ${amount} EGP (${category})`,
      'accounting'
    );

    setShowAddModal(false);
    setAmount(0);
    setBeneficiary('');
    setNotes('');
  };

  // Filtered transactions for list
  const displayTransactions = useMemo(() => {
    let list = [...todayVouchers];
    if (filterType !== 'all') {
      list = list.filter(v => v.type === filterType);
    }
    return list;
  }, [todayVouchers, filterType]);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* 1. Easy Mode Banner with Switcher */}
      <div className="bg-gradient-to-l from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-teal-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-400/30 shrink-0">
              <Stethoscope size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-teal-300 text-xs font-bold mb-1">
                <CheckCircle2 size={14} /> النظام المحاسبي المبسط للطبيب والعيادة (Doctor Friendly Mode)
              </div>
              <h2 className="text-lg font-black text-white">
                خزينة وإيرادات «{currentClinicName}»
              </h2>
              <p className="text-xs text-slate-300">
                إدارة سهلة ومباشرة لإيرادات الكشوفات والمصروفات وصندوق الدرج دون الحاجة لقيود معقدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToFullAccounting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
            >
              <FileText size={15} /> التحويل للنظام المحاسبي المعمق (للمحاسبين والمستشفيات)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Date Bar & Daily Overview Cards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-teal-600" />
            <span className="text-xs font-bold text-slate-700">التاريخ المعاين:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
            {selectedDate !== getTodayISO() && (
              <button
                onClick={() => setSelectedDate(getTodayISO())}
                className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
              >
                (العودة لليوم)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalType('receipt');
                setCategory('كشوفات وزيارات عيادة');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              <Plus size={15} /> + تسجيل إيراد جديد
            </button>

            <button
              onClick={() => {
                setModalType('payment');
                setCategory('مستلزمات وأدوات طبية');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-500/20 cursor-pointer"
            >
              <Minus size={15} /> - تسجيل مصروف عيادة
            </button>
          </div>
        </div>

        {/* 3. Three Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 block mb-1">إجمالي المقبوضات والإيرادات</span>
              <span className="text-2xl font-black text-emerald-900">{totalDayIncome.toLocaleString()} EGP</span>
              <span className="text-[11px] text-emerald-700 block mt-1">
                منها {totalVisitRevenue.toLocaleString()} EGP كشوفات عيادة
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-800 block mb-1">إجمالي المصروفات والمسحوبات</span>
              <span className="text-2xl font-black text-rose-900">{totalDayExpenses.toLocaleString()} EGP</span>
              <span className="text-[11px] text-rose-700 block mt-1">
                {todayVouchers.filter(v => v.type === 'payment').length} عمليات صرف
              </span>
            </div>
            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-rose-600/20">
              <TrendingDown size={24} />
            </div>
          </div>

          <div className="bg-teal-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-teal-950/20 border border-teal-800">
            <div>
              <span className="text-xs font-bold text-teal-200 block mb-1">صافي سيولة درج العيادة (الربح)</span>
              <span className="text-2xl font-black text-white">{netDayCash.toLocaleString()} EGP</span>
              <span className="text-[11px] text-teal-300 block mt-1">
                حالة الخزينة: {netDayCash >= 0 ? 'ربح صافي ✓' : 'عجز بسيط ⚠️'}
              </span>
            </div>
            <div className="w-12 h-12 bg-teal-500/30 text-teal-300 rounded-2xl flex items-center justify-center font-bold border border-teal-400/30">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">سجل حركة الدرج والخزينة لليوم ({displayTransactions.length})</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('receipt')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === 'receipt' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                إيرادات
              </button>
              <button
                onClick={() => setFilterType('payment')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === 'payment' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                مصروفات
              </button>
            </div>

            {allowPrinting && (
              <button
                onClick={() => {
                  printReport({
                    title: `تقرير حركة خزينة العيادة اليومية (${selectedDate})`,
                    subtitle: currentClinicName,
                    facilityName: currentClinicName,
                    columns: [
                      { key: 'voucherNumber', label: 'رقم السند' },
                      { key: 'type', label: 'النوع' },
                      { key: 'beneficiary', label: 'البيان / الجهة' },
                      { key: 'amount', label: 'المبلغ EGP' },
                      { key: 'notes', label: 'الملاحظات' }
                    ],
                    data: displayTransactions.map(t => ({
                      ...t,
                      type: t.type === 'receipt' ? 'إيراد (+)' : 'مصروف (-)'
                    }))
                  });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Printer size={14} /> طباعة
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="p-3.5">رقم الحركة</th>
                <th className="p-3.5">نوع العملية</th>
                <th className="p-3.5">المبلغ</th>
                <th className="p-3.5">المستفيد / البيان</th>
                <th className="p-3.5">التفاصيل الشارحة</th>
                <th className="p-3.5 text-center">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    لا توجد عمليات مسجلة في هذا اليوم. يمكنك استخدام أزرار إضافة إيراد أو مصروف أعلاه.
                  </td>
                </tr>
              ) : (
                displayTransactions.map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-500">{v.voucherNumber}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        v.type === 'receipt' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {v.type === 'receipt' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                        {v.type === 'receipt' ? 'إيراد / قبض' : 'مصروف / صرف'}
                      </span>
                    </td>
                    <td className={`p-3.5 font-bold text-sm ${v.type === 'receipt' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {v.type === 'receipt' ? '+' : '-'}{Number(v.amount).toLocaleString()} EGP
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{v.beneficiary || 'غير محدد'}</td>
                    <td className="p-3.5 text-slate-600">{v.notes || '-'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold">
                        نقداً (كاش)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD TRANSACTION MODAL FOR DOCTOR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <DollarSign size={18} className={modalType === 'receipt' ? 'text-emerald-600' : 'text-rose-600'} />
                {modalType === 'receipt' ? 'تسجيل إيراد / تحصيل للعيادة' : 'تسجيل مصروف / سحب من الدرج'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (EGP)</label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف / البند</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white"
                >
                  {(modalType === 'receipt' ? receiptCategories : paymentCategories).map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشخص / الجهة / البيان</label>
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder={modalType === 'receipt' ? 'اسم المريض أو الجهة...' : 'اسم المحل أو الفني أو الجهة...'}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تفاصيل التكلفة..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveTransaction}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md ${
                  modalType === 'receipt' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                حفظ العملية ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
