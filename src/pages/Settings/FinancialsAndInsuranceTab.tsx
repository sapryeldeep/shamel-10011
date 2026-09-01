import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Receipt, Building, Trash2 } from 'lucide-react';

export default function FinancialsAndInsuranceTab() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const isMaster = currentUser?.clinicId === 'master';

  // Financials
  const [taxId, setTaxId] = useState(currentClinic?.taxId || '');
  const [currency, setCurrency] = useState(currentClinic?.currency || 'EGP');
  const [vatRate, setVatRate] = useState<number | ''>(currentClinic?.vatRate || 0);

  // Insurances
  const [insName, setInsName] = useState('');
  const [insCode, setInsCode] = useState('');
  const [insDiscount, setInsDiscount] = useState<number | ''>('');
  const [insCoverage, setInsCoverage] = useState<number | ''>('');

  const saveFinancialSettings = () => {
    if (!currentClinic || isMaster) return;
    const updatedClinics = state.clinics.map(c => {
      if (c.id === currentClinic.id) {
        return { ...c, taxId, currency, vatRate: Number(vatRate) };
      }
      return c;
    });
    updateState({ clinics: updatedClinics });
    logAction('تحديث الإعدادات المالية', `تحديث العملة: ${currency} والضريبة: ${vatRate}%`);
    alert('تم حفظ الإعدادات المالية بنجاح!');
  };

  const addInsurance = () => {
    if (!insName || insCode === '' || !currentClinic) return;
    const newCompany = {
      id: Date.now().toString(),
      clinicId: currentClinic.id,
      name: insName,
      code: insCode,
      discountPercentage: Number(insDiscount) || 0,
      coveragePercentage: Number(insCoverage) || 0
    };
    updateState({ insuranceCompanies: [...(state.insuranceCompanies || []), newCompany] });
    setInsName(''); 
    setInsCode(''); 
    setInsDiscount(''); 
    setInsCoverage('');
    logAction('إضافة شركة تأمين', `تم إضافة شركة: ${insName}`);
  };

  const removeInsurance = (id: string) => {
    updateState({
      insuranceCompanies: (state.insuranceCompanies || []).filter(c => c.id !== id)
    });
    logAction('حذف شركة تأمين', `تم حذف الشركة ذات المعرف: ${id}`);
  };

  const clinicInsurances = state.insuranceCompanies?.filter(c => String(c.clinicId) === String(currentClinic?.id)) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Currency & Tax */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h6 className="font-bold text-amber-600 mb-4 flex items-center gap-2">
          <Receipt size={18} /> الإعدادات المالية والضريبية للمنشأة
        </h6>
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">العملة الافتراضية</label>
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-semibold"
            >
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="AED">درهم إماراتي (AED)</option>
              <option value="KWD">دينار كويتي (KWD)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">نسبة ضريبة القيمة المضافة (VAT %)</label>
            <input 
              type="number" 
              value={vatRate} 
              onChange={e => setVatRate(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              placeholder="مثال: 14"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">الرقم الضريبي للمنشأة (Tax ID)</label>
            <input 
              type="text" 
              value={taxId} 
              onChange={e => setTaxId(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              placeholder="رقم السجل والبطاقة الضريبية"
            />
          </div>
          <button 
            onClick={saveFinancialSettings}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2 cursor-pointer shadow-xs"
          >
            حفظ الإعدادات المالية
          </button>
        </div>
      </div>

      {/* Insurance Companies */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h6 className="font-bold text-indigo-600 mb-4 flex items-center gap-2">
          <Building size={18} /> إدارة شركات التأمين الطبي (TPA)
        </h6>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input 
            type="text" 
            placeholder="اسم الشركة (مثال: بوبا)"
            value={insName} 
            onChange={e => setInsName(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <input 
            type="text" 
            placeholder="كود الشركة"
            value={insCode} 
            onChange={e => setInsCode(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <input 
            type="number" 
            placeholder="نسبة التحمل للمريض %"
            value={insCoverage} 
            onChange={e => setInsCoverage(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            title="ما يدفعه المريض (Co-pay)"
          />
          <input 
            type="number" 
            placeholder="نسبة الخصم %"
            value={insDiscount} 
            onChange={e => setInsDiscount(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button 
          onClick={addInsurance}
          className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200/50 hover:bg-indigo-100 font-bold py-2 rounded-lg text-sm transition-colors mb-4 cursor-pointer"
        >
          إضافة شركة تأمين
        </button>

        <div className="border border-slate-200 rounded-lg overflow-hidden custom-scrollbar max-h-80 overflow-y-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-4 py-3">الشركة</th>
                <th className="px-4 py-3">تحمل المريض</th>
                <th className="px-4 py-3 text-center w-16">حذف</th>
              </tr>
            </thead>
            <tbody>
              {clinicInsurances.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-6 text-slate-400">لا توجد شركات تأمين مضافة</td></tr>
              ) : clinicInsurances.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                  <td className="px-4 py-2 font-bold text-slate-800">{c.name}</td>
                  <td className="px-4 py-2 font-bold text-indigo-600">{c.coveragePercentage}%</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeInsurance(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer">
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
  );
}
