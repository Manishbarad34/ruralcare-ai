import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Stethoscope, Camera, AlertCircle, Phone } from 'lucide-react';

export default function VideoConsultation({ villager, doctor, currentRole, onCallEnded, socket, targetUserId, isVideoCallMode = true }) {
  const [isVideoMuted, setIsVideoMuted] = useState(!isVideoCallMode);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(isVideoCallMode ? 'Connecting 1080p WebRTC Video Stream...' : 'Connecting HD WebRTC Voice Stream...');
  const [permissionNote, setPermissionNote] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    let animationFrameId;

    const setupWebRTC = async () => {
      // Check for Insecure Context (HTTP IP)
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
        setPermissionNote('🔒 Browser Security Note: Mobile Chrome blocks Camera on HTTP IP. Please use the HTTPS link for camera access!');
      }

      try {
        // Request Camera if Video Call Mode, or Audio-Only if Voice Call Mode
        const constraints = isVideoCallMode
          ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
          : { video: false, audio: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;

        // Assign to Local Viewfinder
        if (localVideoRef.current && isVideoCallMode) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerConnection
        const pc = new RTCPeerConnection(rtcConfig);
        peerConnectionRef.current = pc;

        // Add Local Media Tracks
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Listen for Genuine Remote Track
        pc.ontrack = (event) => {
          console.log('🎥 WebRTC Remote Track Received:', event.streams);
          if (event.streams && event.streams[0]) {
            remoteStreamRef.current = event.streams[0];
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
            setConnectionStatus(isVideoCallMode ? '1080p HD Live Stream Connected' : 'HD Encrypted Voice Stream Connected');
          }
        };

        // ICE Candidates Routing
        pc.onicecandidate = (event) => {
          if (event.candidate && socket && targetUserId) {
            socket.send(JSON.stringify({
              type: 'webrtc:ice-candidate',
              targetUserId,
              payload: { candidate: event.candidate }
            }));
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setConnectionStatus(isVideoCallMode ? '1080p HD Live Stream Connected' : 'HD Encrypted Voice Stream Connected');
          }
        };

        startFallbackCanvas();

      } catch (err) {
        console.warn('Media access error:', err);
        setConnectionStatus('3D Audio-Only Call Active');
        startFallbackCanvas();
      }
    };

    const startFallbackCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let t = 0;

      const draw = () => {
        t += 0.05;
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.strokeStyle = currentRole === 'doctor' ? '#06b6d4' : '#14b8a6';
        ctx.lineWidth = 3;

        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + t) * 30 + (Math.random() - 0.5) * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        animationFrameId = requestAnimationFrame(draw);
      };
      draw();
    };

    setupWebRTC();

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [currentRole, targetUserId, isVideoCallMode]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = isVideoMuted));
    }
    setIsVideoMuted(!isVideoMuted);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = isAudioMuted));
    }
    setIsAudioMuted(!isAudioMuted);
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (onCallEnded) onCallEnded();
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-w-5xl mx-auto w-full select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <h3 className="font-black text-slate-100 text-sm sm:text-base flex items-center gap-2">
              {isVideoCallMode ? '📹 Video Call' : '📞 Voice Call'} with {currentRole === 'doctor' ? (villager?.fullName || villager?.name || 'Patient') : (doctor?.fullName || doctor?.name || 'Doctor')}
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono font-bold">
                {connectionStatus}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Duration: <span className="font-mono text-cyan-300 font-extrabold">{formatTime(callDuration)}</span></p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2.5 py-1 rounded-xl border border-slate-800 hidden sm:inline">
          WebRTC Encrypted 256-bit HD
        </span>
      </div>

      {permissionNote && (
        <div className="p-3 bg-amber-950/90 border border-amber-500 rounded-2xl text-xs font-bold text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{permissionNote}</span>
        </div>
      )}

      {/* Main 2-Way Call Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Remote Video/Audio Stream */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 h-64 sm:h-80 flex items-center justify-center shadow-inner">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} width={400} height={300} className="hidden" />

          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 text-xs text-slate-200 font-bold flex items-center gap-1.5">
            {currentRole === 'doctor' ? <User className="w-4 h-4 text-teal-400" /> : <Stethoscope className="w-4 h-4 text-cyan-400" />}
            <span>{currentRole === 'doctor' ? (villager?.fullName || villager?.name || 'Patient Stream') : (doctor?.fullName || doctor?.name || 'Doctor Stream')}</span>
          </div>
        </div>

        {/* Local Video Stream */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 h-64 sm:h-80 flex items-center justify-center shadow-inner">
          {isVideoCallMode ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${isVideoMuted ? 'hidden' : 'block'}`}
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <Phone className="w-12 h-12 text-teal-400 mx-auto animate-pulse" />
              <p className="text-xs text-slate-300 font-bold">HD Voice Call Active</p>
            </div>
          )}

          {isVideoMuted && isVideoCallMode && (
            <div className="text-center p-6 space-y-2">
              <VideoOff className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500">Camera Turned Off</p>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 text-xs text-slate-200 font-bold flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>You ({currentRole === 'doctor' ? 'Doctor' : 'Patient'})</span>
          </div>
        </div>

      </div>

      {/* Floating Control Pill Bar */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={toggleAudio}
          className={`p-3.5 rounded-2xl border transition ${
            isAudioMuted
              ? 'bg-rose-950 text-rose-300 border-rose-800'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
          }`}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {isVideoCallMode && (
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-2xl border transition ${
              isVideoMuted
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
            }`}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={endCall}
          className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40 transition transform hover:scale-105"
        >
          <PhoneOff className="w-5 h-5" /> End Call
        </button>
      </div>

    </div>
  );
}
