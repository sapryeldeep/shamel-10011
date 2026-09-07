import React, { useState } from 'react';
import { LayoutGrid, AlertTriangle , Plus, Edit3, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';


export default function DepartmentsManager() {
  const { state, updateState, logAction } = useAppContext();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [deleteDeptTarget, setDeleteDeptTarget] = useState<any | null>(null);

  const addDepartment = () => {
    if (!name.trim() || !clinicId) return alert('يرجى تحديد المنشأة واسم القسم');
    const newDept = {
      id: Date.now().toString(),
      name,
      description: desc,
      clinicId
    };
    updateState({ departments: [...(state.departments || []), newDept] });
    logAction('إضافة قسم طبي', `تم إضافة قسم: ${name}`);
    setName(''); setDesc('');
  };

  const confirmRemoveDept = (id: string) => {
    updateState({ departments: state.departments.filter(d => String(d.id) !== String(id)) });
    logAction('حذف قسم طبي', `تم حذف القسم ذو المعرف: ${id}`);
    setDeleteDeptTarget(null);
  };

  return (
    <div>
      <h6 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
        <LayoutGrid size={20} className="text-blue-600" /> إدارة الأقسام الطبية
      </h6>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
        <h6 className="font-bold text-sm text-slate-700 mb-4">إضافة قسم جديد</h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">المنشأة (المستشفى/العيادة)</label>
            <select value={clinicId} onChange={e => setClinicId(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors">
              <option value="">اختر المنشأة...</option>
              {state.clinics.map((c, i) => <option key={c.id || `clinic-${i}`} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">اسم القسم</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors" placeholder="قسم العظام..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">وصف القسم (اختياري)</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
        </div>
        <button onClick={addDepartment} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2">
          <Plus size={16} /> إضافة القسم
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">اسم القسم</th>
              <th className="px-4 py-3">الوصف</th>
              <th className="px-4 py-3">تابع لمنشأة</th>
              <th className="px-4 py-3 text-center w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(!state.departments || state.departments.length === 0) ? (
              <tr><td colSpan={4} className="text-center py-6 text-slate-400">لا توجد أقسام مسجلة</td></tr>
            ) : state.departments.map(d => {
              const c = state.clinics.find(cl => String(cl.id) === String(d.clinicId));
              return (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                <td className="px-4 py-3 font-bold text-slate-800">{d.name}</td>
                <td className="px-4 py-3">{d.description || '--'}</td>
                <td className="px-4 py-3">{c?.name || 'مجهول'}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => setDeleteDeptTarget(d)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="حذف">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {deleteDeptTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h5 className="font-bold text-slate-800 text-base mb-2">تأكيد حذف القسم الطبي</h5>
            <p className="text-xs text-slate-500 mb-5">هل أنت متأكد من حذف قسم «{deleteDeptTarget.name}»؟</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => confirmRemoveDept(deleteDeptTarget.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs">
                حذف نهائي
              </button>
              <button onClick={() => setDeleteDeptTarget(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


