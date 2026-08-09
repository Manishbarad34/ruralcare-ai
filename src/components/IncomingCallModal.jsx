import React from 'react';
import { Phone, PhoneOff, Video, Mic, Volume2, ShieldCheck, Sparkles } from 'lucide-react';

export default function IncomingCallModal({ incomingCall, onAccept, onDecline }) {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(20,184,166,0.3)] text-center space-y-6 relative overflow-hidden">
        
        {/* Pulsing Glowing Ring Animation */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping border border-teal-400" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl shadow-teal-500/40">
            {incomingCall.isVideo ? <Video className="w-10 h-10 stroke-[2.5]" /> : <Phone className="w-10 h-10 stroke-[2.5]" />}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black font-mono bg-teal-950 text-teal-300 px-3 py-1 rounded-full border border-teal-800 uppercase tracking-widest">
            {incomingCall.isVideo ? '📹 Incoming 1080p Video Call' : '📞 Incoming Voice Call'}
          </span>
          <h3 className="text-2xl font-black text-slate-100 pt-2">{incomingCall.callerName || 'Incoming Call'}</h3>
          <p className="text-xs text-slate-400 font-medium">
            {incomingCall.callerRole === 'doctor' ? 'Doctor Tele-Consultation Request' : 'Patient Urgent Consultation Call'}
          </p>
        </div>

        {/* Accept / Decline Round Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={onDecline}
            className="py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
          >
            <PhoneOff className="w-5 h-5" /> DECLINE
          </button>

          <button
            onClick={onAccept}
            className="py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/40 transition transform hover:scale-105"
          >
            <Phone className="w-5 h-5 fill-current" /> ACCEPT CALL
          </button>
        </div>

      </div>
    </div>
  );
}
