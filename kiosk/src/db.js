// Kiosk Data Store Sync Engine

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
          localStorage.setItem('RURALCARE_KIOSK_STORE_V2', JSON.stringify(data));
        }
      }
    }
  } catch (e) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('RURALCARE_KIOSK_STORE_V2');
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

  addToQueue: (queueItem) => {
    if (!localStore.consultationQueue) localStore.consultationQueue = [];
    const exists = localStore.consultationQueue.find(q => q.villagerId === queueItem.villagerId);
    if (!exists) {
      localStore.consultationQueue.push(queueItem);
    }
    return localStore.consultationQueue;
  }
};
