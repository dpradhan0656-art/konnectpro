import 'package:area_head_flutter_app/app/area_head_app.dart';
import 'package:area_head_flutter_app/core/config/supabase_config.dart';
import 'package:area_head_flutter_app/core/services/supabase_service.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  String? startupError;
  if (!SupabaseConfig.isConfigured) {
    startupError =
        'Supabase config missing. Start with --dart-define=SUPABASE_URL=... '
        '--dart-define=SUPABASE_ANON_KEY=...';
  } else {
    try {
      await SupabaseService.initialize();
    } catch (_) {
      startupError = 'Secure backend initialization failed. Please retry.';
    }
  }

  runApp(AreaHeadApp(startupError: startupError));
}
