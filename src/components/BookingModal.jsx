// src/components/BookingModal.jsx
import React, { useState } from 'react';

const BookingModal = ({ isOpen, onClose, expert, cityHeadNumber }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    problem: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the WhatsApp message
    const message = `*New Service Request via KonnectPro*%0A%0A` +
                    `*Customer Name:* ${formData.name}%0A` +
                    `*Phone:* ${formData.phone}%0A` +
                    `*Address:* ${formData.address}%0A` +
                    `*Problem:* ${formData.problem}%0A` +
                    `*Selected Expert:* ${expert.name} (${expert.specialization})%0A` +
                    `*City:* ${expert.city}`;

    // Use the City Head's number or Expert's number if available
    // For now, let's send it to the City Head so they can assign it.
    // Ensure the number is in international format without '+' (e.g., 919876543210)
    const targetNumber = cityHeadNumber || '919876543210'; // Default to a fallback if needed

    const whatsappUrl = `https://wa.me/${targetNumber}?text=${message}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Close the modal after submission
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-teal-800 mb-4">Book {expert.name}</h2>
        <p className="text-sm text-gray-600 mb-4">Fill in your details to request service.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Your Name</label>
            <input 
              type="text" 
              name="name" 
              required
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-teal-500"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              required
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-teal-500"
              placeholder="10-digit mobile number"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Address</label>
            <textarea 
              name="address" 
              required
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-teal-500"
              placeholder="House No, Colony, Landmark..."
              rows="2"
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Describe Problem</label>
            <textarea 
              name="problem" 
              required
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-teal-500"
              placeholder="e.g., Fan not working, Tap leaking..."
              rows="2"
              onChange={handleChange}
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full bg-teal-600 text-white font-bold py-3 rounded hover:bg-teal-700 transition duration-300 flex justify-center items-center"
          >
            Send Request via WhatsApp <span className="ml-2 text-xl">📱</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;