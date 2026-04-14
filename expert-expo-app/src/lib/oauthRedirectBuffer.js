import * as Linking from 'expo-linking';

/**
 * OAuth return URL must match Supabase redirect and Android intent-filters.
 * Captured as early as possible (before React mounts) so we never miss the intent
 * when Custom Tabs closes and the activity receives the deep link first.
 */
const PREFIX = 'expert-expo-app://auth/callback';

function matches(url) {
  if (!url) return false;
  return String(url).toLowerCase().startsWith(PREFIX.toLowerCase());
}

let pending = null;

/** Call once from `index.js` before registering the root component. Keep subscription for app lifetime. */
export function primeGlobalOAuthRedirectCapture() {
  Linking.getInitialURL()
    .then((url) => {
      if (matches(url)) pending = url;
    })
    .catch(() => {});

  return Linking.addEventListener('url', ({ url }) => {
    if (matches(url)) pending = url;
  });
}

export function clearPendingOAuthRedirect() {
  pending = null;
}

export function peekPendingOAuthRedirect() {
  return pending;
}

export function takePendingOAuthRedirect() {
  const u = pending;
  pending = null;
  return u;
}
