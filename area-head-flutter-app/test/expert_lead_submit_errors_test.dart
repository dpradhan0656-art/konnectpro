import 'package:area_head_flutter_app/features/experts/data/expert_lead_submit_errors.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  test('maps duplicate phone errors to friendly message', () {
    const error = PostgrestException(
      message: 'Expert already exists or is already under review',
      code: 'P0001',
    );

    expect(
      mapExpertLeadSubmitError(error),
      'This expert is already submitted or registered.',
    );
  });

  test('maps authorization errors to friendly message', () {
    const error = PostgrestException(message: 'Not authorized', code: 'P0001');

    expect(
      mapExpertLeadSubmitError(error),
      'Only active Area Heads can submit experts.',
    );
  });

  test('maps validation errors to friendly message', () {
    const error = PostgrestException(
      message: 'Expert phone must be a valid 10-digit Indian mobile number',
      code: 'P0001',
    );

    expect(mapExpertLeadSubmitError(error), 'Please check expert details.');
  });

  test('maps unknown errors to generic message', () {
    expect(
      mapExpertLeadSubmitError(Exception('network down')),
      'Could not submit expert lead.',
    );
  });
}
