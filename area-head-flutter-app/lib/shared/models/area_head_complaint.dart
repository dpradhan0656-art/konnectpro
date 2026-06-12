class AreaHeadComplaint {
  const AreaHeadComplaint({
    required this.id,
    required this.reportDate,
    required this.category,
    required this.status,
    required this.priority,
    required this.summary,
    required this.complaintsCount,
    required this.createdAt,
  });

  final String id;
  final DateTime? reportDate;
  final String category;
  final String status;
  final String priority;
  final String summary;
  final int complaintsCount;
  final DateTime? createdAt;

  factory AreaHeadComplaint.fromJson(Map<String, dynamic> json) {
    return AreaHeadComplaint(
      id: json['complaint_id']?.toString() ?? '',
      reportDate: DateTime.tryParse(json['report_date']?.toString() ?? ''),
      category: json['category']?.toString() ?? 'Field Issue',
      status: json['status']?.toString() ?? 'Handled',
      priority: json['priority']?.toString() ?? 'Normal',
      summary: json['summary']?.toString() ?? 'Complaint activity',
      complaintsCount: _readInt(json['complaints_count']),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
    );
  }

  static int _readInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}
