import React from 'react';
import { Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function AuditLogManager() {
  const { state } = useAppContext();
  const logs = state.auditLogs || [];
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <h6 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
        <Activity size={20} className="text-blue-600" /> سجل النشاطات والمراقبة
      </h6>
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">التاريخ والوقت</th>
              <th className="px-4 py-3">المستخدم</th>
              <th className="px-4 py-3">المنشأة</th>
              <th className="px-4 py-3">الحدث (Action)</th>
              <th className="px-4 py-3">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-slate-400">لا توجد نشاطات مسجلة حتى الآن</td></tr>
            ) : sortedLogs.map((log) => {
              const clinicName = state.clinics.find(c => c.id === log.clinicId)?.name || 'اللوحة الرئيسية';
              return (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                  <td className="px-4 py-3 text-xs" dir="ltr">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{log.userName}</td>
                  <td className="px-4 py-3">{clinicName}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
