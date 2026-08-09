import React, { useState, useEffect, useRef } from 'react';
import AITriageChat from './AITriageChat.jsx';
import MedicineMarketplace from './MedicineMarketplace.jsx';
import VideoConsultation from './VideoConsultation.jsx';
import IncomingCallModal from './IncomingCallModal.jsx';
import { User, Stethoscope, Bot, Mic, Video, PackageCheck, Send, CheckCircle2, AlertTriangle, Globe, Sparkles, Inbox, PhoneCall, ShoppingBag, FileText, Clock } from 'lucide-react';

export default function PatientDashboard({ user, token }) {
  const [activeTab, setActiveTab] = useState('intake');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Doctors & Requests State
  const [doctorsList, setDoctorsList] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeConsultation, setActiveConsultation] = useState(null);
  
  // Targeted Call Signaling State
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallingDoctor, setIsCallingDoctor] = useState(false);
  const [callingDoctorName, setCallingDoctorName] = useState('');

  const wsRef = useRef(null);
  const patientName = user?.patientProfile?.fullName || user?.email?.split('@')[0] || 'Patient';

  const quickSymptoms = [
    { label: '🤒 Fever', text: 'I have high body temperature and fever for 2 days.' },
    { label: '🤧 Cold / Cough', text: 'I am experiencing runny nose, sore throat, and continuous cough.' },
    { label: '🤕 Pain', text: 'I have a severe headache and body muscle pain.' },
    { label: '🩹 Injury', text: 'I sustained a minor physical skin cut/wound.' },
    { label: '💊 Medicine Question', text: 'What is the dosage for Paracetamol 500mg?' },
    { label: '❤️ Other Symptoms', text: 'I am feeling general weakness and dizziness.' },
  ];

  const languages = [
    'English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Urdu'
  ];

  // Setup Targeted Authenticated WebSocket Client Connection
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host || 'localhost:5000';
    const wsUrl = `${wsProtocol}//${wsHost}?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔌 Patient WebSocket Event Received:', data.type);

        if (data.type === 'call:invite') {
          // Doctor is calling Patient -> Ringing modal pops up on Patient's phone!
          setIncomingCall({
            callerUserId: data.senderUserId,
            callerName: data.payload?.callerName || 'Doctor',
            isVideo: true
          });
        } else if (data.type === 'call:accept') {
          setIsCallingDoctor(false);
          setActiveTab('consultation');
        } else if (data.type === 'call:decline') {
          setIsCallingDoctor(false);
          setIncomingCall(null);
          alert('Call was declined.');
        }
      } catch (err) {}
    };

    return () => {
      ws.close();
    };
  }, [token]);

  // Fetch Available Doctors Directory from Backend DB
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctorsList(data.doctors || []);
      }
    } catch (err) {}
  };

  // Fetch Patient's Private Request Statuses
  const fetchPatientRequests = async () => {
    try {
      const res = await fetch('/api/consultations/patient-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.requests || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatientRequests();
    const interval = setInterval(fetchPatientRequests, 2000);
    return () => clearInterval(interval);
  }, [token]);

  // Voice Input SpeechRecognition Setup
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage === 'Hindi' ? 'hi-IN' : selectedLanguage === 'Gujarati' ? 'gu-IN' : 'en-US';

    recognition.onstart = () => setIsRecordingVoice(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptomsInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecordingVoice(false);
    };
    recognition.onerror = () => setIsRecordingVoice(false);
    recognition.onend = () => setIsRecordingVoice(false);

    recognition.start();
  };

  const handleRequestDoctorConsultation = async (doctor) => {
    try {
      const res = await fetch('/api/consultations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          symptoms: symptomsInput || 'General Patient Consultation Request',
          urgency: 'MEDIUM'
        })
      });

      if (res.ok) {
        alert(`Consultation request sent to ${doctor.fullName}!`);
        fetchPatientRequests();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit consultation request.');
      }
    } catch (err) {
      alert('Error connecting to consultation server.');
    }
  };

  const handleAcceptDoctorCall = () => {
    if (wsRef.current && wsRef.current.readyState === 1 && incomingCall?.callerUserId) {
      wsRef.current.send(JSON.stringify({
        type: 'call:accept',
        targetUserId: incomingCall.callerUserId
      }));
    }
    setActiveConsultation({ fullName: incomingCall?.callerName || 'Doctor' });
    setIncomingCall(null);
    setActiveTab('consultation');
  };

  const handleDeclineDoctorCall = () => {
    if (wsRef.current && wsRef.current.readyState === 1 && incomingCall?.callerUserId) {
      wsRef.current.send(JSON.stringify({
        type: 'call:decline',
        targetUserId: incomingCall.callerUserId
      }));
    }
    setIncomingCall(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full px-2 sm:px-4 select-none">
      
      {/* Incoming Call Ringing Modal on Patient's Phone */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={handleAcceptDoctorCall}
        onDecline={handleDeclineDoctorCall}
      />

      {/* Ringing Overlay when Patient calls Doctor */}
      {isCallingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-teal-500 rounded-3xl p-6 text-center space-y-4 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 border-2 border-teal-400 flex items-center justify-center mx-auto animate-ping">
              <PhoneCall className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-100">Calling {callingDoctorName}...</h3>
            <p className="text-xs text-slate-400 animate-pulse">Ringing... Waiting for Doctor to Accept</p>
            <button onClick={() => setIsCallingDoctor(false)} className="px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* PATIENT FIRST HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Good day, <span className="text-teal-400">{patientName}</span> 👋
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-bold mt-1">
              How are you feeling today? Describe symptoms or ask any medical question.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300 w-full md:w-auto">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>AI Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-900 text-teal-300 font-extrabold outline-none px-2 py-1 rounded-xl border border-slate-800 cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Symptom Voice Input & Quick Chips Bar */}
        <div className="pt-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder={`Describe symptoms in ${selectedLanguage} (e.g. fever, headache, indigestion)...`}
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 outline-none focus:border-teal-500 font-medium"
            />
            
            <button
              onClick={handleVoiceInput}
              className={`w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 border ${
                isRecordingVoice
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" /> {isRecordingVoice ? 'Recording Voice...' : '🎙 Speak Voice'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {quickSymptoms.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setSymptomsInput(chip.text)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('intake')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'intake' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' : 'bg-slate-950 text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4" /> AI Symptom Triage
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'doctors' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' : 'bg-slate-950 text-slate-400'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Available Doctors ({doctorsList.length})
          </button>

          <button
            onClick={() => setActiveTab('pharmacy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'pharmacy' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' : 'bg-slate-950 text-slate-400'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Medicine Marketplace
          </button>
        </div>
      </div>

      {/* TAB CONTENT: AI SYMPTOM TRIAGE */}
      {activeTab === 'intake' && (
        <AITriageChat
          villager={user?.patientProfile}
          initialSymptoms={symptomsInput}
          selectedLanguage={selectedLanguage}
          onNext={() => setActiveTab('doctors')}
        />
      )}

      {/* TAB CONTENT: AVAILABLE DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-400" />
              Verified Telemedicine Doctors Directory ({doctorsList.length})
            </h3>
          </div>

          {doctorsList && doctorsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctorsList.map((doc) => (
                <div key={doc.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-teal-500/50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-slate-100 text-sm">{doc.fullName}</h4>
                      <p className="text-xs text-teal-300 font-semibold">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.experienceYears} Yrs Experience • {doc.languages}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.isOnline ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                      {doc.isOnline ? '● Online' : 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleRequestDoctorConsultation(doc)}
                      className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Request Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-500 space-y-2">
              <Stethoscope className="w-8 h-8 mx-auto text-slate-600" />
              <p>No doctors currently registered in directory.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEDICINE MARKETPLACE */}
      {activeTab === 'pharmacy' && (
        <MedicineMarketplace token={token} user={user} />
      )}

      {/* TAB CONTENT: ACTIVE CONSULTATION VIDEO CALL */}
      {activeTab === 'consultation' && (
        <VideoConsultation
          villager={user?.patientProfile}
          doctor={activeConsultation || { fullName: 'Consulting Doctor' }}
          currentRole="patient"
          onCallEnded={() => setActiveTab('intake')}
        />
      )}

    </div>
  );
}
