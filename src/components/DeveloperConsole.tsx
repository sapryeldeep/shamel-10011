import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Shield, HardDrive, Settings, Lock, X, Database, Activity
} from 'lucide-react';

import DatabaseArchitectureTab from './DeveloperConsole/DatabaseArchitectureTab';
import SystemModeTab from './DeveloperConsole/SystemModeTab';
import SmartBackupTab from './DeveloperConsole/SmartBackupTab';
import DiagnosticsTab from './DeveloperConsole/DiagnosticsTab';

interface DeveloperConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperConsole({ isOpen, onClose }: DeveloperConsoleProps) {
  const { logAction } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'database'|'mode'|'backup'|'diagnostics'>('database');

  if (!isOpen) return null;

  const handleUnlock = () => {
    if (password === '159632' || password === 'master123') {
      setIsUnlocked(true);
      logAction('دخول المطور', 'تم فتح لوحة المطور الخاصة بنجاح');
    } else {
      alert('كلمة المرور غير صحيحة!');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {!isUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Lock size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">لوحة المطور الخاصة (Developer Console)</h2>
            <p className="text-slate-500 mb-8 text-center max-w-md">
              هذه المنطقة مخصصة فقط للمطور الرئيسي. تحتوي على إعدادات متقدمة للتحكم في بنية قاعدة البيانات، وضع النظام، والنسخ الاحتياطي الذكي.
            </p>
            <div className="w-full max-w-sm">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                className="w-full text-center text-xl tracking-[0.5em] font-mono px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white transition-all outline-hidden mb-4"
                placeholder="••••••"
                dir="ltr"
              />
              <button
                onClick={handleUnlock}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all text-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield size={22} />
                تأكيد الدخول
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 pb-0 shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={28} className="text-indigo-400" />
                <h2 className="text-2xl font-black">إعدادات المطور المتقدمة (DevOps)</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'database' ? 'bg-white text-indigo-900' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-800'
                  }`}
                >
                  <Database size={18} className="inline-block ml-2" />
                  بنية السيرفر (Database Architecture)
                </button>
                <button
                  onClick={() => setActiveTab('mode')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'mode' ? 'bg-white text-indigo-900' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-800'
                  }`}
                >
                  <Settings size={18} className="inline-block ml-2" />
                  وضع النظام (System Mode)
                </button>
                <button
                  onClick={() => setActiveTab('backup')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'backup' ? 'bg-white text-indigo-900' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-800'
                  }`}
                >
                  <HardDrive size={18} className="inline-block ml-2" />
                  إدارة البيانات (Smart Backup)
                </button>
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'diagnostics' ? 'bg-white text-indigo-900' : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-800'
                  }`}
                >
                  <Activity size={18} className="inline-block ml-2" />
                  مراقبة الأداء (Diagnostics)
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {activeTab === 'database' && <DatabaseArchitectureTab />}
              {activeTab === 'mode' && <SystemModeTab />}
              {activeTab === 'backup' && <SmartBackupTab />}
              {activeTab === 'diagnostics' && <DiagnosticsTab />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
