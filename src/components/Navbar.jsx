import React from 'react';
import { Monitor, Stethoscope, ShieldCheck, LogOut, UserCheck } from 'lucide-react';

export default function Navbar({ activePortal, setActivePortal, authenticatedUser, onLogout }) {
  const isPatient = authenticatedUser?.role === 'patient' || authenticatedUser?.role === 'kiosk';
  const isDoctor = authenticatedUser?.role === 'doctor';

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl sticky top-0 z-40 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-teal-500/20 text-slate-950">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-100 text-lg sm:text-xl tracking-tight">
                RuralCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">AI</span>
              </h1>
              <span className="bg-teal-950 text-teal-300 border border-teal-600/40 text-[10px] px-2 py-0.5 rounded-full font-mono font-black uppercase">
                SIH 2026 Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Smart Rural Telemedicine Kiosk & Consultation Platform
            </p>
          </div>
        </div>

        {/* User Status Bar & Logout Controls */}
        <div className="flex items-center gap-3">
          {authenticatedUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs">
                {isDoctor ? (
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-teal-400" />
                )}
                <span className="font-extrabold text-slate-200">{authenticatedUser.name}</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase border ${
                  isDoctor ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-teal-950 text-teal-300 border-teal-800'
                }`}>
                  {isDoctor ? 'Doctor Session' : 'Patient Session'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded-2xl font-extrabold text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                title="Logout Session"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="text-xs font-extrabold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              🔒 Authentication Required
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
