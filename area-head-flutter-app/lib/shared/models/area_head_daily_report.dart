class AreaHeadDailyReport {
  const AreaHeadDailyReport({
    required this.id,
    required this.reportDate,
    required this.expertsContacted,
    required this.expertsOnboarded,
    required this.shopsVisited,
    required this.jobsFollowedUp,
    required this.complaintsHandled,
    required this.hardwareShopName,
    required this.shopOwnerName,
    required this.shopMobileMasked,
    required this.shopArea,
    required this.fieldNotes,
    required this.createdAt,
  });

  final String id;
  final DateTime? reportDate;
  final int expertsContacted;
  final int expertsOnboarded;
  final int shopsVisited;
  final int jobsFollowedUp;
  final int complaintsHandled;
  final String hardwareShopName;
  final String shopOwnerName;
  final String shopMobileMasked;
  final String shopArea;
  final String fieldNotes;
  final DateTime? createdAt;

  factory AreaHeadDailyReport.fromJson(Map<String, dynamic> json) {
    return AreaHeadDailyReport(
      id: json['report_id']?.toString() ?? '',
      reportDate: DateTime.tryParse(json['report_date']?.toString() ?? ''),
      expertsContacted: _readInt(json['experts_contacted']),
      expertsOnboarded: _readInt(json['experts_onboarded']),
      shopsVisited: _readInt(json['shops_visited']),
      jobsFollowedUp: _readInt(json['jobs_followed_up']),
      complaintsHandled: _readInt(json['complaints_handled']),
      hardwareShopName: json['hardware_shop_name']?.toString() ?? '',
      shopOwnerName: json['shop_owner_name']?.toString() ?? '',
      shopMobileMasked: json['shop_mobile_masked']?.toString() ?? '',
      shopArea: json['shop_area']?.toString() ?? '',
      fieldNotes: json['field_notes']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
    );
  }

  static int _readInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}
