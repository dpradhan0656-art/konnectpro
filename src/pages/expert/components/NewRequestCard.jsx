import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';

export default function NewRequestCard({ job, onAccept }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-3 border border-amber-100 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-slate-800 text-lg">{job.service_name}</h4>
                <div className="flex items-center gap-1 mt-1 text-slate-500">
                   <MapPin size={12} className="text-amber-500"/>
                   <p className="text-xs font-medium line-clamp-1">{job.address}</p>
                </div>
            </div>
            <p className="font-black text-xl text-slate-900">₹{job.price}</p>
        </div>
        <button 
            onClick={() => onAccept(job.id)}
            className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
            Accept Request <ArrowRight size={16}/>
        </button>
    </div>
  );
}
