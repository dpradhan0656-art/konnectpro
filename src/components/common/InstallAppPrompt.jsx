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

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
          <Download size={24} className="text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Install Kshatryx Technologies</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {isIOS ? 'Tap Share → Add to Home Screen' : 'Add to home screen for a faster experience'}
          </p>
        </div>
        {!isIOS && (
          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
