import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { BRAND } from './config/brandConfig';

// --- PAGES IMPORT ---
import Home from './pages/customer/Home';
import Login from './pages/auth/Login';
import Bookings from './pages/customer/Bookings';
import CategoryView from './pages/customer/CategoryView';
import DeepakHQ from './pages/admin/DeepakHQ'; // ✅ Admin Panel Import

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Branding Title
    document.title = `${BRAND.name} - ${BRAND.tagline}`;
    
    // 2. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 3. Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home key={session?.user?.id} session={session} />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dynamic Service Page */}
        <Route path="/services/:categoryName" element={<CategoryView session={session} />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route 
          path="/bookings" 
          element={session ? <Bookings /> : <Navigate to="/login" replace />} 
        />

        {/* ✅ ADMIN ROUTE (Fixed for Security) */}
        {/* Ab ye sirf '/deepakhq' likhne par hi khulega */}
        <Route path="/deepakhq" element={<DeepakHQ />} />        

        {/* --- CATCH ALL --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;