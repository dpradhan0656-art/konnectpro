import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- PAGES IMPORT ---
import Home from './pages/customer/Home';
import Bookings from './pages/customer/Bookings';
import DeepakHQ from './pages/admin/DeepakHQ'; // ✅ Admin Panel Added Back

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Real-time Listener (Magic Link Click detect karega)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth Event:", _event); // Debugging ke liye
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        
        {/* Route 1: Home Page (Login ki zaroorat nahi, par session pass karenge) */}
        {/* key={session?.user?.id} lagane se login hote hi page refresh ho jayega */}
        <Route 
          path="/" 
          element={<Home key={session?.user?.id} session={session} />} 
        />

        {/* Route 2: My Bookings (Protected - Bina login ke nahi khulega) */}
        <Route 
          path="/bookings" 
          element={session ? <Bookings /> : <Navigate to="/" replace />} 
        />
        
        {/* Route 3: Admin Panel (God Mode) */}
        <Route path="/deepakhq" element={<DeepakHQ />} />

        {/* Fallback: Agar koi galat URL dale to Home par bhej do */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;