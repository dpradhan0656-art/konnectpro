import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const STORAGE_KEY = 'apnahunar_install_prompt_dismissed';

export default function InstallAppPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const ua = navigator.userAgent || navigator.vendor;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    if (!isMobile) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    if (isIOSDevice) setShow(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
    }
    setShow(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  if (!show) return null;

  /*
   * OLD layout (single flex row): on Android with Install + text + icon, the last
   * flex child (X) could be clipped by overflow or squeezed to zero width.
   * Replaced by: relative card + absolute top-right close (z-index) + safe padding.
   */
  return (
    <div
      className="fixed left-4 right-4 z-[95] max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300"
      style={{
        bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem))',
      }}
    >
      <div className="relative bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4">
        {/* Close: always on top layer — fixes Android WebView / narrow flex clipping */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-[110] flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/95 text-slate-200 ring-1 ring-white/10 hover:bg-slate-700 hover:text-white active:scale-95 shadow-md touch-manipulation"
          aria-label="Dismiss install prompt"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* pr-12 keeps copy clear of the absolute close on all viewports */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 pr-12">
          <div className="flex items-start gap-3 sm:items-center min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
              <Download size={24} className="text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Install Kshatryx Technologies</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isIOS ? 'Tap Share → Add to Home Screen' : 'Add to home screen for a faster experience'}
              </p>
            </div>
          </div>

          {!isIOS && (
            <button
              type="button"
              onClick={handleInstall}
              className="w-full shrink-0 px-4 py-3 sm:w-auto sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
