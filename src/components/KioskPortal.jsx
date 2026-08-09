import React, { useState, useEffect } from 'react';
import FaceScanner from './FaceScanner.jsx';
import BloodTestModule from './BloodTestModule.jsx';
import AITriageChat from './AITriageChat.jsx';
import VideoConsultation from './VideoConsultation.jsx';
import VendingMachineDispenser from './VendingMachineDispenser.jsx';
import DoctorReviewChat from './DoctorReviewChat.jsx';
import { db, syncServerStore } from '../../db/database.js';
import { UserCheck, Droplet, Bot, Video, PackageCheck, Star, ArrowRight, CheckCircle2, Send, Zap, AlertCircle, Inbox, X } from 'lucide-react';

export default function KioskPortal({ villagers = [], doctors = [], inventory = [], aiProvider, isOffline, loggedInUser }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [identifiedVillager, setIdentifiedVillager] = useState(loggedInUser || villagers[0] || { id: 'VILL-101', name: 'Rahul Kumar', village: 'Rampur' });
  const [bloodReport, setBloodReport] = useState(null);
  const [triageDetails, setTriageDetails] = useState(null);
  const [assignedDoctor, setAssignedDoctor] = useState(doctors[0] || { id: 'DOC-01', name: 'Dr. Manish Barad', specialty: 'General Physician' });
  const [approvalRequest, setApprovalRequest] = useState(null);

  useEffect(() => {
    if (loggedInUser) {
      setIdentifiedVillager(loggedInUser);
    } else if (villagers && villagers.length > 0 && !identifiedVillager) {
      setIdentifiedVillager(villagers[0]);
    }
  }, [loggedInUser, villagers]);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      if (!assignedDoctor || !doctors.find(d => d.id === assignedDoctor.id)) {
        setAssignedDoctor(doctors[0]);
      }
    }
  }, [doctors]);

  // Real-time 500ms Auto-Poll for Patient Approval Mailbox Status
  useEffect(() => {
    const checkMailbox = async () => {
      await syncServerStore();
      const mailbox = db.getApprovalMailbox();
      const currentPatientId = identifiedVillager?.id || 'VILL-101';
      const myReq = mailbox.find(m => m.villagerId === currentPatientId || m.villagerName.includes(identifiedVillager?.name || 'Rahul'));
      if (myReq) {
        setApprovalRequest({ ...myReq });
      }
    };

    checkMailbox();
    const interval = setInterval(checkMailbox, 500);
    return () => clearInterval(interval);
  }, [identifiedVillager]);

  const steps = [
    { num: 1, label: 'Biometric Scan', icon: UserCheck },
    { num: 2, label: 'Blood Vitals', icon: Droplet },
    { num: 3, label: 'AI Triage', icon: Bot },
    { num: 4, label: 'Doctor Video Call', icon: Video },
    { num: 5, label: 'Medicine Dispenser', icon: PackageCheck },
    { num: 6, label: 'Feedback', icon: Star },
  ];

  const handleFaceIdentified = (villager) => {
    setIdentifiedVillager(villager);
  };

  const handleBloodTestComplete = (report) => {
    setBloodReport(report);
  };

  const handleSendDoctorApprovalRequest = (doc) => {
    const patientObj = identifiedVillager || { id: `VILL-${Math.floor(1000 + Math.random() * 9000)}`, name: 'Rahul Kumar (Patient)', village: 'Rampur' };
    const doctorObj = doc || assignedDoctor || { id: 'DOC-01', name: 'Dr. Manish Barad', specialty: 'General Physician' };

    setAssignedDoctor(doctorObj);

    const newReq = db.createConsultationRequest({
      villagerId: patientObj.id,
      villagerName: patientObj.name,
      doctorId: doctorObj.id,
      doctorName: doctorObj.name,
      symptoms: triageDetails?.symptoms || 'General Consultation Request',
      emergencyLevel: triageDetails?.riskLevel || 'MEDIUM'
    });

    setApprovalRequest(newReq);

    // Instant WebSocket trigger
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

  const startDirectVideoCall = (doc) => {
    const patientObj = identifiedVillager || { id: `VILL-${Math.floor(1000 + Math.random() * 9000)}`, name: 'Rahul Kumar (Patient)', village: 'Rampur' };
    const doctorObj = doc || assignedDoctor || { id: 'DOC-01', name: 'Dr. Manish Barad', specialty: 'General Physician' };

    setAssignedDoctor(doctorObj);

    db.addToQueue({
      queueId: `Q-${Math.floor(100 + Math.random() * 900)}`,
      villagerId: patientObj.id,
      villagerName: patientObj.name,
      symptoms: 'Direct Emergency Call Request',
      emergencyLevel: 'HIGH',
      assignedDoctor: doctorObj.name,
      joinedAt: new Date().toISOString()
    });
    setCurrentStep(4);
  };

  const handleTriageComplete = (triageData) => {
    setTriageDetails(triageData);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 w-full overflow-x-hidden px-2 sm:px-4">
      
      {/* Available Registered Online Doctors Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-extrabold text-slate-200">
            Available Registered Online Doctors ({doctors.length > 0 ? doctors.length : 1}):
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {(doctors && doctors.length > 0 ? doctors : [
            { id: 'DOC-01', name: 'Dr. Manish Barad', specialty: 'General Physician' }
          ]).map((d) => (
            <div
              key={d.id}
              className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                assignedDoctor?.id === d.id
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-black text-sm">{d.name}</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {d.specialty || 'General Physician'}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => startDirectVideoCall(d)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-[11px] shadow-md shadow-teal-500/20 flex items-center justify-center gap-1 hover:opacity-90 transition transform hover:scale-105"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" /> Direct Call
                </button>

                <button
                  onClick={() => handleSendDoctorApprovalRequest(d)}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-black rounded-xl text-[11px] border border-slate-700 flex items-center justify-center gap-1 transition shadow-lg hover:border-teal-400"
                >
                  <Send className="w-3.5 h-3.5" /> Request Approval
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Approval Status Banner for Patient */}
      {approvalRequest && (
        <div className={`p-4 sm:p-5 rounded-3xl border text-xs sm:text-sm font-extrabold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl ${
          approvalRequest.status === 'APPROVED'
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-500/20'
            : approvalRequest.status === 'DECLINED'
            ? 'bg-rose-950/90 border-rose-500 text-rose-200'
            : 'bg-amber-950/90 border-amber-500 text-amber-200 animate-pulse'
        }`}>
          <div className="flex items-center gap-3">
            {approvalRequest.status === 'APPROVED' && <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
            {approvalRequest.status === 'DECLINED' && <X className="w-6 h-6 text-rose-400 flex-shrink-0" />}
            {approvalRequest.status === 'PENDING' && <Inbox className="w-6 h-6 text-amber-400 flex-shrink-0 animate-bounce" />}
            <div>
              <span className="block font-black text-sm">
                {approvalRequest.status === 'APPROVED' && `✅ REQUEST APPROVED BY ${approvalRequest.doctorName}!`}
                {approvalRequest.status === 'DECLINED' && `❌ Request declined by ${approvalRequest.doctorName}.`}
                {approvalRequest.status === 'PENDING' && `📩 REQUEST SENT TO ${approvalRequest.doctorName}!`}
              </span>
              <span className="text-xs opacity-90">
                {approvalRequest.status === 'APPROVED' && `You are added to the Doctor's Live Patient Queue. Click Start Video Call to connect.`}
                {approvalRequest.status === 'DECLINED' && `Please select another doctor or contact the kiosk operator.`}
                {approvalRequest.status === 'PENDING' && `Status: Waiting for ${approvalRequest.doctorName} to click Approve in their Consultation Mailbox...`}
              </span>
            </div>
          </div>

          {approvalRequest.status === 'APPROVED' && (
            <button
              onClick={() => setCurrentStep(4)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition transform hover:scale-105"
            >
              Start Video Call Now <Video className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Kiosk Step Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between overflow-x-auto gap-2 py-1 scrollbar-none">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;

            return (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer transition whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 font-black shadow-lg shadow-teal-500/30 scale-105'
                    : isDone
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-600/40'
                    : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-slate-950 text-teal-400' : 'bg-slate-900'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs">{s.label}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="transition-all duration-300">
        
        {currentStep === 1 && (
          <FaceScanner
            villagers={villagers}
            onIdentify={handleFaceIdentified}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <BloodTestModule
            villager={identifiedVillager}
            onComplete={handleBloodTestComplete}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <AITriageChat
            villager={identifiedVillager}
            bloodReport={bloodReport}
            aiProvider={aiProvider}
            onComplete={handleTriageComplete}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                  Consulting Doctor: <span className="text-teal-300">{assignedDoctor?.name || 'Doctor Panel'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Specialty: {assignedDoctor?.specialty || 'General Physician'} • Real-time WebRTC 2-Way HD Video Call
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                Skip to Medicine <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <VideoConsultation
              villager={identifiedVillager}
              doctor={assignedDoctor}
              currentRole="kiosk"
              onCallEnded={() => setCurrentStep(5)}
            />
          </div>
        )}

        {currentStep === 5 && (
          <VendingMachineDispenser
            inventory={inventory}
            onNext={() => setCurrentStep(6)}
          />
        )}

        {currentStep === 6 && (
          <DoctorReviewChat
            villager={identifiedVillager}
            doctor={assignedDoctor}
            aiProvider={aiProvider}
            onFinish={() => setCurrentStep(1)}
          />
        )}

      </div>

    </div>
  );
}
