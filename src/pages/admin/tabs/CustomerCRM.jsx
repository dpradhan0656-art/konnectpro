import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Users, Search, Phone, MapPin, Trash2, 
  MessageCircle, Ban, CheckCircle, Plus, User 
} from 'lucide-react';

export default function CustomerCRM() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- MODAL STATE (Manual Add) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', city: 'Jabalpur' });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    // Hum ab 'customers' table se data layenge, bookings se nahi
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCustomers(data);
    setLoading(false);
  };

  // --- 2. ACTIONS ---
  const handleBlock = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if(!confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} this customer?`)) return;

    const { error } = await supabase
      .from('customers')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
        alert(`Customer is now ${newStatus}`);
        fetchCustomers();
    }
  };

  const deleteCustomer = async (id) => {
    if(!confirm("🛑 DANGER: Delete this customer permanently?")) return;
    await supabase.from('customers').delete().eq('id', id);
    fetchCustomers();
  };

  const addManualCustomer = async (e) => {
      e.preventDefault();
      if(!newCustomer.name || !newCustomer.phone) return alert("Name & Phone required!");

      // Check duplicate
      const { data: exist } = await supabase.from('customers').select('*').eq('phone', newCustomer.phone).maybeSingle();
      if(exist) return alert("Customer already exists!");

      const { error } = await supabase.from('customers').insert([newCustomer]);
      
      if(error) alert("Error: " + error.message);
      else {
          alert("✅ Customer Added!");
          setIsModalOpen(false);
          setNewCustomer({ name: '', phone: '', city: 'Jabalpur' });
          fetchCustomers();
      }
  };

  // --- 3. FILTER ---
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-blue-500" /> Customer Database
          </h2>
          <p className="text-slate-500 text-xs mt-1">Total Unique Customers: {customers.length}</p>
        </div>
        
        <div className="flex gap-2">
             <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/20">
                <Plus size={18}/> <span className="hidden sm:inline">Add New Lead</span>
             </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18}/>
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CUSTOMERS GRID (New Card Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold animate-pulse">Loading Database...</div>
        ) : filteredCustomers.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-900 rounded-[2rem] border border-dashed border-slate-800 text-slate-500 italic">
                No customers found. Click 'Add New Lead' to start!
            </div>
        ) : filteredCustomers.map((cust) => (
          <div key={cust.id} className={`bg-slate-900 border ${cust.status === 'blocked' ? 'border-red-900/50 bg-red-900/10' : 'border-slate-800'} rounded-[2rem] p-5 hover:border-blue-500/50 transition-all group relative overflow-hidden`}>
            
            {/* Status Badge */}
            {cust.status === 'blocked' && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    BLOCKED
                </div>
            )}

            <div className="flex items-center gap-4 mb-4 mt-2">
                {/* Auto Avatar based on Name */}
                <img 
                    src={`https://ui-avatars.com/api/?name=${cust.name}&background=3b82f6&color=fff&bold=true`} 
                    alt={cust.name} 
                    className="w-14 h-14 rounded-2xl border-2 border-slate-700"
                />
                <div>
                    <h3 className="text-lg font-black text-white leading-tight">{cust.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-xs font-bold bg-slate-950 px-2 py-0.5 rounded flex items-center gap-1">
                            <MapPin size={10}/> {cust.city}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-2 border-t border-slate-800 pt-4">
                {/* 1. Call */}
                <a href={`tel:${cust.phone}`} className="col-span-1 bg-slate-950 hover:bg-blue-600 text-slate-400 hover:text-white py-2 rounded-xl flex justify-center items-center transition-colors border border-slate-800" title="Call Customer">
                    <Phone size={18}/>
                </a>
                
         {/* 2. WhatsApp (Professional Message) */}
{/* 2. WhatsApp (Professional Message for Kshatr) */}
<a 
  href={`https://wa.me/91${cust.phone}?text=${encodeURIComponent(
    `Dear ${cust.name},\n\nGreetings from *Kshatr*! 🙏\n\nWe are delighted to have you as our valued customer. Through the *Kshatr* app/website, you can easily book professional services for:\n\n✅ *Electrician* (Wiring & Repairs)\n✅ *Plumber* (Leakage & Fitting)\n✅ *AC Repair* (Service & Gas Filling)\n✅ *Cleaning* (Deep Home Cleaning)\n✅ *Carpenter* (Furniture Work)\n\nIs there anything we can assist you with today?\n\nBest Regards,\nTeam *Kshatr* 🇮🇳`
  )}`} 
  target="_blank" 
  rel="noreferrer" 
  className="col-span-1 bg-slate-950 hover:bg-green-600 text-slate-400 hover:text-white py-2 rounded-xl flex justify-center items-center transition-colors border border-slate-800" 
  title="WhatsApp via Kshatr"
>
    <MessageCircle size={18}/>
</a>                 

                {/* 3. Block/Unblock */}
                <button onClick={() => handleBlock(cust.id, cust.status)} className={`col-span-1 bg-slate-950 hover:text-white py-2 rounded-xl flex justify-center items-center transition-colors border border-slate-800 ${cust.status === 'blocked' ? 'text-red-500 hover:bg-green-600' : 'text-slate-400 hover:bg-amber-600'}`} title="Block/Unblock">
                    {cust.status === 'blocked' ? <CheckCircle size={18}/> : <Ban size={18}/>}
                </button>

                {/* 4. Delete */}
                <button onClick={() => deleteCustomer(cust.id)} className="col-span-1 bg-slate-950 hover:bg-red-600 text-slate-400 hover:text-white py-2 rounded-xl flex justify-center items-center transition-colors border border-slate-800" title="Delete">
                    <Trash2 size={18}/>
                </button>
            </div>
            
            <div className="mt-3 text-center">
                 <p className="text-xs font-mono text-slate-600 tracking-widest">{cust.phone}</p>
            </div>

          </div>
        ))}
      </div>

      {/* --- ADD MANUAL CUSTOMER MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-700 shadow-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Plus className="text-blue-500"/> Add New Lead</h3>
                  <form onSubmit={addManualCustomer} className="space-y-3">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Name</label>
                          <input type="text" placeholder="e.g. Amit Kumar" required className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Phone</label>
                          <input type="number" placeholder="9876543210" required className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">City</label>
                          <input type="text" placeholder="Jabalpur" className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})}/>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold">Cancel</button>
                          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Save Lead</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}