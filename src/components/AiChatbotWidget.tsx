import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, RefreshCw, Copy, Check, MessageSquare, ShieldAlert, BookOpen, Stethoscope } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function AiChatbotWidget() {
  const { currentUser, state } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentClinic = state.clinics.find(c => String(c.id) === String(currentUser?.clinicId));

  // If chatbot feature is disabled for this clinic by Master Developer, don't show the widget unless user is master_admin
  const isMaster = currentUser?.role === 'master_admin';
  const isChatbotAllowed = isMaster || (currentClinic?.allowChatbot !== false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `أهلاً بك يا دكتور / أستاذ ${currentUser?.name || ''}! 👋\nأنا المساعد الطبي والإداري الذكي للمنظومة. كيف يمكنني مساعدتك اليوم في المنشأة الطبية؟\n(ملاحظة: تأكد من إضافة API Key الخاص بـ Gemini في إعدادات المنشأة ليعمل المساعد بكفاءة)`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!currentUser || !isChatbotAllowed) {
    return null;
  }

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      // For GitHub pages offline SPA, API key must be provided by user via clinic settings (fallback to hardcoded if needed for dev)
      const apiKey = currentClinic?.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || ""; 
      
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `أنت المساعد الطبي والإداري الذكي لمنظومة (شامل للمستشفيات والعيادات).
أنت تخدم المنشأة الطبية: "${currentClinic?.name || 'المستشفى التخصصي'}" للطبيب/المدير: "${currentUser.name || 'المدير الطبي'}".

مهامك ومجالات خبرتك:
1. إجابة الاستفسارات الطبية السريعة، درجات الخطورة للطوارئ، بروتوكولات الجرعات، والأدوية والبدائل المصرح بها.
2. المساعدة في صياغة التشخيصات وفق الترميز الدولي ICD-10 والتقارير الطبية الرسمية ورسائل توجيه المرضى.
3. كتابة صياغات التذكير والنصح الطبي وإرشادات الفحوصات والأشعة.
4. الرد بلباقة ومهنية رفيعة باللغة العربية بأسلوب منظّم وواضح مع استخدام نقاط وجداول عند الحاجة.`;

      const contents = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model' as const,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: textToSend }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction, temperature: 0.7 }
      });

      const botReplyText = response.text || "عفواً، لم أتمكن من إيجاد الرد المناسب.";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg = err.message === "API_KEY_MISSING" 
        ? "عفواً، الرجاء إعداد مفتاح Gemini API في إعدادات المنشأة حتى أتمكن من مساعدتك."
        : 'حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى التأكد من صحة المفتاح والمحاولة مجدداً.';
        
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: errorMsg,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = [
    { label: "💡 جرعة وتفاعلات أدوية", prompt: "ما هي الجرعة المعتادة لـ Augmentin 1g والتفاعلات الدوائية الواجب الحذر منها؟" },
    { label: "🔍 رمز ICD-10 لمرض", prompt: "ما هو الترميز الدولي ICD-10 لمرض التهاب الزائدة الدودية الحاد وسكر الحمل؟" },
    { label: "📲 نص تذكير واتساب", prompt: "اقترح لي نص رسالة تذكير بالواتساب للمريض لموعد الجراحة والتأكيد عليه بالصيام." },
    { label: "🚨 بروتوكول طوارئ", prompt: "ما هو البروتوكول السريع للتعامل مع حالات الصدمة التحسسية Anaphylaxis في الطوارئ؟" }
  ];

  return (
    <>
      {/* Launcher Button */}
      <button
        id="ai-chatbot-launcher"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-24 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-sm border border-white/20 print:hidden"
        title="الشات بوت الطبي والإداري الذكي"
      >
        <div className="relative">
          <Bot size={22} className="text-white" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
          </span>
        </div>
        <span className="hidden sm:inline">المساعد الطبي الذكي</span>
        <Sparkles size={16} className="text-cyan-300 animate-pulse" />
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Bot size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-2">
                  المساعد الطبي الذكي AI
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Gemini 3.7
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  مساعدك الفوري للاستشارات والترميز وصياغة التقرير
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-right">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-cyan-400'
                }`}>
                  {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm relative group ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  
                  <div className={`flex items-center justify-between mt-2 pt-1 border-t ${
                    m.sender === 'user' ? 'border-blue-500/40 text-blue-100' : 'border-slate-100 text-slate-400'
                  } text-[10px]`}>
                    <span>{m.timestamp}</span>
                    {m.sender === 'bot' && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 text-slate-500"
                        title="نسخ النص"
                      >
                        {copiedId === m.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0 text-xs shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  جاري معالجة الإجابة بواسطة الذكاء الاصطناعي...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto custom-scrollbar flex gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.prompt)}
                disabled={loading}
                className="shrink-0 text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-200 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك أو استفسارك الطبي/الإداري..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-md transition-all shrink-0"
            >
              <Send size={16} className={loading ? "opacity-0" : "rotate-180"} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
