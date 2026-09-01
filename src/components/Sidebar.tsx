import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, Users, CalendarCheck, FileText, Settings, LogOut, 
  Building2, Stethoscope, Bed, Wallet, ShieldCheck, Tv, Landmark, History,
  UserCheck, BookOpen, Rocket, Server, Activity, Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { currentUser, logout, state } = useAppContext();
  const location = useLocation();

  if (!currentUser) return null;

  const isMaster = currentUser.role === 'master_admin' || currentUser.role === 'developer';
  const clinic = state.clinics.find(c => c.id === currentUser.clinicId);
  const isHospital = isMaster || clinic?.systemType === 'hospital';
  const perms = currentUser.perms || [];

  const searchParams = new URLSearchParams(location.search);
  const activeTabParam = searchParams.get('tab') || 'dashboard';

  const hasPerm = (perm: string) => isMaster || currentUser.role === 'doctor' || perms.includes(perm);
  const hasModule = (mod: string) => {
    if (isMaster) return true;
    if (!clinic) return true;
    if (!clinic.modules) return true;
    return clinic.modules.includes(mod);
  };

  const userHasAccountingPerm = isMaster || currentUser.role === 'doctor' || perms.includes('accounting');
  const allowAccounting = (isMaster || (clinic?.allowAccounting !== false)) && userHasAccountingPerm;
  const allowAuditLogs = isMaster || (clinic?.allowAuditLogs !== false);
  const allowOperations = (isMaster || (clinic?.allowOperationsModule !== false)) && hasModule('operations');
  const allowPharmacy = (isMaster || (clinic?.allowPharmacyModule !== false)) && hasPerm('pharmacy') && hasModule('pharmacy');
  const allowInsurance = (isMaster || (clinic?.allowInsuranceModule !== false)) && hasModule('insurance');
  const allowStaffPayroll = (isMaster || (clinic?.allowStaffPayrollModule !== false)) && hasModule('staff-payroll');
  const allowClinicalReports = (isMaster || (clinic?.allowClinicalReportsModule !== false)) && currentUser.role === 'doctor' && hasModule('reports');
  const allowQueueScreen = (isMaster || (clinic?.allowQueueScreen !== false));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 right-0 z-50 h-screen w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 transition-transform duration-300 lg:translate-x-0 overflow-y-auto custom-scrollbar print:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b border-slate-100 text-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md mx-auto mb-2">
            <span className="font-bold text-xl">{isMaster ? '👑' : '🏥'}</span>
          </div>
          <h6 className="font-bold text-sm mb-1 text-slate-800">
            {isMaster ? 'لوحة المطور المركزي' : (clinic?.name || 'المنشأة الطبية')}
          </h6>
          <span className="text-xs text-slate-500 font-medium">
            {isMaster ? 'Master Developer' : currentUser.role === 'doctor' ? 'طبيب ممارس' : 'طاقم العمل'}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {/* ================= MASTER DEVELOPER NAVIGATION ================= */}
          {isMaster ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-black text-indigo-700 bg-indigo-50/80 rounded-lg mb-2 flex items-center justify-between border border-indigo-100">
                <span>مركزي المطور (Control Panel)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="متصلنشط" />
              </div>

              <NavLink 
                to="/master?tab=dashboard" 
                onClick={() => setIsOpen(false)} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  (location.pathname === '/' || location.pathname === '/master') && activeTabParam === 'dashboard'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <LayoutDashboard size={17} /> 1. الرئيسية والإحصائيات
              </NavLink>

              <NavLink 
                to="/master?tab=tenants_permissions" 
                onClick={() => setIsOpen(false)} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  location.pathname === '/master' && activeTabParam === 'tenants_permissions'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Building2 size={17} /> 2. المراكز والتراخيص والصلاحيات
              </NavLink>

              <NavLink 
                to="/master?tab=accounts_preview" 
                onClick={() => setIsOpen(false)} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  location.pathname === '/master' && activeTabParam === 'accounts_preview'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <BookOpen size={17} /> 3. معاينة نماذج الحسابات
              </NavLink>

              <NavLink 
                to="/master?tab=system_updates" 
                onClick={() => setIsOpen(false)} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  location.pathname === '/master' && activeTabParam === 'system_updates'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Rocket size={17} /> 4. مركز التحديثات والإصدارات
              </NavLink>

              <NavLink 
                to="/master?tab=system_cloud" 
                onClick={() => setIsOpen(false)} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  location.pathname === '/master' && activeTabParam === 'system_cloud'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Server size={17} /> 5. الربط السحابي والنسخ الاحتياطي
              </NavLink>

              <NavLink 
                to="/master?tab=maintenance_health" 
                onClick={() => setIsOpen(false)} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  location.pathname === '/master' && activeTabParam === 'maintenance_health'
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Activity size={17} /> 6. وضع الصيانة وصحة السيرفر
              </NavLink>
            </div>
          ) : (
            /* ================= REGULAR CLINIC / HOSPITAL STAFF NAVIGATION ================= */
            <>
              {hasPerm('queue') && hasModule('queue') && (
                <NavLink to="/" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <LayoutDashboard size={18} /> طابور الانتظار
                </NavLink>
              )}

              {allowQueueScreen && !isMaster && (
                <NavLink to="/queue-screen" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-indigo-600 hover:bg-indigo-50",
                  isActive ? "bg-indigo-50 font-bold" : ""
                )}>
                  <Tv size={18} className="text-indigo-600" /> شاشة الانتظار (TV)
                </NavLink>
              )}

              {hasPerm('patients') && hasModule('patients') && (
                <NavLink to="/patients" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <Users size={18} /> ملفات المرضى
                </NavLink>
              )}

              {hasPerm('appointments') && hasModule('appointments') && (
                <NavLink to="/appointments" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <CalendarCheck size={18} /> المواعيد
                </NavLink>
              )}

              {hasPerm('rx') && hasModule('prescription') && (
                <NavLink to="/prescription" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <FileText size={18} /> الروشتة
                </NavLink>
              )}

              {allowOperations && (
                <NavLink to="/operations" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-rose-50 text-rose-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <Bed size={18} /> أقسام المستشفى (ER/OR)
                </NavLink>
              )}

              {allowAccounting && (
                <NavLink to="/accounting" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <Landmark size={18} className="text-blue-600" /> الحسابات وشجرة الحسابات
                </NavLink>
              )}

              {allowStaffPayroll && (
                <NavLink to="/staff-payroll" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <Wallet size={18} /> الكوادر والرواتب
                </NavLink>
              )}

              {allowInsurance && (
                <NavLink to="/insurance" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <ShieldCheck size={18} /> التأمين الصحي
                </NavLink>
              )}

              {allowClinicalReports && (
                <NavLink to="/reports" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <Stethoscope size={18} /> التقارير السريرية
                </NavLink>
              )}

              {allowPharmacy && (
                <NavLink to="/pharmacy" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg> المخزون والصيدلية
                </NavLink>
              )}

              {allowAuditLogs && (
                <NavLink to="/audit-logs" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <History size={18} className="text-slate-600" /> سجل النشاطات (Audit)
                </NavLink>
              )}

              {currentUser.role === 'doctor' && hasModule('settings') && (
                <NavLink to="/settings" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                )}>
                  <Settings size={18} /> الإعدادات
                </NavLink>
              )}

              {(currentUser.role === 'doctor' || isMaster) && (
                <NavLink to="/staff-permissions" onClick={() => setIsOpen(false)} className={({isActive}) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all text-teal-700 hover:bg-teal-50",
                  isActive ? "bg-teal-50 text-teal-800 font-bold border-r-4 border-teal-600" : ""
                )}>
                  <UserCheck size={18} className="text-teal-600 animate-pulse" /> صلاحيات الموظفين
                </NavLink>
              )}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-all text-right cursor-pointer"
          >
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
