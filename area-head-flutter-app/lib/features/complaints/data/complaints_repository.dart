import 'package:area_head_flutter_app/core/services/supabase_service.dart';
import 'package:area_head_flutter_app/shared/models/area_head_complaint.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ComplaintsRepository {
  SupabaseClient get _client => SupabaseService.client;

  Future<List<AreaHeadComplaint>> fetchMyComplaints() async {
    final data = await _client.rpc('get_current_area_head_complaints');
    final rows = data is List ? data : const [];
    return rows
        .whereType<Map<String, dynamic>>()
        .map(AreaHeadComplaint.fromJson)
        .toList();
  }
}
