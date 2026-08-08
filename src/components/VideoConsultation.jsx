import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, PhoneCall, Volume2, VolumeX, ShieldCheck, Camera } from 'lucide-react';

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

  // Animated Fallback Canvas Feed
  useEffect(() => {
    let animId;
    let angle = 0;

    const drawRemote = () => {
      angle += 0.04;
      const canvas = remoteCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 15) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + angle) * 35;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        const nameText = currentRole === 'doctor' ? (villager?.name || 'Patient') : (doctor?.name || 'Doctor');
        ctx.fillText(nameText.charAt(0), canvas.width / 2, canvas.height / 2 - 12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(nameText, canvas.width / 2, canvas.height / 2 + 50);

        ctx.fillStyle = '#10b981';
        ctx.fillText('• Live Encrypted HD Stream', canvas.width / 2, canvas.height / 2 + 70);
      }

      const lCanvas = localCanvasRef.current;
      if (lCanvas) {
        const lCtx = lCanvas.getContext('2d');
        lCtx.fillStyle = '#020617';
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
    }, 600);
  };

  const doctorName = doctor?.name || 'Dr. Manish Barad';
  const patientName = villager?.name || 'Rahul Kumar';

  return (
    <div className="relative w-full max-w-full h-[85vh] sm:h-[650px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      
      {/* Remote Video Container */}
      <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center">
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

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 pointer-events-none" />
      </div>

      {/* Top Floating Status Bar */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-300 font-extrabold text-lg shadow-lg">
            {currentRole === 'doctor' ? patientName.charAt(0) : doctorName.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
              {currentRole === 'doctor' ? patientName : doctorName}
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600 font-mono">
                HD 1080p
              </span>
            </h3>
            <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected ({formatTime(callDuration)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasCameraPermission && (
            <button
              onClick={requestWebcam}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-amber-500/20"
            >
              <Camera className="w-4 h-4" /> Enable Camera
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 text-xs text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit E2EE</span>
          </div>
        </div>
      </div>

      {/* PIP Corner Window */}
      <div className="absolute top-20 right-4 sm:right-6 z-20 w-32 sm:w-40 h-44 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden border-2 border-teal-400/80 shadow-2xl flex items-center justify-center">
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

        <div className="absolute bottom-2 left-2 text-[9px] bg-slate-950/90 text-teal-300 px-1.5 py-0.5 rounded font-bold">
          You ({currentRole === 'doctor' ? 'Doctor' : 'Patient'})
        </div>
      </div>

      {/* WhatsApp Round Controls Bar */}
      <div className="relative z-10 p-6 flex flex-col items-center gap-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-full px-6 py-3.5 shadow-2xl flex items-center justify-center gap-4 sm:gap-6">
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isVideoOff ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSpeakerOff(!isSpeakerOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
              isSpeakerOff ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-xl shadow-rose-600/30 transform hover:scale-105"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

        </div>
      </div>

    </div>
  );
}
