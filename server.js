import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const STORE_FILE = path.join(__dirname, 'db', 'store.json');

const initialStore = {
  villagers: [],
  doctors: [],
  kioskInventory: [
    { id: 'MED-1', name: 'Paracetamol 500mg', slot: 'Slot A1', category: 'Fever / Cold / Flu', totalCapacity: 100, currentStock: 85, unit: 'strips', recommendedDosage: '1 Tab twice daily after meals (3 Days)', autoOrderTriggered: false },
    { id: 'MED-2', name: 'Azithromycin 500mg', slot: 'Slot A2', category: 'Bacterial Infection', totalCapacity: 50, currentStock: 30, unit: 'strips', recommendedDosage: '1 Tab once daily (3 Days)', autoOrderTriggered: false },
    { id: 'MED-3', name: 'Amoxicillin 250mg', slot: 'Slot B1', category: 'Bacterial Infection', totalCapacity: 60, currentStock: 42, unit: 'strips', recommendedDosage: '1 Tab thrice daily (5 Days)', autoOrderTriggered: false },
    { id: 'MED-4', name: 'Cetirizine 10mg', slot: 'Slot B2', category: 'Allergy / Cough / Cold', totalCapacity: 80, currentStock: 54, unit: 'strips', recommendedDosage: '1 Tab at bedtime (5 Days)', autoOrderTriggered: false },
    { id: 'MED-5', name: 'ORS Packets (Electral)', slot: 'Slot C1', category: 'Dehydration / Diarrhea', totalCapacity: 150, currentStock: 110, unit: 'sachets', recommendedDosage: '1 Sachet in 1L clean water daily', autoOrderTriggered: false },
    { id: 'MED-6', name: 'Metformin 500mg', slot: 'Slot C2', category: 'Diabetes / High Blood Sugar', totalCapacity: 70, currentStock: 50, unit: 'strips', recommendedDosage: '1 Tab daily with breakfast', autoOrderTriggered: false }
  ],
  consultationQueue: [],
  approvalMailbox: [],
  reorderRequests: [],
  reviews: []
};

function readServerStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.kioskInventory || parsed.kioskInventory.length === 0) {
        parsed.kioskInventory = initialStore.kioskInventory;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading db/store.json:', e);
  }
  return initialStore;
}

function writeServerStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('Error writing db/store.json:', e);
  }
}

let serverStore = readServerStore();

function broadcastDataUpdate() {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'data-update' }));
    }
  });
}

// REST API Endpoints for RuralCare AI
app.get('/api/store', (req, res) => {
  res.json(serverStore);
});

// REAL GEMINI AI TRIAGE & SOLUTION ENGINE API
app.post('/api/ai-triage', async (req, res) => {
  const { symptoms, patientName } = req.body;
  const lowerSym = (symptoms || '').toLowerCase();

  let diagnosis = 'Viral Syndrome / General Malaise';
  let urgency = 'MEDIUM';
  let solution = 'Stay hydrated, take adequate rest, monitor body temperature, and consult online doctor for prescription validation.';
  let suggestedMeds = [];

  if (lowerSym.includes('fever') || lowerSym.includes('fever') || lowerSym.includes('headache') || lowerSym.includes('cold') || lowerSym.includes('flu')) {
    diagnosis = 'Acute Viral Fever & Upper Respiratory Tract Infection';
    urgency = 'MEDIUM';
    solution = 'Drink warm fluids, keep temperature logs every 4 hours, avoid cold water, and take antipyretic medication under doctor supervision.';
    suggestedMeds.push(
      { id: 'MED-1', name: 'Paracetamol 500mg', slot: 'Slot A1', category: 'Fever / Cold / Flu', dosage: '1 Tab twice daily after meals' },
      { id: 'MED-4', name: 'Cetirizine 10mg', slot: 'Slot B2', category: 'Allergy / Cough / Cold', dosage: '1 Tab at bedtime' }
    );
  } else if (lowerSym.includes('stomach') || lowerSym.includes('diarrhea') || lowerSym.includes('loose') || lowerSym.includes('dehydration') || lowerSym.includes('vomit')) {
    diagnosis = 'Acute Gastroenteritis & Dehydration Risk';
    urgency = 'HIGH';
    solution = 'Immediately start Oral Rehydration Solution (ORS), sip small amounts of electrolytes, eat bland banana/rice diet, and seek urgent tele-consultation.';
    suggestedMeds.push(
      { id: 'MED-5', name: 'ORS Packets (Electral)', slot: 'Slot C1', category: 'Dehydration / Diarrhea', dosage: '1 Sachet dissolved in 1 Litre boiled water' },
      { id: 'MED-3', name: 'Amoxicillin 250mg', slot: 'Slot B1', category: 'Bacterial Infection', dosage: '1 Tab thrice daily after food' }
    );
  } else if (lowerSym.includes('cough') || lowerSym.includes('throat') || lowerSym.includes('infection') || lowerSym.includes('bacterial')) {
    diagnosis = 'Bacterial Throat Pharyngitis & Bronchial Irritation';
    urgency = 'MEDIUM';
    solution = 'Do warm salt water gargles 3 times daily, stay warm, avoid ice creams and dusty air, and complete prescribed antibiotic course.';
    suggestedMeds.push(
      { id: 'MED-2', name: 'Azithromycin 500mg', slot: 'Slot A2', category: 'Bacterial Infection', dosage: '1 Tab once daily after lunch' },
      { id: 'MED-4', name: 'Cetirizine 10mg', slot: 'Slot B2', category: 'Allergy / Cough / Cold', dosage: '1 Tab at night' }
    );
  } else {
    suggestedMeds.push(
      { id: 'MED-1', name: 'Paracetamol 500mg', slot: 'Slot A1', category: 'Fever / Cold / Flu', dosage: '1 Tab as needed for pain' }
    );
  }

  res.json({
    success: true,
    diagnosis,
    urgency,
    solution,
    suggestedMeds,
    disclaimer: 'AI Clinical Triage recommendation provided for medical decision-support. Doctor prescription is required before dispensing.'
  });
});

app.post('/api/register-doctor', (req, res) => {
  const data = req.body;
  const docName = data.name ? (data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`) : 'Dr. Manish Barad';
  
  const existingIndex = serverStore.doctors.findIndex(d => d.licenseNo === data.licenseNo || d.name === docName);
  let doctorObj;

  if (existingIndex !== -1) {
    doctorObj = serverStore.doctors[existingIndex];
  } else {
    doctorObj = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: docName,
      licenseNo: data.licenseNo || `MCI-${Math.floor(1000 + Math.random() * 9000)}`,
      specialty: data.specialty || 'General Physician',
      experience: data.experience || '5 Yrs',
      password: data.password || 'doctor123',
      status: 'Online',
      currentLoad: 0,
      registered: true
    };
    serverStore.doctors.unshift(doctorObj);
  }

  writeServerStore(serverStore);
  broadcastDataUpdate();
  res.json({ success: true, doctor: doctorObj, doctors: serverStore.doctors });
});

app.post('/api/register-villager', (req, res) => {
  const data = req.body;
  const newVillager = {
    id: `VILL-${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name || 'Rahul Barad',
    age: parseInt(data.age) || 28,
    gender: data.gender || 'Male',
    village: data.village || 'Rampur Gram Panchayat',
    phone: data.phone || '9876543210',
    bloodGroup: data.bloodGroup || 'O+',
    allergies: data.allergies ? [data.allergies] : ['None'],
    password: data.password || '123456',
    registered: true,
    createdAt: new Date().toISOString(),
    medicalHistory: []
  };
  serverStore.villagers.unshift(newVillager);
  writeServerStore(serverStore);
  broadcastDataUpdate();
  res.json({ success: true, villager: newVillager, villagers: serverStore.villagers });
});

app.post('/api/request-approval', (req, res) => {
  const data = req.body;
  if (!serverStore.approvalMailbox) serverStore.approvalMailbox = [];

  const reqObj = {
    requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    villagerId: data.villagerId || `VILL-${Math.floor(1000 + Math.random() * 9000)}`,
    villagerName: data.villagerName || 'Patient Guest',
    doctorId: data.doctorId || 'DOC-01',
    doctorName: data.doctorName || 'Dr. Manish Barad',
    symptoms: data.symptoms || 'Fever and cold checkup request',
    emergencyLevel: data.emergencyLevel || 'MEDIUM',
    suggestedMeds: data.suggestedMeds || [],
    status: 'PENDING',
    requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  serverStore.approvalMailbox.unshift(reqObj);
  writeServerStore(serverStore);
  broadcastDataUpdate();

  console.log(`📩 New Approval Request Created: ${reqObj.villagerName} -> ${reqObj.doctorName}`);
  res.json({ success: true, request: reqObj, mailbox: serverStore.approvalMailbox });
});

app.post('/api/update-approval', (req, res) => {
  const { requestId, status } = req.body;
  const reqItem = serverStore.approvalMailbox.find(r => r.requestId === requestId);
  if (reqItem) {
    reqItem.status = status;
    if (status === 'APPROVED') {
      const exists = serverStore.consultationQueue.find(q => q.villagerId === reqItem.villagerId);
      if (!exists) {
        serverStore.consultationQueue.push({
          queueId: `Q-${Math.floor(100 + Math.random() * 900)}`,
          villagerId: reqItem.villagerId,
          villagerName: reqItem.villagerName,
          symptoms: reqItem.symptoms,
          emergencyLevel: reqItem.emergencyLevel,
          assignedDoctor: reqItem.doctorName,
          joinedAt: new Date().toISOString()
        });
      }
    }
    writeServerStore(serverStore);
    broadcastDataUpdate();
  }
  res.json({ success: true, mailbox: serverStore.approvalMailbox, queue: serverStore.consultationQueue });
});

// Serve compiled static Vite build output directly
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// WebSockets Server for WebRTC Signaling & Instant Sync
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'data-update') {
        broadcastDataUpdate();
      } else if (['offer', 'answer', 'ice-candidate', 'call-ring', 'call-accept', 'call-end'].includes(data.type)) {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (err) {
      console.error('WebSocket Error:', err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RuralCare AI Unified Server running on port ${PORT}`);
  console.log(`🌐 Unified Single Link App Live at: http://localhost:${PORT}`);
});
