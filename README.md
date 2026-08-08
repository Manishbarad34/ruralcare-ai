# 🏥 RuralCare AI - AI-Powered Rural Telemedicine Kiosk & Healthcare Platform (SIH 2026 Edition)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![SIH 2026 Edition](https://img.shields.io/badge/SIH_2026-Smart_India_Hackathon-cyan.svg)](https://github.com/Manishbarad34/ruralcare-ai)
[![Node.js Engine](https://img.shields.io/badge/Node.js-v24.x-emerald.svg)](https://nodejs.org)
[![React 18](https://img.shields.io/badge/React-v18.2-blue.svg)](https://react.dev)
[![WebRTC HD Video](https://img.shields.io/badge/WebRTC-HD_1080p-green.svg)](https://webrtc.org)

> **RuralCare AI** is an AI-assisted autonomous rural healthcare kiosk network engineered for Gram Panchayats. It connects rural villagers with remote doctors via 2-way WebRTC HD video consultations, AI-powered health triage (Gemini & Grok), automated micro-fluidic blood vitals simulation, and remote medicine vending dispenser controls.

---

## 🎯 Problem Statement & Rural Vision

Over 65% of India's population resides in rural villages with limited access to certified medical specialists. Rural patients often face long travel distances to city hospitals, fragmented paper health records, and delayed diagnosis.

**RuralCare AI** solves this by establishing intelligent physical health kiosks in Gram Panchayats:
1. **Biometric Patient Recognition**: Instant face scan identification with dropdown fallback.
2. **Pre-Consultation Blood Diagnostics**: Micro-fluidic sensors test Hemoglobin, Blood Sugar, Blood Pressure, and SpO2.
3. **AI Health Triage Gateway**: Gemini & Grok AI summarize symptoms and assign risk levels (LOW, MEDIUM, HIGH, CRITICAL).
4. **Smart Priority Queue Engine**: Ranks queue placement based on AI urgency score, wait time, and blood test readiness.
5. **Doctor Approval Mailbox**: Doctors receive walk-in patient requests in an inbox and approve them into the active queue.
6. **WhatsApp-Style WebRTC Video Consultation**: Full-screen 1080p HD video call with PIP self-camera and round action controls.
7. **Automated Medicine Vending Dispenser**: Micro-controller servo motor vending dispenses prescribed medicine slots directly to the patient.

---

## 🏗️ Core Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons.
- **Backend**: Node.js, Express.js REST API, Express Static File Server.
- **Real-Time Engine**: WebSockets (`ws`) for multi-device cross-network state sync and WebRTC signaling.
- **Database & Persistence**: Central server disk store (`database/store.json`) & PostgreSQL schema (`database/schema.json`).
- **AI Gateway**: Configurable dual provider architecture (`AI_PROVIDER=gemini` or `AI_PROVIDER=grok`).
- **Hardware Abstraction Layer**: `HARDWARE_MODE=simulation` for micro-controller dispenser & blood analyzer testing.

---

## 🚀 SIH 2026 Presentation Story (15-Step Workflow)

1. **Step 1**: Villager arrives at the Gram Panchayat kiosk terminal.
2. **Step 2**: AI Biometric Face Scanner identifies the patient (`Rahul Kumar`).
3. **Step 3**: Previous health profile and medical history are loaded instantly.
4. **Step 4**: Micro-fluidic sensor module records blood vitals (Hemoglobin 13.2 g/dL, Sugar 126 mg/dL, SpO2 99%).
5. **Step 5**: AI Triage Engine collects symptoms (`Fever and headache`) and assigns MEDIUM risk.
6. **Step 6**: Patient clicks **"Request Approval"** for `Dr. Manish Barad`.
7. **Step 7**: Patient screen displays: `📩 REQUEST SENT TO Dr. Manish Barad! STATUS: PENDING DOCTOR APPROVAL IN MAILBOX...`
8. **Step 8**: Request pops up in Doctor's **Patient Consultation Approval Mailbox**.
9. **Step 9**: Doctor clicks ✅ **Approve**.
10. **Step 10**: Smart Queue Engine moves patient into active queue with priority score.
11. **Step 11**: Patient screen updates: `✅ REQUEST APPROVED! CLICK TO START VIDEO CALL NOW!`
12. **Step 12**: Doctor initiates WhatsApp-style 2-Way 1080p HD WebRTC video consultation.
13. **Step 13**: Doctor reviews complete vitals, AI summary, and creates prescription.
14. **Step 14**: Doctor clicks **Dispense** (e.g. Slot A1 - Paracetamol 500mg).
15. **Step 15**: Kiosk vending machine opens slot, dispenses medicine, and logs transaction.

---

## 💻 Local Installation & Setup Instructions

### 1. Clone & Navigate
```bash
git clone https://github.com/Manishbarad34/ruralcare-ai.git
cd ruralcare-ai
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Backend Setup & Server Start
```bash
cd backend
npm install
npm start
```
The server will start on **`http://localhost:5000`**.

### 4. Running Public HTTPS Tunnel (For Mobile Testing)
```bash
npx localtunnel --port 5000
```
Use the generated HTTPS link on mobile devices for 4G/5G/Wi-Fi testing!

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Project Demo
Deployed Application Demo Link: **`https://github.com/Manishbarad34/ruralcare-ai`**
