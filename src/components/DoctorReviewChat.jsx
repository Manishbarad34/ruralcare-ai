import React, { useState } from 'react';
import { Star, CheckCircle2, RefreshCw, Sparkles, Heart } from 'lucide-react';

export default function DoctorReviewChat({ villager, doctor, onFinish }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 1500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-w-2xl mx-auto w-full text-center">
      
      <div className="w-16 h-16 rounded-full bg-teal-950 border border-teal-700 text-teal-300 flex items-center justify-center mx-auto shadow-xl">
        <Star className="w-8 h-8 fill-current" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-100">Consultation Completed</h3>
        <p className="text-xs text-slate-400">Please rate your tele-consultation experience with {doctor?.name || 'Dr. Manish Barad'}</p>
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Thank you! Your feedback has been recorded. Returning to biometric scanner...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                className={`w-8 h-8 cursor-pointer transition ${
                  star <= rating ? 'text-amber-400 fill-current scale-110' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <textarea
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 outline-none focus:border-teal-500 h-24"
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-teal-500/20"
          >
            Submit Feedback & Finish
          </button>
        </form>
      )}

    </div>
  );
}
