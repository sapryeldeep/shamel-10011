import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Server, Cloud, HardDrive } from 'lucide-react';

export default function DatabaseArchitectureTab() {
  const { logAction } = useAppContext();

  const [dbProvider, setDbProvider] = useState<'firebase'|'local_sql'|'remote_sql'>(
    (localStorage.getItem('shamel_db_provider') as any) || 'firebase'
  );
  const [sqlHost, setSqlHost] = useState(localStorage.getItem('shamel_sql_host') || '');
  const [sqlPort, setSqlPort] = useState(localStorage.getItem('shamel_sql_port') || '');
  const [sqlDb, setSqlDb] = useState(localStorage.getItem('shamel_sql_db') || '');
  const [sqlUser, setSqlUser] = useState(localStorage.getItem('shamel_sql_user') || '');
  const [sqlPass, setSqlPass] = useState(localStorage.getItem('shamel_sql_pass') || '');

  const handleSaveDBConfig = () => {
    localStorage.setItem('shamel_db_provider', dbProvider);
    if (dbProvider !== 'firebase') {
      localStorage.setItem('shamel_sql_host', sqlHost);
      localStorage.setItem('shamel_sql_port', sqlPort);
      localStorage.setItem('shamel_sql_db', sqlDb);
      localStorage.setItem('shamel_sql_user', sqlUser);
      localStorage.setItem('shamel_sql_pass', sqlPass);
    }
    alert('تم حفظ إعدادات خوادم البيانات بنجاح! قد تحتاج لإعادة تشغيل النظام لتطبيق التغييرات.');
    logAction('تغيير قاعدة البيانات', `تم تغيير نوع الخادم إلى: ${dbProvider}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
          <Server className="text-indigo-600" />
          اختيار محرك قواعد البيانات (DB Engine)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            onClick={() => setDbProvider('firebase')}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              dbProvider === 'firebase' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <Cloud size={28} className={dbProvider === 'firebase' ? 'text-indigo-600 mb-2' : 'text-slate-400 mb-2'} />
            <h4 className="font-bold text-slate-800">Firebase Cloud</h4>
            <p className="text-xs text-slate-500 mt-1">السحابة الافتراضية للنسخة الحالية. سريعة وتدعم Realtime والتزامن الفوري.</p>
          </div>
          <div 
            onClick={() => setDbProvider('local_sql')}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              dbProvider === 'local_sql' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <HardDrive size={28} className={dbProvider === 'local_sql' ? 'text-indigo-600 mb-2' : 'text-slate-400 mb-2'} />
            <h4 className="font-bold text-slate-800">Local SQL Server</h4>
            <p className="text-xs text-slate-500 mt-1">سيرفر محلي (Offline) داخل شبكة المستشفى (MySQL/Postgres) لخصوصية عالية.</p>
          </div>
          <div 
            onClick={() => setDbProvider('remote_sql')}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              dbProvider === 'remote_sql' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <Server size={28} className={dbProvider === 'remote_sql' ? 'text-indigo-600 mb-2' : 'text-slate-400 mb-2'} />
            <h4 className="font-bold text-slate-800">Remote SQL</h4>
            <p className="text-xs text-slate-500 mt-1">سيرفر SQL خارجي للمؤسسات والمستشفيات الضخمة المتعددة الفروع.</p>
          </div>
        </div>

        {dbProvider !== 'firebase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Host / IP</label>
              <input 
                type="text" 
                value={sqlHost} 
                onChange={e => setSqlHost(e.target.value)} 
                className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white" 
                placeholder="192.168.1.100 أو db.hospital.com"
                dir="ltr" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Port</label>
              <input 
                type="text" 
                value={sqlPort} 
                onChange={e => setSqlPort(e.target.value)} 
                className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white" 
                placeholder="3306 أو 5432"
                dir="ltr" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Database Name</label>
              <input 
                type="text" 
                value={sqlDb} 
                onChange={e => setSqlDb(e.target.value)} 
                className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white" 
                placeholder="shamel_erp"
                dir="ltr" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                value={sqlUser} 
                onChange={e => setSqlUser(e.target.value)} 
                className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white" 
                placeholder="db_user"
                dir="ltr" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={sqlPass} 
                onChange={e => setSqlPass(e.target.value)} 
                className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white" 
                placeholder="••••••••"
                dir="ltr" 
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSaveDBConfig} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            حفظ اتصال قاعدة البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
