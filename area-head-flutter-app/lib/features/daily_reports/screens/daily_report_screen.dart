import 'package:flutter/material.dart';

class DailyReportScreen extends StatelessWidget {
  const DailyReportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daily Field Report')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            _DisabledField(label: 'Today visits', hint: 'Example: 8 shops'),
            _DisabledField(
              label: 'Expert follow-ups',
              hint: 'Example: 3 calls',
            ),
            _DisabledField(
              label: 'Referral source / hardware shop note',
              hint: 'Example: Sharma Hardware referred 2 carpenters',
              maxLines: 3,
            ),
            _DisabledField(
              label: 'Local issues / complaints summary',
              hint: 'Example: One delayed plumbing job in assigned area',
              maxLines: 3,
            ),
            SizedBox(height: 12),
            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Submit coming in next sprint. No data is written from this screen yet.',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DisabledField extends StatelessWidget {
  const _DisabledField({
    required this.label,
    required this.hint,
    this.maxLines = 1,
  });

  final String label;
  final String hint;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextField(
        enabled: false,
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label, hintText: hint),
      ),
    );
  }
}
