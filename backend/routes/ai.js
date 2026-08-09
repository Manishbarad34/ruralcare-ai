import express from 'express';
import dotenv from 'dotenv';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// POST /api/ai/intake
router.post('/intake', async (req, res) => {
  try {
    const { symptoms, language = 'English', conversationHistory = [] } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ error: 'Please describe your symptoms.' });
    }

    const targetLang = language || 'English';
    const userPrompt = symptoms.trim();

    let aiResponse = null;

    // Try calling Google Gemini AI API if API key is provided
    if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const systemPrompt = `You are RuralCare AI Clinical Assistant. You provide clinical symptom intake, triage recommendations, and general health guidance.
Guidelines:
1. Respond in the requested language: ${targetLang}.
2. Provide a structured clinical summary.
3. Identify urgency: LOW, MEDIUM, HIGH, or CRITICAL.
4. Suggest general self-care precautions.
5. Suggest OTC medicines if appropriate (e.g. Paracetamol 500mg, ORS).
6. Always include a prominent medical disclaimer directing the patient to consult a licensed doctor for prescriptions.
7. If symptoms suggest emergency (e.g. chest pain, severe breathlessness), advise emergency hospital care immediately.`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nPatient Input (${targetLang}): ${userPrompt}` }] }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            aiResponse = {
              text: candidateText,
              urgency: candidateText.includes('CRITICAL') || candidateText.includes('HIGH') ? 'HIGH' : 'MEDIUM'
            };
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API fetch error, falling back to clinical engine:', geminiErr);
      }
    }

    // Fallback Clinical Triage Engine if Gemini API is offline or key missing
    if (!aiResponse) {
      const lower = userPrompt.toLowerCase();
      let diagnosis = 'General Health Intake / Symptom Review';
      let urgency = 'MEDIUM';
      let selfCare = 'Rest well, drink warm fluids, keep temperature logs every 4 hours.';
      let suggestedMeds = [];

      if (lower.includes('fever') || lower.includes('taav') || lower.includes('bukhar') || lower.includes('cold') || lower.includes('cough')) {
        diagnosis = 'Acute Viral Fever & Upper Respiratory Track Symptoms';
        urgency = 'MEDIUM';
        selfCare = 'Stay hydrated, take adequate rest, avoid cold beverages, and monitor temperature.';
        suggestedMeds.push(
          { name: 'Paracetamol 500mg', dosage: '1 Tab twice daily after food', category: 'Fever / Pain' },
          { name: 'Cetirizine 10mg', dosage: '1 Tab at bedtime', category: 'Cold / Allergy' }
        );
      } else if (lower.includes('stomach') || lower.includes('diarrhea') || lower.includes('vomit') || lower.includes('loose') || lower.includes('pet')) {
        diagnosis = 'Acute Gastrointestinal Upset & Dehydration Risk';
        urgency = 'HIGH';
        selfCare = 'Sip Oral Rehydration Solution (ORS) frequently, eat light banana/rice diet, avoid spicy food.';
        suggestedMeds.push(
          { name: 'ORS Packets (Electral)', dosage: '1 Sachet in 1L clean water', category: 'Dehydration' }
        );
      } else if (lower.includes('chest pain') || lower.includes('shortness of breath') || lower.includes('unconscious')) {
        diagnosis = 'Urgent Cardiovascular / Respiratory Concern';
        urgency = 'CRITICAL';
        selfCare = '⚠️ CRITICAL EMERGENCY: Please seek immediate emergency medical care at the nearest hospital!';
      } else {
        suggestedMeds.push(
          { name: 'Paracetamol 500mg', dosage: '1 Tab as needed for general pain', category: 'Pain Relief' }
        );
      }

      const formattedText = `🔍 Clinical Summary (${targetLang}): ${diagnosis}\n\nUrgency Level: ${urgency}\n\n💡 Recommended Self-Care: ${selfCare}\n\n💊 Recommended Medicines:\n${suggestedMeds.map(m => `• ${m.name} -> ${m.dosage}`).join('\n')}\n\n⚠️ Disclaimer: AI recommendation provided for clinical intake. Please consult an online doctor for prescription validation.`;

      aiResponse = {
        text: formattedText,
        urgency,
        suggestedMeds
      };
    }

    return res.json({
      success: true,
      result: aiResponse
    });
  } catch (err) {
    console.error('AI Intake Route Error:', err);
    return res.status(500).json({ error: 'AI Intake Service temporary error.' });
  }
});

export default router;
