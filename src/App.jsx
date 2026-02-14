import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { BRAND } from './config/brandConfig'; // ✅ Brand Config Connect

// --- PAGES IMPORT ---
import Home from './pages/customer/Home';
import Login from './pages/auth/Login';
import Bookings from './pages/customer/Bookings'; // ✅ User Bookings
import CategoryView from './pages/customer/CategoryView'; // ✅ New Dynamic Category Page
import DeepakHQ from './pages/admin/DeepakHQ'; // ✅ Admin Panel

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Page Title Set karna (Branding)
    document.title = `${BRAND.name} - ${BRAND.tagline}`;
    
    // 2. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 3. Realtime Auth Listener (Login/Logout detection)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES (Sabke liye khule hain) --- */}
        <Route path="/" element={<Home key={session?.user?.id} session={session} />} />
        <Route path="/login" element={<Login />} />
        
        {/* ✅ Dynamic Service Route: (e.g. /services/ac-repair, /services/cleaning) */}
        <Route path="/services/:categoryName" element={<CategoryView session={session} />} />

        {/* --- PROTECTED ROUTES (Sirf Login user ke liye) --- */}
        <Route 
          path="/bookings" 
          element={session ? <Bookings /> : <Navigate to="/login" replace />} 
        />

        {/* --- ADMIN ROUTE --- */}
        {/* Purana hatayein aur ye nayi line likhein earlier it was <Route path="/deepakhq" element={<DeepakHQ />} /> */}
        <Route path="/admin" element={<DeepakHQ />} />        

        {/* --- CATCH ALL (Galat link par Home bhej do) --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;