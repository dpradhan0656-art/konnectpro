import React, { useId, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useOptionalLocationContext } from '../../context/LocationContext';
import { isDynamicPricingEnabled } from '../../config/pricingFeatureFlags';

/** Canonical cities aligned with dynamic pricing + DB seed (kshatr.com). */
export const SUPPORTED_CITIES = ['Jabalpur', 'Bhopal', 'Sagar', 'Jhansi'];

/**
 * Navbar city dropdown: updates `LocationContext` / localStorage via `setUserCity`.
 * Hidden entirely when `isDynamicPricingEnabled` is false (clean UI, no confusing disabled state).
 */
export default function CitySelector({ className = '' }) {
  const ctx = useOptionalLocationContext();
  const id = useId();

  const userCity = ctx?.userCity ?? '';
  const setUserCity = ctx?.setUserCity;

  const { value, extraOption } = useMemo(() => {
    const raw = (userCity || '').trim();
    const lower = raw.toLowerCase();
    const matched = SUPPORTED_CITIES.find((c) => c.toLowerCase() === lower);
    if (matched) return { value: matched, extraOption: null };
    if (raw)
      return {
        value: raw,
        extraOption: { value: raw, label: `${raw} (current)` },
      };
    return { value: SUPPORTED_CITIES[0], extraOption: null };
  }, [userCity]);

  if (!isDynamicPricingEnabled) {
    return null;
  }

  if (!ctx || typeof setUserCity !== 'function') {
    return null;
  }

  const baseSelect =
    'w-full min-w-0 rounded-lg border bg-slate-800/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider ' +
    'pl-8 pr-2 py-2 sm:py-2 border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/30 ' +
    'appearance-none cursor-pointer';

  return (
    <div
      className={`flex items-center gap-1.5 min-w-0 max-w-[11rem] sm:max-w-[13rem] md:max-w-[15rem] ${className}`}
      title="Choose your city for pricing & availability"
    >
      <label htmlFor={id} className="sr-only">
        Service city
      </label>
      <span className="relative flex items-center flex-1 min-w-0">
        <MapPin
          className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none shrink-0 text-teal-400"
          aria-hidden="true"
        />
        <select
          id={id}
          value={value}
          onChange={(e) => setUserCity(e.target.value)}
          className={baseSelect}
        >
          {extraOption && (
            <option key={extraOption.value} value={extraOption.value}>
              {extraOption.label}
            </option>
          )}
          {SUPPORTED_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}
