import 'dart:async';

import 'package:area_head_flutter_app/features/access/screens/access_denied_screen.dart';
import 'package:area_head_flutter_app/features/access/screens/blocked_screen.dart';
import 'package:area_head_flutter_app/features/auth/data/auth_repository.dart';
import 'package:area_head_flutter_app/features/auth/screens/login_screen.dart';
import 'package:area_head_flutter_app/features/dashboard/screens/dashboard_screen.dart';
import 'package:area_head_flutter_app/shared/models/area_head_profile.dart';
import 'package:flutter/material.dart';

enum AuthGateState {
  checking,
  loginRequired,
  accessDenied,
  blocked,
  active,
  error,
}

class AuthCheckScreen extends StatefulWidget {
  const AuthCheckScreen({super.key, this.startupError});

  final String? startupError;

  @override
  State<AuthCheckScreen> createState() => _AuthCheckScreenState();
}

class _AuthCheckScreenState extends State<AuthCheckScreen> {
  final _repository = AuthRepository();
  StreamSubscription? _authSubscription;

  AuthGateState _state = AuthGateState.checking;
  AreaHeadProfile? _profile;
  String _message = '';

  @override
  void initState() {
    super.initState();
    if (widget.startupError != null) {
      _state = AuthGateState.error;
      _message = widget.startupError!;
      return;
    }
    _authSubscription = _repository.authStateChanges.listen((_) {
      _checkAccess();
    });
    _recoverSessionAndCheckAccess();
  }

  Future<void> _recoverSessionAndCheckAccess() async {
    await _repository.recoverOAuthSessionFromCallback();
    await _checkAccess();
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  Future<void> _checkAccess() async {
    setState(() {
      _state = AuthGateState.checking;
      _message = '';
    });

    try {
      if (_repository.currentSession == null) {
        setState(() => _state = AuthGateState.loginRequired);
        return;
      }

      final profile = await _repository.fetchCurrentAreaHeadProfile();
      if (profile == null) {
        setState(() {
          _profile = null;
          _state = AuthGateState.accessDenied;
          _message =
              'This account is not appointed as an Area Head. Contact admin.';
        });
        return;
      }

      if (!profile.isActive) {
        setState(() {
          _profile = profile;
          _state = AuthGateState.blocked;
          _message = 'Your Area Head account is inactive or blocked.';
        });
        return;
      }

      setState(() {
        _profile = profile;
        _state = AuthGateState.active;
      });
    } catch (_) {
      setState(() {
        _profile = null;
        _state = AuthGateState.error;
        _message = 'Unable to verify access right now. Please retry.';
      });
    }
  }

  Future<void> _logout() async {
    await _repository.signOut();
    setState(() {
      _profile = null;
      _state = AuthGateState.loginRequired;
    });
  }

  @override
  Widget build(BuildContext context) {
    switch (_state) {
      case AuthGateState.checking:
        return const _CheckingView();
      case AuthGateState.loginRequired:
        return LoginScreen(
          repository: _repository,
          onLoginSuccess: _checkAccess,
        );
      case AuthGateState.accessDenied:
        return AccessDeniedScreen(message: _message, onLogout: _logout);
      case AuthGateState.blocked:
        return BlockedScreen(message: _message, onLogout: _logout);
      case AuthGateState.active:
        return DashboardScreen(profile: _profile!, onLogout: _logout);
      case AuthGateState.error:
        return AccessDeniedScreen(
          title: 'Secure Check Failed',
          message: _message,
          actionLabel: 'Retry',
          onLogout: _checkAccess,
        );
    }
  }
}

class _CheckingView extends StatelessWidget {
  const _CheckingView();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Checking secure Area Head access...'),
          ],
        ),
      ),
    );
  }
}
