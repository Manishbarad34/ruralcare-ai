import React, { useState } from 'react';
import { Droplet, Activity, CheckCircle2, ArrowRight, RefreshCw, Heart, Sparkles } from 'lucide-react';

export default function BloodTestModule({ villager, onComplete, onNext }) {
  const [isTesting, setIsTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  const [vitals, setVitals] = useState({
    hemoglobin: 13.2,
    bloodSugar: 126,
    bloodPressure: '120/80',
    spO2: 99
  });

  const handleStartBloodTest = () => {
    setIsTesting(true);
    setTestComplete(false);

    setTimeout(() => {
      setIsTesting(false);
      setTestComplete(true);
      const report = {
        hemoglobin: `${(11 + Math.random() * 3).toFixed(1)} g/dL`,
        bloodSugar: `${Math.floor(90 + Math.random() * 40)} mg/dL`,
        bloodPressure: '120/80 mmHg',
        spO2: `${Math.floor(97 + Math.random() * 3)}%`
      };
      if (onComplete) onComplete(report);
    }, 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 text-cyan-300 rounded-2xl border border-cyan-800 shadow-lg">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-lg">
              Automated Blood Diagnostic Vitals
            </h3>
            <p className="text-xs text-slate-400">
              Non-invasive Micro-fluidic Sensor Diagnostics
            </p>
          </div>
        </div>

        <button
          onClick={handleStartBloodTest}
          disabled={isTesting}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-teal-500/20"
        >
          <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Analyzing Sample...' : 'Run Micro-Test'}
        </button>
      </div>

      {/* Diagnostic Vitals Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Hemoglobin</span>
          <span className="text-xl font-black text-teal-300">{vitals.hemoglobin} g/dL</span>
          <span className="text-[10px] text-emerald-400 block font-semibold">Normal Range</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Blood Sugar</span>
          <span className="text-xl font-black text-amber-300">{vitals.bloodSugar} mg/dL</span>
          <span className="text-[10px] text-amber-400 block font-semibold">Fasting Normal</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Blood Pressure</span>
          <span className="text-xl font-black text-cyan-300">{vitals.bloodPressure} mmHg</span>
          <span className="text-[10px] text-emerald-400 block font-semibold">Optimal</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">SpO2 Oxygen</span>
          <span className="text-xl font-black text-emerald-300">{vitals.spO2}%</span>
          <span className="text-[10px] text-emerald-400 block font-semibold">99% Saturation</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
      >
        Proceed to AI Triage Consultation <ArrowRight className="w-4 h-4" />
      </button>

    </div>
  );
}
