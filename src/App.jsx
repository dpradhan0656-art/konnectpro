import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { BRAND } from './config/brandConfig';

// --- PAGES IMPORT ---
import Home from './pages/customer/Home';
import Login from './pages/auth/Login';
import Bookings from './pages/customer/Bookings';
import CategoryView from './pages/customer/CategoryView';
import DeepakHQ from './pages/admin/DeepakHQ'; 
import About from './pages/legal/About';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Refund from './pages/legal/Refund';
import AntiDiscrimination from './pages/legal/AntiDiscrimination';
import Careers from './pages/legal/Careers';

// ✅ CORRECT IMPORT: (New Expert Form)
import RegisterExpert from './pages/RegisterExpert'; 

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

        {/* ✅ EXPERT REGISTRATION (Single & Correct Route) */}
        <Route path="/register-expert" element={<RegisterExpert />} />
        
        {/* ✅ ADMIN ROUTE */}
        <Route path="/deepakhq" element={<DeepakHQ />} />        

        {/* --- LEGAL ROUTES --- */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<Refund />} />
        <Route path="/anti-discrimination" element={<AntiDiscrimination />} />
        <Route path="/careers" element={<Careers />} />

        {/* --- CATCH ALL (404) --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;