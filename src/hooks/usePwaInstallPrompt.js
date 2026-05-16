import { useEffect, useState } from 'react';

const INSTALL_DISMISS_KEY = 'kshatr_install_prompt_dismissed';

function shouldCaptureInstallPrompt() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return false;
  if (sessionStorage.getItem(INSTALL_DISMISS_KEY)) return false;
  const ua = navigator.userAgent || '';
  return /Android|webOS|iPhone|iPad|iPod/i.test(ua);
}

/**
 * Captures the browser `beforeinstallprompt` event so UI can trigger install later.
 * Only calls preventDefault on mobile when our InstallAppPrompt may show — avoids
 * Chrome console noise on desktop where prompt() is never called.
 */
export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      if (!shouldCaptureInstallPrompt()) return;
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return { outcome: 'unavailable' };
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome !== 'accepted') return { outcome: choice?.outcome || 'dismissed' };
    setDeferredPrompt(null);
    setIsInstallable(false);
    return { outcome: 'accepted' };
  };

  return { deferredPrompt, isInstallable, promptInstall };
}

