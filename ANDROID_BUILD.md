# Kshatr – Android App Build Guide

## Prerequisites

- **Node.js** (v18+)
- **Android Studio** (with Android SDK) – [Download](https://developer.android.com/studio)
- **Java 17** (JDK 17) – Android Studio ke saath aata hai

---

## ✅ Recommended: Android Studio se APK banayein

Windows par Gradle command-line build kabhi-kabhi "Could not move temporary workspace" error deta hai (antivirus/Defender ki wajah se). **Android Studio se build zyada reliable hai.**

### Steps:

1. **Sync karein:**
   ```bash
   npm run cap:sync
   ```

2. **Android Studio open karein:**
   ```bash
   npm run cap:android
   ```

3. **Build APK:**
   - Menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Ya toolbar pe **Build** dropdown → **Build APK(s)**

4. **APK location:**
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

5. **Install:** APK ko phone pe copy karke install karein.

---

## Command Line (Agar kaam kare)

> ⚠️ Agar `JAVA_HOME` ya "Could not move temporary workspace" error aaye, Android Studio use karein (upar).

## Quick Commands

```bash
npm run cap:sync      # Build + sync web to Android
npm run cap:android   # Open in Android Studio
npm run cap:apk:debug # Command-line APK (Windows par kabhi fail ho sakta hai)
```

## Play Store ke liye Signed AAB

1. Android Studio: `npm run cap:android`
2. **Build → Generate Signed Bundle / APK**
3. Keystore create karein (pehli baar) ya existing use karein
4. **Android App Bundle (.aab)** select karein
5. Release build generate karein

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
