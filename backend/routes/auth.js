import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ruralcare_ai_super_secret_jwt_key_2026_sih';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, role, fullName, licenseNo, specialty, village, age, gender, bloodGroup } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const userRole = (role || 'PATIENT').toUpperCase();
    if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(userRole)) {
      return res.status(400).json({ error: 'Invalid user role.' });
    }

    // Determine unique login identifier (email or generated placeholder)
    const userEmail = email ? email.trim().toLowerCase() : `${phone || Date.now()}@ruralcare.ai`;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          ...(phone ? [{ phone: phone.trim() }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email or mobile phone already exists. Please sign in instead.' });
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User & associated profile in atomic transaction
    const newUser = await prisma.user.create({
      data: {
        email: userEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: userRole,
        ...(userRole === 'PATIENT' && {
          patientProfile: {
            create: {
              fullName: fullName || 'Patient Guest',
              age: age ? parseInt(age) : 28,
              gender: gender || 'Other',
              village: village || 'Rampur Gram Panchayat',
              bloodGroup: bloodGroup || 'O+'
            }
          }
        }),
        ...(userRole === 'DOCTOR' && {
          doctorProfile: {
            create: {
              fullName: fullName ? (fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`) : 'Dr. Practitioner',
              licenseNo: licenseNo ? licenseNo.trim() : `MCI-${Math.floor(1000 + Math.random() * 9000)}`,
              specialty: specialty || 'General Physician',
              experienceYears: 5,
              isVerified: true,
              isOnline: true
            }
          }
        })
      },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: newUser.id,
        role: newUser.role,
        patientProfileId: newUser.patientProfile?.id,
        doctorProfileId: newUser.doctorProfile?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, role } = req.body; // identifier can be email, phone, or doctor license/name

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide identifier (email/phone/license) and password.' });
    }

    const cleanId = identifier.trim();

    // Search user by email, phone, or associated doctor/patient profile
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId.toLowerCase() },
          { phone: cleanId },
          { doctorProfile: { licenseNo: cleanId } },
          { doctorProfile: { fullName: { contains: cleanId } } },
          { patientProfile: { fullName: { contains: cleanId } } }
        ]
      },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    // Auto-provision registration if user logins with valid credentials in demo/SIH testing mode
    if (!user) {
      const requestedRole = (role || 'PATIENT').toUpperCase();
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email: `${cleanId.replace(/\s+/g, '').toLowerCase()}@ruralcare.ai`,
          phone: /^\d+$/.test(cleanId) ? cleanId : null,
          passwordHash,
          role: requestedRole,
          ...(requestedRole === 'PATIENT' && {
            patientProfile: {
              create: {
                fullName: cleanId,
                age: 28,
                village: 'Rampur Gram Panchayat'
              }
            }
          }),
          ...(requestedRole === 'DOCTOR' && {
            doctorProfile: {
              create: {
                fullName: cleanId.startsWith('Dr.') ? cleanId : `Dr. ${cleanId}`,
                licenseNo: `MCI-${Math.floor(1000 + Math.random() * 9000)}`,
                specialty: 'General Physician',
                isOnline: true
              }
            }
          })
        },
        include: {
          patientProfile: true,
          doctorProfile: true
        }
      });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid authentication credentials.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        patientProfileId: user.patientProfile?.id,
        doctorProfileId: user.doctorProfile?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user profile.' });
  }
});

export default router;
