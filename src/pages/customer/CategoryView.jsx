import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { getUserCityKey, filterServicesByCity } from '../../lib/serviceCityUtils';
import BookingModal from '../../components/customer/BookingModal';
import { ArrowLeft, Star, Clock, ShoppingBag, Plus, ShieldCheck, Zap, Info } from 'lucide-react';
import { getServiceEmoji, isImageUrl } from '../../lib/serviceIconUtils';
import { getServiceFallbackImage } from '../../lib/fallbackImages';

export default function CategoryView() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cleanCategoryName = category ? category.replace(/-/g, ' ') : '';

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .ilike('category', `%${cleanCategoryName}%`)
        .eq('is_active', true);

      const userCity = getUserCityKey();
      const list = data || [];
      if (!error) setServices(filterServicesByCity(list, userCity));
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
    <div className="min-h-screen max-w-[100vw] w-full overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-4 pb-32 font-sans text-slate-100 selection:bg-teal-500/30"> 
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white pt-6 pb-10 px-6 rounded-b-[3rem] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] relative overflow-hidden w-full box-border border-b border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/25 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all active:scale-95 border border-white/10">
                <ArrowLeft size={24} className="text-white" />
            </button>
            <div>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-[10px] mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Verified Experts</p>
                <h1 className="text-3xl font-black capitalize tracking-tight">{cleanCategoryName}</h1>
            </div>
          </div>
      </div>

      {/* SERVICE LIST */}
      <div className="px-4 mt-8 space-y-6 max-w-2xl mx-auto relative z-20 w-full min-w-0">
        
        {loading ? (
           <div className="text-center py-20 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-lg border border-slate-200/90 ring-1 ring-slate-100">
             <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-slate-600 font-bold uppercase tracking-widest animate-pulse text-xs">Loading {cleanCategoryName}...</p>
             <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
               Powered by Kshatryx Technologies
             </p>
           </div>
        ) : services.length === 0 ? (
           <div className="text-center py-16 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-lg border border-slate-200/90 p-8 ring-1 ring-slate-100">
              <span className="text-5xl block mb-4">{getServiceEmoji(cleanCategoryName)}</span>
              <p className="text-slate-600 font-bold">No active services found for <span className="text-slate-900 capitalize">{cleanCategoryName}</span>.</p>
           </div>
        ) : (
          services.map((service) => {
            const finalPrice = findDisplayPrice(service); 
            const fallbackImg = getServiceFallbackImage(service?.name || cleanCategoryName);
            const rawImg = service.image_url || service.image || service.img || '';
            const useImgUrl = isImageUrl(rawImg);
            const imgSrc = useImgUrl ? (rawImg || fallbackImg) : fallbackImg;

            return (
            <div key={service.id} className="bg-white/95 backdrop-blur-sm p-4 rounded-[2rem] shadow-[0_12px_40px_-12px_rgba(15,23,42,0.08)] border border-slate-200/90 flex gap-4 transition-all hover:border-blue-300/90 hover:shadow-[0_16px_44px_-8px_rgba(37,99,235,0.12)] group ring-1 ring-slate-100">
              
              {/* IMAGE SECTION – URL ya emoji */}
              <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-200/80 relative flex items-center justify-center">
                 <img 
                   src={imgSrc} 
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
                       <span className="flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold"><Star size={10} fill="currentColor"/> 4.8</span>
                       <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><Clock size={10}/> 45 mins</span>
                    </div>

                    {/* ✅ NEW: CUSTOMER NOTE */}
                    {service.note && (
                        <div className="mt-2.5 bg-slate-50 border border-slate-200/90 p-2 rounded-lg flex gap-1.5 items-start">
                            <Info size={12} className="text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-[9px] text-slate-600 leading-tight font-medium">
                                <span className="font-bold text-slate-800">Note:</span> {service.note}
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
                            <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/80">
                                Price on Inspection
                            </div>
                        )}
                    </div>
                    
                    {/* ADD BUTTON */}
                    {getQty(service.id) > 0 ? (
                        <button onClick={() => navigate('/cart')} className="bg-slate-100 border border-slate-300 text-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:bg-slate-200/90 active:scale-95 transition-all">
                           <ShoppingBag size={16}/> <span className="text-xs font-bold">VIEW CART</span>
                        </button>
                    ) : (
                        <button 
                           onClick={() => addToCart(service)}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 border border-blue-500/80 active:scale-95 transition-all flex items-center gap-1"
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