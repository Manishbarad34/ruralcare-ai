import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Submit Consultation Request (PATIENT)
router.post('/request', authenticateToken, requireRole(['PATIENT']), async (req, res) => {
  try {
    const { doctorId, symptoms, urgency } = req.body;

    if (!doctorId || !symptoms) {
      return res.status(400).json({ error: 'Doctor ID and symptoms description are required.' });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const request = await prisma.consultationRequest.create({
      data: {
        patientId: patientProfile.id,
        doctorId,
        symptoms: symptoms.trim(),
        urgency: (urgency || 'MEDIUM').toUpperCase(),
        status: 'PENDING'
      },
      include: {
        doctor: true,
        patient: true
      }
    });

    return res.status(201).json({
      message: 'Consultation request submitted successfully.',
      request
    });
  } catch (err) {
    console.error('Submit Consultation Request Error:', err);
    return res.status(500).json({ error: 'Failed to submit consultation request.' });
  }
});

// 2. Fetch Doctor Mailbox Requests (DOCTOR - ROW-LEVEL SECURITY ENFORCED)
router.get('/doctor-requests', authenticateToken, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }

    const requests = await prisma.consultationRequest.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: {
          include: {
            user: { select: { id: true, email: true, phone: true } }
          }
        },
        consultation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ requests });
  } catch (err) {
    console.error('Fetch Doctor Requests Error:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor requests.' });
  }
});

// 3. Respond to Consultation Request (DOCTOR -> ACCEPT / REJECT)
router.post('/:id/respond', authenticateToken, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be ACCEPTED or REJECTED.' });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: { patient: true }
    });

    if (!request || request.doctorId !== doctorProfile.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this consultation request.' });
    }

    const updatedRequest = await prisma.consultationRequest.update({
      where: { id: requestId },
      data: { status }
    });

    let consultation = null;
    if (status === 'ACCEPTED') {
      consultation = await prisma.consultation.upsert({
        where: { requestId: request.id },
        update: { status: 'ACTIVE' },
        create: {
          requestId: request.id,
          patientId: request.patientId,
          doctorId: doctorProfile.id,
          status: 'ACTIVE'
        }
      });
    }

    return res.json({
      message: `Request ${status.toLowerCase()} successfully.`,
      request: updatedRequest,
      consultation
    });
  } catch (err) {
    console.error('Respond Consultation Error:', err);
    return res.status(500).json({ error: 'Failed to update consultation request status.' });
  }
});

// 4. Fetch Patient Request Statuses (PATIENT)
router.get('/patient-status', authenticateToken, requireRole(['PATIENT']), async (req, res) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const requests = await prisma.consultationRequest.findMany({
      where: { patientId: patientProfile.id },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, email: true, phone: true } }
          }
        },
        consultation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ requests });
  } catch (err) {
    console.error('Fetch Patient Requests Error:', err);
    return res.status(500).json({ error: 'Failed to fetch patient requests.' });
  }
});

// 5. Fetch Persistent Messages Thread for Consultation (DOCTOR & PATIENT)
router.get('/messages/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: { consultation: true }
    });

    if (!request || !request.consultation) {
      return res.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: { consultationId: request.consultation.id },
      orderBy: { createdAt: 'asc' }
    });

    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// 6. Save Persistent Message to Database (DOCTOR & PATIENT)
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { requestId, receiverUserId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty.' });
    }

    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: { consultation: true }
    });

    if (!request || !request.consultation) {
      return res.status(400).json({ error: 'Active consultation required to send persistent messages.' });
    }

    const message = await prisma.message.create({
      data: {
        consultationId: request.consultation.id,
        senderId: req.user.userId,
        receiverId: receiverUserId || req.user.userId,
        text: text.trim(),
        read: false
      }
    });

    return res.status(201).json({ message });
  } catch (err) {
    console.error('Save Message Error:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

// 7. Issue Digital Prescription (DOCTOR)
router.post('/prescription', authenticateToken, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const { consultationId, notes, items } = req.body;

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId }
    });

    if (!consultation || consultation.doctorId !== doctorProfile.id) {
      return res.status(403).json({ error: 'Unauthorized to issue prescription for this consultation.' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        patientId: consultation.patientId,
        doctorId: doctorProfile.id,
        notes: notes ? notes.trim() : 'Take medicines after meals as prescribed.',
        items: {
          create: (items || []).map((item) => ({
            medicineName: item.medicineName,
            strength: item.strength || '500mg',
            dosage: item.dosage || '1 Tab',
            frequency: item.frequency || 'Twice daily',
            duration: item.duration || '3 Days'
          }))
        }
      },
      include: { items: true }
    });

    return res.status(201).json({
      message: 'Digital prescription issued successfully.',
      prescription
    });
  } catch (err) {
    console.error('Create Prescription Error:', err);
    return res.status(500).json({ error: 'Failed to issue prescription.' });
  }
});

export default router;
