import React, { useState } from 'react';
import { Clinic, User } from '../../../types';
import { Key, Save } from 'lucide-react';

interface ClinicQuickEditModalProps {
  clinic: Clinic | null;
  adminUser: User | null;
  onClose: () => void;
  onSave: (updatedData: {
    name: string;
    docName: string;
    username: string;
    pass: string;
    expiryDate: string;
    status: 'active' | 'suspended';
    allowWhatsApp: boolean;
    allowPrinting: boolean;
    allowChatbot: boolean;
    geminiApiKey: string;
  }) => void;
}

export default function ClinicQuickEditModal({ clinic, adminUser, onClose, onSave }: ClinicQuickEditModalProps) {
  if (!clinic) return null;

  const [quickName, setQuickName] = useState(clinic.name);
  const [quickDocName, setQuickDocName] = useState(clinic.docName || '');
  const [quickUsername, setQuickUsername] = useState(adminUser?.username || clinic.ownerUsername || '');
  const [quickPass, setQuickPass] = useState(adminUser?.pass || clinic.ownerPass || '');
  const [quickExpiry, setQuickExpiry] = useState(clinic.expiryDate || '');
  const [quickStatus, setQuickStatus] = useState<'active' | 'suspended'>(clinic.status || 'active');
  const [quickAllowWhatsApp, setQuickAllowWhatsApp] = useState(clinic.allowWhatsApp !== false);
  const [quickAllowPrinting, setQuickAllowPrinting] = useState(clinic.allowPrinting !== false);
  const [quickAllowChatbot, setQuickAllowChatbot] = useState(clinic.allowChatbot !== false);
  const [quickGeminiApiKey, setQuickGeminiApiKey] = useState(clinic.geminiApiKey || '');

  const handleSave = () => {
    if (!quickName.trim() || !quickUsername.trim() || !quickPass.trim()) {
      return alert('يرجى كتابة اسم المنشأة واسم المستخدم وكلمة المرور');
    }
    onSave({
      name: quickName.trim(),
      docName: quickDocName.trim(),
      username: quickUsername.trim(),
      pass: quickPass.trim(),
      expiryDate: quickExpiry || clinic.expiryDate,
      status: quickStatus,
      allowWhatsApp: quickAllowWhatsApp,
      allowPrinting: quickAllowPrinting,
      allowChatbot: quickAllowChatbot,
      geminiApiKey: quickGeminiApiKey.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Key size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">تعديل بيانات الحساب والسر السريع</h4>
              <p className="text-xs text-slate-500">منشأة: <span className="font-bold text-slate-700">{clinic.name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنشأة الطبية</label>
            <input 
              type="text"
              value={quickName}
              onChange={e => setQuickName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطبيب / المدير المسؤول</label>
            <input 
              type="text"
              value={quickDocName}
              onChange={e => setQuickDocName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">اسم المستخدم (User)</label>
              <input 
                type="text"
                value={quickUsername}
                onChange={e => setQuickUsername(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">كلمة المرور الجديدة (Pass)</label>
              <input 
                type="text"
                value={quickPass}
                onChange={e => setQuickPass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ انتهاء الترخيص</label>
              <input 
                type="date"
                value={quickExpiry}
                onChange={e => setQuickExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة الاشتراك</label>
              <select 
                value={quickStatus}
                onChange={e => setQuickStatus(e.target.value as 'active' | 'suspended')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="active">نشط وساري</option>
                <option value="suspended">موقوف مؤقتاً</option>
              </select>
            </div>
          </div>

          {/* Quick Permission Toggles */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">مفتاح الذكاء الاصطناعي (Gemini API Key)</label>
            <input 
              type="text"
              value={quickGeminiApiKey}
              onChange={e => setQuickGeminiApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              dir="ltr"
              placeholder="AI API Key (اتركه فارغاً لإيقاف البوت لهذه المنشأة)"
            />
          </div>

          <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 space-y-2">
            <span className="block text-[11px] font-bold text-purple-900">🛡️ صلاحيات المطور العام لهذه المنشأة:</span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold bg-white p-2 rounded-lg border border-purple-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickAllowWhatsApp}
                  onChange={e => setQuickAllowWhatsApp(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
                <span>📱 واتساب</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold bg-white p-2 rounded-lg border border-purple-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickAllowPrinting}
                  onChange={e => setQuickAllowPrinting(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
                <span>🩻 طباعة</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold bg-white p-2 rounded-lg border border-purple-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickAllowChatbot}
                  onChange={e => setQuickAllowChatbot(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
                <span>🤖 شات بوت</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save size={16} /> حفظ البيانات والتمرير
          </button>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
