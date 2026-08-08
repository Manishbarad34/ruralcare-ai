# 🏗️ RuralCare AI - System Architecture & Engineering Blueprint

## 🌟 Overview
RuralCare AI is a full-stack, smart telemedicine kiosk platform engineered for rural Gram Panchayats. It enables non-invasive biometrics, automated blood diagnostic vitals, AI health triage (Gemini & Grok), WhatsApp-style WebRTC video consultations, and remote medicine vending dispenser controls.

---

## 📐 System Architecture Components

```
                      +----------------------------------+
                      |   Mobile Patient Browser / Kiosk |
                      +----------------------------------+
                                        |
                             HTTP / WebSockets (Port 5000)
                                        |
                                        v
                      +----------------------------------+
                      |   RuralCare AI Backend Server    |
                      |   (Node.js + WebSockets Signaling|
                      +----------------------------------+
                                        |
                                        v
                      +----------------------------------+
                      |     Central Disk Persistence     |
                      |       (database/store.json)      |
                      +----------------------------------+
                                        ^
                                        |
                             HTTP / WebSockets (Port 5000)
                                        |
                      +----------------------------------+
                      |     Doctor Portal Dashboard      |
                      +----------------------------------+
```

---

## 📹 WebRTC 2-Way HD Video Consultation Signal Flow

1. **Patient Request**: Patient submits a consultation request to a registered doctor.
2. **Approval Mailbox**: Request pops up in Doctor's Mailbox. Doctor clicks ✅ `Approve`.
3. **Signaling Exchange**: WebSocket exchanges `offer`, `answer`, and `ice-candidate` messages.
4. **Peer Connection**: WebRTC PeerConnection initializes 2-way 1080p HD audio/video stream.
5. **Fallback Spectrum**: If unencrypted HTTP origins block webcam permission, an animated dynamic medical canvas stream runs continuously so the viewport is never dark.
