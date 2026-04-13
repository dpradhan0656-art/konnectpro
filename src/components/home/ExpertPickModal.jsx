import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Star, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

function normalizeCity(s) {
  if (!s || typeof s !== 'string') return '';
  return s.toLowerCase().replace(/[\s_-]+/g, '').trim();
}

/**
 * Full-screen picker: approved experts from Supabase; select → add to cart → /cart (login gate like ExpertCard).
 */
export default function ExpertPickModal({ open, onClose, locationName }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState([]);
  const [error, setError] = useState('');

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, err } = await supabase
      .from('experts')
      .select(
        'id, name, service_category, rating, experience_years, city, location, visiting_charges, profile_photo_url'
      )
      .eq('status', 'approved')
      .order('name', { ascending: true });

    if (err) {
      console.error(err);
      setError('Experts list load nahi ho saki. Internet check karein ya baad me try karein.');
      setExperts([]);
    } else {
      setExperts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchExperts();
  }, [open, fetchExperts]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const filteredExperts = useMemo(() => {
    if (!experts.length) return [];
    const key = normalizeCity(
      locationName && locationName !== 'Select Location' ? locationName : ''
    );
    if (!key || key === 'locating') return experts;
    const matched = experts.filter((e) => {
      const c = normalizeCity(e.city || '');
      const loc = normalizeCity(e.location || '');
      return c.includes(key) || key.includes(c) || loc.includes(key);
    });
    return matched.length ? matched : experts;
  }, [experts, locationName]);

  const handleSelectExpert = async (expert) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const ok = window.confirm(
        'Expert book karne ke liye login zaroori hai. Kya ab login karna chahenge?'
      );
      if (ok) {
        onClose();
        navigate('/login');
      }
      return;
    }
    addToCart(expert);
    onClose();
    navigate('/cart');
  };

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950/70 backdrop-blur-md p-0 sm:p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-pick-title"
    >
      <div className="flex flex-col w-full max-w-lg max-h-[100dvh] sm:max-h-[min(90dvh,720px)] sm:rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200/90">
        <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div>
            <h2 id="expert-pick-title" className="text-lg font-bold text-slate-900 font-display tracking-tight">
              Choose your expert
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified professionals — tap to add visit to cart
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-200/80 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 [-webkit-overflow-scrolling:touch]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <span className="text-sm font-semibold">Loading experts…</span>
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-red-600 font-medium py-10 px-2">{error}</p>
          )}

          {!loading && !error && filteredExperts.length === 0 && (
            <div className="text-center py-12 px-4">
              <User className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-700 font-semibold">Abhi koi approved expert list me nahi hai.</p>
              <p className="text-slate-500 text-sm mt-2">Categories se service book karein ya baad me try karein.</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className="flex gap-3 p-3 rounded-xl border border-slate-200/90 bg-white mb-2 shadow-sm hover:border-blue-300/80 hover:shadow-md transition-all"
              >
                <img
                  src={
                    expert.profile_photo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=2563eb&color=fff`
                  }
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name || 'E')}&background=2563eb&color=fff`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{expert.name}</p>
                      <p className="text-xs font-semibold text-blue-700 truncate">
                        {expert.service_category || 'Service expert'}
                      </p>
                    </div>
                    <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                      <Star size={10} className="fill-current" aria-hidden="true" />
                      {expert.rating ?? 'New'}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin size={12} className="shrink-0 text-blue-500" aria-hidden="true" />
                    <span className="truncate">
                      {[expert.city, expert.location].filter(Boolean).join(' · ') || 'Your city'}
                    </span>
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-sm font-black text-slate-900">
                      ₹{expert.visiting_charges ?? 199}{' '}
                      <span className="text-[10px] font-semibold text-slate-500">visit</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectExpert(expert)}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-lg shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
