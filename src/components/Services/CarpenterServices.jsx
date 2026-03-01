import React from 'react';
import { Hammer, Armchair, DoorOpen, Paintbrush, Drill, Wrench, Lock } from 'lucide-react';

// Naya data array, purane code ko bina disturb kiye
const carpenterServicesData = [
  { id: 1, name: 'General Repair & Fixing', icon: <Hammer size={24} />, rate: '₹250 - ₹500 / Visit' },
  { id: 2, name: 'Custom Furniture Making', icon: <Armchair size={24} />, rate: '₹800 - ₹1,500 / Day' },
  { id: 3, name: 'Door & Window Install', icon: <DoorOpen size={24} />, rate: '₹400 - ₹1,000 / Piece' },
  { id: 4, name: 'Wood Polishing & Varnish', icon: <Paintbrush size={24} />, rate: '₹500 - ₹2,000 / Item' },
  { id: 5, name: 'Drilling & Wall Hanging', icon: <Drill size={24} />, rate: '₹150 - ₹300 / Task' },
  { id: 6, name: 'Modular Kitchen Woodwork', icon: <Wrench size={24} />, rate: 'Contract Basis' },
  { id: 7, name: 'Lock Install & Repair', icon: <Lock size={24} />, rate: '₹200 - ₹600 / Lock' },
];

const CarpenterServices = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Carpenter Services</h2>
      <ul className="divide-y divide-gray-200">
        {carpenterServicesData.map((service) => (
          <li key={service.id} className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3 text-gray-700">
              <span className="text-blue-600">{service.icon}</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <span className="text-gray-900 font-semibold">{service.rate}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarpenterServices;