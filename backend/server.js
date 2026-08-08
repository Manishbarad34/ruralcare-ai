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

const STORE_FILE = path.join(__dirname, '..', 'database', 'store.json');

const initialStore = {
  villagers: [
    { id: 'VILL-101', name: 'Rahul Kumar', age: 28, gender: 'Male', village: 'Rampur', phone: '9876543210', registered: true }
  ],
  doctors: [
    { id: 'DOC-01', name: 'Dr. Manish Barad', licenseNo: 'MCI-9901', specialty: 'General Physician', experience: '10 Yrs', status: 'Online', currentLoad: 0, registered: true }
  ],
  kioskInventory: [
    { id: 'MED-1', name: 'Paracetamol 500mg', slot: 'Slot A1', category: 'Fever / Analgesic', totalCapacity: 100, currentStock: 85, unit: 'strips', autoOrderTriggered: false },
    { id: 'MED-2', name: 'Azithromycin 500mg', slot: 'Slot A2', category: 'Antibiotic', totalCapacity: 50, currentStock: 30, unit: 'strips', autoOrderTriggered: false },
    { id: 'MED-3', name: 'Amoxicillin 250mg', slot: 'Slot B1', category: 'Antibiotic', totalCapacity: 60, currentStock: 42, unit: 'strips', autoOrderTriggered: false },
    { id: 'MED-4', name: 'Cetirizine 10mg', slot: 'Slot B2', category: 'Anti-allergy', totalCapacity: 80, currentStock: 54, unit: 'strips', autoOrderTriggered: false },
    { id: 'MED-5', name: 'ORS Packets (Electral)', slot: 'Slot C1', category: 'Dehydration', totalCapacity: 150, currentStock: 110, unit: 'sachets', autoOrderTriggered: false },
    { id: 'MED-6', name: 'Metformin 500mg', slot: 'Slot C2', category: 'Diabetes', totalCapacity: 70, currentStock: 50, unit: 'strips', autoOrderTriggered: false }
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
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading database/store.json:', e);
  }
  return initialStore;
}

function writeServerStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('Error writing database/store.json:', e);
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

app.post('/api/register-doctor', (req, res) => {
  const data = req.body;
  const docName = data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`;
  
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
    name: data.name || 'Patient Guest',
    age: parseInt(data.age) || 30,
    gender: data.gender || 'Other',
    village: data.village || 'Rampur',
    phone: data.phone || '9999999999',
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

  const existing = serverStore.approvalMailbox.find(m => m.villagerId === data.villagerId && m.status === 'PENDING');
  let reqObj;

  if (existing) {
    reqObj = existing;
  } else {
    reqObj = {
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      villagerId: data.villagerId,
      villagerName: data.villagerName,
      doctorId: data.doctorId || 'DOC-01',
      doctorName: data.doctorName || 'Dr. Manish Barad',
      symptoms: data.symptoms || 'General Consultation Request',
      emergencyLevel: data.emergencyLevel || 'MEDIUM',
      status: 'PENDING',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    serverStore.approvalMailbox.unshift(reqObj);
  }

  writeServerStore(serverStore);
  broadcastDataUpdate();
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

// Serve frontend production build output if available
const kioskDist = path.join(__dirname, '..', 'kiosk', 'dist');
if (fs.existsSync(kioskDist)) {
  app.use(express.static(kioskDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(kioskDist, 'index.html'));
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
  console.log(`🚀 RuralCare AI Backend API Server running on port ${PORT}`);
  console.log(`🌐 Unified Single Link App Live at: http://localhost:${PORT}`);
});
