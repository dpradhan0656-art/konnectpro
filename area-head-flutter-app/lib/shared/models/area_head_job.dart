class AreaHeadJob {
  const AreaHeadJob({
    required this.id,
    required this.serviceName,
    required this.status,
    required this.amount,
    required this.area,
    required this.createdAt,
    required this.assignedExpertName,
    required this.assignedExpertPhoneMasked,
  });

  final String id;
  final String serviceName;
  final String status;
  final num amount;
  final String area;
  final DateTime? createdAt;
  final String assignedExpertName;
  final String assignedExpertPhoneMasked;

  factory AreaHeadJob.fromJson(Map<String, dynamic> json) {
    return AreaHeadJob(
      id: json['job_id']?.toString() ?? '',
      serviceName: json['service_name']?.toString() ?? 'Service',
      status: json['status']?.toString() ?? 'unknown',
      amount: json['amount'] is num
          ? json['amount'] as num
          : num.tryParse(json['amount']?.toString() ?? '') ?? 0,
      area: json['area']?.toString() ?? 'Assigned area',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      assignedExpertName: json['assigned_expert_name']?.toString() ?? '',
      assignedExpertPhoneMasked:
          json['assigned_expert_phone_masked']?.toString() ?? '',
    );
  }
}
