import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ExpertLeadSubmitFailure implements Exception {
  ExpertLeadSubmitFailure(this.userMessage, {this.debugDetail});

  final String userMessage;
  final String? debugDetail;

  @override
  String toString() => userMessage;
}

String mapExpertLeadSubmitError(Object error) {
  final message = _extractErrorMessage(error).toLowerCase();

  if (message.contains('already exists') ||
      message.contains('already under review') ||
      message.contains('duplicate') ||
      message.contains('23505')) {
    return 'This expert is already submitted or registered.';
  }

  if (message.contains('not authorized') ||
      message.contains('not authenticated') ||
      message.contains('42501')) {
    return 'Only active Area Heads can submit experts.';
  }

  if (message.contains('pgrst202') ||
      message.contains('could not find the function')) {
    return 'Could not submit expert lead. Please retry after a few minutes.';
  }

  if (message.contains('phone') ||
      message.contains('name') ||
      message.contains('category') ||
      message.contains('city') ||
      message.contains('experience') ||
      message.contains('characters') ||
      message.contains('required') ||
      message.contains('22023') ||
      message.contains('22p02')) {
    return 'Please check expert details.';
  }

  return 'Could not submit expert lead.';
}

String _extractErrorMessage(Object error) {
  if (error is PostgrestException) {
    return [
      error.message,
      error.details?.toString(),
      error.hint,
      error.code,
    ].whereType<String>().join(' ');
  }

  if (error is AuthException) {
    return error.message;
  }

  return error.toString();
}

String safeExpertLeadErrorDetail(Object error) {
  if (error is PostgrestException) {
    return 'code=${error.code ?? 'unknown'} message=${error.message}';
  }
  if (error is AuthException) {
    return 'auth message=${error.message}';
  }
  return error.runtimeType.toString();
}

void debugLogExpertLeadPayload({
  required Map<String, dynamic> params,
  required bool phoneValid,
  required bool nameValid,
  required bool cityValid,
  required bool categoryValid,
  required bool experienceValid,
}) {
  if (!kDebugMode) return;

  debugPrint(
    'area_head_submit_expert_lead payload keys=${params.keys.toList()} '
    'validation={name:$nameValid,phone:$phoneValid,category:$categoryValid,'
    'city:$cityValid,experience:$experienceValid}',
  );
}
