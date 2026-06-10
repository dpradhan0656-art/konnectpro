class AreaHeadExpert {
  const AreaHeadExpert({
    required this.id,
    required this.name,
    required this.phoneMasked,
    required this.serviceCategory,
    required this.status,
    required this.rating,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String phoneMasked;
  final String serviceCategory;
  final String status;
  final num rating;
  final DateTime? createdAt;

  factory AreaHeadExpert.fromJson(Map<String, dynamic> json) {
    return AreaHeadExpert(
      id: json['expert_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Expert',
      phoneMasked: json['phone_masked']?.toString() ?? '',
      serviceCategory: json['service_category']?.toString() ?? 'Service',
      status: json['status']?.toString() ?? 'pending',
      rating: json['rating'] is num
          ? json['rating'] as num
          : num.tryParse(json['rating']?.toString() ?? '') ?? 0,
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
    );
  }
}
