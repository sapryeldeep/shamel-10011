import React from 'react';
import { Clinic, User } from '../../../types';
import { Search, Trash2, Phone, EyeOff, Eye, AlertCircle, ExternalLink, FileCheck, Key, Edit3 } from 'lucide-react';

interface ClinicsTableProps {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  users: User[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterType: 'all' | 'clinic' | 'hospital' | 'active' | 'expired';
  setFilterType: (v: 'all' | 'clinic' | 'hospital' | 'active' | 'expired') => void;
  totalClinicsCount: number;
  clinicsCount: number;
  hospitalsCount: number;
  activeCount: number;
  expiredCount: number;
  visiblePasswords: Record<string, boolean>;
  togglePasswordVisibility: (id: string) => void;
  toggleClinicFeature: (c: Clinic, f: 'allowWhatsApp' | 'allowPrinting' | 'allowChatbot') => void;
  onEnterClinic: (id: string) => void;
  onOpenVoucher: (c: Clinic) => void;
  onOpenQuickEdit: (c: Clinic) => void;
  onEditClinic: (c: Clinic) => void;
  onDownloadClinicData: (id: string) => void;
  onDeleteClinic: (c: Clinic) => void;
  onOpenDeleteAllModal: () => void;
}

export default function ClinicsTable({
  clinics,
  filteredClinics,
  users,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  totalClinicsCount,
  clinicsCount,
  hospitalsCount,
  activeCount,
  expiredCount,
  visiblePasswords,
  togglePasswordVisibility,
  toggleClinicFeature,
  onEnterClinic,
  onOpenVoucher,
  onOpenQuickEdit,
  onEditClinic,
  onDownloadClinicData,
  onDeleteClinic,
  onOpenDeleteAllModal
}: ClinicsTableProps) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      {/* Search and Filters Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h6 className="font-bold text-slate-800 text-sm">
            سجل المنشآت الطبية والعملاء ({filteredClinics.length} من {clinics.length})
          </h6>
          <span className="text-xs text-slate-500">انقر على بطاقة التسليم لتصدير رسالة الواتساب أو طباعة الترخيص للعميل</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {clinics.length > 0 && (
            <button
              type="button"
              onClick={onOpenDeleteAllModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
              title="حذف وتصفير جميع المنشآت والبيانات المسجلة نهائياً"
            >
              <Trash2 size={14} /> حذف جميع المنشآت ({clinics.length})
            </button>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الطبيب، الهاتف..."
              className="pr-9 pl-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              الكل ({totalClinicsCount})
            </button>
            <button 
              onClick={() => setFilterType('clinic')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'clinic' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              عيادات ({clinicsCount})
            </button>
            <button 
              onClick={() => setFilterType('hospital')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'hospital' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              مستشفيات ({hospitalsCount})
            </button>
            <button 
              onClick={() => setFilterType('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              سارية ({activeCount})
            </button>
            <button 
              onClick={() => setFilterType('expired')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'expired' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              منتهية ({expiredCount})
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-600">
          <thead className="text-xs font-semibold text-slate-500 bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">المنشأة والنوع</th>
              <th className="px-4 py-3.5">المسؤول والهاتف</th>
              <th className="px-4 py-3.5">حساب المدير (Admin Login)</th>
              <th className="px-4 py-3.5 text-center">تحكم المطور المباشر (Master Controls)</th>
              <th className="px-4 py-3.5">الصلاحية والترخيص</th>
              <th className="px-4 py-3.5 text-center">إجراءات المطور</th>
            </tr>
          </thead>
          <tbody>
            {filteredClinics.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  {searchQuery ? 'لا توجد منشآت مطابقة لبحثك' : 'لم تقم بإنشاء أي منشآت أو عيادات بعد. استخدم النموذج أعلاه لإنشاء أول منشأة وتوليد حسابها!'}
                </td>
              </tr>
            ) : filteredClinics.map(c => {
              const cIdStr = String(c.id);
              const adminUser = users.find(u => String(u.clinicId) === cIdStr && (u.username === c.ownerUsername || u.role === 'doctor'));
              const staffCount = users.filter(u => String(u.clinicId) === cIdStr && u.role === 'staff').length;
              const isPassVisible = visiblePasswords[cIdStr];
              const isExpired = new Date(c.expiryDate).getTime() < new Date().setHours(0,0,0,0);

              const hasWA = c.allowWhatsApp !== false;
              const hasPrint = c.allowPrinting !== false;
              const hasBot = c.allowChatbot !== false;

              return (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors last:border-0">
                  <td className="px-4 py-3.5">
                    <strong className="block text-slate-800 text-base">{c.name}</strong>
                    <span className="text-xs font-semibold text-blue-600">
                      {c.systemType === 'hospital' ? 'مستشفى / مركز طبي' : 'عيادة خاصة'}
                      {c.specialty ? ` - ${c.specialty}` : ''}
                    </span>
                    {c.contractPrice ? (
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                        قيمة التعاقد: {c.contractPrice} EGP
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-700">{c.docName || '--'}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5" dir="ltr">
                      <Phone size={12} /> {c.phone || '--'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg inline-block text-xs font-mono">
                      <div className="text-blue-700 font-bold">User: {adminUser?.username || c.ownerUsername || '--'}</div>
                      <div className="text-slate-600 flex items-center gap-2 mt-0.5">
                        <span>Pass: {isPassVisible ? (adminUser?.pass || c.ownerPass || '--') : '••••••••'}</span>
                        <button onClick={() => togglePasswordVisibility(cIdStr)} className="text-slate-400 hover:text-slate-700 cursor-pointer" title="إظهار / إخفاء">
                          {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </td>
                  
                  {/* Master Direct Controls Cell */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        onClick={() => toggleClinicFeature(c, 'allowWhatsApp')}
                        className={`w-full max-w-[140px] px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all flex items-center justify-between gap-1 cursor-pointer ${
                          hasWA ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                        title="تغيير صلاحية تذكير الواتساب بضغطة واحدة"
                      >
                        <span>📱 الواتساب</span>
                        <span>{hasWA ? 'مفعل ✓' : 'معطل ✕'}</span>
                      </button>

                      <button
                        onClick={() => toggleClinicFeature(c, 'allowPrinting')}
                        className={`w-full max-w-[140px] px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all flex items-center justify-between gap-1 cursor-pointer ${
                          hasPrint ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                        title="تغيير صلاحية الطباعة والتحميل بضغطة واحدة"
                      >
                        <span>🩻 الطباعة</span>
                        <span>{hasPrint ? 'مفعل ✓' : 'معطل ✕'}</span>
                      </button>

                      <button
                        onClick={() => toggleClinicFeature(c, 'allowChatbot')}
                        className={`w-full max-w-[140px] px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all flex items-center justify-between gap-1 cursor-pointer ${
                          hasBot ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                        title="تغيير صلاحية شات بوت الذكاء الاصطناعي بضغطة واحدة"
                      >
                        <span>🤖 شات بوت AI</span>
                        <span>{hasBot ? 'مفعل ✓' : 'معطل ✕'}</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-xs" dir="ltr">{c.expiryDate}</div>
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md mt-1">
                        <AlertCircle size={10} /> اشتراك منتهي
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                        نشط وساري ✓
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <button 
                        onClick={() => onEnterClinic(c.id)} 
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title="دخول لنظام هذه المنشأة والتحكم الفوري بمرضاها وأقسامها"
                      >
                        <ExternalLink size={14} />
                        <span>دخول للنظام 🚀</span>
                      </button>
                      <button 
                        onClick={() => onOpenVoucher(c)} 
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="عرض بطاقة تسليم الحساب والترخيص"
                      >
                        <FileCheck size={14} /> التسليم
                      </button>
                      <button 
                        onClick={() => onOpenQuickEdit(c)} 
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition-colors cursor-pointer" 
                        title="تعديل سريع لاسم المستخدم وكلمة السر"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => onEditClinic(c)} 
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
                        title="تعديل كافة بيانات المنشأة والترخيص"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDownloadClinicData(c.id)} 
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer" 
                        title="تحميل نسخة احتياطية لبيانات المنشأة (ملف منفصل)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                      <button 
                        onClick={() => onDeleteClinic(c)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                        title="حذف المنشأة نهائياً"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
