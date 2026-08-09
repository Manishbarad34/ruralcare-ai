import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/consultations/request (PATIENT only)
router.post('/request', authenticateToken, requireRole(['PATIENT']), async (req, res) => {
  try {
    const { doctorId, symptoms, urgency } = req.body;
    const patientProfileId = req.user.patientProfileId;

    if (!patientProfileId) {
      return res.status(400).json({ error: 'Patient profile not associated with this account.' });
    }

    if (!doctorId) {
      return res.status(400).json({ error: 'Please select a valid target doctor.' });
    }

    // Verify doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Selected doctor not found.' });
    }

    // Create Consultation Request
    const request = await prisma.consultationRequest.create({
      data: {
        patientId: patientProfileId,
        doctorId,
        symptoms: symptoms || 'General Consultation Request',
        urgency: urgency || 'MEDIUM',
        status: 'PENDING'
      },
      include: {
        patient: true,
        doctor: true
      }
    });

    return res.status(201).json({
      message: 'Consultation request submitted successfully.',
      request
    });
  } catch (err) {
    console.error('Create Request Error:', err);
    return res.status(500).json({ error: 'Failed to create consultation request.' });
  }
});

// GET /api/consultations/doctor-requests (DOCTOR only — ROW-LEVEL SECURITY ENFORCED)
router.get('/doctor-requests', authenticateToken, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const doctorProfileId = req.user.doctorProfileId;
    if (!doctorProfileId) {
      return res.status(400).json({ error: 'Doctor profile not associated with this account.' });
    }

    // Doctor A receives ONLY requests specifically addressed to Doctor A
    const requests = await prisma.consultationRequest.findMany({
      where: { doctorId: doctorProfileId },
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ requests });
  } catch (err) {
    console.error('Fetch Doctor Requests Error:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor consultation mailbox.' });
  }
});

// POST /api/consultations/:id/respond (DOCTOR only)
router.post('/:id/respond', authenticateToken, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACCEPTED | REJECTED
    const doctorProfileId = req.user.doctorProfileId;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid response status.' });
    }

    // Verify consultation request belongs to this doctor
    const reqItem = await prisma.consultationRequest.findUnique({
      where: { id }
    });

    if (!reqItem || reqItem.doctorId !== doctorProfileId) {
      return res.status(403).json({ error: 'Unauthorized: You can only respond to requests addressed to you.' });
    }

    // Update status
    const updatedRequest = await prisma.consultationRequest.update({
      where: { id },
      data: { status }
    });

    let consultation = null;
    if (status === 'ACCEPTED') {
      // Check if consultation session already exists
      const existing = await prisma.consultation.findUnique({
        where: { requestId: id }
      });

      if (!existing) {
        consultation = await prisma.consultation.create({
          data: {
            requestId: id,
            patientId: reqItem.patientId,
            doctorId: doctorProfileId,
            status: 'ACTIVE'
          },
          include: {
            patient: true,
            doctor: true
          }
        });
      } else {
        consultation = existing;
      }
    }

    return res.json({
      message: `Request ${status.toLowerCase()} successfully.`,
      request: updatedRequest,
      consultation
    });
  } catch (err) {
    console.error('Respond Request Error:', err);
    return res.status(500).json({ error: 'Failed to process consultation response.' });
  }
});

// GET /api/consultations/patient-status (PATIENT only)
router.get('/patient-status', authenticateToken, requireRole(['PATIENT']), async (req, res) => {
  try {
    const patientProfileId = req.user.patientProfileId;
    if (!patientProfileId) {
      return res.status(400).json({ error: 'Patient profile required.' });
    }

    const requests = await prisma.consultationRequest.findMany({
      where: { patientId: patientProfileId },
      include: {
        doctor: true,
        consultation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch patient requests status.' });
  }
});

// POST /api/consultations/prescription (DOCTOR only)
router.post('/prescription', authenticateToken, requireRole(['DOCTOR']), async (req, res) => {
  try {
    const { consultationId, notes, items } = req.body;
    const doctorProfileId = req.user.doctorProfileId;

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId }
    });

    if (!consultation || consultation.doctorId !== doctorProfileId) {
      return res.status(403).json({ error: 'Unauthorized consultation context.' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        patientId: consultation.patientId,
        doctorId: doctorProfileId,
        notes: notes || 'Prescription issued following tele-consultation',
        items: {
          create: (items || []).map(i => ({
            medicineName: i.medicineName || i.name,
            strength: i.strength || '500mg',
            dosage: i.dosage || '1 Tab',
            frequency: i.frequency || 'Twice daily',
            duration: i.duration || '3 Days'
          }))
        }
      },
      include: {
        items: true,
        patient: true,
        doctor: true
      }
    });

    return res.status(201).json({
      message: 'Prescription created successfully.',
      prescription
    });
  } catch (err) {
    console.error('Create Prescription Error:', err);
    return res.status(500).json({ error: 'Failed to create prescription.' });
  }
});

export default router;
