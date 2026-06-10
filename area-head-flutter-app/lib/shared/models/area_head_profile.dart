class AreaHeadProfile {
  const AreaHeadProfile({
    required this.id,
    required this.userId,
    required this.name,
    required this.assignedArea,
    required this.status,
    required this.walletBalance,
    required this.employmentType,
    required this.compensationValue,
  });

  final String id;
  final String userId;
  final String name;
  final String assignedArea;
  final String status;
  final num walletBalance;
  final String employmentType;
  final num compensationValue;

  factory AreaHeadProfile.fromJson(Map<String, dynamic> json) {
    return AreaHeadProfile(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Area Head',
      assignedArea: json['assigned_area']?.toString() ?? 'Not assigned',
      status: json['status']?.toString() ?? 'unknown',
      walletBalance: json['wallet_balance'] is num
          ? json['wallet_balance'] as num
          : num.tryParse(json['wallet_balance']?.toString() ?? '') ?? 0,
      employmentType: json['employment_type']?.toString() ?? '',
      compensationValue: json['compensation_value'] is num
          ? json['compensation_value'] as num
          : num.tryParse(json['compensation_value']?.toString() ?? '') ?? 0,
    );
  }

  bool get isActive => status.toLowerCase() == 'active';
}
