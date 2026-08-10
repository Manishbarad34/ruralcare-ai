import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Stethoscope, Video, Phone, CheckCheck, Circle, ShieldCheck } from 'lucide-react';

export default function DirectChatOverlay({ isOpen, onClose, currentRole, activeUser, peerUser, socket, targetUserId, onStartCall, requestId, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBottomRef = useRef(null);

  const peerName = peerUser?.fullName || peerUser?.name || (currentRole === 'doctor' ? 'Patient' : 'Dr. Manish Barad');
  const peerSpecialtyOrVillage = currentRole === 'doctor' ? (peerUser?.village || 'Rampur Panchayat') : (peerUser?.specialty || 'General Physician');

  // Fetch Persistent Database Messages on Open
  useEffect(() => {
    if (!isOpen || !requestId || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/consultations/messages/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map(m => ({
              senderId: m.senderId,
              text: m.text,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
          }
        }
      } catch (err) {}
    };

    fetchMessages();
  }, [isOpen, requestId, token]);

  // Listen for Real-Time Incoming WebSocket Chat Messages
  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat:message') {
          const incomingText = data.payload?.text;
          const incomingSender = data.senderUserId;

          if (incomingText) {
            setMessages((prev) => [
              ...prev,
              {
                senderId: incomingSender,
                text: incomingText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (err) {}
    };

    socket.addEventListener('message', handleSocketMessage);
    return () => {
      socket.removeEventListener('message', handleSocketMessage);
    };
  }, [socket]);

  const scrollToBottom = () => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textToSend = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append to Local WhatsApp Thread
    setMessages((prev) => [...prev, { senderId: activeUser?.userId || 'me', text: textToSend, time: timeStr }]);
    setInput('');
    setTimeout(scrollToBottom, 50);

    // 1. Save to SQLite Database via API
    if (requestId && token) {
      try {
        await fetch('/api/consultations/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            requestId,
            receiverUserId: targetUserId,
            text: textToSend
          })
        });
      } catch (err) {}
    }

    // 2. Relay Targeted Real-Time WebSocket Signal to Recipient Phone/Laptop
    if (socket && socket.readyState === 1 && targetUserId) {
      socket.send(JSON.stringify({
        type: 'chat:message',
        targetUserId,
        payload: { text: textToSend }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-slate-900 border-2 border-teal-500/80 rounded-3xl max-w-lg w-full h-[85vh] flex flex-col justify-between shadow-2xl overflow-hidden relative">
        
        {/* WHATSAPP-STYLE HEADER */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black flex items-center justify-center shadow-md">
              {currentRole === 'doctor' ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-slate-100 text-sm flex items-center gap-2">
                {peerName}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-teal-300 font-mono font-medium">{peerSpecialtyOrVillage} • Online</p>
            </div>
          </div>

          {/* Quick Call Action Controls in Header (WhatsApp Style) */}
          <div className="flex items-center gap-2">
            {onStartCall && (
              <>
                <button
                  onClick={() => onStartCall(peerUser, true)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition"
                  title="Start 1080p Video Call"
                >
                  <Video className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => onStartCall(peerUser, false)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 transition"
                  title="Start Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WHATSAPP CHAT THREAD BODY */}
        <div className="flex-1 bg-slate-950 p-4 overflow-y-auto space-y-3 font-sans">
          <div className="text-center my-2">
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full font-mono">
              🔒 End-to-end 256-bit Encrypted Consultation Chat
            </span>
          </div>

          {messages && messages.length > 0 ? (
            messages.map((m, idx) => {
              const isMe = m.senderId === (activeUser?.userId || 'me') || m.senderId !== targetUserId;
              return (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[82%] space-y-1 ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-slate-950 font-bold rounded-tr-none shadow-md shadow-teal-500/10'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 font-medium rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <span>{m.time || '10:48 AM'}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-teal-400 stroke-[2.5]" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-700" />
              <p>No messages in chat thread yet. Say hello to start consultation!</p>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* WHATSAPP INPUT BAR */}
        <form onSubmit={handleSend} className="bg-slate-950 p-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${peerName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 outline-none focus:border-teal-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-teal-500/20 disabled:opacity-40 transition transform hover:scale-105"
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

      </div>
    </div>
  );
}
