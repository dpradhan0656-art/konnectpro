import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingModal from '../../components/customer/BookingModal';
import SOSButton from '../../components/common/SOSButton';
import { Star, Clock, MapPin, Camera, Play, ShieldCheck, ArrowLeft } from 'lucide-react';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Mock Data (Asli app me ye Supabase se aayega)
  const service = {
    id: id,
    name: "Split AC Service",
    rating: 4.8,
    reviews_count: 124,
    basePrice: 599,
    serviceFee: 100,
    eta: "15 mins",
    image: "https://images.unsplash.com/photo-1581094794329-cd56b5095bb4?auto=format&fit=crop&q=80&w=1000",
    description: "Deep cleaning of filters, cooling coil, and drain tray. Gas charging extra if needed."
  };

  // 6.1 Video Reviews Data
  const videoReviews = [
    { id: 1, user: "Rahul S.", thumbnail: "https://images.unsplash.com/photo-1590541673322-959c5d1406c1?auto=format&fit=crop&q=80&w=300", videoUrl: "#" },
    { id: 2, user: "Priya M.", thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=300", videoUrl: "#" },
  ];

  // 3.2 AI Estimator Tool Logic
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAnalyzing(true);
      // Mocking AI Analysis Delay
      setTimeout(() => {
        setAnalyzing(false);
        setEstimatedPrice(service.basePrice + 250); // AI says repair needs more work
        alert("🤖 AI Analysis Complete!\n\nBased on the photo, it looks like the cooling coil needs extra cleaning. Estimate updated.");
      }, 2000);
    }
  };

  const handleBookingConfirm = (mode) => {
    alert(`Booking Confirmed! Payment Mode: ${mode === 'online' ? 'Secure Vault' : 'Pay After Service'}.`);
    setShowBooking(false);
    navigate('/bookings'); // Send to bookings page
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans text-slate-800">
      <SOSButton />

      {/* HEADER IMAGE & NAV */}
      <div className="relative h-64 w-full">
        <img src={service.image} className="w-full h-full object-cover" alt={service.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 to-transparent opacity-80"></div>
        
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-3xl font-extrabold tracking-wide">{service.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-teal-100 text-sm font-bold">
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
              <Star size={12} fill="currentColor" /> {service.rating}
            </span>
            <span>• {service.reviews_count} Reviews</span>
            <span>• {service.eta} ETA</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* PRICE CARD */}
        <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Estimate</p>
            <h2 className="text-2xl font-extrabold text-teal-700">₹{estimatedPrice || service.basePrice + service.serviceFee}</h2>
            {estimatedPrice && <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 rounded">AI Adjusted</span>}
          </div>
          <button 
            onClick={() => setShowBooking(true)}
            className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-amber-600 transition transform hover:-translate-y-1"
          >
            Book Now
          </button>
        </div>

        {/* 3.2 AI ESTIMATOR TOOL */}
        <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
              <h3 className="font-bold text-teal-900 flex items-center gap-2">
                <Camera size={18} /> AI Price Estimator
              </h3>
              <p className="text-xs text-teal-700 mt-1">Upload a photo of the problem to get an exact price.</p>
            </div>
          </div>
          
          <div className="relative z-10">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload}
              id="ai-upload"
              className="hidden"
            />
            <label 
              htmlFor="ai-upload" 
              className={`block w-full text-center py-3 rounded-xl border-2 border-dashed border-teal-300 font-bold cursor-pointer transition ${
                analyzing ? 'bg-teal-100 text-teal-500' : 'bg-white text-teal-600 hover:bg-teal-50'
              }`}
            >
              {analyzing ? '🤖 Analyzing Problem...' : '📷 Click / Upload Photo'}
            </label>
          </div>
          {/* Decorative AI Element */}
          <div className="absolute right-[-10px] top-[-10px] text-6xl opacity-10 rotate-12">🤖</div>
        </div>

        {/* 6.1 VIDEO REVIEWS */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Play size={18} className="text-red-500 fill-current" /> Video Reviews
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {videoReviews.map((review) => (
              <div key={review.id} className="min-w-[140px] relative rounded-xl overflow-hidden shadow-md group cursor-pointer">
                <img src={review.thumbnail} className="w-full h-24 object-cover" alt="User review" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <Play size={16} className="text-white fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-bold">{review.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAFETY BADGE */}
        <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 border border-green-100">
          <ShieldCheck className="text-green-600" size={24} />
          <div>
            <h4 className="font-bold text-green-800 text-sm">Apna Hunar Safety Guarantee</h4>
            <p className="text-xs text-green-600">Verified Experts & Insurance Cover upto ₹5000.</p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal 
          service={service} 
          onClose={() => setShowBooking(false)} 
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
};

export default ServiceDetails;