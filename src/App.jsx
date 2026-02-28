import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Contexts
import { CartProvider } from './context/CartContext'; 
import { ConfigProvider } from './context/ConfigContext'; 
import { ThemeProvider } from './context/ThemeContext'; 

// Components
import Navbar from './components/common/Navbar'; 
import Footer from './components/common/Footer'; 

// 1. CUSTOMER PAGES
import Home from './pages/customer/Home';
import Login from './pages/auth/Login'; 
import Bookings from './pages/customer/Bookings';
import CategoryView from './pages/customer/CategoryView'; 
import Cart from './pages/customer/Cart'; 
import Checkout from './pages/customer/Checkout';
import Profile from './pages/customer/Profile';

// 2. ADMIN PAGES
import DeepakHQ from './pages/admin/DeepakHQ'; 

// 3. EXPERT PAGES
import ExpertDashboard from './pages/expert/ExpertDashboard';
import PartnerApp from './pages/expert/PartnerApp'; 
import ExpertLogin from './pages/expert/ExpertLogin'; 
import ExpertKYC from './pages/expert/ExpertKYC';
import RegisterExpert from './pages/RegisterExpert'; 

// 4. AREA HEAD PAGES
import AreaHeadApp from './pages/area_head/AreaHeadApp'; 
import AreaHeadLogin from './pages/area_head/AreaHeadLogin'; 

// Legal Pages
import About from './pages/legal/About';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Refund from './pages/legal/Refund';
import AntiDiscrimination from './pages/legal/AntiDiscrimination';
import Careers from './pages/legal/Careers';

// Helper: Scroll to Top
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// 🛡️ 4 Separate Worlds Layout
const Layout = ({ children }) => {
  const location = useLocation();
  
  // कस्टमर का Navbar/Footer बाकी 3 पैनल्स में बिल्कुल नहीं दिखेगा
  const isHiddenPage = location.pathname.startsWith('/deepakhq') || 
                       location.pathname.startsWith('/expert') || 
                       location.pathname === '/expert-dashboard' || 
                       location.pathname.startsWith('/area-head') || 
                       location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
       {!isHiddenPage && <Navbar />}
       <main className={`flex-1 ${!isHiddenPage ? 'pt-24 md:pt-24' : ''}`}>
          {children}
       </main>
       {!isHiddenPage && <Footer />} 
    </div>
  );
};

const AppRoutes = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* ========================================== */}
          {/* DOOR 1: CUSTOMER PORTAL */}
          {/* ========================================== */}
          <Route path="/" element={<Home session={session} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/category/:category" element={<CategoryView session={session} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/bookings" element={session ? <Bookings /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" replace />} />
          
          {/* ========================================== */}
          {/* DOOR 2: DEEPAKHQ (SUPER ADMIN) */}
          {/* ========================================== */}
          <Route path="/deepakhq/*" element={<DeepakHQ />} />         
          
          {/* ========================================== */}
          {/* DOOR 3: EXPERT (PARTNER) PORTAL */}
          {/* ========================================== */}
          <Route path="/expert-dashboard" element={<ExpertDashboard />} />
          <Route path="/expert/login" element={<ExpertLogin />} />
          <Route path="/expert/kyc" element={<ExpertKYC />} />
          <Route path="/expert/dashboard" element={session ? <PartnerApp /> : <Navigate to="/expert/login" replace />} />
          <Route path="/register-expert" element={<RegisterExpert />} />
          
          {/* ========================================== */}
          {/* DOOR 4: AREA HEAD PORTAL */}
          {/* ========================================== */}
          <Route path="/area-head/login" element={<AreaHeadLogin />} />
          <Route path="/area-head/dashboard" element={session ? <AreaHeadApp /> : <Navigate to="/area-head/login" replace />} />
          
          {/* LEGAL & OTHERS */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund-policy" element={<Refund />} />
          <Route path="/anti-discrimination" element={<AntiDiscrimination />} />
          <Route path="/careers" element={<Careers />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;