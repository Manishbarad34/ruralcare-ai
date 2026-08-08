import React, { useState } from 'react';
import { UserCheck, Stethoscope, ShieldCheck, Zap, Lock, ArrowRight, X } from 'lucide-react';
import { db } from '../../db/database.js';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [role, setRole] = useState('kiosk');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [password, setPassword] = useState('123456');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'kiosk') {
      const villager = db.loginVillager(phone || name || 'Rahul Kumar', password);
      onLoginSuccess({ ...villager, role: 'kiosk' });
    } else {
      const doctor = db.loginDoctor(licenseNo || name || 'Dr. Manish Barad', password);
      onLoginSuccess({ ...doctor, role: 'doctor' });
    }
  };

  const handleQuickPatientLogin = () => {
    const villager = db.registerVillager({ name: 'Rahul Kumar', phone: '9876543210', village: 'Rampur Gram Panchayat' });
    onLoginSuccess({ ...villager, role: 'kiosk' });
  };

  const handleQuickDoctorLogin = () => {
    const doctor = db.registerDoctor({ name: 'Dr. Manish Barad', licenseNo: 'MCI-9901', specialty: 'General Physician' });
    onLoginSuccess({ ...doctor, role: 'doctor' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1 rounded-xl bg-slate-950 border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 font-black text-2xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-100">RuralCare AI Portal Sign In</h3>
          <p className="text-xs text-slate-400">Select role to access telemedicine portal</p>
        </div>

        {/* 1-Click Demo Quick Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleQuickDoctorLogin}
            className="py-2.5 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
          >
            <Stethoscope className="w-4 h-4 text-cyan-400" /> 1-Click Doctor
          </button>
          <button
            type="button"
            onClick={handleQuickPatientLogin}
            className="py-2.5 px-3 bg-teal-950 hover:bg-teal-900 border border-teal-500/50 text-teal-300 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
          >
            <UserCheck className="w-4 h-4 text-teal-400" /> 1-Click Patient
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono tracking-widest absolute">
            or manual login
          </span>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('kiosk')}
            className={`py-2 text-xs font-black rounded-xl transition ${
              role === 'kiosk' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Villager / Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-2 text-xs font-black rounded-xl transition ${
              role === 'doctor' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'
            }`}
          >
            Registered Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {role === 'kiosk' ? (
            <>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-teal-500"
                />
              </div>
            </>
          ) : (
            <>
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
                <label className="block text-slate-400 font-bold mb-1">MCI License Number</label>
                <input
                  type="text"
                  placeholder="e.g. MCI-9901"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            Enter Portal <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
