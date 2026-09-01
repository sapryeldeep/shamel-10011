import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Activity, Users, FileText, Receipt, Search, Filter } from 'lucide-react';

export default function TenantMonitor() {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate stats for each clinic
  const tenantStats = state.clinics.map(clinic => {
    // 1. Users/Staff
    const staffCount = state.users.filter(u => u.clinicId === clinic.id).length;
    
    // 2. Patients/Visits (from queue/archive and patient history)
    let patientCount = 0;
    if (state.queue && state.queue[clinic.id]) patientCount += state.queue[clinic.id].length;
    if (state.archive && state.archive[clinic.id]) patientCount += state.archive[clinic.id].length;
    
    // 3. Invoices
    const invoicesCount = state.invoices?.filter(inv => inv.clinicId === clinic.id).length || 0;
    
    // 4. Prescriptions
    const rxCount = state.rxStore?.[clinic.id]?.length || 0;

    return {
      ...clinic,
      staffCount,
      patientCount,
      invoicesCount,
      rxCount,
      totalActivity: staffCount + patientCount + invoicesCount + rxCount
    };
  });

  // Sort by activity and filter
  const filteredTenants = tenantStats
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.includes(searchTerm))
    .sort((a, b) => b.totalActivity - a.totalActivity);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h6 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <Activity size={24} className="text-indigo-600" />
            مراقبة الاستهلاك والنشاط (Tenant Usage Monitor)
          </h6>
          <p className="text-xs font-bold text-slate-500 mt-1">مراقبة استهلاك الموارد وحجم العمليات لكل منشأة مشتركة في النظام</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث باسم المنشأة أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-3 py-1.5 border border-slate-200 rounded-lg">
            <Filter size={16} />
            ترتيب حسب: الأنشط أولاً
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold">
              <tr>
                <th className="p-4">المنشأة (العيادة/المركز)</th>
                <th className="p-4 text-center">عدد المستخدمين</th>
                <th className="p-4 text-center">المرضى والزيارات</th>
                <th className="p-4 text-center">الروشتات المكتوبة</th>
                <th className="p-4 text-center">الفواتير المُصدرة</th>
                <th className="p-4 text-center">مؤشر النشاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 text-sm">{tenant.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">كود: {tenant.id.slice(0, 8)}...</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                      <Users size={14} /> {tenant.staffCount}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <Activity size={14} /> {tenant.patientCount}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
                      <FileText size={14} /> {tenant.rxCount}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold">
                      <Receipt size={14} /> {tenant.invoicesCount}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {tenant.totalActivity > 50 ? (
                      <span className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        نشط جداً ({tenant.totalActivity})
                      </span>
                    ) : tenant.totalActivity > 10 ? (
                      <span className="text-blue-600 font-bold text-xs flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        نشط ({tenant.totalActivity})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-xs flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        خامل ({tenant.totalActivity})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold text-sm">
                    لا توجد منشآت مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
