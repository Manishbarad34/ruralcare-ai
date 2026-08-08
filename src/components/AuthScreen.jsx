import React, { useState } from 'react';
import { Stethoscope, UserCheck, ShieldCheck, ArrowRight, Zap, Lock, Scan, Activity } from 'lucide-react';
import { db } from '../../db/database.js';

export default function AuthScreen({ onLoginSuccess, villagers = [], doctors = [] }) {
  const [selectedRole, setSelectedRole] = useState(null); // 'doctor' | 'patient' | null
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [password, setPassword] = useState('123456');

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    const villager = db.loginVillager(phone || name || 'Rahul Kumar', password);
    onLoginSuccess({ ...villager, role: 'patient' });
  };

  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    const doctor = db.loginDoctor(licenseNo || name || 'Dr. Manish Barad', password);
    onLoginSuccess({ ...doctor, role: 'doctor' });
  };

  const handleQuickPatientLogin = (selectedVillager) => {
    const vObj = selectedVillager || (villagers && villagers[0]) || { name: 'Rahul Kumar', phone: '9876543210', village: 'Rampur' };
    const villager = db.registerVillager(vObj);
    onLoginSuccess({ ...villager, role: 'patient' });
  };

  const handleQuickDoctorLogin = (selectedDoc) => {
    const dObj = selectedDoc || (doctors && doctors[0]) || { name: 'Dr. Manish Barad', licenseNo: 'MCI-9901', specialty: 'General Physician' };
    const doctor = db.registerDoctor(dObj);
    onLoginSuccess({ ...doctor, role: 'doctor' });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 max-w-5xl mx-auto w-full select-none">
      
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/20">
          <ShieldCheck className="w-4 h-4 text-teal-400" /> SIH 2026 Telemedicine Authentication Gateway
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          RuralCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400">AI</span> Kiosk Portal
        </h1>
        
        <p className="text-sm text-slate-400 max-w-xl mx-auto font-medium">
          Please select your user role below to authenticate and enter your dedicated healthcare portal.
        </p>
      </div>

      {/* Role Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* CARD 1: PATIENT KIOSK PORTAL */}
        <div className={`bg-slate-900/90 border rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-2xl relative overflow-hidden ${
          selectedRole === 'patient'
            ? 'border-teal-400 ring-2 ring-teal-500/40 bg-slate-900 shadow-teal-500/20'
            : 'border-slate-800 hover:border-teal-500/50 hover:bg-slate-900'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/30">
                <UserCheck className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black font-mono bg-teal-950 text-teal-300 px-3 py-1 rounded-full border border-teal-800 uppercase">
                Patient Kiosk Mode
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-100">Village Kiosk Patient Entry</h3>
              <p className="text-xs text-slate-400 mt-1">
                For villagers and rural patients requiring face biometric scanning, blood diagnostics, and doctor consultation.
              </p>
            </div>

            {/* Quick Demo Patients Selection Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider block">
                ⚡ Quick 1-Click Patient Sign-In:
              </span>
              <div className="flex flex-wrap gap-2">
                {(villagers && villagers.length > 0 ? villagers : [
                  { name: 'Rahul Kumar', id: 'VILL-101', village: 'Rampur' },
                  { name: 'Mm', id: 'VILL-102', village: 'Gram Panchayat' }
                ]).map((v) => (
                  <button
                    key={v.id || v.name}
                    onClick={() => handleQuickPatientLogin(v)}
                    className="px-3 py-1.5 bg-teal-950 hover:bg-teal-900 border border-teal-600/50 text-teal-300 rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> {v.name} ({v.village || 'Rampur'})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Expansion toggle */}
          {selectedRole !== 'patient' ? (
            <button
              onClick={() => setSelectedRole('patient')}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              Sign In as Patient <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <form onSubmit={handlePatientSubmit} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name / Patient ID</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-teal-500/20"
              >
                Enter Kiosk Portal Now
              </button>
            </form>
          )}
        </div>

        {/* CARD 2: DOCTOR COMMAND CENTER PORTAL */}
        <div className={`bg-slate-900/90 border rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-2xl relative overflow-hidden ${
          selectedRole === 'doctor'
            ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-slate-900 shadow-cyan-500/20'
            : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/30">
                <Stethoscope className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800 uppercase">
                Doctor Mode
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-100">Doctor Command Center</h3>
              <p className="text-xs text-slate-400 mt-1">
                For verified medical doctors to manage patient approval mailboxes, priority queues, and HD WebRTC consultations.
              </p>
            </div>

            {/* Quick Demo Doctors Selection Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                ⚡ Quick 1-Click Doctor Sign-In:
              </span>
              <div className="flex flex-wrap gap-2">
                {(doctors && doctors.length > 0 ? doctors : [
                  { name: 'Dr. Manish Barad', licenseNo: 'MCI-9901', specialty: 'General Physician' }
                ]).map((d) => (
                  <button
                    key={d.id || d.name}
                    onClick={() => handleQuickDoctorLogin(d)}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> {d.name} ({d.licenseNo || 'MCI-9901'})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Expansion toggle */}
          {selectedRole !== 'doctor' ? (
            <button
              onClick={() => setSelectedRole('doctor')}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              Sign In as Doctor <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <form onSubmit={handleDoctorSubmit} className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Manish Barad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">MCI Medical License Number</label>
                <input
                  type="text"
                  placeholder="e.g. MCI-9901"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-cyan-500/20"
              >
                Enter Doctor Command Center
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
