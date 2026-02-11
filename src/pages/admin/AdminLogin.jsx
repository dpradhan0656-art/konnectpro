import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- PAGES IMPORT ---
import Home from './pages/customer/Home';
import Bookings from './pages/customer/Bookings';
import DeepakHQ from './pages/admin/DeepakHQ'; // ✅ SIRF YE CHAHIYE

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        
        {/* --- CUSTOMER ROUTES --- */}
        <Route path="/" element={<Home key={session?.user?.id} session={session} />} />
        <Route path="/bookings" element={session ? <Bookings /> : <Navigate to="/" replace />} />
        
        {/* --- ADMIN ROUTE (SINGLE ENTRY) --- */}
        {/* AdminLogin ki zaroorat nahi, DeepakHQ khud login maang lega */}
        <Route path="/deepakhq" element={<DeepakHQ />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;