import React, { useState, useEffect } from 'react';
import VideoConsultation from './VideoConsultation.jsx';
import IncomingCallModal from './IncomingCallModal.jsx';
import DirectChatOverlay from './DirectChatOverlay.jsx';
import DeliveryPanel from './DeliveryPanel.jsx';
import { Stethoscope, User, Video, MessageSquare, CheckCircle2, Clock, PackageCheck, ShieldCheck, Inbox, X, Check, BellRing, Pill, Plus, Minus, Send, PhoneCall, Phone, Sparkles, Bell } from 'lucide-react';

export default function DoctorDashboard({ user, token, socket }) {
  const [activeTab, setActiveTab] = useState('active');
  const [mailboxRequests, setMailboxRequests] = useState([]);
  const [activeConsultation, setActiveConsultation] = useState(null);
  
  // Real Targeted WebSockets & Call/Chat Signaling State
  const [isCallingPatient, setIsCallingPatient] = useState(false);
  const [callingPatientName, setCallingPatientName] = useState('');
  const [callingTargetUserId, setCallingTargetUserId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // Floating Toast Notification State
  const [toastNotification, setToastNotification] = useState(null);

  // WhatsApp Direct Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatRequestId, setChatRequestId] = useState(null);

  // Prescription Generator State
  const [prescribeNotes, setPrescribeNotes] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([
    { medicineName: 'Paracetamol 500mg', dosage: '1 Tab', frequency: 'Twice daily', duration: '3 Days' }
  ]);
  const [successMsg, setSuccessMsg] = useState(null);

  const doctorProfile = user?.doctorProfile || { fullName: 'Dr. Practitioner', licenseNo: 'MCI-9901', specialty: 'General Physician' };

  // Audio Beep Generator for Calls and Messages
  const playAudioChime = (frequency = 440, type = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  // Attach Global Socket Listener
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔌 Doctor Dashboard Received WebSocket Signal:', data.type);

        if (data.type === 'call:invite') {
          playAudioChime(587.33, 'triangle');
          setIncomingCall({
            callerUserId: data.senderUserId,
            callerName: data.payload?.callerName || 'Patient',
            isVideo: data.payload?.isVideo !== false
          });
        } else if (data.type === 'call:accept') {
          playAudioChime(880, 'sine');
          setIsCallingPatient(false);
          setActiveConsultation({
            fullName: callingPatientName || 'Patient',
            targetUserId: callingTargetUserId
          });
        } else if (data.type === 'call:decline') {
          setIsCallingPatient(false);
          setIncomingCall(null);
          alert('Call was declined by patient.');
        } else if (data.type === 'chat:message') {
          playAudioChime(659.25, 'sine');
          setToastNotification({
            title: `💬 New Message`,
            message: data.payload?.text || 'Patient sent a message'
          });
          setTimeout(() => setToastNotification(null), 4000);
        }
      } catch (err) {}
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, callingPatientName, callingTargetUserId]);

  // Fetch Doctor's Consultation Mailbox
  const fetchDoctorMailbox = async () => {
    try {
      const res = await fetch('/api/consultations/doctor-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMailboxRequests(data.requests || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchDoctorMailbox();
    const interval = setInterval(fetchDoctorMailbox, 1000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRespondRequest = async (requestId, status) => {
    try {
      const res = await fetch(`/api/consultations/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchDoctorMailbox();
      }
    } catch (err) {}
  };

  // DOCTOR INITIATES CALL -> SENDS TARGETED WS SIGNAL TO PATIENT PHONE!
  const handleInitiateCallToPatient = (patientObj, isVideo = true) => {
    const targetPatientUserId = patientObj?.userId || patientObj?.user?.id;
    const targetPatientName = patientObj?.fullName || 'Patient';

    setCallingPatientName(targetPatientName);
    setCallingTargetUserId(targetPatientUserId);
    setIsCallingPatient(true);

    if (socket && socket.readyState === 1 && targetPatientUserId) {
      socket.send(JSON.stringify({
        type: 'call:invite',
        targetUserId: targetPatientUserId,
        payload: {
          callerName: doctorProfile.fullName,
          isVideo
        }
      }));
    }
  };

  const handleOpenChatWithPatient = (reqItem) => {
    const patientObj = reqItem.patient;
    setChatTargetUser({
      userId: patientObj?.userId || patientObj?.user?.id,
      fullName: patientObj?.fullName || 'Patient',
      village: patientObj?.village || 'Rampur Panchayat'
    });
    setChatRequestId(reqItem.id);
    setIsChatOpen(true);
  };

  const handleAcceptIncomingCall = () => {
    if (socket && socket.readyState === 1 && incomingCall?.callerUserId) {
      socket.send(JSON.stringify({
        type: 'call:accept',
        targetUserId: incomingCall.callerUserId
      }));
    }
    setActiveConsultation({
      fullName: incomingCall?.callerName || 'Patient',
      targetUserId: incomingCall?.callerUserId
    });
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = () => {
    if (socket && socket.readyState === 1 && incomingCall?.callerUserId) {
      socket.send(JSON.stringify({
        type: 'call:decline',
        targetUserId: incomingCall.callerUserId
      }));
    }
    setIncomingCall(null);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!activeConsultation?.id) return alert('No active consultation selected.');

    try {
      const res = await fetch('/api/consultations/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          consultationId: activeConsultation.id,
          notes: prescribeNotes,
          items: prescribedMeds
        })
      });

      if (res.ok) {
        setSuccessMsg('✅ Digital Prescription issued successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      alert('Failed to issue prescription.');
    }
  };

  const pendingRequests = mailboxRequests.filter(m => m.status === 'PENDING');
  const approvedRequests = mailboxRequests.filter(m => m.status === 'ACCEPTED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full px-2 sm:px-4 select-none">
      
      {/* Floating Notification Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border-2 border-teal-500 text-slate-100 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce max-w-xs">
          <Bell className="w-6 h-6 text-teal-400 flex-shrink-0 animate-pulse" />
          <div>
            <h4 className="font-black text-xs text-teal-300">{toastNotification.title}</h4>
            <p className="text-[11px] text-slate-200 font-medium">{toastNotification.message}</p>
          </div>
        </div>
      )}

      {/* WhatsApp Direct Chat Overlay Modal */}
      <DirectChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentRole="doctor"
        activeUser={user?.doctorProfile}
        peerUser={chatTargetUser}
        socket={socket}
        targetUserId={chatTargetUser?.userId}
        onStartCall={handleInitiateCallToPatient}
        requestId={chatRequestId}
        token={token}
      />

      {/* Incoming Call Ringing Modal from Patient */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* Ringing Overlay when Doctor calls Patient */}
      {isCallingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl p-6 text-center space-y-4 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 flex items-center justify-center mx-auto animate-ping">
              <PhoneCall className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-100">Ringing {callingPatientName}...</h3>
            <p className="text-xs text-slate-400 animate-pulse">Call invitation sent to patient's phone. Waiting for Patient to Accept...</p>
            <button
              onClick={() => {
                setIsCallingPatient(false);
                if (socket && socket.readyState === 1 && callingTargetUserId) {
                  socket.send(JSON.stringify({ type: 'call:decline', targetUserId: callingTargetUserId }));
                }
              }}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* DOCTOR COMMAND CENTER HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              Medical Command Center
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold">
                Logged In: {doctorProfile.fullName}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Specialty: {doctorProfile.specialty} • License: {doctorProfile.licenseNo} • WhatsApp Telemedicine Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs text-cyan-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>MCI Verified Doctor Session</span>
        </div>
      </div>

      {/* APPROVED ACTIVE PATIENT CONSULTATIONS DIRECTORY */}
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950 text-emerald-300 rounded-xl border border-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                Approved Active Patients Directory ({approvedRequests.length})
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                  Ready to Call & WhatsApp Chat
                </span>
              </h3>
              <p className="text-xs text-slate-400">Patients whose consultation requests have been approved by you</p>
            </div>
          </div>
        </div>

        {approvedRequests && approvedRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl border bg-slate-950 border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/60 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 flex items-center justify-center font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-100">{req.patient?.fullName || 'Patient'}</h4>
                      <p className="text-[11px] text-slate-400">Village: {req.patient?.village || 'Rampur'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-950 text-emerald-300 border-emerald-800">
                    APPROVED
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Symptoms:</span>
                  <p className="text-slate-300 font-medium">{req.symptoms}</p>
                </div>

                {/* 3 Action Buttons for Approved Patient: Video Call, Voice Call, Chat */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleInitiateCallToPatient(req.patient, true)}
                    className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 transform hover:scale-105"
                  >
                    <Video className="w-3.5 h-3.5 fill-current" /> Video Call
                  </button>

                  <button
                    onClick={() => handleInitiateCallToPatient(req.patient, false)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold rounded-xl text-[11px] border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> Voice Call
                  </button>

                  <button
                    onClick={() => handleOpenChatWithPatient(req)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold rounded-xl text-[11px] border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-500 space-y-1">
            <User className="w-6 h-6 mx-auto text-slate-600" />
            <p>No approved patients yet. Approve incoming requests from the Mailbox below to add patients to your active list.</p>
          </div>
        )}
      </div>

      {/* CONSULTATION APPROVAL MAILBOX SECTION */}
      <div className={`bg-slate-900/90 border rounded-3xl p-5 shadow-2xl space-y-4 transition-all duration-300 ${
        pendingRequests.length > 0 ? 'border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-slate-800'
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
                  <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black animate-bounce">
                    ⚡ {pendingRequests.length} PENDING REQUEST!
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {mailboxRequests.length} Total
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Walk-in requests specifically addressed to {doctorProfile.fullName}</p>
            </div>
          </div>
        </div>

        {mailboxRequests && mailboxRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mailboxRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl border bg-slate-950 border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 flex items-center justify-center font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-100">{req.patient?.fullName || 'Patient'}</h4>
                      <p className="text-[11px] text-slate-400">Village: {req.patient?.village || 'Rampur'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${req.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : req.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
                    {req.status}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Symptoms:</span>
                  <p className="text-slate-300 font-medium">{req.symptoms}</p>
                </div>

                {req.status === 'PENDING' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                      className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 font-extrabold"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Approve Request
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                      className="py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-800"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                ) : req.status === 'ACCEPTED' ? (
                  <button
                    onClick={() => handleInitiateCallToPatient(req.patient, true)}
                    className="w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transform hover:scale-[1.02]"
                  >
                    <Video className="w-4 h-4 fill-current" /> Call Patient Phone Now
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No pending consultation requests in mailbox currently.</p>
          </div>
        )}
      </div>

      {/* ACTIVE VIDEO CALL SESSION */}
      {activeConsultation && (
        <VideoConsultation
          villager={activeConsultation}
          doctor={doctorProfile}
          currentRole="doctor"
          onCallEnded={() => setActiveConsultation(null)}
          socket={socket}
          targetUserId={activeConsultation?.targetUserId}
        />
      )}

      {/* PRESCRIPTION GENERATOR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-400" />
            <h3 className="font-extrabold text-slate-100 text-base">Digital Prescription & Kiosk Dispenser Controls</h3>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Clinical Notes & Instructions</label>
            <input
              type="text"
              placeholder="Take medicines after meals. Drink warm fluids."
              value={prescribeNotes}
              onChange={(e) => setPrescribeNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-teal-500/20"
          >
            Issue Digital Prescription & Authorize Kiosk Dispense
          </button>
        </form>
      </div>

      <DeliveryPanel />

    </div>
  );
}
