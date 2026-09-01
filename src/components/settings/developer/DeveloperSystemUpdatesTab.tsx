import React, { useState } from 'react';
import { 
  Rocket, Server, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Megaphone, Plus, Clock, Tag, Building2, Send, Sparkles, Layers, ArrowUpCircle
} from 'lucide-react';
import { AppState } from '../../../context/defaults';
import { SystemReleaseUpdate } from '../../../types';
import { getFormattedDateTime } from '../../../lib/utils';

interface DeveloperSystemUpdatesTabProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  logAction: (action: string, details: string) => void;
}

export default function DeveloperSystemUpdatesTab({
  state,
  updateState,
  logAction
}: DeveloperSystemUpdatesTabProps) {
  const updatesHistory = state.systemUpdatesHistory || [];

  // Form State for new System Release
  const [version, setVersion] = useState('v2.6.0 Enterprise');
  const [title, setTitle] = useState('');
  const [updateType, setUpdateType] = useState<'major' | 'minor' | 'security' | 'patch'>('major');
  const [targetAudience, setTargetAudience] = useState<'all' | 'hospitals' | 'centers' | 'clinics'>('all');
  const [description, setDescription] = useState('');
  const [changesText, setChangesText] = useState('');
  const [broadcastAlert, setBroadcastAlert] = useState(true);
  const [enableMaintenance, setEnableMaintenance] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Publish New Release
  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim() || !description.trim()) {
      alert('الرجاء تعبئة جميع الحقول الرئيسية للتحديث (رقم الإصدار، العنوان، والوصف).');
      return;
    }

    setIsPublishing(true);

    const changesList = changesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newRelease: SystemReleaseUpdate = {
      id: `update_${Date.now()}`,
      version: version.trim(),
      title: title.trim(),
      releaseDate: getFormattedDateTime(),
      updateType,
      targetAudience,
      description: description.trim(),
      changesList: changesList.length > 0 ? changesList : ['تحديثات تحسين الأداء وإصلاح الثغرات'],
      broadcastAlert,
      maintenanceWindow: enableMaintenance,
      publishedBy: 'المطور الرئيسي (Master Developer)'
    };

    const updatedHistory = [newRelease, ...updatesHistory];

    const newGlobalAnnouncement = broadcastAlert ? {
      active: true,
      message: `🚀 تم إطلاق التحديث الجديد للمنظومة (${version.trim()}): ${title.trim()}!`,
      type: 'info' as const
    } : state.globalAnnouncement;

    updateState({
      systemUpdatesHistory: updatedHistory,
      maintenanceMode: enableMaintenance ? true : state.maintenanceMode,
      globalAnnouncement: newGlobalAnnouncement
    });

    logAction('نشر تحديث نظام جديد', `تم نشر التحديث رقم ${version} بعنوان: ${title}`);

    setTimeout(() => {
      setIsPublishing(false);
      setTitle('');
      setDescription('');
      setChangesText('');
      alert(`🎉 تم نشر التحديث (${version}) وتطبيقه على المنظومة بنجاح!`);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                <Rocket size={14} /> مركز نشر الإصدارات والتحديثات (Release Manager)
              </span>
            </div>
            <h3 className="text-xl font-black text-white">إدارة وإطلاق التحديثات البرمجية للمنظومة</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              من هنا يمكنك نشر الإصدارات الجديدة، إضافة ملاحظات التحديث (Release Notes)، إرسال تنبيهات فورية للمستخدمين، وتفعيل وضع الصيانة التلقائي أثناء إيقاف وتحديث السيرفرات.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-left">
              <span className="block text-[10px] text-slate-400 font-bold">الإصدار الحالي المستقر</span>
              <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> {updatesHistory[0]?.version || 'v2.5.0 Enterprise'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Form to Add New Release & Updates */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Plus size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">نشر تحديث جديد للمنظومة</h4>
              <span className="text-xs text-slate-500 font-bold">Publish New System Release</span>
            </div>
          </div>

          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-mono font-bold">
            {getFormattedDateTime()}
          </span>
        </div>

        <form onSubmit={handlePublishUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الإصدار (Version Tag):</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="مثال: v2.6.0 Enterprise"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع التحديث:</label>
              <select
                value={updateType}
                onChange={(e: any) => setUpdateType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="major">🚀 تحديث أساسي رئيسي (Major Release)</option>
                <option value="minor">✨ تحديث مميزات جديدة (Feature Update)</option>
                <option value="security">🛡️ تحديث أمني عاجل (Security Patch)</option>
                <option value="patch">🔧 تحسينات وأداء (Bug Fixes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نطاق التحديث الموجه:</label>
              <select
                value={targetAudience}
                onChange={(e: any) => setTargetAudience(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">جميع المنشآت والعيادات والمستشفيات</option>
                <option value="hospitals">المستشفيات العامة فقط</option>
                <option value="centers">المراكز الطبية التخصصية فقط</option>
                <option value="clinics">العيادات الخاصة فقط</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان التحديث الرئيسي:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحديث شجرة الحسابات التخصصية ونشر أزرار التصدير الذكية"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف وتفاصيل التحديث:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح مختصر للتحديث والهدف منه..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">قائمة التعديلات والإضافات (ضع كل نقطة في سطر منفصل):</label>
            <textarea
              rows={3}
              value={changesText}
              onChange={(e) => setChangesText(e.target.value)}
              placeholder="مثال:&#10;تطوير مصفوفة التحكم بالصلاحيات للمطور&#10;إتاحة تصدير PDF وإكسيل والطباعة في دليل المرضى&#10;فصل بيانات شجرة الحسابات بالكامل لمنع التداخل"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={broadcastAlert}
                  onChange={(e) => setBroadcastAlert(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Megaphone size={16} className="text-blue-600" />
                <span>إرسال تنبيه فوري شريطي بجميع شاشات العيادات والمستشفيات</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={enableMaintenance}
                  onChange={(e) => setEnableMaintenance(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <AlertTriangle size={16} className="text-amber-600" />
                <span>تفعيل وضع الصيانة التلقائي للنظام عند إدراج التحديث</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> جاري النشر والتوجيه...
                </>
              ) : (
                <>
                  <Send size={16} /> نشر وإطلاق التحديث الآن
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Updates History Log */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">سجل الإصدارات والتحديثات السابقة</h4>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            إجمالي الإصدارات: {updatesHistory.length}
          </span>
        </div>

        <div className="p-4 space-y-4">
          {updatesHistory.map((up, idx) => (
            <div key={up.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold rounded-lg text-xs">
                    {up.version}
                  </span>
                  <h5 className="font-bold text-slate-800 text-sm">{up.title}</h5>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    up.updateType === 'major' ? 'bg-purple-100 text-purple-800' : up.updateType === 'security' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {up.updateType === 'major' ? 'تحديث أساسي' : up.updateType === 'security' ? 'تحديث أمني' : 'تحسينات'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {up.releaseDate}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {up.description}
              </p>

              {up.changesList && up.changesList.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="block text-[11px] font-bold text-slate-700 mb-1.5">التعديلات المضمنة:</span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {up.changesList.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
