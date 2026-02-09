import React, { useState } from 'react';
import { Users, Calendar, DollarSign, Activity, Star, Search, Wallet, Gift, PlusCircle } from 'lucide-react';

export default function DeepakHQ() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dummy Experts Data (Database ki jagah)
  const [experts, setExperts] = useState([
    { id: 1, name: "Ramesh Kumar", service: "Plumber", phone: "9876543210", balance: 150, status: "Active" },
    { id: 2, name: "Suresh Electrician", service: "Electrician", phone: "9876543211", balance: 0, status: "Inactive" },
    { id: 3, name: "Anita Cleaning", service: "Cleaning", phone: "9876543212", balance: 500, status: "Active" },
  ]);

  // Admin dwara wallet recharge karne ka function
  const handleManualRecharge = (id, amount) => {
    const updatedExperts = experts.map(expert => {
      if (expert.id === id) {
        return { ...expert, balance: expert.balance + amount };
      }
      return expert;
    });
    setExperts(updatedExperts);
    alert(`Success! ₹${amount} added to Expert's wallet.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-10 text-yellow-400">Deepak HQ 👑</h1>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <Activity size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('experts')} className={`flex items-center gap-3 w-full p-3 rounded-xl ${activeTab === 'experts' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <Users size={20} /> Manage Experts
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 w-full p-3 rounded-xl ${activeTab === 'bookings' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <Calendar size={20} /> Bookings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* EXPERTS MANAGEMENT TAB */}
        {activeTab === 'experts' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="text-blue-600"/> Manage Experts & Wallets
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <tr>
                    <th className="p-4">Expert Name</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Current Wallet</th>
                    <th className="p-4">Give Bonus / Recharge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {experts.map((expert) => (
                    <tr key={expert.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{expert.name}</p>
                        <p className="text-xs text-slate-400">{expert.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">{expert.service}</span>
                      </td>
                      <td className="p-4 font-bold text-green-600 text-lg">
                        ₹{expert.balance}
                      </td>
                      <td className="p-4 flex gap-2">
                        {/* Admin Action Buttons */}
                        <button 
                          onClick={() => handleManualRecharge(expert.id, 100)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Gift size={14}/> +₹100 Bonus
                        </button>
                        <button 
                          onClick={() => handleManualRecharge(expert.id, 500)}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Wallet size={14}/> +₹500 Recharge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB (Purana Wala) */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Business Overview</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-slate-800">₹12,450</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign size={24}/></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm">Active Bookings</p>
                    <h3 className="text-3xl font-bold text-slate-800">8</h3>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Calendar size={24}/></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm">Experts Online</p>
                    <h3 className="text-3xl font-bold text-slate-800">12</h3>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Users size={24}/></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}