import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { User, Phone, MapPin, Search, MessageCircle } from 'lucide-react';

export default function CustomerCRM() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✅ Added Search State

  useEffect(() => {
      const fetchCRM = async () => {
          const { data } = await supabase.from('bookings').select('*');
          if(data) {
              // Logic to filter UNIQUE customers
              const uniqueMap = new Map();
              data.forEach(booking => {
                  // Phone number ko safai se nikalna (Data safety)
                  const phone = booking.customer_phone || booking.phone;
                  
                  if(phone && !uniqueMap.has(phone)) { 
                      uniqueMap.set(phone, {
                          name: booking.customer_name || 'Unknown',
                          phone: phone,
                          address: booking.address,
                          total_orders: 1,
                          last_order: booking.created_at
                      });
                  } else if (phone) {
                      const exist = uniqueMap.get(phone);
                      exist.total_orders += 1;
                  }
              });
              setCustomers(Array.from(uniqueMap.values()));
          }
      };
      fetchCRM();
  }, []);

  // ✅ Search Filter Logic
  const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-4">
            <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <User className="text-indigo-500" /> Customer Database
                </h2>
                <p className="text-slate-400 text-xs mt-1">Total Unique Customers: {customers.length}</p>
            </div>
            
            {/* Search Box */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search Customer..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white focus:border-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        {/* TABLE */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                            <th className="p-4">Customer Details</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">History</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredCustomers.map((cust, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 group transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-white">{cust.name}</div>
                                    <div className="text-[10px] text-slate-500">Last Active: {new Date(cust.last_order).toLocaleDateString()}</div>
                                </td>
                                
                                <td className="p-4 font-mono text-slate-400">{cust.phone}</td>
                                
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-xs">
                                        <MapPin size={14} className="text-slate-600 shrink-0"/> 
                                        <span className="truncate w-32">{cust.address || 'No Address'}</span>
                                    </div>
                                </td>
                                
                                <td className="p-4">
                                    <span className="bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded text-xs font-bold">
                                        {cust.total_orders} Orders
                                    </span>
                                </td>

                                {/* ✅ WhatsApp & Call Buttons */}
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={`https://wa.me/91${cust.phone}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 bg-green-900/20 text-green-500 rounded-lg hover:bg-green-600 hover:text-white transition"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={16}/>
                                        </a>
                                        <a 
                                            href={`tel:${cust.phone}`} 
                                            className="p-2 bg-blue-900/20 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                            title="Call"
                                        >
                                            <Phone size={16}/>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No customers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}