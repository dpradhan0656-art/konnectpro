import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getServiceEmoji, isImageUrl } from '../../lib/serviceIconUtils';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';

function CartItemIcon({ item }) {
  const [imgError, setImgError] = useState(false);
  const showImg = isImageUrl(item.image) && !imgError;
  const emoji = item.image && !isImageUrl(item.image) ? item.image : getServiceEmoji(item.category || item.name);
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-teal-50">
      {showImg ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <span className="text-2xl">{emoji}</span>
      )}
    </div>
  );
}

export default function Cart() {
  const { cart, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  // --- VIEW 1: EMPTY CART (Khali Tokri) ---
  if (cart.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full max-w-[100vw] overflow-x-hidden bg-white p-6 animate-in fade-in"
        style={{ minHeight: 'calc(100dvh - 120px)' }}
      >
        {/* OLD: min-h-screen — full viewport, could misalign with Header+BottomNav */}
        <div className="bg-slate-50 p-5 rounded-full mb-5">
          <ShoppingBag size={48} className="text-slate-300" aria-hidden />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Aapki Cart Khali Hai!</h2>
        <p className="text-slate-400 text-center mb-6 sm:mb-8 max-w-xs text-sm">
          Lagta hai aapne abhi tak koi service select nahi ki hai.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Go to Services
        </button>
      </div>
    );
  }

  // --- VIEW 2: CART WITH ITEMS (Dukan ki list) ---
  return (
    <div className="min-h-screen max-w-[100vw] w-full overflow-x-hidden bg-gray-50 font-sans animate-in slide-in-from-right-10" style={{ paddingBottom: 'max(6rem, env(safe-area-inset-bottom, 0px) + 5rem)' }}>
      
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600"/>
        </button>
        <h1 className="text-lg font-black text-slate-900">My Cart ({cart.length})</h1>
      </div>

      {/* Cart Items List */}
      <div className="p-4 space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center animate-in fade-in">
            
            {/* Item Info */}
            <div className="flex gap-4 items-center">
              <CartItemIcon item={item} />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black">{item.category || 'Service'}</p>
                <p className="text-sm font-black text-blue-600 mt-1">₹{item.base_price || item.price}</p>
              </div>
            </div>

            {/* Remove Button */}
            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Bill Summary (The Parchi) */}
      <div className="p-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Payment Summary</h3>
            
            <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Items Total</span>
                <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Convenience Fee</span>
                <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-dashed border-slate-200 my-2"></div>
            <div className="flex justify-between text-lg font-black text-slate-900">
                <span>Grand Total</span>
                <span>₹{cartTotal}</span>
            </div>
        </div>
      </div>

      {/* Checkout Bar (Floating at bottom) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
            <button 
                onClick={() => navigate('/checkout')} 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 flex justify-between items-center px-6 hover:bg-blue-700 transition-all active:scale-95"
            >
                <div className="text-left">
                    <p className="text-[10px] text-blue-200 uppercase leading-none">Total to pay</p>
                    <p className="text-xl">₹{cartTotal}</p>
                </div>
                <span className="flex items-center gap-2">Checkout <ArrowRight size={20}/></span>
            </button>
        </div>
      </div>

    </div>
  );
}