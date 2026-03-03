import React from 'react';

/** Renders category icon: emoji, image URL, or fallback. */
export default function SmartIcon({ iconValue }) {
  if (!iconValue) return <span className="text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">🔧</span>;
  if (iconValue.startsWith('http')) {
    return <img src={iconValue} alt="Category" className="w-10 h-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110" />;
  }
  return <span className="text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{iconValue}</span>;
}
