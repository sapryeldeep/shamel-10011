import React, { useState } from 'react';
import { Clinic, User } from '../../../types';
import { FileCheck, Check, Copy, Printer } from 'lucide-react';
import { getFormattedDateTime } from '../../../lib/utils';

interface ClinicVoucherModalProps {
  clinic: Clinic | null;
  adminUser: User | null;
  onClose: () => void;
}

export default function ClinicVoucherModal({ clinic, adminUser, onClose }: ClinicVoucherModalProps) {
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!clinic || !adminUser) return null;

  const copyWhatsAppMessage = () => {
    const msg = `
🏥 *بيانات تفعيل وترخيص برنامج شامل للمستشفيات والعيادات*

مرحباً دكتور / ${clinic.docName || clinic.name} 👋
تم تجهيز ونشر منصتكم الطبية المؤسسية بنجاح!

🏢 *المنشأة:* ${clinic.name}
🩺 *التخصص:* ${clinic.specialty || 'عام'}
📅 *صلاحية الاشتراك حتى:* ${clinic.expiryDate}

🔐 *بيانات تسجيل دخول المدير (Admin):*
👤 *اسم المستخدم:* ${adminUser.username}
🔑 *كلمة المرور:* ${adminUser.pass}

🌐 *رابط المنصة:*
${window.location.origin}

💡 *ملاحظة:*
يمكنكم الآن الدخول بالحساب أعلاه وإضافة موظفيكم (الاستقبال، التمريض، الأطباء، الصيدلية، المعمل) وتعيين الصلاحيات الخاصة بكل موظف من قائمة "الإعدادات والدليل الشامل".

📞 *للدعم الفني والتطوير:*
م/ صبري الديب: 01065826742
    `.trim();

    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const printVoucherSlip = () => {
    const slipWin = window.open('', '_blank');
    if (!slipWin) return;
    slipWin.document.write(`
      <html dir="rtl">
      <head>
        <title>وثيقة تسليم ترخيص المنشأة الطبية - ${clinic.name}</title>
        <style>
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
          .voucher { border: 2px solid #2563eb; padding: 30px; max-width: 600px; margin: auto; border-radius: 16px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #1d4ed8; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .cred-box { background: #f0fdf4; border: 1.5px dashed #16a34a; border-radius: 12px; padding: 15px; margin: 20px 0; }
          .row-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .row-item:last-child { border-bottom: none; }
          .highlight { font-weight: bold; color: #0f172a; font-family: monospace; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .seal { display: inline-block; border: 2px solid #2563eb; color: #2563eb; font-weight: bold; padding: 4px 15px; border-radius: 8px; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="voucher">
          <div class="header">
            <h2 class="title">منظومة شامل للمستشفيات والعيادات (ERP)</h2>
            <div class="subtitle">وثيقة اعتماد وتسليم ترخيص النظام وحساب الإدارة الرئيسي</div>
            <div class="seal">ترخيص تشغيل معتمد ✓</div>
          </div>

          <div class="row-item"><span>اسم المنشأة الطبية:</span><strong>${clinic.name}</strong></div>
          <div class="row-item"><span>نوع المنشأة والتخصص:</span><span>${clinic.systemType === 'hospital' ? 'مستشفى' : 'عيادة / مركز'} - ${clinic.specialty || 'عام'}</span></div>
          <div class="row-item"><span>الطبيب / المدير المسؤول:</span><strong>${clinic.docName || '--'}</strong></div>
          <div class="row-item"><span>تاريخ الاعتماد والتسليم:</span><span>${getFormattedDateTime()}</span></div>
          <div class="row-item"><span>تاريخ انتهاء صلاحية الترخيص:</span><span style="color: #2563eb; font-weight: bold;">${clinic.expiryDate}</span></div>

          <div class="cred-box">
            <div style="font-weight: bold; color: #166534; margin-bottom: 10px; font-size: 14px;">🔐 بيانات حساب المدير الرئيسي (Clinic Admin):</div>
            <div class="row-item"><span>اسم المستخدم (Username):</span><span class="highlight">${adminUser.username}</span></div>
            <div class="row-item"><span>كلمة المرور (Password):</span><span class="highlight">${adminUser.pass}</span></div>
            <div class="row-item"><span>رابط تسجيل الدخول:</span><span style="direction: ltr; font-size: 12px;">${window.location.origin}</span></div>
          </div>

          <div style="font-size: 12px; color: #475569; line-height: 1.6;">
            <strong>توجيهات الإدارة:</strong><br/>
            - من خلال هذا الحساب، يمكن لمدير المنشأة إنشاء حسابات خاصة بالموظفين (الاستقبال، التمريض، الأطباء، الصيدلية، المعمل) وتحديد صلاحيات كل موظف.<br/>
            - يرجى الحفاظ على سرية بيانات الدخول.
          </div>

          <div class="footer">
            توقيع المطور والمسؤول الفني: <strong>م/ صبري الديب (Sapry El-Deeb)</strong><br/>
            هاتف: 01065826742 | بريد: sapry.eldeep@gmail.com
          </div>
        </div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    slipWin.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <FileCheck size={28} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">بطاقة تسليم المنشأة والترخيص</h4>
          <p className="text-xs text-slate-500 mt-1">
            بيانات تسجيل الدخول المخصصة لمدير المنشأة لمشاركتها معه عبر الواتساب أو الطباعة
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
            <span className="text-slate-500">المنشأة الطبية:</span>
            <span className="font-bold text-slate-800">{clinic.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
            <span className="text-slate-500">الطبيب / المسؤول:</span>
            <span className="font-bold text-slate-800">{clinic.docName || '--'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
            <span className="text-slate-500">تاريخ انتهاء الاشتراك:</span>
            <span className="font-bold text-blue-600" dir="ltr">{clinic.expiryDate}</span>
          </div>

          <div className="bg-white border-2 border-dashed border-emerald-400 p-4 rounded-xl space-y-2 mt-2">
            <div className="text-xs font-bold text-emerald-800">🔐 بيانات الدخول الرئيسية للمدير:</div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">اسم المستخدم (User):</span>
              <span className="font-mono font-bold text-blue-700 text-base" dir="ltr">{adminUser.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">كلمة المرور (Pass):</span>
              <span className="font-mono font-bold text-slate-900 text-base" dir="ltr">{adminUser.pass}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={copyWhatsAppMessage}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {copiedMsg ? <Check size={18} /> : <Copy size={18} />}
            {copiedMsg ? 'تم نسخ رسالة الواتساب الجاهزة بنجاح!' : 'نسخ رسالة الواتساب الجاهزة لإرسالها للعميل'}
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={printVoucherSlip}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer"
            >
              <Printer size={16} /> طباعة وثيقة التسليم
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
