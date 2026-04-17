import React from 'react';
import { Clock, Sun, Sunrise, Sunset } from 'lucide-react';

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '09:00 AM - 12:00 PM', icon: Sunrise },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 04:00 PM', icon: Sun },
  { id: 'evening', label: 'Evening', time: '04:00 PM - 08:00 PM', icon: Sunset },
];

export default function TimeSlotPicker({ selectedSlot, onSelectSlot }) {
  return (
    <div className="w-full mt-6 mb-4">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Clock size={18} className="text-emerald-700" />
        Select Time Slot <span className="text-red-500">*</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIME_SLOTS.map((slot) => {
          const Icon = slot.icon;
          const isSelected = selectedSlot === slot.time;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot.time)}
              className={`relative flex flex-col items-start p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left touch-manipulation active:scale-[0.98] ${
                isSelected
                  ? 'border-amber-400 bg-emerald-50/50 shadow-md ring-1 ring-amber-400/50'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={16} className={isSelected ? 'text-amber-600' : 'text-slate-400'} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-emerald-900' : 'text-slate-500'}`}>
                  {slot.label}
                </span>
              </div>
              <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                {slot.time}
              </span>

              {/* Gold Active Indicator Dot */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
