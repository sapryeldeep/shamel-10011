import React from 'react';
import { Building2, Stethoscope, Building, Sparkles, Clock, Users } from 'lucide-react';
import { Clinic, User } from '../../../types';

interface ClinicMetricsBannerProps {
  clinics: Clinic[];
  users: User[];
}

export default function ClinicMetricsBanner({ clinics, users }: ClinicMetricsBannerProps) {
  const totalClinicsCount = clinics.length;
  const clinicsCount = clinics.filter(c => c.systemType === 'clinic' || !c.systemType).length;
  const hospitalsCount = clinics.filter(c => c.systemType === 'hospital').length;
  const activeCount = clinics.filter(c => new Date(c.expiryDate).getTime() >= new Date().setHours(0,0,0,0)).length;
  const expiredCount = clinics.filter(c => new Date(c.expiryDate).getTime() < new Date().setHours(0,0,0,0)).length;
  const totalUsersCount = users.filter(u => u.role !== 'master_admin').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Clinics */}
      <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Building2 size={22} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-blue-700">إجمالي المنشآت</span>
          <span className="text-xl font-black text-blue-900">{totalClinicsCount}</span>
        </div>
      </div>

      {/* Clinics Count */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Stethoscope size={22} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-indigo-700">العيادات المنشأة</span>
          <span className="text-xl font-black text-indigo-900">{clinicsCount}</span>
        </div>
      </div>

      {/* Hospitals Count */}
      <div className="bg-purple-50/80 border border-purple-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <div className="w-11 h-11 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Building size={22} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-purple-700">المستشفيات والمراكز</span>
          <span className="text-xl font-black text-purple-900">{hospitalsCount}</span>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <div className="w-11 h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles size={22} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-emerald-700">اشتراكات سارية</span>
          <span className="text-xl font-black text-emerald-900">{activeCount}</span>
        </div>
      </div>

      {/* Expired Subscriptions */}
      <div className="bg-rose-50/80 border border-rose-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <div className="w-11 h-11 bg-rose-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Clock size={22} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-rose-700">اشتراكات منتهية</span>
          <span className="text-xl font-black text-rose-900">{expiredCount}</span>
        </div>
      </div>

      {/* Total Users/Staff */}
      <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <div className="w-11 h-11 bg-amber-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Users size={22} />
        </div>
        <div>
          <span className="block text-[11px] font-bold text-amber-700">إجمالي الكوادر</span>
          <span className="text-xl font-black text-amber-900">{totalUsersCount}</span>
        </div>
      </div>
    </div>
  );
}
