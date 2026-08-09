import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

import authRoutes from './backend/routes/auth.js';
import consultationRoutes from './backend/routes/consultations.js';
import doctorRoutes from './backend/routes/doctors.js';
import aiRoutes from './backend/routes/ai.js';
import medicineRoutes from './backend/routes/medicines.js';
import { seedDatabase } from './backend/lib/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_ai_super_secret_jwt_key_2026_sih';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Seed Database Baseline Catalog
seedDatabase().catch((err) => console.error('Database Seeding Error:', err));

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/medicines', medicineRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Compiled Static Frontend Build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Targeted WebSockets & WebRTC Signaling Subsystem
// Map storing active user sockets: Map<idString, Set<WebSocket>>
const userSocketsMap = new Map();

const registerSocket = (idKey, ws) => {
  if (!idKey) return;
  if (!userSocketsMap.has(idKey)) {
    userSocketsMap.set(idKey, new Set());
  }
  userSocketsMap.get(idKey).add(ws);
};

const unregisterSocket = (idKey, ws) => {
  if (!idKey) return;
  const userSockets = userSocketsMap.get(idKey);
  if (userSockets) {
    userSockets.delete(ws);
    if (userSockets.size === 0) {
      userSocketsMap.delete(idKey);
    }
  }
};

wss.on('connection', (ws, req) => {
  let authenticatedUser = null;

  // Extract token from query params
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const token = urlObj.searchParams.get('token');

  if (token) {
    try {
      authenticatedUser = jwt.verify(token, JWT_SECRET);
      
      // Register socket under User.id, PatientProfile.id, AND DoctorProfile.id
      registerSocket(authenticatedUser.userId, ws);
      registerSocket(authenticatedUser.patientProfileId, ws);
      registerSocket(authenticatedUser.doctorProfileId, ws);

      console.log(`🔌 WebSocket Client Connected & Registered: User=${authenticatedUser.userId}, PatientProf=${authenticatedUser.patientProfileId}, DoctorProf=${authenticatedUser.doctorProfileId}`);
    } catch (err) {
      console.warn('WebSocket connection token invalid. Proceeding as unauthenticated listener.');
    }
  }

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw);
      const { type, targetUserId, payload } = data;

      // Handle targeted 1-to-1 WebRTC signaling & Notifications
      if (targetUserId) {
        const targetSockets = userSocketsMap.get(targetUserId);
        if (targetSockets && targetSockets.size > 0) {
          targetSockets.forEach((clientWs) => {
            if (clientWs.readyState === 1) {
              clientWs.send(JSON.stringify({
                type,
                senderUserId: authenticatedUser?.userId || authenticatedUser?.patientProfileId || authenticatedUser?.doctorProfileId,
                payload
              }));
            }
          });
          console.log(`📡 WebSocket Signal Relayed: Type=${type} -> TargetID=${targetUserId}`);
        } else {
          console.warn(`⚠️ WebSocket Target ID not found in active map: TargetID=${targetUserId}`);
        }
      } else {
        // Fallback broadcast
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (err) {
      console.error('WebSocket Message Error:', err);
    }
  });

  ws.on('close', () => {
    if (authenticatedUser) {
      unregisterSocket(authenticatedUser.userId, ws);
      unregisterSocket(authenticatedUser.patientProfileId, ws);
      unregisterSocket(authenticatedUser.doctorProfileId, ws);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RuralCare AI Production Telemedicine Platform running on port ${PORT}`);
  console.log(`🌐 Application Link: http://localhost:${PORT}`);
});
