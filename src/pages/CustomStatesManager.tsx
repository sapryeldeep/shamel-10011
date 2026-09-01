import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings2, Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CLINICAL_STATES } from '../lib/constants';

export default function CustomStatesManager() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);

  const customStates = currentClinic?.customClinicalStates || DEFAULT_CLINICAL_STATES;
  
  const [newStateLabel, setNewStateLabel] = useState('');
  const [newStateColor, setNewStateColor] = useState('text-slate-600');

  const saveToClinic = (states: typeof DEFAULT_CLINICAL_STATES) => {
    const updatedClinics = state.clinics.map(c => {
      if (c.id === currentClinic?.id) {
        return { ...c, customClinicalStates: states };
      }
      return c;
    });
    updateState({ clinics: updatedClinics });
    logAction('تحديث إعدادات الأقسام', 'تحديث الحالات السريرية للمنشأة');
  };

  const addState = () => {
    if (!newStateLabel.trim()) return;
    const newId = 'custom_' + Date.now();
    const newList = [...customStates, { id: newId, label: newStateLabel.trim(), color: newStateColor }];
    saveToClinic(newList);
    setNewStateLabel('');
  };

  const removeState = (id: string) => {
    const newList = customStates.filter(s => s.id !== id);
    saveToClinic(newList);
  };

  if (currentUser?.clinicId === 'master' && currentUser?.role !== 'master_admin') return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
        <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
          <Settings2 size={24} />
        </div>
        <div>
          <h6 className="font-extrabold text-slate-800 text-base">إعدادات الأقسام والتصنيفات (ديناميكية)</h6>
          <p className="text-xs text-slate-500 mt-1 font-medium">تخصيص الحالات السريرية وقوائم المرضى حسب تخصص العيادة</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4">قائمة الحالات السريرية (Clinical States)</h3>
        
        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <input 
            type="text" 
            placeholder="اسم الحالة (مثال: متابعة حمل، حرجة، غسيل كلى...)" 
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
            value={newStateLabel}
            onChange={(e) => setNewStateLabel(e.target.value)}
          />
          <select 
            value={newStateColor}
            onChange={(e) => setNewStateColor(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="text-slate-600">رمادي (افتراضي)</option>
            <option value="text-emerald-600">أخضر (مستقر/إيجابي)</option>
            <option value="text-blue-600">أزرق (متابعة عادية)</option>
            <option value="text-amber-600">أصفر (تحت الملاحظة)</option>
            <option value="text-orange-600">برتقالي (تحذير)</option>
            <option value="text-red-600">أحمر (حرج/خطير)</option>
            <option value="text-purple-600">بنفسجي (خاص)</option>
          </select>
          <button 
            onClick={addState}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> إضافة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {customStates.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={s.color} />
                <span className={`font-bold text-sm ${s.color}`}>{s.label}</span>
              </div>
              <button 
                onClick={() => removeState(s.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
