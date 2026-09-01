import React from 'react';
import { useAppContext } from '../context/AppContext';
import DeveloperControlCenter from '../components/settings/developer/DeveloperControlCenter';
import { ShieldAlert } from 'lucide-react';

export default function MasterPanel() {
  const { currentUser } = useAppContext();

  if (!currentUser || (currentUser.role !== 'master_admin' && currentUser.role !== 'developer')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-red-200" dir="rtl">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">وصول محظور - مخصص للمطور الرئيسي فقط</h2>
        <p className="text-slate-500 text-sm max-w-md">
          هذه الشاشة محمية ببروتوكول أمان مخصص للمطور الرئيسي (Role: 'developer' / 'master_admin') لإدارة التراخيص والحسابات المالية.
        </p>
      </div>
    );
  }

  return <DeveloperControlCenter />;
}
