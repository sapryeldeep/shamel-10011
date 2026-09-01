import React, { useState } from 'react';
import { MessageCircle, Phone, X, ExternalLink } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customPhone, setCustomPhone] = useState('');
  const [customMsg, setCustomMsg] = useState('مرحباً، أود الاستفسار بخصوص النظام الطبي الشامل.');

  const devPhone = '201065826742';

  const sendToDev = () => {
    const url = `https://wa.me/${devPhone}?text=${encodeURIComponent('مرحباً م. صبري الديب، أود الدعم الفني أو الاستفسار بخصوص منصة شامل للمستشفيات والعيادات.')}`;
    window.open(url, '_blank');
  };

  const sendToPatient = () => {
    if (!customPhone.trim()) return alert('يرجى كتابة رقم هاتف المريض');
    let formatted = customPhone.trim().replace(/\D/g, '');
    if (formatted.startsWith('01')) formatted = '2' + formatted;
    const url = `https://wa.me/${formatted}?text=${encodeURIComponent(customMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 print:hidden font-sans" dir="rtl">
      {isOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 mb-3 w-80 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <h6 className="font-bold text-xs text-slate-800">خدمة عملاء وواتساب</h6>
                <small className="text-slate-400 text-[10px]">تواصل فوري ومباشر</small>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 pt-3">
            {/* Direct Support with Developer */}
            <div className="bg-emerald-50/70 border border-emerald-200/50 p-2.5 rounded-xl">
              <div className="text-[11px] font-bold text-emerald-800 mb-1">دعم فني وتطوير النظام:</div>
              <div className="text-xs text-slate-600 mb-2">م. صبري الديب - 01065826742</div>
              <button
                onClick={sendToDev}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={14} /> محادثة المطور عبر واتساب
              </button>
            </div>

            {/* Quick Patient WhatsApp sender */}
            <div className="border-t border-slate-100 pt-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">إرسال رسالة سريعة لمريض:</span>
              <input
                type="text"
                placeholder="رقم الهاتف (010...)"
                value={customPhone}
                onChange={e => setCustomPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <textarea
                placeholder="نص الرسالة..."
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-16"
              />
              <button
                onClick={sendToPatient}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={14} /> إرسال عبر WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        title="تواصل عبر WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
