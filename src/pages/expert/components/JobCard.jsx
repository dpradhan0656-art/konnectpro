import React, { useState } from 'react';
import { MapPin, Navigation, ShieldCheck, CheckCircle } from 'lucide-react';

export default function JobCard({ job, onStartTrip, onArrive, onVerifyStart, onVerifyFinish }) {
  // OTP state is now LOCAL to this card (Modular!)
  const [localOtp, setLocalOtp] = useState("");

  const getStatusColor = (status) => {
    switch(status) {
        case 'completed': return 'bg-green-600';
        case 'in_progress': return 'bg-amber-600';
        default: return 'bg-blue-600';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden mb-4 transition-all hover:shadow-md">
      {/* Status Badge */}
      <div className={`absolute top-0 right-0 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase ${getStatusColor(job.status)}`}>
          {job.status.replace(/_/g, ' ')}
      </div>

      <div className="mb-4">
          <h4 className="font-bold text-lg text-slate-800">{job.service_name}</h4>
          <p className="text-xs font-bold text-slate-400 mb-2 font-mono">Order #{job.id.toString().slice(0,8)}</p>
          
          {/* Address Box */}
          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0"/>
              <div>
                  <p className="text-sm font-bold text-slate-700">{job.customer_name || "Customer"}</p>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{job.address}</p>
                  {/* Google Maps Link Button */}
                  {job.address && job.address.includes("http") && (
                      <a 
                        href={job.address.split("Map: ")[1].trim()} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-200"
                      >
                        <Navigation size={10} /> Open Map
                      </a>
                  )}
              </div>
          </div>
      </div>

      {/* Action Area */}
      <div className="pt-2 border-t border-slate-100 mt-2">
          
          {/* 1. Start Trip */}
          {job.status === 'assigned' && (
             <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2" onClick={() => onStartTrip(job.id)}>
                <Navigation size={18}/> Start Trip
             </button>
          )}
          
          {/* 2. Arrived */}
          {job.status === 'on_the_way' && (
             <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2" onClick={() => onArrive(job.id)}>
                <MapPin size={18}/> I Have Arrived
             </button>
          )}
          
          {/* 3. Start OTP */}
          {job.status === 'arrived' && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 text-center mb-2">Ask Customer for Start OTP</p>
                  <div className="flex gap-2">
                      <input 
                        className="flex-1 border border-blue-200 p-2 rounded-lg text-center font-bold tracking-widest text-lg outline-none focus:ring-2 focus:ring-blue-400" 
                        placeholder="OTP" 
                        maxLength={4} 
                        value={localOtp} 
                        onChange={e => setLocalOtp(e.target.value)} 
                      />
                      <button onClick={() => { onVerifyStart(job, localOtp); setLocalOtp(""); }} className="bg-blue-600 text-white px-6 rounded-lg font-bold active:scale-95">
                        Start
                      </button>
                  </div>
              </div>
          )}
          
          {/* 4. Finish OTP */}
          {job.status === 'in_progress' && (
              <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-green-800 text-center mb-2 flex items-center justify-center gap-1">
                    <ShieldCheck size={14}/> Job Started. Ask End OTP to Finish.
                  </p>
                  <div className="flex gap-2">
                      <input 
                        className="flex-1 border border-green-200 p-2 rounded-lg text-center font-bold tracking-widest text-lg outline-none focus:ring-2 focus:ring-green-400" 
                        placeholder="OTP" 
                        maxLength={4} 
                        value={localOtp} 
                        onChange={e => setLocalOtp(e.target.value)} 
                      />
                      <button onClick={() => { onVerifyFinish(job, localOtp); setLocalOtp(""); }} className="bg-slate-900 text-white px-6 rounded-lg font-bold active:scale-95">
                        Finish
                      </button>
                  </div>
              </div>
          )}

          {/* 5. Completed */}
          {job.status === 'completed' && (
              <div className="text-center py-2 text-green-600 font-black text-sm flex items-center justify-center gap-1 bg-green-50 rounded-xl">
                  <CheckCircle size={16}/> Job Completed Successfully
              </div>
          )}
      </div>
    </div>
  );
}
