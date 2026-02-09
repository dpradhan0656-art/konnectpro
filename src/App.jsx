import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Customer Pages
import Home from './pages/customer/Home';
import ServiceDetails from './pages/customer/ServiceDetails';
import Bookings from './pages/customer/Bookings';
import Profile from './pages/customer/Profile';

// Expert Pages
import ExpertDashboard from './pages/expert/ExpertDashboard';
import RegisterExpert from './pages/expert/RegisterExpert'; // ✅ (1) यह लाइन नई जुड़ी है

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import DeepakHQ from './pages/admin/DeepakHQ';

// Legal Pages
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Refund from './pages/legal/Refund';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/service/:id" element={<ServiceDetails />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />

        {/* Expert Routes */}
        <Route path="/expert" element={<ExpertDashboard />} />
        <Route path="/register-expert" element={<RegisterExpert />} /> {/* ✅ (2) यह रूट नया जुड़ा है */}

        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Route */}
        <Route path="/deepakhq" element={<DeepakHQ />} />

        {/* Legal Routes (Required for Razorpay) */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
      </Routes>
    </Router>
  );
}

export default App;