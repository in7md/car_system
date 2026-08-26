"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles, Activity } from "lucide-react";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "مرحباً! أنا المساعد المالي والتحليلي الخاص بنظام InventraX. كيف يمكنني مساعدتك اليوم؟ (مثال: 'كم إجمالي الأرباح؟', 'كم رأس المال؟')" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessages(prev => [...prev, { role: "assistant", content: `❌ عذراً، حدث خطأ: ${err.message}` }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8" dir="rtl">
      
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-900 to-indigo-700 p-6 rounded-t-3xl shadow-lg text-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-300" /> المساعد الذكي (AI Assistant)
          </h1>
          <p className="text-indigo-200 text-sm mt-1">تحليل مالي ومحاسبي مشفر وآمن</p>
        </div>
        <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
          <Bot className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-3xl shadow-sm h-[600px] flex flex-col">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[75%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                <p className="leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 rounded-tl-sm flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" /> جاري التفكير وتحليل البيانات...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="اسألني عن الأرباح، المصروفات، أو العمليات المشبوهة..."
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-2xl py-4 pr-4 pl-16 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute left-2 top-2 bottom-2 bg-indigo-600 text-white w-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            </button>
          </form>
          <div className="text-center mt-3 text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> يتم جلب البيانات لحظياً وبأمان من قاعدة البيانات
          </div>
        </div>
      </div>

    </div>
  );
}
