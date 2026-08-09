import { prisma } from './db.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    const medicineCount = await prisma.medicine.count();
    if (medicineCount === 0) {
      console.log('🌱 Seeding initial medicine inventory catalog...');
      await prisma.medicine.createMany({
        data: [
          {
            name: 'Paracetamol 500mg',
            category: 'Fever / Cold / Flu',
            slot: 'Slot A1',
            strength: '500mg',
            price: 25.0,
            totalCapacity: 100,
            currentStock: 85,
            unit: 'strips',
            recommendedDosage: '1 Tab twice daily after meals (3 Days)',
            isPrescriptionRequired: false,
          },
          {
            name: 'Azithromycin 500mg',
            category: 'Bacterial Infection',
            slot: 'Slot A2',
            strength: '500mg',
            price: 110.0,
            totalCapacity: 50,
            currentStock: 30,
            unit: 'strips',
            recommendedDosage: '1 Tab once daily (3 Days)',
            isPrescriptionRequired: true,
          },
          {
            name: 'Amoxicillin 250mg',
            category: 'Bacterial Infection',
            slot: 'Slot B1',
            strength: '250mg',
            price: 65.0,
            totalCapacity: 60,
            currentStock: 42,
            unit: 'strips',
            recommendedDosage: '1 Tab thrice daily (5 Days)',
            isPrescriptionRequired: true,
          },
          {
            name: 'Cetirizine 10mg',
            category: 'Allergy / Cough / Cold',
            slot: 'Slot B2',
            strength: '10mg',
            price: 18.0,
            totalCapacity: 80,
            currentStock: 54,
            unit: 'strips',
            recommendedDosage: '1 Tab at bedtime (5 Days)',
            isPrescriptionRequired: false,
          },
          {
            name: 'ORS Packets (Electral)',
            category: 'Dehydration / Diarrhea',
            slot: 'Slot C1',
            strength: '21.8g',
            price: 15.0,
            totalCapacity: 150,
            currentStock: 110,
            unit: 'sachets',
            recommendedDosage: '1 Sachet in 1L clean water daily',
            isPrescriptionRequired: false,
          },
          {
            name: 'Metformin 500mg',
            category: 'Diabetes / High Blood Sugar',
            slot: 'Slot C2',
            strength: '500mg',
            price: 45.0,
            totalCapacity: 70,
            currentStock: 50,
            unit: 'strips',
            recommendedDosage: '1 Tab daily with breakfast',
            isPrescriptionRequired: true,
          },
        ],
      });
      console.log('✅ Medicine inventory catalog seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
