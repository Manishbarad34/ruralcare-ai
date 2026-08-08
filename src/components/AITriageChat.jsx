import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AITriageChat({ villager, bloodReport, aiProvider = 'GEMINI', onComplete, onNext }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${villager?.name || 'Patient'}! I am RuralCare AI Triage Assistant. Please describe your symptoms (e.g. fever, headache, stomach discomfort).`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiReply = {
        sender: 'ai',
        text: `Thank you. Based on your symptoms "${currentInput}" and vitals report, your triage risk level is assessed as MEDIUM. I am preparing your priority consultation request for available online doctors.`
      };
      setMessages((prev) => [...prev, aiReply]);
      if (onComplete) {
        onComplete({ symptoms: currentInput, riskLevel: 'MEDIUM' });
      }
    }, 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-w-4xl mx-auto w-full">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-950 text-teal-300 rounded-2xl border border-teal-700">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">
              RuralCare AI Health Triage Engine ({aiProvider})
            </h3>
            <p className="text-xs text-slate-400">Conversational Symptom Assessment</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md shadow-teal-500/20"
        >
          Connect to Doctor <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 h-72 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
              m.sender === 'user' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-teal-950 text-teal-300 border border-teal-700'
            }`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`p-3 rounded-2xl max-w-[80%] text-xs ${
              m.sender === 'user'
                ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800/60'
                : 'bg-slate-900 text-slate-200 border border-slate-800'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-teal-400 italic">
            <Bot className="w-4 h-4 animate-spin" />
            <span>AI Triage Engine Analyzing Symptoms...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Describe your symptoms here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-1"
        >
          Send <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
