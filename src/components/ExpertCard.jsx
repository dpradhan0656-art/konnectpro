import React, { useState } from 'react';
import BookingModal from './BookingModal';
import { MapPin, Star, Clock, CheckCircle } from 'lucide-react'; // Assuming you have lucide-react icons, if not, standard text works too.

const ExpertCard = ({ expert }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🛠️ CONFIGURATION: City Head WhatsApp Numbers
  // Deepak Sir, please replace these dummy numbers with the actual numbers of your City Heads.
  // Format: Country Code + Number (e.g., 919876543210) without '+' sign.
  const getCityHeadNumber = (city) => {
    const cityHeads = {
      'Sagar': '918989092325',    // Rishabh Pradhan (Vinay)
      'Jhansi': '919319414129',   // Sanju Ale
      'Nagpur': '919970814191',   // Shri Babloo Pandey
      'Jabalpur': '917503323131', // Vimla Pradhan
    };

    // Return the specific city head or a default Admin number (Preeti Ji's number)
    return cityHeads[city] || '919589634799'; 
  };

  return (
    <>
      {/* --- Expert Card UI --- */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
        
        {/* Top Section: Image & Badge */}
        <div className="relative h-48 bg-gray-200">
          <img 
            src={expert.image_url || "https://via.placeholder.com/300?text=KonnectPro+Expert"} 
            alt={expert.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-bold text-teal-700 shadow flex items-center gap-1">
            <CheckCircle size={14} /> Verified
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{expert.name}</h3>
              <p className="text-teal-600 font-medium text-sm">{expert.specialization}</p>
            </div>
            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-yellow-700 text-xs font-bold">
              <Star size={14} className="fill-current mr-1" />
              {expert.rating || "New"}
            </div>
          </div>

          {/* Details: Experience & Location */}
          <div className="space-y-2 text-gray-500 text-sm mt-3">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{expert.experience_years || "0"} Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{expert.city}, {expert.area || "Main City"}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* --- Booking Modal Component --- */}
      {/* This renders conditionally when isModalOpen is true */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        expert={expert}
        cityHeadNumber={getCityHeadNumber(expert.city)}
      />
    </>
  );
};

export default ExpertCard;