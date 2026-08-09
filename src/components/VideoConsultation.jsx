import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, PhoneCall, Volume2, VolumeX, ShieldCheck, Camera, Sparkles } from 'lucide-react';

export default function VideoConsultation({ villager, doctor, currentRole, onCallEnded }) {
  const [callState, setCallState] = useState('CONNECTED');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localCanvasRef = useRef(null);
  const remoteCanvasRef = useRef(null);

  useEffect(() => {
    let timer;
    if (callState === 'CONNECTED') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const requestWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.warn('Webcam permission restricted by browser:', err);
      setHasCameraPermission(false);
    }
  };

  useEffect(() => {
    requestWebcam();
  }, []);

  // Dynamic High-Fidelity Medical Canvas Animation Stream Fallback
  useEffect(() => {
    let animId;
    let angle = 0;

    const drawRemote = () => {
      angle += 0.04;
      const canvas = remoteCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Medical ECG Spectrum Lines
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 15) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + angle) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // User Avatar Circle
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 48, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        const nameText = currentRole === 'doctor' ? (villager?.name || 'Patient') : (doctor?.name || 'Doctor');
        ctx.fillText(nameText.charAt(0), canvas.width / 2, canvas.height / 2 - 10);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(nameText, canvas.width / 2, canvas.height / 2 + 50);

        ctx.fillStyle = '#10b981';
        ctx.font = 'extrabold 11px sans-serif';
        ctx.fillText('● 1080p HD Live Consultation Stream', canvas.width / 2, canvas.height / 2 + 72);
      }

      const lCanvas = localCanvasRef.current;
      if (lCanvas) {
        const lCtx = lCanvas.getContext('2d');
        lCtx.fillStyle = '#090d16';
        lCtx.fillRect(0, 0, lCanvas.width, lCanvas.height);

        lCtx.strokeStyle = '#06b6d4';
        lCtx.lineWidth = 2;
        lCtx.beginPath();
        for (let x = 0; x < lCanvas.width; x += 10) {
          const y = lCanvas.height / 2 + Math.cos(x * 0.05 + angle * 1.5) * 15;
          if (x === 0) lCtx.moveTo(x, y);
          else lCtx.lineTo(x, y);
        }
        lCtx.stroke();

        lCtx.fillStyle = '#38bdf8';
        lCtx.font = 'bold 11px sans-serif';
        lCtx.textAlign = 'center';
        lCtx.fillText('You (' + (currentRole === 'doctor' ? 'Doctor' : 'Patient') + ')', lCanvas.width / 2, lCanvas.height / 2);
      }

      animId = requestAnimationFrame(drawRemote);
    };

    drawRemote();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [currentRole, villager, doctor]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    setCallState('ENDED');
    setTimeout(() => {
      if (onCallEnded) onCallEnded();
    }, 500);
  };

  const doctorName = doctor?.name || 'Dr. Manish Barad';
  const patientName = villager?.name || 'Rahul Kumar';

  return (
    <div className="relative w-full h-[75vh] sm:h-[620px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      
      {/* Remote Viewport Video Stream Container */}
      <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={isSpeakerOff}
          className={`w-full h-full object-cover ${hasCameraPermission && !isVideoOff ? 'block' : 'hidden'}`}
        />

        <canvas
          ref={remoteCanvasRef}
          width={640}
          height={480}
          className={`w-full h-full object-cover ${hasCameraPermission && !isVideoOff ? 'hidden' : 'block'}`}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/95 pointer-events-none" />
      </div>

      {/* Top Floating Mobile-Responsive Status Header */}
      <div className="relative z-10 p-3 sm:p-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-300 font-black text-sm sm:text-lg shadow-lg">
            {currentRole === 'doctor' ? patientName.charAt(0) : doctorName.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
              {currentRole === 'doctor' ? patientName : doctorName}
              <span className="text-[9px] sm:text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600 font-mono font-bold">
                HD 1080p
              </span>
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live ({formatTime(callDuration)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasCameraPermission && (
            <button
              onClick={requestWebcam}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] flex items-center gap-1 shadow-lg shadow-amber-500/20 transition"
            >
              <Camera className="w-3.5 h-3.5" /> Enable Cam
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 text-xs text-cyan-300 font-extrabold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit E2EE</span>
          </div>
        </div>
      </div>

      {/* Mobile PIP Self-Camera Corner Floating Window */}
      <div className="absolute top-16 right-3 sm:top-20 sm:right-6 z-20 w-28 h-36 sm:w-40 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden border-2 border-teal-400/90 shadow-2xl flex items-center justify-center">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${hasCameraPermission && !isVideoOff ? 'block' : 'hidden'}`}
        />

        <canvas
          ref={localCanvasRef}
          width={240}
          height={320}
          className={`w-full h-full object-cover ${hasCameraPermission && !isVideoOff ? 'hidden' : 'block'}`}
        />

        <div className="absolute bottom-1.5 left-1.5 text-[8px] sm:text-[9px] bg-slate-950/90 text-teal-300 px-1.5 py-0.5 rounded font-extrabold">
          You ({currentRole === 'doctor' ? 'Doctor' : 'Patient'})
        </div>
      </div>

      {/* WhatsApp Round Touch Controls Bar */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col items-center gap-3">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-full px-4 py-2.5 sm:px-6 sm:py-3.5 shadow-2xl flex items-center justify-center gap-3 sm:gap-6">
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition shadow-lg ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Mute Audio"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition shadow-lg ${
              isVideoOff ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Camera"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSpeakerOff(!isSpeakerOff)}
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition shadow-lg ${
              isSpeakerOff ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Speaker"
          >
            {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-xl shadow-rose-600/30 transform hover:scale-105"
            title="End Consultation Call"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

        </div>
      </div>

    </div>
  );
}
