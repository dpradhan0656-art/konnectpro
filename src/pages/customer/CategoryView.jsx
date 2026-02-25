import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import BookingModal from '../../components/customer/BookingModal';
import { ArrowLeft, Star, Clock, ShoppingBag, Plus, ShieldCheck, Zap, Info } from 'lucide-react';

export default function CategoryView() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cleanCategoryName = category ? category.replace(/-/g, ' ') : '';

  const getFallbackImage = (cat) => {
      const lowerCat = (cat || "").toLowerCase();
      if(lowerCat.includes('ac') || lowerCat.includes('cool')) return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80";
      if(lowerCat.includes('clean') || lowerCat.includes('wash')) return "https://images.unsplash.com/photo-1581578731117-e0a820379b73?w=500&q=80";
      if(lowerCat.includes('paint')) return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80";
      if(lowerCat.includes('plumb') || lowerCat.includes('water') || lowerCat.includes('ro')) return "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80";
      if(lowerCat.includes('electr') || lowerCat.includes('light')) return "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80";
      if(lowerCat.includes('carpen') || lowerCat.includes('wood')) return "https://images.unsplash.com/photo-1622295023576-e41332a813d0?w=500&q=80";
      if(lowerCat.includes('salon') || lowerCat.includes('hair') || lowerCat.includes('beauty')) return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80"; 
      return "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&q=80"; 
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .ilike('category', `%${cleanCategoryName}%`)
        .eq('is_active', true); 

      if (!error) setServices(data || []);
      setLoading(false);
    };
    fetchServices();
  }, [cleanCategoryName]);

  const getQty = (id) => cart.find(i => i.id === id) ? 1 : 0;

  const findDisplayPrice = (service) => {
      const val = service.base_price || service.price || service.rate || service.amount;
      const num = parseFloat(val);
      return (num && num > 0) ? num : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-teal-100"> 
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white pt-6 pb-10 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all active:scale-95 border border-white/10">
                <ArrowLeft size={24} className="text-white" />
            </button>
            <div>
                <p className="text-teal-400 font-bold uppercase tracking-widest text-[10px] mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Verified Experts</p>
                <h1 className="text-3xl font-black capitalize tracking-tight">{cleanCategoryName}</h1>
            </div>
          </div>
      </div>

      {/* SERVICE LIST */}
      <div className="px-4 -mt-8 space-y-5 max-w-2xl mx-auto relative z-20">
        
        {loading ? (
           <div className="text-center py-20 bg-white rounded-[2rem] shadow-lg border border-slate-100">
             <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse text-xs">Loading {cleanCategoryName}...</p>
           </div>
        ) : services.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8">
              <Zap size={48} className="mx-auto mb-4 text-slate-300"/>
              <p className="text-slate-500 font-bold">No active services found for <span className="text-slate-800 capitalize">{cleanCategoryName}</span>.</p>
           </div>
        ) : (
          services.map((service) => {
            const finalPrice = findDisplayPrice(service); 
            const fallbackImg = getFallbackImage(cleanCategoryName);

            return (
            <div key={service.id} className="bg-white p-4 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex gap-4 transition-all hover:border-teal-500/30 group">
              
              {/* IMAGE SECTION */}
              <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner relative">
                 <img 
                   src={service.image_url || fallbackImg} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }} 
                   alt={service.name}
                 />
              </div>

              {/* INFO SECTION */}
              <div className="flex-1 flex flex-col justify-between py-1">
                 <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{service.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold"><Star size={10} fill="currentColor"/> 4.8</span>
                       <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock size={10}/> 45 mins</span>
                    </div>

                    {/* ✅ NEW: CUSTOMER NOTE */}
                    {service.note && (
                        <div className="mt-2.5 bg-slate-50 border border-slate-100 p-2 rounded-lg flex gap-1.5 items-start">
                            <Info size={12} className="text-teal-500 mt-0.5 shrink-0" />
                            <p className="text-[9px] text-slate-500 leading-tight font-medium">
                                <span className="font-bold text-slate-700">Note:</span> {service.note}
                            </p>
                        </div>
                    )}
                 </div>

                 <div className="flex justify-between items-end mt-3">
                    
                    {/* PRICE DISPLAY */}
                    <div>
                        {finalPrice ? (
                            <div className="text-xl font-black text-slate-900">₹{finalPrice}</div>
                        ) : (
                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                Price on Inspection
                            </div>
                        )}
                    </div>
                    
                    {/* ADD BUTTON */}
                    {getQty(service.id) > 0 ? (
                        <button onClick={() => navigate('/cart')} className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                           <ShoppingBag size={16}/> <span className="text-xs font-bold">VIEW CART</span>
                        </button>
                    ) : (
                        <button 
                           onClick={() => addToCart(service)}
                           className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-teal-900/20 active:scale-95 transition-all flex items-center gap-1"
                        >
                           ADD <Plus size={14}/>
                        </button>
                    )}
                 </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {isModalOpen && <BookingModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}