import React from 'react';
import { ShieldCheck, LogOut, User, Stethoscope, HeartPulse } from 'lucide-react';

export default function Navbar({ user, onSignOut }) {
  const userName = user?.patientProfile?.fullName || user?.doctorProfile?.fullName || user?.email || 'Authenticated User';
  const role = user?.role || 'PATIENT';

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40">
      
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-xl text-slate-950 font-black shadow-lg shadow-teal-500/20">
          <HeartPulse className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-black text-slate-100 text-base sm:text-lg tracking-tight">
            RuralCare <span className="text-teal-400">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Smart Rural Telemedicine & AI Kiosk</p>
        </div>
      </div>

      {/* User Context & Sign Out */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${role === 'DOCTOR' ? 'bg-cyan-400' : 'bg-teal-400'} animate-pulse`} />
            <span className="font-bold text-slate-200">{userName}</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              role === 'DOCTOR' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-teal-950 text-teal-300 border-teal-800'
            }`}>
              {role}
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800 text-xs font-bold transition flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      )}

    </nav>
  );
}
