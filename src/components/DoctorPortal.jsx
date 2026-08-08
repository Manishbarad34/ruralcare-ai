import React, { useState, useEffect } from 'react';
import VideoConsultation from './VideoConsultation.jsx';
import DoctorChatModal from './DoctorChatModal.jsx';
import { db, syncServerStore } from '../../db/database.js';
import { Stethoscope, User, Video, MessageSquare, CheckCircle2, Clock, Droplet, PackageCheck, AlertTriangle, ShieldCheck, Heart, Sparkles, Inbox, RefreshCw, X, ChevronDown, Check } from 'lucide-react';

export default function DoctorPortal({ doctors = [], queue = [], inventory = [], onDispenseMedicine, loggedInDoctor }) {
  const [selectedDoctor, setSelectedDoctor] = useState(loggedInDoctor || doctors[0] || null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [activeChatModal, setActiveChatModal] = useState(null);
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [mailboxRequests, setMailboxRequests] = useState([]);

  useEffect(() => {
    if (loggedInDoctor) {
      setSelectedDoctor(loggedInDoctor);
    } else if (doctors && doctors.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctors[0]);
    }
  }, [loggedInDoctor, doctors]);

  // Real-time 1-Second Auto-Poll for Consultation Approval Mailbox
  useEffect(() => {
    const fetchMailbox = async () => {
      await syncServerStore();
      const mailbox = db.getApprovalMailbox();
      setMailboxRequests([...mailbox]);
    };

    fetchMailbox();
    const interval = setInterval(fetchMailbox, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDoctor = (e) => {
    const docId = e.target.value;
    const found = doctors.find(d => d.id === docId) || doctors[0];
    setSelectedDoctor(found);
  };

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

  const pendingRequests = mailboxRequests.filter(m => m.status === 'PENDING');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full">
      
      {/* Top Doctor Selection & Command Center Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              Medical Command Center Portal
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                Online
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Manage patient walk-in requests, approval mailbox, and video calls
            </p>
          </div>
        </div>

        {/* Doctor Switcher Dropdown Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-extrabold">
            <Stethoscope className="w-4 h-4 text-cyan-400" />
            <span>Select Active Doctor:</span>
          </div>

          <div className="relative w-full sm:w-64">
            <select
              value={selectedDoctor?.id || doctors[0]?.id || ''}
              onChange={handleSelectDoctor}
              className="w-full bg-slate-950 text-cyan-300 font-extrabold border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer focus:border-cyan-500 transition appearance-none pr-8"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Consultation Approval Mailbox Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-950 text-amber-300 rounded-xl border border-amber-800">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Patient Consultation Approval Mailbox
                {pendingRequests.length > 0 && (
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {pendingRequests.length} Pending
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
                    ? 'bg-amber-950/20 border-amber-500/60 text-slate-200'
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
                    req.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Symptoms / Reason:</span>
                  <p className="text-slate-300 font-medium mt-0.5">{req.symptoms || 'General Checkup Request'}</p>
                </div>

                {req.status === 'PENDING' ? (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateApproval(req.requestId, 'APPROVED')}
                      className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateApproval(req.requestId, 'DECLINED')}
                      className="py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700/50 text-rose-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => handleUpdateApproval(req.requestId, 'LATER')}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      Later
                    </button>
                  </div>
                ) : req.status === 'APPROVED' ? (
                  <button
                    onClick={() => handleStartConsultation({ queueId: req.requestId, villagerId: req.villagerId, villagerName: req.villagerName })}
                    className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5"
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

      {/* Live Priority Queue & Inventory Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Priority Patient Queue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                Approved Patient Priority Queue ({queue.length})
              </h3>
            </div>
          </div>

          {queue && queue.length > 0 ? (
            <div className="space-y-3">
              {queue.map((item, idx) => (
                <div
                  key={item.queueId || idx}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-cyan-500/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">{item.villagerName}</h4>
                      <p className="text-xs text-slate-400">Symptoms: {item.symptoms}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartConsultation(item)}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5 fill-current" /> Call
                    </button>

                    <button
                      onClick={() => setActiveChatModal(item)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400">
              No patients in active queue right now.
            </div>
          )}
        </div>

        {/* Remote Medicine Inventory Control */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                Kiosk Medicine Inventory & Remote Vending
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {inventory.map((med) => (
              <div
                key={med.id}
                className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mr-2">
                    {med.slot}
                  </span>
                  <span className="font-extrabold text-slate-200">{med.name}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Stock: {med.currentStock} {med.unit}</span>
                </div>

                <button
                  onClick={() => onDispenseMedicine(med.id, activeConsultation?.villagerId)}
                  className="px-3 py-1.5 bg-teal-950 hover:bg-teal-900 border border-teal-600/50 text-teal-300 font-bold rounded-xl text-xs transition"
                >
                  Remote Dispense
                </button>
              </div>
            ))}
          </div>
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
