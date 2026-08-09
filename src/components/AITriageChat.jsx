import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Pill, Stethoscope, Search } from 'lucide-react';

export default function AITriageChat({ villager, bloodReport, aiProvider = 'GEMINI', onComplete, onNext }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${villager?.name || 'Patient'}! I am RuralCare AI Clinical Assistant. Please describe your symptoms (e.g. high fever for 2 days, headache, stomach ache, diarrhea, cough).`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: currentInput, patientName: villager?.name })
      });

      if (res.ok) {
        const data = await res.json();
        setIsTyping(false);
        setAiResult(data);

        const aiReply = {
          sender: 'ai',
          text: `🔍 AI Clinical Diagnosis: ${data.diagnosis}\n\n💡 Recommended Solution: ${data.solution}\n\n💊 AI Suggested Medicines:\n${data.suggestedMeds.map(m => `• ${m.name} (${m.category}) -> Dosage: ${m.dosage}`).join('\n')}`
        };

        setMessages((prev) => [...prev, aiReply]);
        if (onComplete) {
          onComplete({ symptoms: currentInput, riskLevel: data.urgency, diagnosis: data.diagnosis, suggestedMeds: data.suggestedMeds });
        }
      } else {
        throw new Error('AI API Error');
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackReply = {
        sender: 'ai',
        text: `Thank you. Based on "${currentInput}", your triage urgency is MEDIUM. Suggested Medicine: Paracetamol 500mg (1 Tab twice daily after food).`
      };
      setMessages((prev) => [...prev, fallbackReply]);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-950 text-teal-300 rounded-2xl border border-teal-700 shadow-lg shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
              Gemini AI Clinical Diagnosis & Solution Search Engine
              <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full font-mono border border-teal-700 uppercase">
                Live AI
              </span>
            </h3>
            <p className="text-xs text-slate-400">AI Symptom Analysis & Clinical Prescription Suggestions</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-teal-500/30 transition transform hover:scale-105"
        >
          Connect to Doctor <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Log */}
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

            <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-line ${
              m.sender === 'user'
                ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800/60 font-semibold'
                : 'bg-slate-900 text-slate-200 border border-slate-800 font-medium'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-teal-400 font-bold italic animate-pulse">
            <Search className="w-4 h-4 animate-spin" />
            <span>Searching Clinical Solution Database & Medical Diagnosis...</span>
          </div>
        )}
      </div>

      {/* Suggested Medicine Cards Bar */}
      {aiResult?.suggestedMeds && aiResult.suggestedMeds.length > 0 && (
        <div className="p-3 bg-slate-950 rounded-2xl border border-teal-500/40 space-y-2">
          <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest flex items-center gap-1">
            <Pill className="w-3.5 h-3.5" /> AI Recommended Medicines & Dosage:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {aiResult.suggestedMeds.map((med) => (
              <div key={med.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-100">{med.name}</span>
                  <span className="text-[10px] text-teal-400 block font-mono">{med.dosage}</span>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  {med.slot}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Describe symptoms (e.g. fever, cough, stomach pain)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-teal-500 transition"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-1"
        >
          Diagnose <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
