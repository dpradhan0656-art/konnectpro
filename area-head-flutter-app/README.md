# Kshatr Area Head App

Android-first Flutter app for Kshatr Area Heads.

## Features

- Google login with Area Head RBAC
- Dashboard stats from PostgreSQL RPC
- My Experts and Add Expert Lead
- Jobs list
- Complaints activity from daily reports
- Daily report submit and history
- Logout

## Run (Web)

```bash
cd area-head-flutter-app
flutter pub get
flutter run -d chrome --web-port 3000 `
  --dart-define=SUPABASE_URL="YOUR_SUPABASE_URL" `
  --dart-define=SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

## Run (Android)

```bash
flutter run -d android `
  --dart-define=SUPABASE_URL="YOUR_SUPABASE_URL" `
  --dart-define=SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

Supabase redirect URL for Android OAuth:

`com.kshatr.areahead://login-callback`

## Required Supabase migrations

Apply these before launch:

- `20260610154500_area_head_phase2_readonly_rpcs.sql`
- `20260610163000_area_head_submit_expert_lead.sql`
- `20260613001000_area_head_daily_report_submit.sql`
- `20260613010500_area_head_reports_and_dashboard_stats.sql`
- `20260613020000_area_head_complaints_readonly.sql`

## Play Store release checklist

1. Create Android upload keystore and configure release signing in `android/app/build.gradle.kts`
2. Bump `version` in `pubspec.yaml`
3. Build release APK/AAB with `--dart-define` Supabase values
4. Test Google login on a real Android device
5. Add Play Store listing, privacy policy, and screenshots
