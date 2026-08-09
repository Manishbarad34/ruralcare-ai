import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, User, Stethoscope, BellRing } from 'lucide-react';

export default function DirectChatOverlay({ isOpen, onClose, currentRole, activeUser, peerUser, wsRef, targetUserId }) {
  const [messages, setMessages] = useState([
    {
      sender: currentRole === 'doctor' ? 'patient' : 'doctor',
      text: `Hello! I am connected with you on RuralCare AI live tele-chat.`
    }
  ]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!wsRef || !wsRef.current) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat:message') {
          const senderRole = data.senderUserId === targetUserId ? (currentRole === 'doctor' ? 'patient' : 'doctor') : 'other';
          setMessages((prev) => [
            ...prev,
            { sender: senderRole, text: data.payload?.text || 'New message' }
          ]);
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      } catch (err) {}
    };

    const socket = wsRef.current;
    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [wsRef, targetUserId, currentRole, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textToSend = input.trim();
    const newMsg = { sender: currentRole, text: textToSend };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Send targeted WebSocket chat message to targetUserId
    if (wsRef && wsRef.current && wsRef.current.readyState === 1 && targetUserId) {
      wsRef.current.send(JSON.stringify({
        type: 'chat:message',
        targetUserId,
        payload: { text: textToSend }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 relative">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              Live Direct Chat Session ({currentRole === 'doctor' ? 'Doctor View' : 'Patient View'})
              {unreadCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {unreadCount} New
                </span>
              )}
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
            placeholder="Type message to send..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-teal-500 font-medium"
          />
          <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-teal-500/20">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
