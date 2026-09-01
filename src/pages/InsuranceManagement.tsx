import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Plus, Trash2, FileCheck, Building, CreditCard } from 'lucide-react';
import { getFormattedDateTime } from '../lib/utils';
import { InsuranceClaim } from '../types';

export default function InsuranceManagement() {
  const { state, updateState, currentUser } = useAppContext();
  const getClinicId = () => currentUser?.clinicId || 'master';
  const cId = getClinicId();

  const [patientName, setPatientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [copayRate, setCopayRate] = useState<number>(20);
  const [claimAmount, setClaimAmount] = useState<number>(0);

  const claimsList: InsuranceClaim[] = state.insuranceStore?.[cId] || [];

  const addClaim = () => {
    if (!patientName.trim() || !companyName.trim() || claimAmount <= 0) {
      return alert('يرجى كتابة اسم المريض واسم شركة التأمين والمبلغ الإجمالي');
    }

    const patientShare = (claimAmount * copayRate) / 100;
    const companyShare = claimAmount - patientShare;

    const newClaim: InsuranceClaim = {
      id: Date.now().toString(),
      clinicId: cId,
      patient: patientName,
      company: companyName,
      cardNo: cardNo || 'غير محدد',
      copay: copayRate,
      amount: claimAmount,
      companyShare,
      status: 'معلقة للمراجعة',
      date: getFormattedDateTime()
    };

    const updated = [...claimsList, newClaim];
    updateState({ insuranceStore: { ...state.insuranceStore, [cId]: updated } });
    setPatientName('');
    setCardNo('');
    setClaimAmount(0);
    alert('تم تسجيل المطالبة التأمينية بنجاح!');
  };

  const removeClaim = (id: string | number) => {
    const updated = claimsList.filter(c => String(c.id) !== String(id));
    updateState({ insuranceStore: { ...state.insuranceStore, [cId]: updated } });
  };

  const toggleClaimStatus = (id: string | number) => {
    const updated = claimsList.map(c => {
      if (String(c.id) === String(id)) {
        const nextStatus = c.status === 'معلقة للمراجعة' ? 'معتمدة ومقبولة' : c.status === 'معتمدة ومقبولة' ? 'تم تحصيل المستحقات' : 'معلقة للمراجعة';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    updateState({ insuranceStore: { ...state.insuranceStore, [cId]: updated } });
  };

  let totalClaims = 0;
  let totalCompanyDue = 0;
  claimsList.forEach(c => {
    totalClaims += Number(c.amount) || 0;
    totalCompanyDue += Number(c.companyShare) || 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">إجمالي المطالبات المسجلة</span>
            <h4 className="text-xl font-bold text-slate-800">{totalClaims} EGP</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">مستحقات على شركات التأمين</span>
            <h4 className="text-xl font-bold text-emerald-600">{totalCompanyDue} EGP</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">عدد الحالات التأمينية</span>
            <h4 className="text-xl font-bold text-indigo-600">{claimsList.length} مطالبة</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h6 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
            <CreditCard size={20} className="text-blue-600" /> تسجيل مطالبة تأمينية جديدة
          </h6>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="اسم المريض..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">شركة التأمين / جهة الـ TPA</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="مثال: بوبا، أليانز، ميدنت، مصر للتأمين..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">رقم الكارت الطبي</label>
                <input
                  type="text"
                  value={cardNo}
                  onChange={e => setCardNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="رقم البوليصة"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">تحمل المريض (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={copayRate}
                  onChange={e => setCopayRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-blue-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">إجمالي تكلفة الخدمة (EGP)</label>
              <input
                type="number"
                min="0"
                value={claimAmount}
                onChange={e => setClaimAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                placeholder="0"
              />
            </div>
            
            {claimAmount > 0 && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>حصة المريض النقدي ({copayRate}%):</span>
                  <strong className="text-slate-800">{((claimAmount * copayRate)/100).toFixed(1)} EGP</strong>
                </div>
                <div className="flex justify-between font-bold text-blue-700">
                  <span>المطالبة على شركة التأمين:</span>
                  <strong>{(claimAmount - (claimAmount * copayRate)/100).toFixed(1)} EGP</strong>
                </div>
              </div>
            )}

            <button
              onClick={addClaim}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> حفظ المطالبة
            </button>
          </div>
        </div>

        {/* Claims Table Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h6 className="font-bold text-slate-800 mb-4 text-base">سجل مطالبات شركات التأمين الصحي</h6>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">المريض والشركة</th>
                  <th className="px-4 py-3">رقم الكارت</th>
                  <th className="px-4 py-3">التحمل (%)</th>
                  <th className="px-4 py-3">المبلغ على التأمين</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {claimsList.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-slate-400">لا توجد مطالبات تأمينية مسجلة</td></tr>
                ) : claimsList.map((c, idx) => (
                  <tr key={c.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      <div>{c.patient}</div>
                      <small className="text-blue-600 font-medium">{c.company}</small>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{c.cardNo}</td>
                    <td className="px-4 py-3 font-medium">{c.copay}%</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{c.companyShare} EGP</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleClaimStatus(c.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                          c.status === 'معتمدة ومقبولة' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          c.status === 'تم تحصيل المستحقات' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                        title="انقر لتغيير الحالة"
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => removeClaim(c.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
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
    </div>
  );
}
