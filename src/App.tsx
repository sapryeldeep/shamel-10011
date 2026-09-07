import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import QueueDisplayScreen from './pages/QueueDisplayScreen';
import AppRoutes from './AppRoutes';
import WhatsAppWidget from './components/WhatsAppWidget';
import AiChatbotWidget from './components/AiChatbotWidget';
import { Menu, Tv, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFormattedDateTime } from './lib/utils';

export default function App() {
  const { state, currentUser, switchClinicContext } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!currentUser) {
    return <Login />;
  }

  // Find user's active clinic
  const currentClinic = state.clinics.find(c => String(c.id) === String(currentUser.clinicId));
  const allowWhatsApp = currentUser.clinicId === 'master' || (currentClinic?.allowWhatsApp !== false);
  const allowChatbot = currentUser.clinicId === 'master' || (currentClinic?.allowChatbot !== false);
  const allowPrinting = currentUser.clinicId === 'master' || (currentClinic?.allowPrinting !== false);

  // If on TV Queue screen, render full dedicated screen without default sidebar
  if (location.pathname === '/queue-screen') {
    return <QueueDisplayScreen />;
  }
  
  // Maintenance Mode Lock
  if (state.maintenanceMode && currentUser.role !== 'master_admin' && currentUser.role !== 'developer') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans" dir="rtl" style={{ fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif' }}>
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-3">النظام تحت الصيانة مؤقتاً</h1>
        <p className="text-slate-600 text-lg max-w-md font-medium leading-relaxed">
          نحن نقوم حالياً بتحديث وترقية النظام لتقديم تجربة أفضل.
          <br/>
          يرجى المحاولة بعد قليل، نعتذر عن هذا الإزعاج.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          تحديث الصفحة (Reload)
        </button>
      </div>
    );
  }

  const isDevOrMaster = currentUser.role === 'master_admin' || currentUser.role === 'developer';

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 flex font-sans" dir="rtl" style={{ fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif' }}>
      {/* Global Announcement Banner */}
      {state.globalAnnouncement?.active && (
        <div className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2.5 flex items-center justify-center text-center font-bold text-sm shadow-md print:hidden ${
          state.globalAnnouncement.type === 'error' ? 'bg-red-600 text-white' :
          state.globalAnnouncement.type === 'warning' ? 'bg-amber-500 text-white' :
          'bg-indigo-600 text-white'
        }`}>
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <span className="shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </span>
            <span>{state.globalAnnouncement.message}</span>
          </div>
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={`flex-1 w-full lg:pr-64 transition-all duration-300 flex flex-col h-screen overflow-hidden print:pr-0 print:h-auto print:overflow-visible ${state.globalAnnouncement?.active ? 'pt-10' : ''}`}>
        <div className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto print:p-0 print:overflow-visible print:block">
          
          <header className="flex justify-between items-center bg-white h-16 px-6 rounded-xl border border-slate-200 shadow-sm shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <button 
                className="lg:hidden p-2 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div>
                <h5 className="font-bold text-slate-800 m-0 leading-tight flex items-center gap-2">
                  <span>مرحباً، <span className="text-blue-600">{currentUser.name}</span></span>
                  {isDevOrMaster && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full">
                      👑 المطور الرئيسي
                    </span>
                  )}
                </h5>
                <small className="text-slate-500 text-[10px]">
                  {getFormattedDateTime()}
                </small>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isDevOrMaster && (currentClinic?.allowQueueScreen !== false) && (
                <Link
                  to="/queue-screen"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="فتح شاشة الانتظار للتلفزيونات والشاشات الكبيرة"
                >
                  <Tv size={15} />
                  <span className="hidden sm:inline">شاشة الانتظار (TV)</span>
                </Link>
              )}

              {!isDevOrMaster && allowPrinting && (
                <button onClick={() => window.print()} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 hidden md:flex transition-colors cursor-pointer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  طباعة
                </button>
              )}

              {isDevOrMaster && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    سيرفر السحابة نشط
                  </span>
                  <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold shadow-xs">
                    v2.5.0 Enterprise
                  </span>
                </div>
              )}
            </div>
          </header>

          <AppRoutes currentUser={currentUser} />
          
        </div>
      </main>

      {allowWhatsApp && <WhatsAppWidget />}
      {allowChatbot && <AiChatbotWidget />}
    </div>
  );
}
