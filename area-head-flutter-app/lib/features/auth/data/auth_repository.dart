import 'package:area_head_flutter_app/core/config/supabase_config.dart';
import 'package:area_head_flutter_app/core/services/supabase_service.dart';
import 'package:area_head_flutter_app/shared/models/area_head_profile.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  SupabaseClient get _client => SupabaseService.client;

  Session? get currentSession => _client.auth.currentSession;

  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  Future<void> signInWithGoogle() async {
    final redirectTo = SupabaseConfig.oauthRedirectUrl;
    if (kDebugMode) {
      debugPrint('[AreaHeadOAuth] starting OAuth redirectTo=$redirectTo');
    }

    try {
      await _client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: redirectTo,
        authScreenLaunchMode: kIsWeb
            ? LaunchMode.platformDefault
            : LaunchMode.externalApplication,
        queryParams: const {'prompt': 'select_account'},
      );
    } catch (error) {
      if (kDebugMode) {
        debugPrint('[AreaHeadOAuth] OAuth error: $error');
      }
      rethrow;
    }
  }

  /// Web only: parse session from OAuth callback URL after Google redirect.
  Future<bool> recoverOAuthSessionFromCallback() async {
    if (!kIsWeb) return false;

    final uri = Uri.base;
    final hasCallback =
        uri.fragment.contains('access_token') ||
        uri.fragment.contains('error=') ||
        uri.queryParameters.containsKey('code');
    if (!hasCallback) return false;

    if (kDebugMode) {
      debugPrint('[AreaHeadOAuth] recovering session from callback');
    }

    try {
      await _client.auth.getSessionFromUrl(uri);
      return true;
    } catch (error) {
      if (kDebugMode) {
        debugPrint('[AreaHeadOAuth] session recovery failed: $error');
      }
      return false;
    }
  }

  Future<void> signOut() => _client.auth.signOut();

  Future<AreaHeadProfile?> fetchCurrentAreaHeadProfile() async {
    final userId = currentSession?.user.id;
    if (userId == null || userId.isEmpty) return null;

    final data = await _client
        .from('area_heads')
        .select(
          'id, user_id, name, assigned_area, status, wallet_balance, '
          'employment_type, compensation_value',
        )
        .eq('user_id', userId)
        .maybeSingle();

    if (data == null) return null;
    return AreaHeadProfile.fromJson(data);
  }
}
