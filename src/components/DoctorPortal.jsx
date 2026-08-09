import React, { useState, useEffect } from 'react';
import VideoConsultation from './VideoConsultation.jsx';
import DoctorChatModal from './DoctorChatModal.jsx';
import { db, syncServerStore } from '../../db/database.js';
import { Stethoscope, User, Video, MessageSquare, CheckCircle2, Clock, Droplet, PackageCheck, AlertTriangle, ShieldCheck, Heart, Sparkles, Inbox, RefreshCw, X, ChevronDown, Check, BellRing, Pill, Plus, Minus, Send, Zap } from 'lucide-react';

export default function DoctorPortal({ doctors = [], queue = [], inventory = [], onDispenseMedicine, loggedInDoctor }) {
  const [selectedDoctor, setSelectedDoctor] = useState(loggedInDoctor || doctors[0] || { id: 'DOC-01', name: 'Dr. Manish Barad', specialty: 'General Physician' });
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [activeChatModal, setActiveChatModal] = useState(null);
  const [mailboxRequests, setMailboxRequests] = useState([]);
  
  // Dosage & Prescription State
  const [selectedDosage, setSelectedDosage] = useState({}); // { medId: quantity }
  const [dispenseSuccessMsg, setDispenseSuccessMsg] = useState(null);

  useEffect(() => {
    if (loggedInDoctor) {
      setSelectedDoctor(loggedInDoctor);
    } else if (doctors && doctors.length > 0) {
      setSelectedDoctor(doctors[0]);
    }
  }, [loggedInDoctor, doctors]);

  // Real-time 500ms Instant Auto-Poll for Consultation Approval Mailbox
  useEffect(() => {
    const fetchMailbox = async () => {
      await syncServerStore();
      const mailbox = db.getApprovalMailbox();
      setMailboxRequests([...mailbox]);
    };

    fetchMailbox();
    const interval = setInterval(fetchMailbox, 500);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateApproval = (requestId, status) => {
    db.updateApprovalStatus(requestId, status);
    const updated = db.getApprovalMailbox();
    setMailboxRequests([...updated]);

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host || 'localhost:5000';
      const ws = new WebSocket(`${wsProtocol}//${wsHost}`);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'data-update' }));
        setTimeout(() => ws.close(), 300);
      };
    } catch (e) {}
  };

  const handleStartConsultation = (patient) => {
    setActiveConsultation(patient);
    setActiveVideoCall(patient);
  };

  const handleQuantityChange = (medId, delta) => {
    setSelectedDosage((prev) => {
      const current = prev[medId] || 1;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [medId]: next };
    });
  };

  const handleDispenseWithDosage = (med) => {
    const qty = selectedDosage[med.id] || 1;
    const result = db.dispenseMedicine(med.id, qty, activeConsultation?.villagerId, selectedDoctor?.name);
    if (result.success) {
      setDispenseSuccessMsg(`✅ Prescribed & Dispensed ${qty} ${med.unit} of ${med.name} from ${med.slot}!`);
      setTimeout(() => setDispenseSuccessMsg(null), 3000);
    } else {
      alert(`Insufficient stock! Current stock: ${med.currentStock}`);
    }
  };

  const pendingRequests = mailboxRequests.filter(m => m.status === 'PENDING');

  // Common Disease Quick Dispense Categories
  const categories = [
    { title: '🌡️ Fever / Cold / Flu', slot: 'Slot A1', medId: 'MED-1' },
    { title: '🧫 Bacterial Infection', slot: 'Slot A2 & B1', medId: 'MED-2' },
    { title: '🤧 Allergy / Cough', slot: 'Slot B2', medId: 'MED-4' },
    { title: '💧 Dehydration / Diarrhea', slot: 'Slot C1', medId: 'MED-5' },
    { title: '🩸 Diabetes / Blood Sugar', slot: 'Slot C2', medId: 'MED-6' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full">
      
      {/* Top Doctor Selection & Active Real Doctor Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              Medical Command Center Portal
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Logged In: {selectedDoctor?.name || 'Dr. Manish Barad'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Specialty: {selectedDoctor?.specialty || 'General Physician'} • License: {selectedDoctor?.licenseNo || 'MCI-9901'}
            </p>
          </div>
        </div>

        {/* Real Active Doctor Status Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs text-cyan-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real MCI Verified Doctor Session</span>
        </div>

      </div>

      {/* Consultation Approval Mailbox Section */}
      <div className={`bg-slate-900/90 border rounded-3xl p-5 shadow-2xl space-y-4 transition-all duration-300 ${
        pendingRequests.length > 0
          ? 'border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
          : 'border-slate-800'
      }`}>
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${pendingRequests.length > 0 ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
              {pendingRequests.length > 0 ? <BellRing className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Patient Consultation Approval Mailbox
                {pendingRequests.length > 0 ? (
                  <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black animate-bounce shadow-lg">
                    ⚡ {pendingRequests.length} NEW REQUEST PENDING APPROVAL!
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {mailboxRequests.length} Total
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Incoming walk-in requests submitted from village kiosks</p>
            </div>
          </div>
        </div>

        {mailboxRequests && mailboxRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mailboxRequests.map((req) => (
              <div
                key={req.requestId}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition shadow-lg ${
                  req.status === 'PENDING'
                    ? 'bg-amber-950/40 border-amber-500 text-slate-200 shadow-amber-500/20 ring-1 ring-amber-500/50'
                    : req.status === 'APPROVED'
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-extrabold flex items-center justify-center text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">{req.villagerName}</h4>
                      <p className="text-[11px] text-slate-400">ID: {req.villagerId} • Requested: {req.requestedAt}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded-full border ${
                    req.status === 'PENDING' ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-black' :
                    req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Symptoms / Reason:</span>
                  <p className="text-slate-300 font-medium">{req.symptoms || 'General Checkup Request'}</p>
                </div>

                {req.status === 'PENDING' ? (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateApproval(req.requestId, 'APPROVED')}
                      className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1 transform hover:scale-105"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateApproval(req.requestId, 'DECLINED')}
                      className="py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => handleUpdateApproval(req.requestId, 'LATER')}
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      Later
                    </button>
                  </div>
                ) : req.status === 'APPROVED' ? (
                  <button
                    onClick={() => handleStartConsultation({ queueId: req.requestId, villagerId: req.villagerId, villagerName: req.villagerName })}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 transform hover:scale-[1.02]"
                  >
                    <Video className="w-4 h-4 fill-current" /> Start Video Consultation
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No consultation requests in mailbox currently.</p>
          </div>
        )}

      </div>

      {/* Active Video Call Window */}
      {activeVideoCall && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Video className="w-5 h-5" />
              <span>Live Consultation Session with {activeVideoCall.villagerName || 'Patient'}</span>
            </div>
            <button
              onClick={() => setActiveVideoCall(null)}
              className="px-3 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-300 font-bold rounded-xl text-xs"
            >
              Minimize Video Window
            </button>
          </div>

          <VideoConsultation
            villager={{ name: activeVideoCall.villagerName, id: activeVideoCall.villagerId }}
            doctor={selectedDoctor}
            currentRole="doctor"
            onCallEnded={() => setActiveVideoCall(null)}
          />
        </div>
      )}

      {/* Real AI Prescription & Dosage Selection Section */}
      <div className="bg-slate-900/90 border border-teal-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-950 text-teal-300 rounded-xl border border-teal-700">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                🤖 Doctor AI Clinical Prescription & Kiosk Dispenser Control
              </h3>
              <p className="text-xs text-slate-400">Select medicine, adjust exact tablet/strip dosage, and trigger automated kiosk delivery</p>
            </div>
          </div>
        </div>

        {dispenseSuccessMsg && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-xs font-black text-emerald-300 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{dispenseSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((med) => {
            const qty = selectedDosage[med.id] || 1;
            return (
              <div
                key={med.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-teal-500/60 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {med.slot}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Stock: {med.currentStock} {med.unit}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-100 mt-2">{med.name}</h4>
                  <span className="text-xs text-teal-300 block font-semibold">{med.category}</span>
                  <p className="text-[10px] text-slate-400 italic mt-1 font-mono">{med.recommendedDosage}</p>
                </div>

                {/* Dosage Quantity Selector (1 Tab, 2 Tabs, 3 Strips, etc.) */}
                <div className="pt-2 border-t border-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Prescribe Quantity:</span>
                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleQuantityChange(med.id, -1)}
                        className="p-1 text-slate-400 hover:text-slate-100 bg-slate-950 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-teal-300 text-xs w-4 text-center">{qty}</span>
                      <button
                        onClick={() => handleQuantityChange(med.id, 1)}
                        className="p-1 text-slate-400 hover:text-slate-100 bg-slate-950 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispenseWithDosage(med)}
                    className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 transform hover:scale-[1.02]"
                  >
                    <PackageCheck className="w-4 h-4" /> Dispense {qty} {med.unit} Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <DoctorChatModal
        isOpen={!!activeChatModal}
        onClose={() => setActiveChatModal(null)}
        patient={activeChatModal}
        doctor={selectedDoctor}
      />

    </div>
  );
}
