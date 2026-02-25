import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Cart ko LocalStorage se load karo (Taaki refresh par data na ude)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('konnect_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Jaise hi Cart badle, use LocalStorage me save karo
  useEffect(() => {
    localStorage.setItem('konnect_cart', JSON.stringify(cart));
  }, [cart]);

  // 💰 PRICE HUNTER LOGIC (Sabse Jaruri Hissa)
  // Ye function check karega ki rate kis naam se chupa hai
  const findBestPrice = (item) => {
    // Priority 1: 'base_price' (Jo humne DB scan me dekha)
    if (item.base_price) return Number(item.base_price);
    
    // Priority 2: 'price' (Agar purana data ho)
    if (item.price) return Number(item.price);
    
    // Priority 3: 'rate' or 'amount'
    if (item.rate) return Number(item.rate);
    if (item.amount) return Number(item.amount);
    
    return 0; // Agar kuch na mile
  };

  // ✅ ADD TO CART
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Check: Kya ye item pehle se added hai?
      const exists = prevCart.find((i) => i.id === item.id);
      if (exists) {
        alert("Ye service pehle se cart me hai! 🛒");
        return prevCart;
      }
      
      // Price dhundo
      let finalPrice = findBestPrice(item);
      
      // Fallback: Agar galti se 0 aa gaya, to default 199 maan lo (Safety)
      if (!finalPrice || finalPrice === 0) finalPrice = 199;

      const newItem = {
        id: item.id,
        name: item.name || item.service_name || 'Service', 
        price: finalPrice, // Ab yahan sahi rate aayega
        image: item.image_url || item.image || '',
        category: item.category || 'Expert Service'
      };

      return [...prevCart, newItem];
    });
  };

  // ❌ REMOVE FROM CART
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // 🧹 CLEAR CART
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('konnect_cart');
  };

  // 🧮 LIVE CALCULATIONS (Billing Logic)
  const cartTotal = cart.reduce((total, item) => total + (Number(item.price) || 0), 0);
  
  // Logic: ₹199 se jyada hone par Delivery Fee MAAF
  const convenienceFee = cartTotal > 199 ? 0 : 49; 
  
  const grandTotal = cartTotal > 0 ? cartTotal + convenienceFee : 0;
  
  const feeMessage = cartTotal > 199 
    ? "🎉 Convenience Fee FREE!" 
    : `💡 Add items worth ₹${200 - cartTotal} more to save ₹49 Fee!`;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartTotal, 
      grandTotal, 
      convenienceFee, 
      feeMessage 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);