import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();

    // Real-time Magic: Jaise hi Expert status badlega, yahan dikh jayega
    const channel = supabase
      .channel('my_bookings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, () => {
        fetchMyBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMyBookings = async () => {
    // Asli app me hum user ID se filter karte, abhi demo ke liye sab dikha rahe hain
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-20 px-4 font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

      {loading ? (
        <p className="text-center text-gray-400 mt-10">Loading status...</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-md">
              
              {/* Status Indicator Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                order.status === 'completed' ? 'bg-green-500' :
                order.status === 'accepted' ? 'bg-blue-500' :
                'bg-yellow-400'
              }`}></div>

              <div className="flex justify-between items-start mb-2 pl-2">
                <div>
                  <h3 className="font-bold text-gray-800">{order.service_details}</h3>
                  <p className="text-xs text-gray-400">Order ID: #{order.id}</p>
                </div>
                
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status === 'completed' && <CheckCircle size={12} />}
                  {order.status === 'accepted' && <Clock size={12} />}
                  {order.status === 'pending' && <AlertCircle size={12} />}
                  {order.status}
                </span>
              </div>

              <div className="pl-2 space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>{order.scheduled_date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} />
                  <span className="truncate w-48">{order.address}</span>
                </div>
              </div>

              <div className="pl-2 mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-primary">₹{order.total_amount}</span>
                
                {order.status === 'accepted' && (
                  <button className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-primary/30 animate-pulse">
                    Track Expert
                  </button>
                )}
                
                {order.status === 'completed' && (
                  <button className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50">
                    Download Invoice
                  </button>
                )}
              </div>

            </div>
          ))}

          {bookings.length === 0 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-gray-300" />
              </div>
              <p className="text-gray-400">No bookings yet.</p>
              <button className="mt-4 text-primary font-bold text-sm">Find a Service</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
