import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- PAGES IMPORT ---
import Home from './pages/customer/Home';
import Bookings from './pages/customer/Bookings';
import DeepakHQ from './pages/admin/DeepakHQ'; // ✅ Only DeepakHQ is needed now

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Real-time Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        
        {/* --- CUSTOMER AREA --- */}
        <Route 
          path="/" 
          element={<Home key={session?.user?.id} session={session} />} 
        />

        <Route 
          path="/bookings" 
          element={session ? <Bookings /> : <Navigate to="/" replace />} 
        />
        
        {/* --- ADMIN AREA (SINGLE SECRET DOOR) --- */}
        {/* Ab /admin ki zaroorat nahi hai, DeepakHQ sab sambhal lega */}
        <Route path="/deepakhq" element={<DeepakHQ />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;