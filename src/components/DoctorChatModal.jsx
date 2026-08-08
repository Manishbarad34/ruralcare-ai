import React, { useState } from 'react';
import { MessageSquare, Send, X, User, Stethoscope } from 'lucide-react';

export default function DoctorChatModal({ isOpen, onClose, patient, doctor }) {
  const [messages, setMessages] = useState([
    { sender: 'doctor', text: `Hello ${patient?.villagerName || 'Patient'}! Doctor ${doctor?.name || 'Dr. Manish'} here. How can I assist you today?` }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: 'doctor', text: input }]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 relative">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">
              Direct Consultation Chat with {patient?.villagerName || 'Patient'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 h-64 overflow-y-auto space-y-2 text-xs">
          {messages.map((m, i) => (
            <div key={i} className={`p-2.5 rounded-xl max-w-[80%] ${m.sender === 'doctor' ? 'bg-cyan-950 text-cyan-200 border border-cyan-800 ml-auto' : 'bg-slate-900 text-slate-200 border border-slate-800'}`}>
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
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
          />
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
