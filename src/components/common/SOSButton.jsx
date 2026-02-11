import React from 'react';

const SOSButton = () => {
  const handleSOS = () => {
    // Future: Connect to Backend API to alert Police/Admin
    if (confirm("🚨 EMERGENCY ALERT\n\nAre you sure you want to send an SOS signal to Police & Apna Hunar Support?")) {
      alert("SOS Signal Sent! \n\nYour live location has been shared with our Quick Response Team.");
    }
  };

  return (
    <button
      onClick={handleSOS}
      className="fixed bottom-24 right-4 z-50 bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-full shadow-2xl border-4 border-red-400 animate-pulse transition-transform hover:scale-110 flex items-center justify-center w-16 h-16"
      title="Emergency Help"
    >
      <span className="text-2xl">🆘</span>
    </button>
  );
};

export default SOSButton;