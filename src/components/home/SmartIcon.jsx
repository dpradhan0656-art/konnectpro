import React from 'react';
import { getServiceEmoji, isImageUrl } from '../../lib/serviceIconUtils';

/** Renders category icon: emoji, image URL, or category-based fallback. */
export default function SmartIcon({ iconValue, categoryName }) {
  if (!iconValue) return <span className="text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{getServiceEmoji(categoryName)}</span>;
  if (isImageUrl(iconValue)) {
    const FALLBACK = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&q=80';
    return <img src={iconValue} alt={categoryName || 'Category'} className="w-10 h-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK; }} />;
  }
  return <span className="text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{iconValue}</span>;
}
