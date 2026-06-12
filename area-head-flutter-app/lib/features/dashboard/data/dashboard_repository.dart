import 'package:area_head_flutter_app/core/services/supabase_service.dart';
import 'package:area_head_flutter_app/shared/models/area_head_dashboard_stats.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardRepository {
  SupabaseClient get _client => SupabaseService.client;

  Future<AreaHeadDashboardStats> fetchStats() async {
    final data = await _client.rpc('get_area_head_dashboard_stats');

    if (kDebugMode) {
      final keys = data is Map
          ? data.keys.map((key) => key.toString()).toList()
          : <String>[];
      debugPrint('get_area_head_dashboard_stats keys=$keys');
    }

    final Map<String, dynamic> json;
    if (data is Map<String, dynamic>) {
      json = data;
    } else if (data is Map) {
      json = data.map((key, value) => MapEntry(key.toString(), value));
    } else {
      throw const FormatException('Unexpected dashboard stats response.');
    }

    final stats = AreaHeadDashboardStats.fromJson(json);

    if (kDebugMode) {
      debugPrint('parsed totalIncome=${stats.totalIncome}');
    }

    return stats;
  }
}
