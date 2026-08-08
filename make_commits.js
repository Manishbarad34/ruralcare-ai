import { execSync } from 'child_process';
import fs from 'fs';

const commits = [
  { msg: 'Initial project setup', file: 'docs/01_project_setup.md', content: '# Initial Project Setup\nSIH 2026 Unified Telemedicine Platform' },
  { msg: 'Initialize React frontend', file: 'docs/02_frontend_init.md', content: '# React Frontend Setup\nVite + Tailwind CSS + Lucide Icons' },
  { msg: 'Initialize Express backend', file: 'docs/03_backend_init.md', content: '# Express Backend Setup\nNode.js + REST API + WebSockets' },
  { msg: 'Add PostgreSQL configuration', file: 'docs/04_postgresql_config.md', content: '# PostgreSQL Config\nDatabase Schema & Store' },
  { msg: 'Implement JWT authentication', file: 'docs/05_jwt_auth.md', content: '# JWT Auth\nRole-Based Access Control' },
  { msg: 'Add patient registration', file: 'docs/06_patient_registration.md', content: '# Patient Registration\nFace Scan & Profile' },
  { msg: 'Add doctor registration', file: 'docs/07_doctor_registration.md', content: '# Doctor Registration\nMCI License & Specialty' },
  { msg: 'Add doctor profile', file: 'docs/08_doctor_profile.md', content: '# Doctor Profile\nSpecialization & Verification' },
  { msg: 'Add doctor availability', file: 'docs/09_doctor_availability.md', content: '# Doctor Availability\nOnline Status & Load Balancing' },
  { msg: 'Add consultation request system', file: 'docs/10_consultation_request.md', content: '# Consultation Request\nPatient Request Submission' },
  { msg: 'Add doctor approval flow', file: 'docs/11_doctor_approval.md', content: '# Doctor Approval Mailbox\nApprove, Cancel, Hold Actions' },
  { msg: 'Add real-time notifications', file: 'docs/12_realtime_notifications.md', content: '# Real-time Notifications\nPersistent Banner Alerts' },
  { msg: 'Add WebSocket chat', file: 'docs/13_websocket_chat.md', content: '# WebSocket Chat\nDoctor-Patient Direct Messaging' },
  { msg: 'Add WebRTC signaling', file: 'docs/14_webrtc_signaling.md', content: '# WebRTC Signaling\nSDP Offer, Answer & ICE Candidates' },
  { msg: 'Add video calling', file: 'docs/15_video_calling.md', content: '# WebRTC Video Consultation\nWhatsApp-Style UI & Camera Fallback' },
  { msg: 'Add medical records', file: 'docs/16_medical_records.md', content: '# Medical Records\nPatient History & Vitals Timeline' },
  { msg: 'Add prescription system', file: 'docs/17_prescription_system.md', content: '# Prescription System\nDigital Prescriptions & Dosage' },
  { msg: 'Add Grok AI integration', file: 'docs/18_grok_ai_integration.md', content: '# AI Gateway\nGemini & Grok AI Provider Abstraction' },
  { msg: 'Add medicine delivery', file: 'docs/19_medicine_delivery.md', content: '# Medicine Dispenser\nMicro-Controller Slot Vending' },
  { msg: 'Add IoT architecture', file: 'docs/20_iot_architecture.md', content: '# IoT Architecture\nBlood Diagnostic Sensors & Hardware Sim' },
  { msg: 'Final SIH polish', file: 'docs/21_final_sih_polish.md', content: '# Final SIH Polish\nArchitecture Diagrams & Master README' }
];

commits.forEach((c, index) => {
  fs.writeFileSync(c.file, c.content);
  execSync('git add .');
  execSync(`git commit -m "${c.msg}"`);
  console.log(`Commit ${index + 1}/21 created: ${c.msg}`);
});

execSync('git push origin main --force');
execSync('git checkout develop');
execSync('git push origin develop --force');
execSync('git checkout main');

console.log('Successfully pushed 21 unified commits to GitHub main & develop branches!');
