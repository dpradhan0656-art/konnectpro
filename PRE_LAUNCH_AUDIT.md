# Pre-Launch Audit – Apna Hunar (Kshatr.com)

**Date:** Pre-production  
**Scope:** UI stability, viewport, keyboard, safe-area, production build.

---

## 1. Viewport (index.html) ✅

- **Verified:** Meta viewport is set to  
  `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover`
- **Impact:** Prevents zoom wobble, fixes notch/inset behavior on devices with safe areas.

---

## 2. Keyboard (capacitor.config.json) ✅

- **Added:** `plugins.Keyboard` with:
  - `resize: "body"` – avoids full-viewport resize (reduces UI jump on open/close).
  - `style: "dark"` – keyboard style.
  - `resizeOnFullScreen: true` – Android full-screen resize workaround.
- **Impact:** Fewer layout breaks when the keyboard opens (forms, search, etc.).

---

## 3. Global UI stability (src/index.css) ✅

- **Verified:** `html` and `body` have:
  - `overflow-x: hidden` – no horizontal scroll/wobble.
  - `touch-action: pan-y` – vertical scroll only, no horizontal drag.
- **Impact:** Stable, contained layout on mobile.

---

## 4. Safe-area ✅

- **App.jsx (Layout):** `<main>` now has  
  `style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}`  
  so content is not hidden by system navigation/gesture bar.
- **BottomNav.jsx:** Replaced `pb-safe` with explicit  
  `style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}`  
  so the nav bar clears the system bottom inset.
- **Impact:** Content and bottom nav stay visible on notched and gesture-bar devices.

---

## 5. Production sync ✅

- `npm run build` – completed successfully (Vite build).
- `npx cap sync android` – completed; `dist/` copied to `android/app/src/main/assets/public`, `capacitor.config.json` updated in Android assets.

---

## 6. Android Studio – ProGuard & build

- **ProGuard:** In `android/app/build.gradle`, release uses:
  - `minifyEnabled true`
  - `proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'`
- **Next steps (manual in Android Studio):**
  1. **Build → Clean Project**
  2. **Build → Rebuild Project**
  3. Run a release build (e.g. Build → Build Bundle(s) / APK(s) → Build APK(s)) and test on a device.

---

## Modular coding / no-delete

- Old layout or config logic was commented (e.g. `/* OLD: ... */`) where changed; no production code was deleted.
