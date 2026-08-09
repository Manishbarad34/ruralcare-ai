import express from 'express';
import { prisma } from '../lib/db.js';

const router = express.Router();

// GET /api/doctors — Fetch public/verified directory of available doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        isVerified: true
      },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        experienceYears: true,
        languages: true,
        isOnline: true,
        nextAvailableSlot: true,
        licenseNo: true
      },
      orderBy: { isOnline: 'desc' }
    });

    return res.json({ doctors });
  } catch (err) {
    console.error('Fetch Doctors Error:', err);
    return res.status(500).json({ error: 'Failed to fetch doctor directory.' });
  }
});

// GET /api/doctors/:id — Fetch specific doctor details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        experienceYears: true,
        languages: true,
        isOnline: true,
        nextAvailableSlot: true,
        licenseNo: true
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    return res.json({ doctor });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch doctor profile.' });
  }
});

export default router;
