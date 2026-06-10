import 'package:flutter/foundation.dart';

class SupabaseConfig {
  const SupabaseConfig._();

  static const url = String.fromEnvironment('SUPABASE_URL');
  static const anonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  /// Android deep link — must match AndroidManifest and Supabase Redirect URLs.
  static const androidOAuthRedirect = 'com.kshatr.areahead://login-callback';

  static bool get isConfigured => url.isNotEmpty && anonKey.isNotEmpty;

  /// Web: current origin (e.g. http://localhost:3000). Mobile: app scheme callback.
  /// Never fall back to Supabase Site URL (kshatr.com customer app).
  static String get oauthRedirectUrl =>
      kIsWeb ? Uri.base.origin : androidOAuthRedirect;
}
