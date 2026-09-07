import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CalendarPlus, CalendarDays, Trash2, MessageCircle } from 'lucide-react';
import { Appointment } from '../types';

export default function Appointments() {
  const { state, updateState, currentUser, logAction } = useAppContext();
  
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('');

  const getClinicId = () => {
    return currentUser?.clinicId === 'master' ? 'default' : currentUser?.clinicId || 'default';
  };

  const cId = getClinicId();
  const appointments = state.appointments[cId] || [];

  const addAppointment = () => {
    if (!appName || !appDate) {
      alert("أدخل اسم المريض والتاريخ!");
      return;
    }

    const newApp: Appointment = {
      id: Date.now().toString(),
      name: appName,
      phone: appPhone,
      date: appDate,
      time: appTime
    };

    updateState({
      appointments: {
        ...state.appointments,
        [cId]: [...appointments, newApp]
      }
    });
    
    logAction(
      'حجز موعد', 
      `حجز موعد جديد للمريض «${appName}» بتاريخ ${appDate} ${appTime ? `الساعة ${appTime}` : ''}.`,
      'appointments',
      { operationType: 'create', targetName: appName }
    );

    setAppName('');
    setAppPhone('');
    setAppDate('');
    setAppTime('');
  };

  const deleteAppointment = (id: string) => {
    const appToDelete = appointments.find(a => String(a.id) === String(id));
    updateState({
      appointments: {
        ...state.appointments,
        [cId]: appointments.filter(a => String(a.id) !== String(id))
      }
    });
    logAction(
      'إلغاء موعد', 
      `تم إلغاء موعد المريض «${appToDelete?.name || id}» بتاريخ ${appToDelete?.date || ''}.`,
      'appointments',
      { operationType: 'delete', targetId: id, targetName: appToDelete?.name }
    );
  };

  const sendWhatsApp = (a: Appointment) => {
    if (!a.phone) return alert('برجاء إدخال رقم الهاتف للمريض أولاً.');
    
    const currentClinic = state.clinics.find(c => c.id === currentUser?.clinicId);
    if (currentClinic?.allowWhatsApp === false) {
      return alert('عفواً، تم إيقاف خدمة إرسال تذكيرات الواتساب لهذه المنشأة من قبل المطور العام. يرجى التواصل مع المطور لتفعيل الخدمة.');
    }

    const clinicKey = currentUser?.clinicId || 'default';
    const waSettings = state.whatsappSettingsStore?.[clinicKey] || {
      reminderTemplate: 'مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic} - {doctor} بتاريخ {date} الساعة {time}. نتمنى لكم دوام الصحة والعافية.',
      autoIncludeMap: true
    };

    if (waSettings.enableReminders === false) {
      return alert('تذكيرات الواتساب معطلة حالياً في إعدادات المنشأة. يرجى تفعيلها من صفحة الإعدادات.');
    }

    const clinicName = currentClinic ? currentClinic.name : 'العيادة';
    const doctorName = currentClinic?.docName ? `د/ ${currentClinic.docName}` : '';
    
    let message = waSettings.reminderTemplate || 'مرحباً {patient}، نذكركم بموعدكم الطبي لدى {clinic} بتاريخ {date} الساعة {time}.';
    message = message
      .replace(/{patient}/g, a.name)
      .replace(/{clinic}/g, clinicName)
      .replace(/{doctor}/g, doctorName)
      .replace(/{date}/g, a.date || '')
      .replace(/{time}/g, a.time || '');

    const cleanPhone = a.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    logAction('تذكير موعد', `تم إرسال رسالة تذكير موعد بالواتساب للمريض: ${a.name}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Add Appointment */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <h6 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <CalendarPlus size={20} className="text-blue-600" /> حجز موعد
          </h6>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم المريض</label>
              <input 
                type="text" 
                value={appName} onChange={e => setAppName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الهاتف</label>
              <input 
                type="text" 
                value={appPhone} onChange={e => setAppPhone(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">التاريخ</label>
              <input 
                type="date" 
                value={appDate} onChange={e => setAppDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الوقت</label>
              <input 
                type="time" 
                value={appTime} onChange={e => setAppTime(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button 
              onClick={addAppointment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              تأكيد الحجز
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <h6 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
            <CalendarDays size={20} className="text-blue-600" /> جدول المواعيد
          </h6>

          <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold first:rounded-tr-lg last:rounded-tl-lg">المريض</th>
                  <th className="px-4 py-3 font-semibold">الهاتف</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 font-semibold">التوقيت</th>
                  <th className="px-4 py-3 font-semibold first:rounded-tr-lg last:rounded-tl-lg">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">لا توجد مواعيد محجوزة</td>
                  </tr>
                ) : appointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{a.name}</td>
                    <td className="px-4 py-3">{a.phone || '--'}</td>
                    <td className="px-4 py-3 text-blue-600 font-bold">{a.date}</td>
                    <td className="px-4 py-3">{a.time || '--'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {a.phone && (
                          <button onClick={() => sendWhatsApp(a)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="إرسال تذكير واتساب">
                            <MessageCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteAppointment(a.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="إلغاء الموعد">
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
  );
}
