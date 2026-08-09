import express from 'express';
import { prisma } from '../lib/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/medicines — Fetch catalog
router.get('/', async (req, res) => {
  try {
    const { category, query } = req.query;

    const medicines = await prisma.medicine.findMany({
      where: {
        ...(category && category !== 'ALL' ? { category } : {}),
        ...(query ? { name: { contains: query } } : {})
      },
      orderBy: { slot: 'asc' }
    });

    return res.json({ medicines });
  } catch (err) {
    console.error('Fetch Medicines Error:', err);
    return res.status(500).json({ error: 'Failed to fetch medicine catalog.' });
  }
});

// POST /api/medicines/orders — Create medicine order & atomically deduct stock
router.post('/orders', authenticateToken, requireRole(['PATIENT']), async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryMethod } = req.body;
    const patientProfileId = req.user.patientProfileId;

    if (!patientProfileId) {
      return res.status(400).json({ error: 'Patient profile required.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order cart is empty.' });
    }

    // Atomic transaction for stock verification and order creation
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemData = [];

      for (const item of items) {
        const med = await tx.medicine.findUnique({
          where: { id: item.medicineId }
        });

        if (!med || med.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for medicine: ${item.name || 'Selected Item'}. Available: ${med?.currentStock || 0}`);
        }

        // Deduct stock atomically
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { currentStock: med.currentStock - item.quantity }
        });

        const itemTotal = med.price * item.quantity;
        totalAmount += itemTotal;

        orderItemData.push({
          medicineId: med.id,
          medicineName: med.name,
          quantity: item.quantity,
          price: med.price
        });
      }

      // Create Delivery Address if provided
      let addressId = null;
      if (deliveryAddress) {
        const createdAddr = await tx.deliveryAddress.create({
          data: {
            patientId: patientProfileId,
            fullName: deliveryAddress.fullName || 'Recipient',
            phone: deliveryAddress.phone || '9876543210',
            addressLine: deliveryAddress.addressLine || 'Village House',
            village: deliveryAddress.village || 'Rampur',
            district: deliveryAddress.district || 'District',
            state: deliveryAddress.state || 'State',
            pincode: deliveryAddress.pincode || '380001',
            landmark: deliveryAddress.landmark || ''
          }
        });
        addressId = createdAddr.id;
      }

      // Create Order
      const newOrder = await tx.medicineOrder.create({
        data: {
          patientId: patientProfileId,
          totalAmount,
          deliveryAddressId: addressId,
          deliveryMethod: (deliveryMethod || 'STANDARD').toUpperCase(),
          status: 'CONFIRMED',
          items: {
            create: orderItemData
          }
        },
        include: {
          items: true,
          deliveryAddress: true
        }
      });

      return newOrder;
    });

    return res.status(201).json({
      message: 'Medicine order placed successfully.',
      order
    });
  } catch (err) {
    console.error('Order Creation Error:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to place medicine order.' });
  }
});

// GET /api/medicines/orders/my-orders — Fetch patient orders
router.get('/orders/my-orders', authenticateToken, requireRole(['PATIENT']), async (req, res) => {
  try {
    const patientProfileId = req.user.patientProfileId;
    const orders = await prisma.medicineOrder.findMany({
      where: { patientId: patientProfileId },
      include: {
        items: true,
        deliveryAddress: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch order history.' });
  }
});

export default router;
