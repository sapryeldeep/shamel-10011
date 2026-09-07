import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Wallet, Plus, Trash2, Printer, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { getFormattedDateTime } from '../lib/utils';
import { StaffMember, PayrollTransaction } from '../types';

export default function PayrollAndStaff() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  const getClinicId = () => currentUser?.clinicId || 'master';
  const cId = getClinicId();

  // Staff Directory form state
  const [staffName, setStaffName] = useState('');
  const [staffCat, setStaffCat] = useState('طبيب استشاري / أخصائي');
  const [staffDep, setStaffDep] = useState('الاستقبال والعيادات');
  const [staffSalary, setStaffSalary] = useState<number>(6000);
  const [staffPhone, setStaffPhone] = useState('');

  // Payroll transaction form state
  const [selectedStaffIdx, setSelectedStaffIdx] = useState<string>('');
  const [transType, setTransType] = useState<'bonus' | 'advance' | 'deduction'>('bonus');
  const [transAmount, setTransAmount] = useState<number>(0);
  const [transNote, setTransNote] = useState('');

  const staffList: StaffMember[] = state.staffDirectory?.[cId] || [];
  const payrollTrans: PayrollTransaction[] = state.payrollStore?.[cId] || [];

  const addStaff = () => {
    if (!staffName.trim()) return alert('يرجى كتابة اسم الموظف أو الكادر الطبي');
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      clinicId: cId,
      name: staffName,
      cat: staffCat,
      dep: staffDep || 'عام',
      salary: Number(staffSalary) || 0,
      phone: staffPhone || '--'
    };
    const updated = [...staffList, newStaff];
    updateState({ staffDirectory: { ...state.staffDirectory, [cId]: updated } });
    logAction(
      'إضافة موظف/كادر',
      `تم تسجيل موظف جديد «${staffName}» بوظيفة «${staffCat}» وراتب أساسي ${staffSalary} EGP.`,
      'staff',
      { operationType: 'create', targetName: staffName, targetId: newStaff.id }
    );
    setStaffName(''); setStaffPhone('');
    alert('تمت إضافة العضو لدليل الكوادر بنجاح!');
  };

  const removeStaff = (id: string | number) => {
    const staffToDelete = staffList.find(s => String(s.id) === String(id));
    const updated = staffList.filter(s => String(s.id) !== String(id));
    updateState({ staffDirectory: { ...state.staffDirectory, [cId]: updated } });
    logAction(
      'حذف موظف/كادر',
      `تم حذف الموظف «${staffToDelete?.name || id}» من دليل الكوادر.`,
      'staff',
      { operationType: 'delete', targetId: String(id), targetName: staffToDelete?.name }
    );
  };

  const addTransaction = () => {
    if (selectedStaffIdx === '' || transAmount <= 0) {
      return alert('يرجى اختيار الموظف وإدخال مبلغ صحيح');
    }
    const staff = staffList[Number(selectedStaffIdx)];
    if (!staff) return;

    const newTrans: PayrollTransaction = {
      id: Date.now().toString(),
      clinicId: cId,
      staffName: staff.name,
      transType,
      amount: Number(transAmount),
      note: transNote || (transType === 'bonus' ? 'مكافأة / حافز' : transType === 'advance' ? 'سلفة' : 'خصم'),
      date: getFormattedDateTime()
    };

    const updated = [...payrollTrans, newTrans];
    updateState({ payrollStore: { ...state.payrollStore, [cId]: updated } });
    logAction(
      'معاملة راتب',
      `تم تسجيل ${transType === 'bonus' ? 'مكافأة' : transType === 'advance' ? 'سلفة' : 'خصم'} للموظف «${staff.name}» بقيمة ${transAmount} EGP (${newTrans.note}).`,
      'staff',
      { operationType: 'process', targetName: staff.name, targetId: newTrans.id }
    );
    setTransAmount(0);
    setTransNote('');
    alert('تم تسجيل المعاملة المالية بنجاح!');
  };

  const removeTransaction = (transId: string | number) => {
    const updated = payrollTrans.filter(t => String(t.id) !== String(transId));
    updateState({ payrollStore: { ...state.payrollStore, [cId]: updated } });
  };

  const printSalarySlip = (staff: StaffMember, basic: number, bonuses: number, deductions: number, net: number) => {
    const slipWin = window.open('', '_blank');
    if (!slipWin) return;
    slipWin.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال صرف راتب ومستحقات - ${staff.name}</title>
        <style>
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 25px; color: #333; }
          .slip { border: 2px solid #16a34a; padding: 25px; max-width: 480px; margin: auto; border-radius: 14px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
          h3 { text-align: center; color: #16a34a; margin-bottom: 2px; }
          .sub { text-align: center; font-size: 13px; color: #666; margin-bottom: 15px; }
          p { margin: 8px 0; font-size: 14px; }
          .row-flex { display: flex; justify-content: space-between; border-bottom: 1px dashed #ddd; padding: 6px 0; }
          .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #666; border-top: 1px dashed #999; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="slip">
          <h3>شامل للمستشفيات والعيادات</h3>
          <div class="sub">إيصال صرف راتب ومستحقات مالية (Payroll Slip)</div>
          <hr/>
          <div class="row-flex"><span><strong>التاريخ:</strong></span><span>${getFormattedDateTime()}</span></div>
          <div class="row-flex"><span><strong>اسم الموظف:</strong></span><span>${staff.name}</span></div>
          <div class="row-flex"><span><strong>الفئة الوظيفية:</strong></span><span>${staff.cat} (${staff.dep})</span></div>
          <br/>
          <div class="row-flex"><span>الراتب الأساسي:</span><span><strong>${basic} EGP</strong></span></div>
          <div class="row-flex"><span>إجمالي المكافآت والحوافز:</span><span style="color: #16a34a;"><strong>+${bonuses} EGP</strong></span></div>
          <div class="row-flex"><span>إجمالي السلف والخصومات:</span><span style="color: #dc2626;"><strong>-${deductions} EGP</strong></span></div>
          <br/>
          <div class="row-flex" style="font-size: 16px; border-bottom: 2px solid #16a34a;">
            <span><strong>صافي الراتب المستحق:</strong></span>
            <span style="color: #2563eb;"><strong>${net} EGP</strong></span>
          </div>
          <div class="footer">
            توقيع المستلم: ........................ | توقيع الحسابات: ........................<br/>
            Developed by Sapry El-Deeb | Tel: 01065826742
          </div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    slipWin.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Staff Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h6 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
            <Users size={20} className="text-amber-600" /> إضافة كادر طبي / إداري
          </h6>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم العضو الرباعي</label>
              <input
                type="text"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="أدخل الاسم..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الفئة الوظيفية</label>
              <select
                value={staffCat}
                onChange={e => setStaffCat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="طبيب استشاري / أخصائي">طبيب استشاري / أخصائي</option>
                <option value="طبيب مقيم">طبيب مقيم</option>
                <option value="رئيس تمريض / ممرض(ة)">رئيس تمريض / ممرض(ة)</option>
                <option value="فني معمل / أشعة">فني معمل / أشعة</option>
                <option value="إداري / محاسب / استقبال">إداري / محاسب / استقبال</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">القسم / التخصص</label>
                <input
                  type="text"
                  value={staffDep}
                  onChange={e => setStaffDep(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الراتب الأساسي (EGP)</label>
                <input
                  type="number"
                  min="0"
                  value={staffSalary}
                  onChange={e => setStaffSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={staffPhone}
                onChange={e => setStaffPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="010..."
              />
            </div>
            <button
              onClick={addStaff}
              className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> حفظ في دليل الكوادر
            </button>
          </div>
        </div>

        {/* Add Transaction / Adjustment Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h6 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
            <Wallet size={20} className="text-emerald-600" /> تسجيل مكافأة / سلفة / خصم
          </h6>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اختر الموظف</label>
              <select
                value={selectedStaffIdx}
                onChange={e => setSelectedStaffIdx(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
              >
                <option value="">اختر الموظف من الدليل...</option>
                {staffList.map((s, idx) => (
                  <option key={idx} value={idx}>{s.name} ({s.cat}) - راتب: {s.salary} EGP</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">نوع المعاملة المالية</label>
              <select
                value={transType}
                onChange={e => setTransType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="bonus">مكافأة / حافز إضافي (+)</option>
                <option value="advance">سلفة مالية (-)</option>
                <option value="deduction">جزاء / خصم إداري (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">المبلغ (EGP)</label>
              <input
                type="number"
                min="0"
                value={transAmount}
                onChange={e => setTransAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">البيان / ملاحظات</label>
              <input
                type="text"
                value={transNote}
                onChange={e => setTransNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="سبب الحافز أو السلفة..."
              />
            </div>
            <button
              onClick={addTransaction}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> حفظ المعاملة المالية
            </button>
          </div>
        </div>

        {/* Staff Quick Directory Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h6 className="font-bold text-slate-800 mb-4 flex items-center justify-between text-base">
            <span>دليل العاملين الحاليين</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{staffList.length} كادر</span>
          </h6>
          <div className="flex-1 overflow-y-auto max-h-72 space-y-2">
            {staffList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">لا توجد كوادر مسجلة حالياً</div>
            ) : staffList.map((s, idx) => (
              <div key={s.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <strong className="block text-sm text-slate-800">{s.name}</strong>
                  <span className="text-xs text-slate-500">{s.cat} | {s.salary} EGP</span>
                </div>
                <button onClick={() => removeStaff(s.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Comprehensive Payroll Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h6 className="font-bold text-slate-800 mb-4 text-base flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" /> كشف حساب الرواتب وصافي المستحقات الشهرية
        </h6>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">الموظف والفئة</th>
                <th className="px-4 py-3">القسم</th>
                <th className="px-4 py-3">الراتب الأساسي</th>
                <th className="px-4 py-3">المكافآت (+)</th>
                <th className="px-4 py-3">السلف والخصومات (-)</th>
                <th className="px-4 py-3 font-bold text-blue-700">صافي المستحق</th>
                <th className="px-4 py-3 text-center">طباعة إيصال</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-slate-400">لا توجد كوادر مسجلة لحساب المرتبات</td></tr>
              ) : staffList.map((st, idx) => {
                let bonuses = 0;
                let deductions = 0;
                payrollTrans.filter(t => t.staffName === st.name).forEach(t => {
                  if (t.transType === 'bonus') bonuses += t.amount;
                  else deductions += t.amount;
                });
                const net = st.salary + bonuses - deductions;

                return (
                  <tr key={st.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      <div>{st.name}</div>
                      <small className="text-slate-400 font-normal">{st.cat}</small>
                    </td>
                    <td className="px-4 py-3">{st.dep}</td>
                    <td className="px-4 py-3">{st.salary} EGP</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">+{bonuses} EGP</td>
                    <td className="px-4 py-3 text-rose-600 font-bold">-{deductions} EGP</td>
                    <td className="px-4 py-3 font-bold text-blue-600 text-base">{net} EGP</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => printSalarySlip(st, st.salary, bonuses, deductions, net)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Printer size={14} /> إيصال صرف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
