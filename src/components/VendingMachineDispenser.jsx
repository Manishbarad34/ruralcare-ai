import React, { useState } from 'react';
import { PackageCheck, CheckCircle2, ArrowRight, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export default function VendingMachineDispenser({ inventory = [], onNext }) {
  const [dispensingSlot, setDispensingSlot] = useState(null);
  const [dispensedMed, setDispensedMed] = useState(null);

  const handleDispenseSlot = (med) => {
    setDispensingSlot(med.slot);
    setTimeout(() => {
      setDispensingSlot(null);
      setDispensedMed(med);
    }, 1500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 max-w-4xl mx-auto w-full">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-950 text-teal-300 rounded-2xl border border-teal-800 shadow-lg">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-lg">
              Automated Kiosk Medicine Dispenser
            </h3>
            <p className="text-xs text-slate-400">Micro-controller Servo Motor Slot Vending</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-teal-500/20"
        >
          Proceed to Feedback <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {dispensedMed && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Medicine Dispensed Successfully from {dispensedMed.slot}: {dispensedMed.name}!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((med) => (
          <div
            key={med.id}
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-teal-500/50 transition"
          >
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {med.slot}
              </span>
              <h4 className="font-extrabold text-sm text-slate-100 mt-1">{med.name}</h4>
              <span className="text-xs text-slate-400 block">{med.category}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-xs font-bold text-slate-300">Stock: {med.currentStock} {med.unit}</span>
              <button
                onClick={() => handleDispenseSlot(med)}
                disabled={dispensingSlot === med.slot}
                className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shadow-teal-500/20 flex items-center gap-1"
              >
                {dispensingSlot === med.slot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Dispense'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
