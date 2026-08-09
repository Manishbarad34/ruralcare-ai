import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, User, Stethoscope } from 'lucide-react';

export default function DirectChatOverlay({ isOpen, onClose, currentRole, activeUser, peerUser }) {
  const [messages, setMessages] = useState([
    {
      sender: currentRole === 'doctor' ? 'patient' : 'doctor',
      text: `Hello! I am connected with you on RuralCare AI live chat portal.`
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { sender: currentRole, text: input.trim() };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 relative">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">
              Live Direct Chat Session ({currentRole === 'doctor' ? 'Doctor' : 'Patient'})
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 h-64 overflow-y-auto space-y-2 text-xs">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl max-w-[80%] ${
                m.sender === currentRole
                  ? 'bg-teal-950 text-teal-200 border border-teal-800 ml-auto'
                  : 'bg-slate-900 text-slate-200 border border-slate-800'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-teal-500"
          />
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
