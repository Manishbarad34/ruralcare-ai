import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import PatientDashboard from './components/PatientDashboard.jsx';
import DoctorDashboard from './components/DoctorDashboard.jsx';
import Navbar from './components/Navbar.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('RURALCARE_AUTH_TOKEN') || null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Authenticate Session on App Mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('RURALCARE_AUTH_TOKEN');
      if (!savedToken) {
        setIsLoadingSession(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthToken(savedToken);
        } else {
          localStorage.removeItem('RURALCARE_AUTH_TOKEN');
          setAuthToken(null);
        }
      } catch (err) {
        console.warn('Session verification network error:', err);
      } finally {
        setIsLoadingSession(false);
      }
    };

    verifySession();
  }, []);

  const handleLoginSuccess = (userObj, token) => {
    setCurrentUser(userObj);
    setAuthToken(token);
    localStorage.setItem('RURALCARE_AUTH_TOKEN', token);
  };

  const handleSignOut = () => {
    localStorage.removeItem('RURALCARE_AUTH_TOKEN');
    setCurrentUser(null);
    setAuthToken(null);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-teal-400 space-y-3 font-mono text-xs">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span>Authenticating Secure Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      <div className="space-y-4">
        <Navbar user={currentUser} onSignOut={handleSignOut} />

        <main className="px-3 sm:px-6">
          {!currentUser ? (
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          ) : currentUser.role === 'DOCTOR' ? (
            <DoctorDashboard user={currentUser} token={authToken} />
          ) : (
            <PatientDashboard user={currentUser} token={authToken} />
          )}
        </main>
      </div>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        RuralCare AI • Production Telemedicine System • SIH 2026 Edition
      </footer>
    </div>
  );
}
