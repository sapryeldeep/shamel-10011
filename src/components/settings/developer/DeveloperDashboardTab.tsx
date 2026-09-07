import React, { useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Wallet, Clock, Users, Building2, 
  Activity, CheckCircle2, AlertTriangle, ArrowUpRight, Bed, 
  Stethoscope, CalendarCheck, ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Clinic, User } from '../../../types';
import { AppState } from '../../../context/defaults';

interface DeveloperDashboardTabProps {
  state: AppState;
  onNavigateToTenants: () => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DeveloperDashboardTab({ state, onNavigateToTenants }: DeveloperDashboardTabProps) {
  const clinics = state.clinics || [];
  const users = state.users || [];

  // Financial Computations
  const financialStats = useMemo(() => {
    let designSalesTotal = 0;
    let branchSalesTotal = 0;
    let totalCashCollected = 0;
    let totalPendingReceivables = 0;
    let totalMaxBranches = 0;

    clinics.forEach(c => {
      const design = Number(c.designPrice || c.contractPrice || 0);
      const maxBranches = Number(c.maxBranches || 1);
      const branchPrice = Number(c.branchLicensePrice || 0);
      const branchTotal = maxBranches * branchPrice;
      const totalContract = design + branchTotal;
      const paid = Number(c.paidAmount || 0);
      const remaining = Math.max(0, totalContract - paid);

      designSalesTotal += design;
      branchSalesTotal += branchTotal;
      totalCashCollected += paid;
      totalPendingReceivables += remaining;
      totalMaxBranches += maxBranches;
    });

    const grandTotalSales = designSalesTotal + branchSalesTotal;
    const collectionRate = grandTotalSales > 0 ? Math.round((totalCashCollected / grandTotalSales) * 100) : 100;

    return {
      designSalesTotal,
      branchSalesTotal,
      grandTotalSales,
      totalCashCollected,
      totalPendingReceivables,
      totalMaxBranches,
      collectionRate
    };
  }, [clinics]);

  // Operational Computations
  const operationalStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    let activeCount = 0;
    let suspendedCount = 0;
    let expiredCount = 0;

    clinics.forEach(c => {
      if (c.status === 'suspended') {
        suspendedCount++;
      } else {
        const exp = new Date(c.expiryDate).setHours(0, 0, 0, 0);
        if (exp < today) {
          expiredCount++;
        } else {
          activeCount++;
        }
      }
    });

    // Total Patients / Queue / Bookings count across all clinics
    let totalPatientsInQueue = 0;
    let totalArchivePatients = 0;
    let totalAppointments = 0;

    Object.values(state.queue || {}).forEach(arr => {
      totalPatientsInQueue += arr.length;
    });
    Object.values(state.archive || {}).forEach(arr => {
      totalArchivePatients += arr.length;
    });
    Object.values(state.appointments || {}).forEach(arr => {
      totalAppointments += arr.length;
    });

    const totalVisits = totalPatientsInQueue + totalArchivePatients;
    const totalStaffMembers = users.filter(u => u.role !== 'master_admin').length;

    return {
      activeCount,
      suspendedCount,
      expiredCount,
      totalVisits,
      totalPatientsInQueue,
      totalAppointments,
      totalStaffMembers
    };
  }, [clinics, users, state]);

  // Chart Data: Centers Financial Comparison (Top 6 or all)
  const barChartData = useMemo(() => {
    return clinics.map(c => {
      const design = Number(c.designPrice || c.contractPrice || 0);
      const maxBranches = Number(c.maxBranches || 1);
      const branchPrice = Number(c.branchLicensePrice || 0);
      const totalContract = design + (maxBranches * branchPrice);
      const paid = Number(c.paidAmount || 0);
      const remaining = Math.max(0, totalContract - paid);

      return {
        name: c.name.length > 14 ? c.name.substring(0, 14) + '...' : c.name,
        fullName: c.name,
        'إجمالي المستحق': totalContract,
        'المحصل كاش': paid,
        'المتبقي الآجل': remaining
      };
    });
  }, [clinics]);

  // Pie Chart Data: Status Breakdown
  const pieChartData = useMemo(() => {
    return [
      { name: 'نشطة سارية', value: operationalStats.activeCount, color: '#10b981' },
      { name: 'منتهية الصلاحية', value: operationalStats.expiredCount, color: '#f59e0b' },
      { name: 'موقوفة / مجمدة', value: operationalStats.suspendedCount, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [operationalStats]);

  return (
    <div className="space-y-8">
      {/* 1. Financial KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={20} />
            المؤشرات المالية لمبيعات المنظومة (Financial Overview)
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            نسبة التحصيل الإجمالية: <strong className="text-emerald-600 font-mono">{financialStats.collectionRate}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Design Sales */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-700">إجمالي مبيعات التصميم</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-900 font-mono">
              {financialStats.designSalesTotal.toLocaleString()} <span className="text-xs font-bold text-blue-700">ج.م</span>
            </div>
            <p className="text-[11px] text-blue-600/80 font-medium mt-1">
              قيمة برمجيات وتصميم المنظومة الأساسية
            </p>
          </div>

          {/* Branch Licensing Sales */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-700">إجمالي تراخيص الفروع</span>
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Building2 size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-900 font-mono">
              {financialStats.branchSalesTotal.toLocaleString()} <span className="text-xs font-bold text-purple-700">ج.م</span>
            </div>
            <p className="text-[11px] text-purple-600/80 font-medium mt-1">
              إجمالي {financialStats.totalMaxBranches} فروع مرخصة للمراكز
            </p>
          </div>

          {/* Cash Collected */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-700">المحصل الفعلي (كاش)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Wallet size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-900 font-mono">
              {financialStats.totalCashCollected.toLocaleString()} <span className="text-xs font-bold text-emerald-700">ج.م</span>
            </div>
            <p className="text-[11px] text-emerald-600/80 font-medium mt-1">
              المبالغ المقبوضة فعلياً بحوزة المطور
            </p>
          </div>

          {/* Pending Receivables */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-700">المستحقات الآجلة المتبقية</span>
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-900 font-mono">
              {financialStats.totalPendingReceivables.toLocaleString()} <span className="text-xs font-bold text-rose-700">ج.م</span>
            </div>
            <p className="text-[11px] text-rose-600/80 font-medium mt-1">
              ديون ومتبقيات واجبة التحصيل لدى المراكز
            </p>
          </div>
        </div>
      </div>

      {/* 2. Operational KPIs */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="text-indigo-600" size={20} />
          المؤشرات التشغيلية للمنظومة (Operational Health)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">المراكز النشطة</span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {operationalStats.activeCount} <span className="text-xs font-normal text-slate-400">/ {clinics.length}</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">إجمالي الفروع</span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {financialStats.totalMaxBranches} <span className="text-xs font-normal text-slate-400">فرع مرخص</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">الكوادر والموظفين</span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {operationalStats.totalStaffMembers} <span className="text-xs font-normal text-slate-400">مستخدم</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CalendarCheck size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">المرضى والزيارات</span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {operationalStats.totalVisits.toLocaleString()} <span className="text-xs font-normal text-slate-400">سجل</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Revenues & Dues Comparison */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              مقارنة الإيرادات والمحصل والمستحق حسب المركز (ج.م)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">بيانات حية ومحدثة</span>
          </div>

          {barChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Building2 size={36} className="mb-2 text-slate-300" />
              لا توجد بيانات مراكز كافية للرسم البياني
            </div>
          ) : (
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', textAlign: 'right' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="إجمالي المستحق" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="المحصل كاش" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="المتبقي الآجل" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={18} className="text-purple-600" />
              توزيع حالة المراكز السحابية
            </h3>
          </div>

          {pieChartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Building2 size={36} className="mb-2 text-slate-300" />
              لا توجد مراكز مسجلة
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center" dir="ltr">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="w-full space-y-2 mt-2" dir="rtl">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{item.value} مراكز</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Branch & Center Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building2 className="text-blue-600" size={18} />
              جدول أداء ومعدلات الفروع المباشر (Tenant Financials & Usage)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة مباشرة للإيرادات، الحجوزات، المتبقيات المالية، وحالة تراخيص كل مركز
            </p>
          </div>

          <button
            onClick={onNavigateToTenants}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>إدارة المراكز والصلاحيات</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5">المنشأة والفرع</th>
                <th className="p-3.5">نوع النظام</th>
                <th className="p-3.5">المسؤول / المشرف</th>
                <th className="p-3.5 text-center">المرضى / الحجوزات</th>
                <th className="p-3.5">إجمالي التعاقد</th>
                <th className="p-3.5">المحصل كاش</th>
                <th className="p-3.5">المتبقي الآجل</th>
                <th className="p-3.5">نسبة السداد</th>
                <th className="p-3.5 text-center">حالة الاشتراك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    لا توجد أي منشآت مسجلة بالنظام حالياً. انقر على تبويب "المراكز والتراخيص" لإضافة منشأة جديدة.
                  </td>
                </tr>
              ) : (
                clinics.map(c => {
                  const design = Number(c.designPrice || c.contractPrice || 0);
                  const maxBranches = Number(c.maxBranches || 1);
                  const branchPrice = Number(c.branchLicensePrice || 0);
                  const totalContract = design + (maxBranches * branchPrice);
                  const paid = Number(c.paidAmount || 0);
                  const remaining = Math.max(0, totalContract - paid);
                  const payRate = totalContract > 0 ? Math.min(100, Math.round((paid / totalContract) * 100)) : 100;

                  const queueCount = (state.queue?.[c.id] || []).length;
                  const archiveCount = (state.archive?.[c.id] || []).length;
                  const apptCount = (state.appointments?.[c.id] || []).length;
                  const totalPatients = queueCount + archiveCount;

                  const isSuspended = c.status === 'suspended';
                  const isExpired = new Date(c.expiryDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{c.phone || 'بدون هاتف'}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          c.systemType === 'hospital' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          c.systemType === 'center' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {c.systemType === 'hospital' ? 'مستشفى' : c.systemType === 'center' ? 'مركز تخصصي' : 'عيادة خاصة'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-700">{c.docName || c.name}</div>
                        <span className="text-[10px] text-indigo-600 font-mono font-bold">@{c.ownerUsername || 'admin'}</span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-mono font-bold text-slate-700">
                          {totalPatients} زيارة
                        </span>
                      </td>

                      <td className="p-3.5 font-bold font-mono text-slate-800">
                        {totalContract.toLocaleString()} ج.م
                      </td>

                      <td className="p-3.5 font-bold font-mono text-emerald-600">
                        {paid.toLocaleString()} ج.م
                      </td>

                      <td className="p-3.5 font-bold font-mono">
                        {remaining > 0 ? (
                          <span className="text-rose-600">{remaining.toLocaleString()} ج.م</span>
                        ) : (
                          <span className="text-emerald-600">0 (خالص)</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-slate-600">{payRate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                payRate >= 100 ? 'bg-emerald-500' : payRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${payRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        {isSuspended ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-lg text-[10px]">موقوف</span>
                        ) : isExpired ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px]">منتهي</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px]">نشط ساري</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
