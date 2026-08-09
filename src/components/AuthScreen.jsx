import React, { useState } from 'react';
import { Stethoscope, UserCheck, ShieldCheck, ArrowRight, Lock, User, Phone, FileText, Activity, Heart, Sparkles, CheckCircle2, Building2 } from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'doctor'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [village, setVillage] = useState('Rampur Gram Panchayat');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering
      ? {
          role: activeTab.toUpperCase(),
          fullName: fullName.trim(),
          email: identifier.includes('@') ? identifier.trim() : `${phone || Date.now()}@ruralcare.ai`,
          phone: phone.trim() || undefined,
          password: password.trim(),
          licenseNo: activeTab === 'doctor' ? licenseNo.trim() : undefined,
          specialty: activeTab === 'doctor' ? specialty : undefined,
          village: activeTab === 'patient' ? village : undefined
        }
      : {
          identifier: identifier.trim(),
          password: password.trim(),
          role: activeTab.toUpperCase()
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      if (data.token && data.user) {
        localStorage.setItem('RURALCARE_AUTH_TOKEN', data.token);
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Network error connecting to authentication server.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full select-none">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl w-full overflow-hidden">
        
        {/* LEFT COLUMN: Premium Healthcare SaaS Visual & Hero Section */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> SIH 2026 Telemedicine Platform
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Healthcare, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400">Connected.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
              Talk to verified doctors, perform instant AI symptom intakes in 10 Indian languages, receive digital prescriptions, and access automated kiosk pharmacy dispensing.
            </p>
          </div>

          {/* Animated Subtle Pulse Health Network Visualizer */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-teal-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400 animate-pulse" /> Live Tele-Health Network
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                256-bit Encrypted
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="block font-black text-slate-100 text-base">100%</span>
                <span className="text-[10px] text-slate-400">Verified Doctors</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="block font-black text-teal-300 text-base">10+</span>
                <span className="text-[10px] text-slate-400">Languages</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="block font-black text-cyan-300 text-base">HD 1080p</span>
                <span className="text-[10px] text-slate-400">WebRTC Video</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Row-Level Data Privacy</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Crisp Healthcare SaaS Authentication Card */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          
          {/* Role Selector Tabs */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('patient'); setErrorMsg(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                activeTab === 'patient'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Patient Portal
            </button>

            <button
              onClick={() => { setActiveTab('doctor'); setErrorMsg(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                activeTab === 'doctor'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Doctor Command Center
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/90 border border-rose-500 rounded-2xl text-xs text-rose-200 font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-black text-slate-100 text-base">
                {isRegistering ? `Create ${activeTab === 'doctor' ? 'Doctor' : 'Patient'} Account` : `Sign In to ${activeTab === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-teal-400 hover:underline font-bold text-xs"
              >
                {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
              </button>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder={activeTab === 'doctor' ? 'Dr. Manish Barad' : 'Rahul Barad'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500 transition font-bold"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {activeTab === 'doctor' ? 'Email / License Number / Phone' : 'Email or Mobile Phone Number'}
              </label>
              <input
                type="text"
                placeholder={activeTab === 'doctor' ? 'MCI-9901 or doctor@ruralcare.ai' : '9876543210 or patient@ruralcare.ai'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500 transition font-bold"
                required
              />
            </div>

            {isRegistering && activeTab === 'doctor' && (
              <div>
                <label className="block text-slate-400 font-bold mb-1">MCI License Number</label>
                <input
                  type="text"
                  placeholder="MCI-9901"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            )}

            {isRegistering && activeTab === 'patient' && (
              <div>
                <label className="block text-slate-400 font-bold mb-1">Village / Gram Panchayat Location</label>
                <input
                  type="text"
                  placeholder="Rampur Gram Panchayat, District Rajkot"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : isRegistering ? 'Complete Registration & Sign In' : 'Sign In Now'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
