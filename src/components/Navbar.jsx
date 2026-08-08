import React from 'react';
import { Monitor, Stethoscope, ShieldCheck, LogOut, UserCheck } from 'lucide-react';

export default function Navbar({ activePortal, setActivePortal, authenticatedUser, onLogout }) {
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

        {/* Navigation Portal Switcher & Auth Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center shadow-inner">
            <button
              onClick={() => setActivePortal('kiosk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activePortal === 'kiosk'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Patient Kiosk Portal
            </button>

            {authenticatedUser?.role !== 'kiosk' && (
              <button
                onClick={() => setActivePortal('doctor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activePortal === 'doctor'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Doctor Portal Mode
              </button>
            )}
          </div>

          {authenticatedUser && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-slate-200">{authenticatedUser.name}</span>
              <button
                onClick={onLogout}
                className="ml-1 p-1 bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded-lg transition"
                title="Logout Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
