import 'package:area_head_flutter_app/shared/models/area_head_complaint.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('parses complaint RPC row safely', () {
    final complaint = AreaHeadComplaint.fromJson({
      'complaint_id': 'abc-123',
      'report_date': '2026-06-13',
      'category': 'Field Issue',
      'status': 'Handled',
      'priority': 'Medium',
      'summary': '2 complaints handled on site visit',
      'complaints_count': 2,
      'created_at': '2026-06-13T10:00:00Z',
    });

    expect(complaint.id, 'abc-123');
    expect(complaint.complaintsCount, 2);
    expect(complaint.priority, 'Medium');
    expect(complaint.summary, contains('complaints'));
  });
}
