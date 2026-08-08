// RuralCare AI Unified Client-Server Database Engine

let localStore = {
  villagers: [],
  doctors: [],
  kioskInventory: [],
  consultationQueue: [],
  approvalMailbox: [],
  reorderRequests: [],
  reviews: []
};

export async function syncServerStore() {
  try {
    const res = await fetch('/api/store');
    if (res.ok) {
      const data = await res.json();
      if (data) {
        localStore = data;
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('RURALCARE_UNIFIED_STORE_V3', JSON.stringify(data));
        }
      }
    }
  } catch (e) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('RURALCARE_UNIFIED_STORE_V3');
        if (saved) localStore = JSON.parse(saved);
      } catch (err) {}
    }
  }
  return localStore;
}

export const db = {
  getVillagers: () => localStore.villagers || [],
  getDoctors: () => localStore.doctors || [],
  getQueue: () => localStore.consultationQueue || [],
  getApprovalMailbox: () => localStore.approvalMailbox || [],
  getInventory: () => localStore.kioskInventory || [],

  registerVillager: (data) => {
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
    
    if (!localStore.villagers) localStore.villagers = [];
    localStore.villagers.unshift(newVillager);

    fetch('/api/register-villager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(e => console.warn('API POST error:', e));

    return newVillager;
  },

  loginVillager: (phone, password) => {
    const found = (localStore.villagers || []).find(v => (v.phone === phone || v.id === phone) && v.password === password);
    if (found) return found;
    return db.registerVillager({ name: phone, phone: phone, password: password });
  },

  registerDoctor: (data) => {
    const docName = data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`;
    const newDoc = {
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

    if (!localStore.doctors) localStore.doctors = [];
    const idx = localStore.doctors.findIndex(d => d.licenseNo === newDoc.licenseNo || d.name === newDoc.name);
    if (idx === -1) {
      localStore.doctors.unshift(newDoc);
    }

    fetch('/api/register-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(e => console.warn('API POST error:', e));

    return newDoc;
  },

  loginDoctor: (licenseNo, password) => {
    const found = (localStore.doctors || []).find(d => (d.licenseNo === licenseNo || d.id === licenseNo || d.name.toLowerCase().includes(licenseNo.toLowerCase())) && d.password === password);
    if (found) return found;
    return db.registerDoctor({ name: licenseNo, licenseNo: licenseNo, password: password });
  },

  createConsultationRequest: (data) => {
    if (!localStore.approvalMailbox) localStore.approvalMailbox = [];
    const newReq = {
      requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      villagerId: data.villagerId,
      villagerName: data.villagerName,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      symptoms: data.symptoms || 'General Checkup',
      emergencyLevel: data.emergencyLevel || 'MEDIUM',
      status: 'PENDING',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    localStore.approvalMailbox.unshift(newReq);

    fetch('/api/request-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(e => console.warn('API POST error:', e));

    return newReq;
  },

  updateApprovalStatus: (requestId, status) => {
    const req = (localStore.approvalMailbox || []).find(r => r.requestId === requestId);
    if (req) {
      req.status = status;
      if (status === 'APPROVED') {
        db.addToQueue({
          queueId: `Q-${Math.floor(100 + Math.random() * 900)}`,
          villagerId: req.villagerId,
          villagerName: req.villagerName,
          symptoms: req.symptoms,
          emergencyLevel: req.emergencyLevel,
          assignedDoctor: req.doctorName,
          joinedAt: new Date().toISOString()
        });
      }
    }

    fetch('/api/update-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status })
    }).catch(e => console.warn('API POST error:', e));

    return localStore.approvalMailbox;
  },

  addToQueue: (queueItem) => {
    if (!localStore.consultationQueue) localStore.consultationQueue = [];
    const exists = localStore.consultationQueue.find(q => q.villagerId === queueItem.villagerId);
    if (!exists) {
      localStore.consultationQueue.push(queueItem);
    }
    return localStore.consultationQueue;
  },

  dispenseMedicine: (medicineId, quantity = 1, villagerId, doctorName) => {
    const med = (localStore.kioskInventory || []).find(m => m.id === medicineId);
    if (!med || med.currentStock < quantity) return { success: false, message: 'Stock unavailable' };
    med.currentStock -= quantity;
    return { success: true, remainingStock: med.currentStock };
  }
};
