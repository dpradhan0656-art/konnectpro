import 'package:area_head_flutter_app/core/services/supabase_service.dart';
import 'package:area_head_flutter_app/shared/models/area_head_daily_report.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DailyReportFailure implements Exception {
  DailyReportFailure(this.userMessage);

  final String userMessage;

  @override
  String toString() => userMessage;
}

class DailyReportRepository {
  SupabaseClient get _client => SupabaseService.client;

  Future<List<AreaHeadDailyReport>> fetchRecentReports() async {
    final data = await _client.rpc('get_current_area_head_daily_reports');
    final rows = data is List ? data : const [];
    return rows
        .whereType<Map<String, dynamic>>()
        .map(AreaHeadDailyReport.fromJson)
        .toList();
  }

  Future<void> submitDailyReport({
    required DateTime reportDate,
    required int expertsContacted,
    required int expertsOnboarded,
    required int shopsVisited,
    required int jobsFollowedUp,
    required int complaintsHandled,
    String? hardwareShopName,
    String? shopOwnerName,
    String? shopMobile,
    String? shopArea,
    String? fieldNotes,
  }) async {
    final normalizedMobile = _normalizePhone(shopMobile ?? '');
    final trimmedShopName = _blankToNull(hardwareShopName);
    final trimmedOwnerName = _blankToNull(shopOwnerName);
    final trimmedShopArea = _blankToNull(shopArea);
    final trimmedNotes = _blankToNull(fieldNotes);

    _validateCount(expertsContacted);
    _validateCount(expertsOnboarded);
    _validateCount(shopsVisited);
    _validateCount(jobsFollowedUp);
    _validateCount(complaintsHandled);
    _validateLength(trimmedShopName, 120, 'Shop name');
    _validateLength(trimmedOwnerName, 120, 'Shop owner name');
    _validateLength(trimmedShopArea, 120, 'Shop area');
    _validateLength(trimmedNotes, 1000, 'Field notes');

    if (normalizedMobile != null &&
        !RegExp(r'^[6-9][0-9]{9}$').hasMatch(normalizedMobile)) {
      throw DailyReportFailure('Enter a valid 10-digit Indian shop mobile.');
    }

    final params = <String, dynamic>{
      'report_date': _formatDate(reportDate),
      'experts_contacted': expertsContacted,
      'experts_onboarded': expertsOnboarded,
      'shops_visited': shopsVisited,
      'jobs_followed_up': jobsFollowedUp,
      'complaints_handled': complaintsHandled,
      'hardware_shop_name': trimmedShopName,
      'shop_owner_name': trimmedOwnerName,
      'shop_mobile': normalizedMobile,
      'shop_area': trimmedShopArea,
      'field_notes': trimmedNotes,
    };

    try {
      await _client.rpc('area_head_submit_daily_report', params: params);
    } catch (error) {
      if (kDebugMode) {
        debugPrint(
          'area_head_submit_daily_report failed: ${_safeErrorDetail(error)}',
        );
      }
      throw DailyReportFailure(_mapError(error));
    }
  }

  String? _blankToNull(String? value) {
    final trimmed = value?.trim();
    if (trimmed == null || trimmed.isEmpty) return null;
    return trimmed;
  }

  String? _normalizePhone(String value) {
    final digits = value.replaceAll(RegExp('[^0-9]'), '');
    if (digits.isEmpty) return null;
    if (digits.length == 12 && digits.startsWith('91')) {
      return digits.substring(2);
    }
    return digits;
  }

  String _formatDate(DateTime date) {
    final localDate = DateTime(date.year, date.month, date.day);
    final year = localDate.year.toString().padLeft(4, '0');
    final month = localDate.month.toString().padLeft(2, '0');
    final day = localDate.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  void _validateCount(int value) {
    if (value < 0 || value > 500) {
      throw DailyReportFailure(
        'Daily report counts must be between 0 and 500.',
      );
    }
  }

  void _validateLength(String? value, int maxLength, String label) {
    if (value != null && value.length > maxLength) {
      throw DailyReportFailure('$label must be $maxLength characters or less.');
    }
  }

  String _mapError(Object error) {
    final message = _safeErrorDetail(error).toLowerCase();
    if (message.contains('not authorized') ||
        message.contains('not authenticated') ||
        message.contains('42501')) {
      return 'Only active Area Heads can submit daily reports.';
    }
    if (message.contains('mobile') || message.contains('count')) {
      return 'Please check daily report details.';
    }
    return 'Could not submit daily report.';
  }

  String _safeErrorDetail(Object error) {
    if (error is PostgrestException) {
      return 'code=${error.code ?? 'unknown'} message=${error.message}';
    }
    return error.runtimeType.toString();
  }
}
