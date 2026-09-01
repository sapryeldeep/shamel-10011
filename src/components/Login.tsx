import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserCircle2 } from 'lucide-react';
import PatientPortal from './PatientPortal';

export default function Login() {
  const { login, state } = useAppContext();
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<'staff' | 'patient'>('staff');

  const handleLogin = () => {
    if (!username.trim() || !pass.trim()) return;
    const err = login(username, pass);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-5 font-sans" dir="rtl" style={{ fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif' }}>
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-[24px] shadow-sm p-8 text-center">
        
        <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-xl">
          <button 
            onClick={() => { setMode('staff'); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'staff' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            دخول الكادر الطبي
          </button>
          <button 
            onClick={() => { setMode('patient'); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'patient' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
          >
            بوابة المريض
          </button>
        </div>

        {mode === 'staff' ? (
          <>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md mx-auto mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-3v3h-4v-3H7v-4h3V6h4v3h3v4z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">شامل للمستشفيات والعيادات</h3>
            <p className="text-sm text-slate-500 mb-8">منصة التخطيط المؤسسي الطبي العملاق (ERP)</p>
            
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-sm mb-6 font-bold">
                {error}
              </div>
            )}

            <div className="text-right mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-1">اسم المستخدم</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <div className="text-right mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-1">كلمة المرور</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg text-sm transition-colors mb-2"
            >
              تسجيل الدخول
            </button>
          </>
        ) : (
          <PatientPortal onBack={() => setMode('staff')} />
        )}
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center leading-relaxed">
          Developed by <strong className="text-slate-500">Sapry El-Deeb</strong><br/>
          Tel: 01065826742 | Email: sapry.eldeep@gmail.com
        </div>
      </div>
    </div>
  );
}
