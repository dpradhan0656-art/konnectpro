import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';
import Logo from './Logo'; // 🔥 New Logo Import

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Navigation Items
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={24} /> },
    { name: 'Bookings', path: '/bookings', icon: <Calendar size={24} /> },
    { name: 'Profile', path: '/profile', icon: <User size={24} /> },
  ];

  return (
    <>
      {/* 🖥️ DESKTOP NAVBAR (Header) */}
      <nav className="hidden md:flex fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 h-16 items-center px-8 justify-between transition-all duration-300 shadow-sm">
        
        {/* 🔥 NEW LOGO HERE */}
        <Link to="/">
          <Logo size={40} color="dark" />
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.path) ? 'text-primary font-bold' : 'text-gray-500'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
            Login
          </Link>
        </div>
      </nav>

      {/* 📱 MOBILE NAVBAR (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90 ${
                isActive(item.path) ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive(item.path) ? 'bg-primary/10' : 'bg-transparent'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive(item.path) ? 'font-bold' : ''}`}>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
