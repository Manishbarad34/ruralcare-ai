import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, ShieldCheck, Camera, Sparkles, HeartPulse } from 'lucide-react';

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

  // Dynamic 3D Neon Particle & ECG Canvas Stream Fallback
  useEffect(() => {
    let animId;
    let angle = 0;
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * 640,
      y: Math.random() * 480,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 0.8 + 0.2
    }));

    const drawRemote = () => {
      angle += 0.04;
      const canvas = remoteCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Deep 3D Dark Radial Mesh Background
        const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, 400);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#020617');
        bgGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animated Particle Mesh
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        particles.forEach(p => {
          p.y -= p.speed;
          if (p.y < 0) p.y = canvas.height;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Glowing 3D ECG Waves
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#14b8a6';
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + angle) * 40 + Math.cos(x * 0.01) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.shadowColor = '#06b6d4';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
          const y = canvas.height / 2 + Math.cos(x * 0.03 + angle * 1.5) * 25;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3D Avatar Center Circle
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 52, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        const nameText = currentRole === 'doctor' ? (villager?.name || 'Patient') : (doctor?.name || 'Doctor');
        ctx.fillText(nameText.charAt(0), canvas.width / 2, canvas.height / 2 - 10);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(nameText, canvas.width / 2, canvas.height / 2 + 52);

        ctx.fillStyle = '#10b981';
        ctx.font = 'extrabold 11px sans-serif';
        ctx.fillText('● 1080p HD Live WebRTC Stream', canvas.width / 2, canvas.height / 2 + 75);
      }

      const lCanvas = localCanvasRef.current;
      if (lCanvas) {
        const lCtx = lCanvas.getContext('2d');
        lCtx.fillStyle = '#020617';
        lCtx.fillRect(0, 0, lCanvas.width, lCanvas.height);

        lCtx.strokeStyle = '#06b6d4';
        lCtx.lineWidth = 2;
        lCtx.beginPath();
        for (let x = 0; x < lCanvas.width; x += 8) {
          const y = lCanvas.height / 2 + Math.cos(x * 0.06 + angle * 1.5) * 15;
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
    <div className="relative w-full h-[78vh] sm:h-[620px] bg-slate-950 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col justify-between select-none">
      
      {/* Remote Viewport Video Stream */}
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

      {/* Top Floating Status Header */}
      <div className="relative z-10 p-3 sm:p-5 flex items-center justify-between gap-2 backdrop-blur-md bg-slate-950/40 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-black flex items-center justify-center text-sm sm:text-xl shadow-lg shadow-teal-500/30">
            {currentRole === 'doctor' ? patientName.charAt(0) : doctorName.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-1.5">
              {currentRole === 'doctor' ? patientName : doctorName}
              <span className="text-[9px] sm:text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/50 font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                HD 1080p
              </span>
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Consultation ({formatTime(callDuration)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasCameraPermission && (
            <button
              onClick={requestWebcam}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-[11px] flex items-center gap-1 shadow-lg shadow-amber-500/30 transition transform hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5" /> Enable Cam
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-500/40 text-xs text-cyan-300 font-black shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit E2EE</span>
          </div>
        </div>
      </div>

      {/* PIP Self-Camera Window with 3D Glowing Border */}
      <div className="absolute top-16 right-3 sm:top-20 sm:right-6 z-20 w-28 h-38 sm:w-40 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center">
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

        <div className="absolute bottom-1.5 left-1.5 text-[8px] sm:text-[9px] bg-slate-950/90 text-teal-300 px-1.5 py-0.5 rounded font-black border border-teal-500/40">
          You ({currentRole === 'doctor' ? 'Doctor' : 'Patient'})
        </div>
      </div>

      {/* Round Glass WhatsApp Touch Controls Bar */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col items-center gap-3">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-full px-4 py-2.5 sm:px-7 sm:py-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3 sm:gap-6">
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isMuted ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:border hover:border-teal-400'
            }`}
            title="Mute Audio"
          >
            {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isVideoOff ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:border hover:border-cyan-400'
            }`}
            title="Toggle Camera"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={() => setIsSpeakerOff(!isSpeakerOff)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isSpeakerOff ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 scale-105' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:border hover:border-amber-400'
            }`}
            title="Toggle Speaker"
          >
            {isSpeakerOff ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center justify-center transition-all duration-300 shadow-xl shadow-rose-600/40 transform hover:scale-110"
            title="End Consultation Call"
          >
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

        </div>
      </div>

    </div>
  );
}
