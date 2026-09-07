import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DiagnosisProtocol } from '../../types';
import { Sparkles, Plus, Trash2, BookmarkPlus } from 'lucide-react';

export default function ProtocolsTab() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);

  const [protoDiagName, setProtoDiagName] = useState('');
  const [protoSpecialty, setProtoSpecialty] = useState('');
  const [protoDrugName, setProtoDrugName] = useState('');
  const [protoDrugDose, setProtoDrugDose] = useState('');
  const [protoDrugsList, setProtoDrugsList] = useState<{ name: string; dose: string }[]>([]);

  const addDrugToProtocolList = () => {
    if (!protoDrugName.trim()) return;
    setProtoDrugsList([
      ...protoDrugsList,
      { name: protoDrugName.trim(), dose: protoDrugDose.trim() || 'قرص يومياً' }
    ]);
    setProtoDrugName('');
    setProtoDrugDose('');
  };

  const removeDrugFromProtocolList = (idx: number) => {
    setProtoDrugsList(protoDrugsList.filter((_, i) => i !== idx));
  };

  const saveDiagnosisProtocol = () => {
    if (!protoDiagName.trim()) {
      alert('يرجى كتابة اسم التشخيص الطبي أولاً');
      return;
    }
    if (protoDrugsList.length === 0) {
      alert('يرجى إضافة دواء واحد على الأقل لهذا التشخيص');
      return;
    }
    const newProto: DiagnosisProtocol = {
      id: 'dp_' + Date.now(),
      diagnosisName: protoDiagName.trim(),
      specialty: protoSpecialty.trim() || currentClinic?.specialty || 'عام',
      drugs: protoDrugsList
    };
    updateState({
      diagnosisProtocols: [...(state.diagnosisProtocols || []), newProto]
    });
    logAction('إضافة بروتوكول تشخيص', `إضافة بروتوكول: ${protoDiagName}`);
    setProtoDiagName('');
    setProtoSpecialty('');
    setProtoDrugsList([]);
    alert(`تم حفظ بروتوكول التشخيص "${protoDiagName}" وأدويته بنجاح!`);
  };

  const deleteDiagnosisProtocol = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف بروتوكول التشخيص "${name}"؟`)) {
      updateState({
        diagnosisProtocols: (state.diagnosisProtocols || []).filter(p => p.id !== id)
      });
      logAction('حذف بروتوكول تشخيص', `حذف بروتوكول: ${name}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-indigo-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-indigo-800/80">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={18} className="text-indigo-400" />
            <span>نماذج الروشتة والأدوية التلقائية (Diagnosis Protocols)</span>
          </div>
          <h5 className="text-lg md:text-xl font-black text-white m-0">
            إدارة بروتوكولات التشخيص والأدوية والجرعات الجاهزة
          </h5>
          <p className="text-xs text-indigo-200 mt-1 m-0">
            قم بإنشاء وتخزين نماذج بروتوكولية تحتوي على اسم التشخيص الطبي وقائمة أدوية محددة بجرعاتها. يتم استخدامها بنقرة واحدة داخل صفحة الروشتة لتسريع عمل الطبيب.
          </p>
        </div>
        <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-xl text-xs font-bold shrink-0">
          {(state.diagnosisProtocols || []).length} بروتوكول مسجل
        </span>
      </div>

      {/* Protocol Creator Form */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-indigo-700/50 mb-6 space-y-4">
        <h6 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <Plus size={16} /> إضافة بروتوكول تشخيص جديد:
        </h6>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-indigo-200 mb-1">اسم التشخيص الطبي:</label>
            <input
              type="text"
              placeholder="مثال: القدم السكرية - Diabetic Foot..."
              value={protoDiagName}
              onChange={e => setProtoDiagName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-indigo-200 mb-1">التخصص الطبي التابع له:</label>
            <input
              type="text"
              placeholder="مثال: باطنة وسكر / جراحة الأوعية الدموية..."
              value={protoSpecialty}
              onChange={e => setProtoSpecialty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Protocol Drug Inputs */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 space-y-2">
          <label className="block text-[11px] font-bold text-indigo-300">إضافة أدوية لهذا البروتوكول:</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="اسم الدواء (Ciprobay 500mg)..."
              value={protoDrugName}
              onChange={e => setProtoDrugName(e.target.value)}
              className="md:col-span-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
            />
            <input
              type="text"
              placeholder="الجرعة (قرص كل 12 ساعة)..."
              value={protoDrugDose}
              onChange={e => setProtoDrugDose(e.target.value)}
              className="md:col-span-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={addDrugToProtocolList}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> ضم الدواء للبروتوكول
            </button>
          </div>

          {/* Staged Drugs List for this protocol */}
          {protoDrugsList.length > 0 && (
            <div className="mt-3 divide-y divide-slate-800 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {protoDrugsList.map((d, i) => (
                <div key={i} className="p-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-300">{i + 1}. {d.name}</span>
                    <span className="text-slate-400">({d.dose})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDrugFromProtocolList(i)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={saveDiagnosisProtocol}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 cursor-pointer"
        >
          <BookmarkPlus size={16} /> حفظ نموذج التشخيص والبروتوكول العلاجي
        </button>
      </div>

      {/* List of Saved Protocols */}
      <div className="space-y-3">
        <h6 className="text-xs font-bold text-indigo-200">البروتوكولات المسجلة حالياً في المنظومة:</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {(state.diagnosisProtocols || []).length === 0 ? (
            <div className="col-span-2 text-center py-6 text-indigo-300/60 bg-slate-900/40 rounded-xl">
              لا توجد بروتوكولات مسجلة بعد. أضف تشخيصاتك الأكثر تكراراً لتوفير الوقت!
            </div>
          ) : (state.diagnosisProtocols || []).map(p => (
            <div key={p.id} className="bg-slate-800/90 p-3.5 rounded-xl border border-indigo-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-indigo-200 flex items-center gap-1">
                    🩺 {p.diagnosisName}
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-md font-semibold">
                    {p.specialty || 'عام'}
                  </span>
                </div>
                <div className="space-y-1 my-2">
                  {p.drugs.map((d, di) => (
                    <div key={di} className="text-[11px] text-slate-300 flex items-center justify-between bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                      <span className="font-semibold text-white">• {d.name}</span>
                      <span className="text-indigo-400 font-medium">{d.dose}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 mt-1">
                <span className="text-[10px] text-slate-400">
                  {p.drugs.length} أدوية مخصصة
                </span>
                <button
                  type="button"
                  onClick={() => deleteDiagnosisProtocol(p.id, p.diagnosisName)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
