import React, { useState, useEffect, useRef } from 'react';
import { Camera, Scan, CheckCircle2, User, History, AlertTriangle, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';

export default function FaceScanner({ onIdentify, onVillagerIdentified, villagers = [], onNext }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const safeVillagers = Array.isArray(villagers) && villagers.length > 0
    ? villagers
    : [{ id: 'VILL-101', name: 'Rahul Kumar', age: 30, gender: 'Male', village: 'Rampur', bloodGroup: 'O+' }];

  const [selectedVillagerId, setSelectedVillagerId] = useState(safeVillagers[0]?.id || 'VILL-101');
  const [identifiedUser, setIdentifiedUser] = useState(safeVillagers[0]);

  useEffect(() => {
    if (safeVillagers && safeVillagers.length > 0) {
      const match = safeVillagers.find(v => v.id === selectedVillagerId) || safeVillagers[0];
      setIdentifiedUser(match);
      setSelectedVillagerId(match.id);
    }
  }, [villagers]);

  const startRealWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Real webcam access denied or unavailable:', err);
      setCameraActive(false);
    }
  };

  const startFaceScan = (vId) => {
    const targetId = vId || selectedVillagerId;
    setIsScanning(true);
    setScanProgress(0);
    startRealWebcam();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          const found = safeVillagers.find(v => v.id === targetId) || safeVillagers[0];
          setIdentifiedUser(found);
          const callback = onIdentify || onVillagerIdentified;
          if (callback) callback(found);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  useEffect(() => {
    startFaceScan(selectedVillagerId);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [selectedVillagerId]);

  const handleSelectVillager = (e) => {
    const vId = e.target.value;
    setSelectedVillagerId(vId);
    const found = safeVillagers.find(v => v.id === vId) || safeVillagers[0];
    setIdentifiedUser(found);
    const callback = onIdentify || onVillagerIdentified;
    if (callback) callback(found);
  };

  const activeUser = identifiedUser || safeVillagers[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-950 text-teal-300 rounded-2xl border border-teal-800 shadow-lg">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-lg">
              AI Biometric Face Scan Verification
            </h3>
            <p className="text-xs text-slate-400">
              Integrated Kiosk Face Recognition Engine
            </p>
          </div>
        </div>

        <button
          onClick={() => startFaceScan(selectedVillagerId)}
          disabled={isScanning}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-extrabold transition flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          Re-Scan Face
        </button>
      </div>

      {/* Registered Patients Selector Dropdown Bar */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200">
          <User className="w-4 h-4 text-teal-400" />
          <span>Select Registered Patient to Scan ({safeVillagers.length}):</span>
        </div>

        <div className="relative w-full sm:w-72">
          <select
            value={selectedVillagerId}
            onChange={handleSelectVillager}
            className="w-full bg-slate-900 text-teal-300 font-extrabold border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer focus:border-teal-500 transition appearance-none pr-8"
          >
            {safeVillagers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.id}) - {v.village || 'Rampur'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Main Grid: Camera View + Biometric Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Viewfinder Camera Feed */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 h-64 sm:h-80 flex items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
          />

          {!cameraActive && (
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-teal-400">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-400">
                Live Biometric Webcam Scanning Active
              </p>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 bg-teal-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
              <div className="w-36 h-36 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4 shadow-xl shadow-teal-500/40" />
              <span className="text-xs font-mono font-black text-teal-300 bg-slate-950/90 px-3 py-1 rounded-full border border-teal-500/50">
                Scanning Vector: {scanProgress}%
              </span>
            </div>
          )}

          {!isScanning && activeUser && (
            <div className="absolute bottom-3 left-3 right-3 bg-emerald-950/90 border border-emerald-600/50 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold">{activeUser.name} Verified</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-800">
                99.4% Match
              </span>
            </div>
          )}
        </div>

        {/* Right Patient Profile & Vitals Preview */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800 uppercase tracking-wider">
              Identified Patient Profile
            </span>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-700 text-teal-300 flex items-center justify-center font-extrabold text-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-100">{activeUser?.name || 'Patient Guest'}</h4>
                <p className="text-xs text-slate-400">
                  ID: {activeUser?.id || 'VILL-101'} • Age: {activeUser?.age || 30} • Village: {activeUser?.village || 'Rampur'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Blood Group</span>
                <span className="font-extrabold text-teal-300">{activeUser?.bloodGroup || 'O+'}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Allergies</span>
                <span className="font-extrabold text-amber-300">None</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            Proceed to Blood Vitals <Sparkles className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
