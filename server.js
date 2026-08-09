import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

import { seedDatabase } from './backend/lib/seed.js';
import authRoutes from './backend/routes/auth.js';
import consultationRoutes from './backend/routes/consultations.js';
import doctorRoutes from './backend/routes/doctors.js';
import aiRoutes from './backend/routes/ai.js';
import medicineRoutes from './backend/routes/medicines.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_ai_super_secret_jwt_key_2026_sih';

// Security Headers & Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allowed for video/audio streams and inline scripts in Vite
}));
app.use(cors());
app.use(express.json());

// Seed Database Inventory & Default Records on Startup
seedDatabase().catch((err) => console.error('Seed Error:', err));

// Register Production API Routes
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
// Map storing active user sockets: Map<userId, Set<WebSocket>>
const userSocketsMap = new Map();

wss.on('connection', (ws, req) => {
  let authenticatedUser = null;

  // Extract token from query params or auth header
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const token = urlObj.searchParams.get('token');

  if (token) {
    try {
      authenticatedUser = jwt.verify(token, JWT_SECRET);
      const userId = authenticatedUser.userId;

      if (!userSocketsMap.has(userId)) {
        userSocketsMap.set(userId, new Set());
      }
      userSocketsMap.get(userId).add(ws);
      console.log(`🔌 WebSocket Client Connected & Authenticated: User ID ${userId}`);
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
                senderUserId: authenticatedUser?.userId,
                payload
              }));
            }
          });
        }
      } else {
        // Fallback broadcast for global data updates if target unspecified
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
    if (authenticatedUser?.userId) {
      const userId = authenticatedUser.userId;
      const userSockets = userSocketsMap.get(userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          userSocketsMap.delete(userId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RuralCare AI Production Telemedicine Platform running on port ${PORT}`);
  console.log(`🌐 Application Link: http://localhost:${PORT}`);
});
