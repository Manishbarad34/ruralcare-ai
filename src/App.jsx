import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import KioskPortal from './components/KioskPortal.jsx';
import DoctorPortal from './components/DoctorPortal.jsx';
import { db, syncServerStore } from '../db/database.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('RuralCare AI Error Boundary caught crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-rose-500/50 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-rose-400">System Recovered Smoothly</h2>
            <p className="text-xs text-slate-400">An unexpected exception occurred. Click reset to reload portal.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs"
            >
              Reset Application State
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const [villagers, setVillagers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [queue, setQueue] = useState([]);

  // URL Query Parameter Role Direct Sign-In Support (e.g. ?role=doctor or ?role=patient)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam === 'patient' || roleParam === 'kiosk') {
      const v = db.registerVillager({ name: 'Rahul Kumar', phone: '9876543210', village: 'Rampur' });
      setAuthenticatedUser({ ...v, role: 'patient' });
    } else if (roleParam === 'doctor') {
      const d = db.registerDoctor({ name: 'Dr. Manish Barad', licenseNo: 'MCI-9901', specialty: 'General Physician' });
      setAuthenticatedUser({ ...d, role: 'doctor' });
    } else {
      try {
        const savedAuth = localStorage.getItem('RURALCARE_AUTH_SESSION_V4');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed && parsed.role) setAuthenticatedUser(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // 1-Second Auto-Sync Engine for Cross-Device Data Sync
  useEffect(() => {
    const syncData = async () => {
      await syncServerStore();
      setVillagers([...db.getVillagers()]);
      setDoctors([...db.getDoctors()]);
      setInventory([...db.getInventory()]);
      setQueue([...db.getQueue()]);
    };

    syncData();
    const interval = setInterval(syncData, 1000);

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host || 'localhost:5000';
    let ws;
    try {
      ws = new WebSocket(`${wsProtocol}//${wsHost}`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'data-update') {
            syncData();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const handleLoginSuccess = (userObj) => {
    setAuthenticatedUser(userObj);
    localStorage.setItem('RURALCARE_AUTH_SESSION_V4', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem('RURALCARE_AUTH_SESSION_V4');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
        
        <Navbar
          authenticatedUser={authenticatedUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full flex flex-col justify-center">
          {!authenticatedUser ? (
            <AuthScreen
              onLoginSuccess={handleLoginSuccess}
              villagers={villagers}
              doctors={doctors}
            />
          ) : authenticatedUser.role === 'doctor' ? (
            <DoctorPortal
              doctors={doctors}
              queue={queue}
              inventory={inventory}
              loggedInDoctor={authenticatedUser}
              onDispenseMedicine={(medId, villagerId) => db.dispenseMedicine(medId, 1, villagerId, authenticatedUser?.name)}
            />
          ) : (
            <KioskPortal
              villagers={villagers}
              doctors={doctors}
              inventory={inventory}
              aiProvider="GEMINI"
              isOffline={false}
              loggedInUser={authenticatedUser}
            />
          )}
        </main>

      </div>
    </ErrorBoundary>
  );
}
