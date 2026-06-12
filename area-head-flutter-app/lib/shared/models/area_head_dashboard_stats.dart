class AreaHeadDashboardStats {
  const AreaHeadDashboardStats({
    required this.totalIncome,
    required this.totalExpertsCount,
    required this.experts,
  });

  final double totalIncome;
  final int totalExpertsCount;
  final List<AreaHeadDashboardExpertSummary> experts;

  factory AreaHeadDashboardStats.fromJson(Map<String, dynamic> json) {
    final expertsRaw = json['experts_list'];
    final expertsRows = expertsRaw is List ? expertsRaw : const [];
    return AreaHeadDashboardStats(
      totalIncome: _parseIncome(json['total_income']),
      totalExpertsCount: json['total_experts_count'] is int
          ? json['total_experts_count'] as int
          : int.tryParse(json['total_experts_count']?.toString() ?? '') ?? 0,
      experts: expertsRows
          .whereType<Map<String, dynamic>>()
          .map(AreaHeadDashboardExpertSummary.fromJson)
          .toList(),
    );
  }

  static double _parseIncome(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}

class AreaHeadDashboardExpertSummary {
  const AreaHeadDashboardExpertSummary({
    required this.name,
    required this.fieldCategory,
    required this.status,
    required this.kycStatus,
  });

  final String name;
  final String fieldCategory;
  final String status;
  final String kycStatus;

  factory AreaHeadDashboardExpertSummary.fromJson(Map<String, dynamic> json) {
    return AreaHeadDashboardExpertSummary(
      name: json['expert_name']?.toString() ?? 'Expert',
      fieldCategory: json['field_category']?.toString() ?? 'Service',
      status: json['status']?.toString() ?? 'unknown',
      kycStatus: json['kyc_status']?.toString() ?? 'pending',
    );
  }
}
