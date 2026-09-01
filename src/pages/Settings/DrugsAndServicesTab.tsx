import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Pill, Tag, Trash2 } from 'lucide-react';

export default function DrugsAndServicesTab() {
  const { state, updateState, currentUser } = useAppContext();
  const clinicIdStr = String(currentUser?.clinicId || 'master');

  // Drugs
  const [drugName, setDrugName] = useState('');
  const [drugDose, setDrugDose] = useState('');

  // Services
  const [servName, setServName] = useState('');
  const [servPrice, setServPrice] = useState<number | ''>('');

  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const currency = currentClinic?.currency || 'EGP';

  const addDrug = () => {
    if (!drugName.trim()) return;
    updateState({
      drugs: [...state.drugs, { name: drugName.trim(), dose: drugDose.trim(), clinicId: clinicIdStr }]
    });
    setDrugName('');
    setDrugDose('');
  };

  const removeDrug = (item: any) => {
    updateState({
      drugs: state.drugs.filter(d => !(d.name === item.name && d.clinicId === item.clinicId))
    });
  };

  const addService = () => {
    if (!servName.trim() || servPrice === '') return;
    updateState({
      services: [...state.services, { name: servName.trim(), price: Number(servPrice), clinicId: clinicIdStr }]
    });
    setServName('');
    setServPrice('');
  };

  const removeService = (item: any) => {
    updateState({
      services: state.services.filter(s => !(s.name === item.name && s.clinicId === item.clinicId))
    });
  };

  const filteredDrugs = state.drugs.filter(
    d => currentUser?.clinicId === 'master' || d.clinicId === String(currentUser?.clinicId) || !d.clinicId
  );

  const filteredServices = state.services.filter(
    s => currentUser?.clinicId === 'master' || s.clinicId === String(currentUser?.clinicId) || !s.clinicId
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Drugs Settings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h6 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
          <Pill size={18} /> إدارة دليل الأدوية
        </h6>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input 
            type="text" 
            placeholder="اسم الدواء"
            value={drugName} 
            onChange={e => setDrugName(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <input 
            type="text" 
            placeholder="الجرعة (مثال: قرص كل 8 ساعات)"
            value={drugDose} 
            onChange={e => setDrugDose(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <button 
          onClick={addDrug}
          className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 font-bold py-2 rounded-lg text-sm transition-colors mb-4 cursor-pointer"
        >
          إضافة دواء
        </button>
        
        <div className="border border-slate-200 rounded-lg overflow-hidden custom-scrollbar max-h-80 overflow-y-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold">الدواء</th>
                <th className="px-4 py-3 font-semibold">الجرعة</th>
                <th className="px-4 py-3 font-semibold text-center w-16">حذف</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrugs.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-6 text-slate-400">لا توجد أدوية مسجلة</td></tr>
              ) : filteredDrugs.map((d, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                  <td className="px-4 py-2 font-bold text-slate-800 flex items-center gap-2">
                    {d.name}
                    {!d.clinicId && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">عام</span>}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">{d.dose}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeDrug(d)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Settings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h6 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
          <Tag size={18} /> الفحوصات والخدمات
        </h6>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="col-span-2">
            <input 
              type="text" 
              placeholder="اسم الخدمة / الفحص"
              value={servName} 
              onChange={e => setServName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <input 
              type="number" 
              placeholder="السعر" 
              min="0"
              value={servPrice} 
              onChange={e => setServPrice(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
        <button 
          onClick={addService}
          className="w-full bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100 font-bold py-2 rounded-lg text-sm transition-colors mb-4 cursor-pointer"
        >
          إضافة خدمة
        </button>
        
        <div className="border border-slate-200 rounded-lg overflow-hidden custom-scrollbar max-h-80 overflow-y-auto">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold">الخدمة</th>
                <th className="px-4 py-3 font-semibold">السعر ({currency})</th>
                <th className="px-4 py-3 font-semibold text-center w-16">حذف</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-6 text-slate-400">لا توجد خدمات مسجلة</td></tr>
              ) : filteredServices.map((s, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                  <td className="px-4 py-2 font-bold text-slate-800 flex items-center gap-2">
                    {s.name}
                    {!s.clinicId && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">عام</span>}
                  </td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">{s.price}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeService(s)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer">
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
