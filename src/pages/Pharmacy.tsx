import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Pill, Box, AlertTriangle, Search, Plus, Trash2 } from 'lucide-react';
import { InventoryItem } from '../types';

export default function Pharmacy() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts'>('inventory');
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'drug' | 'supply'>('drug');
  const [qty, setQty] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [expiry, setExpiry] = useState('');
  const [price, setPrice] = useState<number | ''>('');

  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
  const allowPharmacyPriceEdit = isMaster || (currentClinic?.allowPharmacyPriceEdit !== false);

  const clinicInventory = (state.inventory || []).filter(i => currentUser?.clinicId === 'master' || i.clinicId === currentUser?.clinicId);

  const lowStockItems = clinicInventory.filter(i => i.quantity <= i.minStock);
  const expiringSoonItems = clinicInventory.filter(i => {
    if (!i.expiryDate) return false;
    const expiryDate = new Date(i.expiryDate);
    const today = new Date();
    const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && expiryDate >= today;
  });
  const expiredItems = clinicInventory.filter(i => {
    if (!i.expiryDate) return false;
    const expiryDate = new Date(i.expiryDate);
    const today = new Date();
    return expiryDate < today;
  });

  const allAlerts = [...lowStockItems, ...expiringSoonItems, ...expiredItems];

  const addItem = () => {
    if (!name || qty === '' || minStock === '' || price === '') return;
    
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      clinicId: currentUser?.clinicId || 'master',
      name,
      type,
      quantity: Number(qty),
      minStock: Number(minStock),
      expiryDate: expiry || undefined,
      price: Number(price)
    };

    updateState({ inventory: [...(state.inventory || []), newItem] });
    logAction(
      'إضافة للمخزون الصيدلي',
      `تم إضافة صنف جديد «${name}» (${type === 'drug' ? 'دواء' : 'مستلزمات'}) بكمية ${qty} وسعر ${price} EGP.`,
      'pharmacy',
      { operationType: 'create', targetName: name, targetId: newItem.id }
    );
    
    setName(''); setQty(''); setMinStock(''); setExpiry(''); setPrice('');
  };

  const removeItem = (id: string, itemName: string) => {
    updateState({ inventory: state.inventory.filter(i => String(i.id) !== String(id)) });
    logAction(
      'حذف من المخزون الصيدلي',
      `تم حذف الصنف «${itemName}» من مخزون الصيدلية.`,
      'pharmacy',
      { operationType: 'delete', targetId: String(id), targetName: itemName }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            المخزون والصيدلية
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            تنبيهات المخزون {allAlerts.length > 0 && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs">{allAlerts.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Item Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
            <h6 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <Plus size={20} className="text-indigo-600" /> إضافة صنف جديد
            </h6>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم الصنف (دواء / مستلزمات)</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">النوع</label>
                  <select 
                    value={type} onChange={e => setType(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="drug">دواء</option>
                    <option value="supply">مستلزمات طبية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    السعر (للبيع) {!allowPharmacyPriceEdit && <span className="text-rose-500 text-[10px]">(محجوب بقرار المطور)</span>}
                  </label>
                  <input 
                    type="number" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                    disabled={!allowPharmacyPriceEdit}
                    placeholder={!allowPharmacyPriceEdit ? 'محدد من المطور' : ''}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الكمية الحالية</label>
                  <input 
                    type="number" value={qty} onChange={e => setQty(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">حد التنبيه بالنفاذ</label>
                  <input 
                    type="number" value={minStock} onChange={e => setMinStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ الصلاحية (اختياري)</label>
                <input 
                  type="date" value={expiry} onChange={e => setExpiry(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-right"
                />
              </div>
              
              <button 
                onClick={addItem}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
              >
                إضافة للمخزون
              </button>
            </div>
          </div>

          {/* Inventory List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h6 className="font-bold text-slate-800 flex items-center gap-2">
                <Box size={18} className="text-slate-600" /> جرد المخزون والصيدلية
              </h6>
            </div>
            
            <div className="overflow-x-auto flex-1 custom-scrollbar p-4">
              <table className="w-full text-sm text-right text-slate-600">
                <thead className="text-xs font-semibold text-slate-500 bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">الصنف</th>
                    <th className="px-4 py-3">النوع</th>
                    <th className="px-4 py-3 text-center">الكمية</th>
                    <th className="px-4 py-3 text-center">السعر</th>
                    <th className="px-4 py-3 text-center">الصلاحية</th>
                    <th className="px-4 py-3 text-center w-16">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicInventory.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">لا توجد أصناف في المخزون</td></tr>
                  ) : clinicInventory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                      <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'drug' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                          {item.type === 'drug' ? 'دواء' : 'مستلزمات'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${item.quantity <= item.minStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{item.price}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500" dir="ltr">{item.expiryDate || '---'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.id, item.name)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
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
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
            <h6 className="font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle size={18} /> التنبيهات الحرجة (النواقص وانتهاء الصلاحية)
            </h6>
          </div>
          
          <div className="p-6">
            {allAlerts.length === 0 ? (
              <div className="text-center py-10 text-emerald-600 font-bold flex flex-col items-center gap-3">
                <Box size={40} className="opacity-50" />
                المخزون في حالة ممتازة، لا توجد تنبيهات!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiredItems.map(item => (
                  <div key={item.id} className="bg-white border-2 border-red-200 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-1"><AlertTriangle size={24} /></div>
                    <div>
                      <h4 className="font-bold text-red-700 text-lg">{item.name}</h4>
                      <p className="text-sm text-red-600 font-bold mt-1">منتهي الصلاحية منذ: <span dir="ltr">{item.expiryDate}</span></p>
                      <p className="text-xs text-slate-500 mt-1">يجب إعدام أو استبدال الكمية الحالية ({item.quantity}) فوراً.</p>
                    </div>
                  </div>
                ))}
                
                {expiringSoonItems.map(item => (
                  <div key={item.id} className="bg-white border-2 border-amber-200 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mt-1"><AlertTriangle size={24} /></div>
                    <div>
                      <h4 className="font-bold text-amber-700 text-lg">{item.name}</h4>
                      <p className="text-sm text-amber-600 font-bold mt-1">يقترب من انتهاء الصلاحية: <span dir="ltr">{item.expiryDate}</span></p>
                      <p className="text-xs text-slate-500 mt-1">يتبقى أقل من 30 يوماً على الانتهاء.</p>
                    </div>
                  </div>
                ))}

                {lowStockItems.map(item => (
                  <div key={item.id} className="bg-white border border-rose-200 p-4 rounded-xl flex items-start gap-4 shadow-sm">
                    <div className="bg-rose-50 p-2 rounded-lg text-rose-500 mt-1"><Box size={24} /></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                      <p className="text-sm text-rose-600 font-bold mt-1">تحذير نفاذ الكمية!</p>
                      <p className="text-xs text-slate-500 mt-1">الكمية المتبقية ({item.quantity}) أقل من الحد الأدنى ({item.minStock}).</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
