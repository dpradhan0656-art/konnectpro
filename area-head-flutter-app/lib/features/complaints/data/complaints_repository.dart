import 'package:area_head_flutter_app/shared/models/area_head_complaint.dart';

class ComplaintsRepository {
  Future<List<AreaHeadComplaint>> fetchMyComplaints() async {
    // Complaints schema/RPC is not source-controlled yet. Keep this read-only
    // module closed instead of guessing a broad table query.
    return const [];
  }
}
