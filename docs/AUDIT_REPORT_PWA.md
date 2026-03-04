# Codebase Audit & PWA Conversion Report

**Date:** March 2025 | **Scope:** Bug hunt, stabilization, PWA conversion

---

## Phase 1: Critical Bugs Found

### 1. Unhandled Promise Rejections
- **ExpertControl.jsx:** `supabase.from('experts').delete().eq('id', exp.id).then(fetchData)` — no `.catch()`; delete failure gives no user feedback.
- **ManageOffers.jsx:** `handleDelete` — no error check on delete; silent failure.
- **Navbar/App:** `getSession().then()` — no `.catch()` (low risk but unhandled).

### 2. Missing Image Fallbacks (`onError`)
- **ServiceCard.jsx:** Main service image — no `onError`; broken URLs show broken image icon.
- **SmartIcon.jsx:** Category icon from URL — no `onError`.
- **ServiceDetails.jsx:** Service image + video review thumbnails — no `onError`.
- **Profile.jsx:** Avatar image — no `onError`.
- **OffersSection.jsx:** Offer images — no `onError` (fallback URL exists but if both fail, broken).
- **ServiceManager.jsx:** Admin image preview — no `onError` for inline edit.

### 3. Invalid Default Asset Path
- **ManageOffers.jsx:** `image_url: '/assets/banners/ac-service.jpg'` — path likely 404; asset may not exist.

### 4. Navbar Avatar Fallback
- **Navbar.jsx:** `onError` uses `e.target.nextSibling` — fragile if DOM structure changes.

### 5. ServiceDetails Page
- **ServiceDetails.jsx:** Uses mock data; not in App routes; effectively dead code. Left as-is (no regression).

---

## Phase 2: PWA Gaps Identified

| Item | Current | Required |
|------|---------|----------|
| **manifest theme_color** | `#1e3a8a` (blue) | Brand teal `#0d9488` |
| **Apple meta tags** | Missing | apple-mobile-web-app-capable, apple-touch-icon, apple-mobile-web-app-status-bar-style |
| **PWA icons** | pwa-192x192.png, pwa-512x512.png (referenced) | Ensure icons exist in public/ |
| **Workbox caching** | Default (precache only) | Add runtimeCaching for API, images |
| **Offline fallback** | None | Add offline page |

---

## Phase 3: Install Prompt

- No custom "Add to Home Screen" prompt exists.
- Need `InstallAppPrompt.jsx` — detect mobile (Android/Safari), show gentle install CTA.

---

## Fixes Applied (Summary)

1. **ExpertControl + ManageOffers:** proper async/await + error handling for delete operations.
2. **ServiceCard, SmartIcon, OffersSection, Profile, ServiceDetails:** add `onError` fallbacks for all images.
3. **ManageOffers:** default image_url to working Unsplash URL (was `/assets/banners/...` 404).
4. **index.html:** add Apple meta tags (apple-mobile-web-app-capable, apple-touch-icon, status-bar-style).
5. **vite.config:** manifest theme_color → brand teal `#0d9488`; workbox runtimeCaching for Unsplash + Supabase.
6. **InstallAppPrompt.jsx:** created; detects mobile, shows install CTA; integrated in App Layout (customer pages only).
7. **public/pwa-192x192.png, pwa-512x512.png:** minimal placeholder icons added. Replace with proper 192x192 and 512x512 brand icons for production.
