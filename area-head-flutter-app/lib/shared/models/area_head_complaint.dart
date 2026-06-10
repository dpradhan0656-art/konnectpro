class AreaHeadComplaint {
  const AreaHeadComplaint({
    required this.id,
    required this.jobId,
    required this.category,
    required this.status,
    required this.priority,
    required this.summary,
    required this.createdAt,
  });

  final String id;
  final String jobId;
  final String category;
  final String status;
  final String priority;
  final String summary;
  final DateTime? createdAt;
}
