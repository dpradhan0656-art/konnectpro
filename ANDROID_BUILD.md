# Kshatr – Android App Build Guide

## Prerequisites

- **Node.js** (v18+)
- **Android Studio** (with Android SDK)
- **Java 17** (JDK 17)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build web app + sync to Android
npm run cap:sync

# 3. Open in Android Studio
npm run cap:android

# 4. Run on device/emulator from Android Studio (▶️) or:
npm run cap:run:android
```

## Build APK / AAB for Play Store

1. Open Android Studio: `npm run cap:android`
2. **Build → Generate Signed Bundle / APK**
3. Create keystore (first time) or use existing
4. Select **Android App Bundle (.aab)** for Play Store
5. Build **release** variant

## Project Structure

```
KonnectPro/
├── dist/              # Vite build output (web assets)
├── android/            # Capacitor Android project
│   └── app/
│       └── src/main/
│           ├── assets/public/   # Your web app (synced from dist)
│           └── res/             # Icons, splash, strings
├── capacitor.config.json
└── package.json
```

## Useful Commands

| Command | Description |
|--------|-------------|
| `npm run build` | Build web app |
| `npm run cap:sync` | Build + copy to Android |
| `npm run cap:android` | Open Android Studio |
| `npm run cap:run:android` | Run on connected device |

## App Identity

- **App ID:** `com.kshatr.app`
- **App Name:** Kshatr
- **Web Dir:** `dist` (Vite output)

## Notes

- After any web code change: run `npm run cap:sync`
- App icons: Replace `android/app/src/main/res/mipmap-*/ic_launcher.png` with your 192x192 and 512x512 icons
- Splash screen: Configure in `capacitor.config.json` if needed
