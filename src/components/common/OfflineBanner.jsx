import React from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

/**
 * Non-intrusive global offline banner.
 * Pure UI layer: does not block rendering or mutate state outside itself.
 */
export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[120] pointer-events-none">
      <div className="mx-auto mt-2 w-fit max-w-[95vw] rounded-full border border-amber-500/40 bg-slate-900/95 px-4 py-2 shadow-lg backdrop-blur-sm">
        <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-amber-300 uppercase">
          <WifiOff size={14} />
          No Internet Connection
        </p>
      </div>
    </div>
  );
}
