import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Clock, Search, ListChecks, TrendingUp, BarChart3, Building2, Stethoscope, Building, Sparkles, Users, ArrowLeft, Volume2, Trash2, Check, FileSpreadsheet, Tv, RotateCcw, AlertTriangle, Archive, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFormattedDateTime, getTodayISO } from '../lib/utils';
import { announcePatientCall } from '../lib/audioVoice';
import DoctorCallModal from '../components/DoctorCallModal';
import { PatientQueueItem } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function Dashboard() {
  const { state, updateState, currentUser, archiveAndResetQueue } = useAppContext();
  
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pService, setPService] = useState('');
  const [pTotal, setPTotal] = useState<number>(0);
  const [pPaid, setPPaid] = useState<number>(0);
  const [callingPatient, setCallingPatient] = useState<string | null>(null);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [showArchiveQueueModal, setShowArchiveQueueModal] = useState(false);

  const getClinicId = () => {
    return currentUser?.clinicId === 'master' ? 'master' : currentUser?.clinicId || 'master';
  };

  const getQueue = () => {
    const cId = getClinicId();
    if (cId === 'master') {
      return Object.values(state.queue).flat() || [];
    }
    return state.queue[cId] || [];
  };

  const queue = getQueue();

  const getChartData = () => {
    const cId = getClinicId();
    let allPatients: PatientQueueItem[] = [];

    if (cId === 'master') {
      allPatients = [
        ...(Object.values(state.queue).flat() as PatientQueueItem[]),
        ...(Object.values(state.archive).flat() as PatientQueueItem[])
      ];
    } else {
      allPatients = [
        ...((state.queue[cId] || []) as PatientQueueItem[]),
        ...((state.archive[cId] || []) as PatientQueueItem[])
      ];
    }

    const dailyDataMap: Record<string, number> = {};
    const monthlyRevMap: Record<string, number> = {};

    allPatients.forEach(p => {
      const dateStr = p.isoDate || getTodayISO();
      dailyDataMap[dateStr] = (dailyDataMap[dateStr] || 0) + 1;
      
      const monthStr = dateStr.substring(0, 7);
      monthlyRevMap[monthStr] = (monthlyRevMap[monthStr] || 0) + (Number(p.paid) || 0);
    });

    const dailyData = Object.keys(dailyDataMap).sort().slice(-7).map(date => ({
      date,
      patients: dailyDataMap[date]
    }));

    const monthlyData = Object.keys(monthlyRevMap).sort().slice(-6).map(month => ({
      month,
      revenue: monthlyRevMap[month]
    }));

    // Fill with empty data if no data yet to show the charts properly
    if (dailyData.length === 0) dailyData.push({ date: getTodayISO(), patients: 0 });
    if (monthlyData.length === 0) monthlyData.push({ month: getTodayISO().substring(0, 7), revenue: 0 });

    return { dailyData, monthlyData };
  };

  const { dailyData, monthlyData } = getChartData();

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPService(val);
    const srv = state.services.find(s => s.name === val);
    if (srv) {
      setPTotal(srv.price);
      setPPaid(srv.price);
    }
  };

  const savePatient = () => {
    if (!pName || !pPhone) {
      alert("أدخل اسم المريض والهاتف!");
      return;
    }

    const cId = getClinicId() === 'master' ? (state.clinics[0]?.id || 'default') : getClinicId();
    
    const newItem: PatientQueueItem = {
      id: Date.now().toString(),
      name: pName,
      age: pAge,
      phone: pPhone,
      service: pService || 'كشف طبي',
      total: pTotal,
      paid: pPaid,
      due: pTotal - pPaid,
      status: 'waiting',
      isoDate: getTodayISO(),
      date: getFormattedDateTime()
    };

    const currentQueue = state.queue[cId] || [];
    
    updateState({
      queue: {
        ...state.queue,
        [cId]: [...currentQueue, newItem]
      }
    });

    setPName('');
    setPAge('');
    setPPhone('');
    setPTotal(0);
    setPPaid(0);
  };

  const removeFromQueue = (id: string) => {
    const cId = getClinicId();
    let updatedQueue = { ...state.queue };
    
    if (cId === 'master') {
      Object.keys(updatedQueue).forEach(k => {
        updatedQueue[k] = updatedQueue[k].filter(item => String(item.id) !== String(id));
      });
    } else {
      updatedQueue[cId] = (updatedQueue[cId] || []).filter(item => String(item.id) !== String(id));
    }
    
    updateState({ queue: updatedQueue });
  };

  const finishExam = (id: string) => {
    const cId = getClinicId();
    let updatedQueue = { ...state.queue };
    
    if (cId === 'master') {
      Object.keys(updatedQueue).forEach(k => {
        updatedQueue[k] = updatedQueue[k].map(item => String(item.id) === String(id) ? { ...item, status: 'done' as const } : item);
      });
    } else {
      updatedQueue[cId] = (updatedQueue[cId] || []).map(item => String(item.id) === String(id) ? { ...item, status: 'done' as const } : item);
    }
    
    updateState({ queue: updatedQueue });
  };

  const callPatientByName = (patientName: string) => {
    setCallingPatient(patientName);
    announcePatientCall(patientName);
    setTimeout(() => {
      setCallingPatient(null);
    }, 4500);
  };

  const callNextPatient = () => {
    const waiting = queue.find(p => p.status === 'waiting');
    if (!waiting) {
      alert("الطابور فارغ!");
      return;
    }
    
    const cId = getClinicId();
    let updatedQueue = { ...state.queue };
    
    // Mark any 'in' as 'done'
    const markInAsDone = (list: PatientQueueItem[]) => list.map(item => 
      item.status === 'in' ? { ...item, status: 'done' as const } : item
    );

    if (cId === 'master') {
      Object.keys(updatedQueue).forEach(k => {
        updatedQueue[k] = markInAsDone(updatedQueue[k]).map(item => 
          String(item.id) === String(waiting.id) ? { ...item, status: 'in' as const } : item
        );
      });
    } else {
      updatedQueue[cId] = markInAsDone(updatedQueue[cId] || []).map(item => 
        String(item.id) === String(waiting.id) ? { ...item, status: 'in' as const } : item
      );
    }
    
    updateState({ queue: updatedQueue });
    callPatientByName(waiting.name);
  };

  const exportQueueToCSV = () => {
    if (queue.length === 0) return alert('لا يوجد بيانات للتصدير');
    const headers = ['الاسم', 'العمر', 'الهاتف', 'الخدمة', 'المطلوب', 'المدفوع', 'الوقت', 'الحالة'];
    const rows = queue.map(p => [
      p.name, p.age || '', p.phone, p.service, p.total, p.paid, p.date, 
      p.status === 'done' ? 'تم الكشف' : p.status === 'in' ? 'بالداخل' : 'انتظار'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `الطابور_اليومي_${getTodayISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isMaster = currentUser?.role === 'master_admin';
  const totalClinics = state.clinics.length;
  const clinicsCount = state.clinics.filter(c => c.systemType === 'clinic' || !c.systemType).length;
  const hospitalsCount = state.clinics.filter(c => c.systemType === 'hospital').length;
  const activeCount = state.clinics.filter(c => new Date(c.expiryDate).getTime() >= new Date().setHours(0,0,0,0)).length;
  const totalStaffCount = state.users.filter(u => u.role !== 'master_admin').length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Master Developer Quick Stats Banner */}
      {isMaster && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-white/10 pb-3">
            <div>
              <h5 className="font-bold text-lg text-white flex items-center gap-2">
                <Building2 className="text-blue-400" size={22} />
                لوحة إحصائيات المطور العام (منشآت وتراخيص المنظومة)
              </h5>
              <p className="text-xs text-slate-300 mt-0.5">
                متابعة حية لعدد العيادات والمستشفيات المنشأة والاشتراكات السارية
              </p>
            </div>
            <Link
              to="/master"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              إدارة المنشآت وتوليد الحسابات <ArrowLeft size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="block text-[11px] text-blue-200 font-semibold">إجمالي المنشآت</span>
              <span className="text-xl font-black text-white">{totalClinics}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="block text-[11px] text-indigo-200 font-semibold">العيادات المنشأة</span>
              <span className="text-xl font-black text-indigo-300">{clinicsCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="block text-[11px] text-purple-200 font-semibold">المستشفيات والمراكز</span>
              <span className="text-xl font-black text-purple-300">{hospitalsCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="block text-[11px] text-emerald-200 font-semibold">الاشتراكات السارية</span>
              <span className="text-xl font-black text-emerald-300">{activeCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="block text-[11px] text-amber-200 font-semibold">إجمالي الكوادر</span>
              <span className="text-xl font-black text-amber-300">{totalStaffCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h6 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> اتجاه أعداد المرضى (آخر 7 أيام)
          </h6>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Line type="monotone" name="المرضى" dataKey="patients" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h6 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-600" /> توزيع الإيرادات (آخر 6 أشهر)
          </h6>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Bar dataKey="revenue" name="الإيرادات" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
      
      {/* Add to Queue Panel */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <h6 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" /> تسجيل مريض بطابور اليوم
          </h6>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
              <input 
                type="text" 
                value={pName} onChange={e => setPName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">العمر</label>
                <input 
                  type="number" min="0"
                  value={pAge} onChange={e => setPAge(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الهاتف</label>
                <input 
                  type="text" 
                  value={pPhone} onChange={e => setPPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">نوع الكشف / الخدمة</label>
              <select 
                value={pService} onChange={handleServiceChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">اختر الخدمة أو الكشف...</option>
                {state.services.filter(s => getClinicId() === 'master' || s.clinicId === getClinicId() || !s.clinicId).map(s => (
                  <option key={s.name} value={s.name}>{s.name} ({s.price} EGP)</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">المطلوب</label>
                <input 
                  type="number" min="0"
                  value={pTotal} onChange={e => setPTotal(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">المدفوع</label>
                <input 
                  type="number" min="0"
                  value={pPaid} onChange={e => setPPaid(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button 
              onClick={savePatient}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              إضافة لطابور اليوم
            </button>
          </div>
        </div>
      </div>

      {/* Queue List Panel */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          {/* Active Voice Calling Toast Banner */}
          {callingPatient && (
            <div className="mb-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Volume2 className="animate-bounce" size={24} />
                <div>
                  <div className="font-bold text-sm">جاري النداء الصوتي باللغة العربية...</div>
                  <div className="text-xs text-emerald-100 font-semibold">المريض: {callingPatient} (تفضل بالدخول إلى غرفة الكشف)</div>
                </div>
              </div>
              <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full font-bold">نداء حي 🔊</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h6 className="font-bold text-slate-800 m-0 flex items-center gap-2 text-lg">
              <Clock size={20} className="text-blue-600" /> طابور الانتظار اليومي
            </h6>
            <div className="flex gap-2 flex-wrap items-center">
              <Link
                to="/queue-screen"
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                title="فتح شاشة الانتظار للتلفزيونات والشاشات الحائطية"
              >
                <Tv size={14} />
                <span>شاشة التلفزيون (TV)</span>
              </Link>

              <button
                type="button"
                onClick={() => setDoctorModalOpen(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="نداء صوتي على طبيب أو كادر طبي في المستشفى"
              >
                <Stethoscope size={14} className="text-amber-700" />
                <span>نداء طبيب 📢</span>
              </button>

              <button onClick={exportQueueToCSV} className="px-3 py-1.5 border border-slate-200 text-slate-600 bg-white font-bold rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                <FileSpreadsheet size={14} className="text-slate-500" />
                تصدير Excel
              </button>

              <button
                type="button"
                onClick={() => setShowArchiveQueueModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                title="تصفير طابور اليوم ونقل الحالات للأرشيف الدائم بالتاريخ والوقت"
              >
                <RotateCcw size={14} className="text-rose-600" />
                <span>تصفير وأرشفة اليوم 📥</span>
              </button>

              <button onClick={callNextPatient} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs sm:text-sm hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                <Volume2 size={16} />
                نداء المريض التالي
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold first:rounded-tr-lg last:rounded-tl-lg">#</th>
                  <th className="px-4 py-3 font-semibold">الاسم</th>
                  <th className="px-4 py-3 font-semibold">الخدمة</th>
                  <th className="px-4 py-3 font-semibold">الوقت</th>
                  <th className="px-4 py-3 font-semibold">المطلوب</th>
                  <th className="px-4 py-3 font-semibold">المدفوع</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold first:rounded-tr-lg last:rounded-tl-lg">الإجراءات والنداء</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">لا يوجد مرضى في طابور الانتظار حالياً</td>
                  </tr>
                ) : queue.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                    <td className="px-4 py-3">{p.service}</td>
                    <td className="px-4 py-3 text-blue-600">{p.date || '--'}</td>
                    <td className="px-4 py-3">{p.total}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{p.paid}</td>
                    <td className="px-4 py-3">
                      {p.status === 'waiting' && <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-200/50">في الانتظار</span>}
                      {p.status === 'in' && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-200/50">داخل العيادة</span>}
                      {p.status === 'done' && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200/50">تم الكشف</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end items-center">
                        {/* Arabic Voice Call Button */}
                        <button
                          onClick={() => callPatientByName(p.name)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          title={`نداء صوتي باسم: ${p.name}`}
                        >
                          <Volume2 size={13} className="text-emerald-600" />
                          <span>نداء</span>
                        </button>
                        
                        {p.status !== 'done' && (
                          <button
                            onClick={() => finishExam(p.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="إنهاء الكشف"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => removeFromQueue(p.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف من الطابور"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <DoctorCallModal
      isOpen={doctorModalOpen}
      onClose={() => setDoctorModalOpen(false)}
    />

    {/* Confirmation Modal for Archiving and Resetting Queue */}
    {showArchiveQueueModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h5 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Archive size={20} className="text-blue-600" /> تصفير ونقل طابور اليوم للأرشيف
            </h5>
            <button
              type="button"
              onClick={() => setShowArchiveQueueModal(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-blue-900">
              <RotateCcw size={18} className="text-blue-600 shrink-0" />
              <span>تأكيد تصفير وأرشفة الطابور اليومي</span>
            </div>
            <p className="leading-relaxed">
              أنت على وشك تصفير طابور الانتظار الحالي لجميع الحالات المسجلة (<strong className="text-blue-900 font-extrabold">{queue.length} مريض</strong>) ونقل كافة البيانات إلى <strong>الأرشيف النهائي</strong> مع الاحتفاظ بالتواريخ والأوقات الدقيقة لجميع التخصصات.
            </p>
            <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-[11px] text-slate-600 font-bold space-y-1">
              <p>✓ سيتم تفريغ طابور اليوم لبدء استقبال حالات جديدة.</p>
              <p>✓ يمكن الرجوع لجميع السجلات المؤرشفة في أي وقت من شاشة المرضى والتقارير.</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                archiveAndResetQueue(getClinicId());
                setShowArchiveQueueModal(false);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Archive size={16} /> تأكيد التصفير والأرشفة الآن
            </button>
            <button
              type="button"
              onClick={() => setShowArchiveQueueModal(false)}
              className="px-4 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
