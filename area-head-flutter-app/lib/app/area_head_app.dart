import 'package:area_head_flutter_app/app/app_theme.dart';
import 'package:area_head_flutter_app/features/auth/screens/auth_check_screen.dart';
import 'package:flutter/material.dart';

class AreaHeadApp extends StatelessWidget {
  const AreaHeadApp({super.key, this.startupError});

  final String? startupError;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kshatr Area Head',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark(),
      home: AuthCheckScreen(startupError: startupError),
    );
  }
}
