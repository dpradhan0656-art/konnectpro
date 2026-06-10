import 'package:area_head_flutter_app/core/services/supabase_service.dart';
import 'package:area_head_flutter_app/features/experts/data/expert_lead_submit_errors.dart';
import 'package:area_head_flutter_app/shared/models/area_head_expert.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ExpertsRepository {
  SupabaseClient get _client => SupabaseService.client;

  Future<List<AreaHeadExpert>> fetchMyExperts() async {
    final data = await _client.rpc('get_current_area_head_experts');
    final rows = data is List ? data : const [];
    return rows
        .whereType<Map<String, dynamic>>()
        .map(AreaHeadExpert.fromJson)
        .toList();
  }

  Future<void> submitExpertLead({
    required String name,
    required String phone,
    required String category,
    required String city,
    required num experienceYears,
    String? localNote,
  }) async {
    final trimmedName = name.trim();
    final trimmedPhone = phone.trim();
    final trimmedCategory = category.trim();
    final trimmedCity = city.trim();
    final trimmedNote = localNote?.trim();

    final params = <String, dynamic>{
      'expert_name': trimmedName,
      'expert_phone': trimmedPhone,
      'expert_category': trimmedCategory,
      'expert_city': trimmedCity,
      'experience_years': experienceYears,
    };

    if (trimmedNote != null && trimmedNote.isNotEmpty) {
      params['local_note'] = trimmedNote;
    }

    final phoneValid = RegExp(
      r'^[6-9][0-9]{9}$',
    ).hasMatch(_normalizePhone(trimmedPhone));
    final nameValid = trimmedName.length >= 2;
    final categoryValid = trimmedCategory.isNotEmpty;
    final cityValid = trimmedCity.length >= 2;
    final experienceValid = experienceYears >= 0 && experienceYears <= 60;

    debugLogExpertLeadPayload(
      params: params,
      phoneValid: phoneValid,
      nameValid: nameValid,
      categoryValid: categoryValid,
      cityValid: cityValid,
      experienceValid: experienceValid,
    );

    if (!phoneValid ||
        !nameValid ||
        !categoryValid ||
        !cityValid ||
        !experienceValid) {
      throw ExpertLeadSubmitFailure('Please check expert details.');
    }

    try {
      await _client.rpc('area_head_submit_expert_lead', params: params);
    } catch (error) {
      if (kDebugMode) {
        debugPrint(
          'area_head_submit_expert_lead failed: ${safeExpertLeadErrorDetail(error)}',
        );
      }
      throw ExpertLeadSubmitFailure(
        mapExpertLeadSubmitError(error),
        debugDetail: safeExpertLeadErrorDetail(error),
      );
    }
  }

  String _normalizePhone(String value) {
    final digits = value.replaceAll(RegExp('[^0-9]'), '');
    if (digits.length == 12 && digits.startsWith('91')) {
      return digits.substring(2);
    }
    return digits;
  }
}
