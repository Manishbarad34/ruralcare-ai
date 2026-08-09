import React, { useState } from 'react';
import { Stethoscope, UserCheck, ShieldCheck, ArrowRight, Zap, Lock, Scan, Activity, Sparkles, UserPlus } from 'lucide-react';
import { db } from '../../db/database.js';

export default function AuthScreen({ onLoginSuccess, villagers = [], doctors = [] }) {
  const [selectedRole, setSelectedRole] = useState(null); // 'doctor' | 'patient' | null
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [password, setPassword] = useState('123456');

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter your full name');
    const villager = db.loginVillager(name.trim(), password);
    onLoginSuccess({ ...villager, role: 'patient' });
  };

  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter Doctor Name');
    const doctor = db.loginDoctor(licenseNo.trim() || name.trim(), password);
    onLoginSuccess({ ...doctor, role: 'doctor' });
  };

  const handleQuickPatientLogin = (selectedVillager) => {
    onLoginSuccess({ ...selectedVillager, role: 'patient' });
  };

  const handleQuickDoctorLogin = (selectedDoc) => {
    onLoginSuccess({ ...selectedDoc, role: 'doctor' });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 max-w-5xl mx-auto w-full select-none">
      
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/50 text-teal-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(20,184,166,0.3)] animate-pulse-glow">
          <ShieldCheck className="w-4 h-4 text-teal-400" /> SIH 2026 Telemedicine Authentication Gateway
        </div>
        
        <h1 className="text-3xl sm:text-6xl font-black text-slate-100 tracking-tight">
          RuralCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 drop-shadow-[0_0_25px_rgba(45,212,191,0.4)]">AI</span> Kiosk
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
          Please select your user role below to authenticate and enter your dedicated healthcare portal.
        </p>
      </div>

      {/* Role Selection Cards Grid with 3D Depth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* CARD 1: PATIENT KIOSK PORTAL */}
        <div className={`glass-card-3d rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden ${
          selectedRole === 'patient'
            ? 'border-teal-400 ring-2 ring-teal-500/50 shadow-[0_0_40px_rgba(20,184,166,0.3)]'
            : ''
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-black shadow-[0_0_25px_rgba(20,184,166,0.5)]">
                <UserCheck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black font-mono bg-teal-950/90 text-teal-300 px-3 py-1 rounded-full border border-teal-600/50 uppercase tracking-wider shadow-inner">
                Patient Kiosk Mode
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-100">Village Kiosk Patient Entry</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                For villagers and rural patients requiring face biometric scanning, blood diagnostics, and doctor consultation.
              </p>
            </div>

            {/* Registered Patients Selector */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider block flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Registered Patients ({villagers.length}):
              </span>
              
              {villagers && villagers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {villagers.map((v) => (
                    <button
                      key={v.id || v.name}
                      onClick={() => handleQuickPatientLogin(v)}
                      className="px-3.5 py-2 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/50 text-teal-300 rounded-xl text-xs font-black transition shadow-md flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> {v.name} ({v.village || 'Rampur'})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No patients registered yet. Enter your name below to register instantly.</p>
              )}
            </div>
          </div>

          {/* Form Expansion toggle */}
          {selectedRole !== 'patient' ? (
            <button
              onClick={() => setSelectedRole('patient')}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" /> Register & Sign In as Patient <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <form onSubmit={handlePatientSubmit} className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Your Real Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Barad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500 transition font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-teal-500/30"
              >
                Register Patient & Enter Kiosk
              </button>
            </form>
          )}
        </div>

        {/* CARD 2: DOCTOR COMMAND CENTER PORTAL */}
        <div className={`glass-card-3d rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden ${
          selectedRole === 'doctor'
            ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
            : ''
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <Stethoscope className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black font-mono bg-cyan-950/90 text-cyan-300 px-3 py-1 rounded-full border border-cyan-600/50 uppercase tracking-wider shadow-inner">
                Doctor Mode
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-100">Doctor Command Center</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                For verified medical doctors to manage patient approval mailboxes, priority queues, and HD WebRTC consultations.
              </p>
            </div>

            {/* Registered Doctors Selector */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> Registered Doctors ({doctors.length}):
              </span>
              
              {doctors && doctors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {doctors.map((d) => (
                    <button
                      key={d.id || d.name}
                      onClick={() => handleQuickDoctorLogin(d)}
                      className="px-3.5 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-black transition shadow-md flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      <Stethoscope className="w-3.5 h-3.5" /> {d.name} ({d.specialty || 'General Physician'})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No doctors registered yet. Enter your Doctor Name below to register instantly.</p>
              )}
            </div>
          </div>

          {/* Form Expansion toggle */}
          {selectedRole !== 'doctor' ? (
            <button
              onClick={() => setSelectedRole('doctor')}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" /> Register & Sign In as Doctor <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <form onSubmit={handleDoctorSubmit} className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Your Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Manish Barad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500 transition font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">MCI Medical License Number</label>
                <input
                  type="text"
                  placeholder="e.g. MCI-9901"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-cyan-500/30"
              >
                Register Doctor & Enter Portal
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
