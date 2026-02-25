import React from 'react';

export default function ExpertHeader({ expertData, toggleDuty }) {
  if (!expertData) return null;

  return (
    <div className="bg-[#0f172a] text-white p-6 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
      <div className="flex justify-between items-center mb-1">
          <div>
              <h2 className="font-black text-xl">{expertData.name}</h2>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">{expertData.service_category} Expert</p>
          </div>
          <button 
            onClick={toggleDuty} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all border ${
              expertData.is_online 
                ? 'bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
              <div className={`w-2 h-2 rounded-full ${expertData.is_online ? 'bg-white animate-pulse' : 'bg-slate-500'}`}></div>
              {expertData.is_online ? 'ON DUTY' : 'OFF DUTY'}
          </button>
      </div>
    </div>
  );
}
