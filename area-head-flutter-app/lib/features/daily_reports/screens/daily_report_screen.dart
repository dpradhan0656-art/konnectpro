import 'package:area_head_flutter_app/features/daily_reports/data/daily_report_repository.dart';
import 'package:area_head_flutter_app/shared/models/area_head_daily_report.dart';
import 'package:flutter/material.dart';

class DailyReportScreen extends StatefulWidget {
  const DailyReportScreen({super.key});

  @override
  State<DailyReportScreen> createState() => _DailyReportScreenState();
}

class _DailyReportScreenState extends State<DailyReportScreen> {
  final _repository = DailyReportRepository();
  final _formKey = GlobalKey<FormState>();
  final _expertsContactedController = TextEditingController(text: '0');
  final _expertsOnboardedController = TextEditingController(text: '0');
  final _shopsVisitedController = TextEditingController(text: '0');
  final _jobsFollowedUpController = TextEditingController(text: '0');
  final _complaintsHandledController = TextEditingController(text: '0');
  final _shopNameController = TextEditingController();
  final _shopOwnerController = TextEditingController();
  final _shopMobileController = TextEditingController();
  final _shopAreaController = TextEditingController();
  final _fieldNotesController = TextEditingController();

  late Future<List<AreaHeadDailyReport>> _reportsFuture;
  DateTime _reportDate = _dateOnly(DateTime.now());
  bool _submitting = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _reportsFuture = _repository.fetchRecentReports();
  }

  @override
  void dispose() {
    _expertsContactedController.dispose();
    _expertsOnboardedController.dispose();
    _shopsVisitedController.dispose();
    _jobsFollowedUpController.dispose();
    _complaintsHandledController.dispose();
    _shopNameController.dispose();
    _shopOwnerController.dispose();
    _shopMobileController.dispose();
    _shopAreaController.dispose();
    _fieldNotesController.dispose();
    super.dispose();
  }

  static DateTime _dateOnly(DateTime value) {
    return DateTime(value.year, value.month, value.day);
  }

  String _formatDate(DateTime value) {
    final year = value.year.toString().padLeft(4, '0');
    final month = value.month.toString().padLeft(2, '0');
    final day = value.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  String _formatFriendlyDate(DateTime? value) {
    if (value == null) return '-';
    return _formatDate(value);
  }

  int _readCount(TextEditingController controller) {
    return int.tryParse(controller.text.trim()) ?? 0;
  }

  String? _validateCount(String? value) {
    final count = int.tryParse((value ?? '').trim());
    if (count == null) return 'Enter a valid number.';
    if (count < 0 || count > 500) return 'Must be between 0 and 500.';
    return null;
  }

  String? _validateOptionalMobile(String? value) {
    final digits = (value ?? '').replaceAll(RegExp('[^0-9]'), '');
    if (digits.isEmpty) return null;
    final normalized = digits.length == 12 && digits.startsWith('91')
        ? digits.substring(2)
        : digits;
    if (!RegExp(r'^[6-9][0-9]{9}$').hasMatch(normalized)) {
      return 'Enter a valid Indian mobile number.';
    }
    return null;
  }

  String? _validateMaxLength(String? value, int maxLength, String label) {
    if ((value ?? '').trim().length > maxLength) {
      return '$label must be $maxLength characters or less.';
    }
    return null;
  }

  Future<void> _pickReportDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _reportDate,
      firstDate: DateTime(2024),
      lastDate: _dateOnly(DateTime.now()),
    );
    if (picked == null) return;
    setState(() => _reportDate = _dateOnly(picked));
  }

  Future<void> _submit() async {
    if (_submitting) return;
    setState(() => _error = '');

    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    try {
      await _repository.submitDailyReport(
        reportDate: _reportDate,
        expertsContacted: _readCount(_expertsContactedController),
        expertsOnboarded: _readCount(_expertsOnboardedController),
        shopsVisited: _readCount(_shopsVisitedController),
        jobsFollowedUp: _readCount(_jobsFollowedUpController),
        complaintsHandled: _readCount(_complaintsHandledController),
        hardwareShopName: _shopNameController.text,
        shopOwnerName: _shopOwnerController.text,
        shopMobile: _shopMobileController.text,
        shopArea: _shopAreaController.text,
        fieldNotes: _fieldNotesController.text,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Daily report submitted')));
      setState(() {
        _reportsFuture = _repository.fetchRecentReports();
      });
    } on DailyReportFailure catch (error) {
      setState(() => _error = error.userMessage);
    } catch (_) {
      setState(() => _error = 'Could not submit daily report.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _prefillFromReport(AreaHeadDailyReport report) {
    if (report.reportDate != null) {
      _reportDate = _dateOnly(report.reportDate!);
    }
    _expertsContactedController.text = report.expertsContacted.toString();
    _expertsOnboardedController.text = report.expertsOnboarded.toString();
    _shopsVisitedController.text = report.shopsVisited.toString();
    _jobsFollowedUpController.text = report.jobsFollowedUp.toString();
    _complaintsHandledController.text = report.complaintsHandled.toString();
    _shopNameController.text = report.hardwareShopName;
    _shopOwnerController.text = report.shopOwnerName;
    _shopMobileController.clear();
    _shopAreaController.text = report.shopArea;
    _fieldNotesController.text = report.fieldNotes;
    setState(() => _error = '');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daily Field Report')),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            setState(() {
              _reportsFuture = _repository.fetchRecentReports();
            });
            await _reportsFuture;
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'Submit your daily ground work. Re-submitting the same date updates that report instead of creating a duplicate.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.calendar_today_outlined,
                        color: Colors.tealAccent,
                      ),
                      title: const Text('Report Date'),
                      subtitle: Text(_formatDate(_reportDate)),
                      trailing: OutlinedButton(
                        onPressed: _submitting ? null : _pickReportDate,
                        child: const Text('Change'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _NumberField(
                      controller: _expertsContactedController,
                      label: 'Experts Contacted',
                      validator: _validateCount,
                    ),
                    _NumberField(
                      controller: _expertsOnboardedController,
                      label: 'Experts Onboarded',
                      validator: _validateCount,
                    ),
                    _NumberField(
                      controller: _shopsVisitedController,
                      label: 'Shops Visited',
                      validator: _validateCount,
                    ),
                    _NumberField(
                      controller: _jobsFollowedUpController,
                      label: 'Jobs Followed Up',
                      validator: _validateCount,
                    ),
                    _NumberField(
                      controller: _complaintsHandledController,
                      label: 'Complaints Handled',
                      validator: _validateCount,
                    ),
                    TextFormField(
                      controller: _shopNameController,
                      decoration: const InputDecoration(
                        labelText: 'Hardware Shop Name (optional)',
                        prefixIcon: Icon(Icons.storefront_outlined),
                      ),
                      textInputAction: TextInputAction.next,
                      validator: (value) =>
                          _validateMaxLength(value, 120, 'Shop name'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _shopOwnerController,
                      decoration: const InputDecoration(
                        labelText: 'Shop Owner Name (optional)',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      textInputAction: TextInputAction.next,
                      validator: (value) =>
                          _validateMaxLength(value, 120, 'Shop owner name'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _shopMobileController,
                      decoration: const InputDecoration(
                        labelText: 'Shop Mobile (optional)',
                        hintText: '10 digits or +91XXXXXXXXXX',
                        prefixIcon: Icon(Icons.phone_outlined),
                      ),
                      keyboardType: TextInputType.phone,
                      textInputAction: TextInputAction.next,
                      validator: _validateOptionalMobile,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _shopAreaController,
                      decoration: const InputDecoration(
                        labelText: 'Shop Area (optional)',
                        prefixIcon: Icon(Icons.location_on_outlined),
                      ),
                      textInputAction: TextInputAction.next,
                      validator: (value) =>
                          _validateMaxLength(value, 120, 'Shop area'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _fieldNotesController,
                      decoration: const InputDecoration(
                        labelText: 'Field Notes (optional)',
                        hintText:
                            'Operational notes only. No KYC, bank or customer address.',
                        prefixIcon: Icon(Icons.note_alt_outlined),
                      ),
                      maxLines: 4,
                      validator: (value) =>
                          _validateMaxLength(value, 1000, 'Field notes'),
                    ),
                    if (_error.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        _error,
                        style: const TextStyle(color: Colors.redAccent),
                      ),
                    ],
                    const SizedBox(height: 20),
                    FilledButton.icon(
                      onPressed: _submitting ? null : _submit,
                      icon: _submitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.send_outlined),
                      label: Text(
                        _submitting
                            ? 'Submitting...'
                            : 'Submit / Update Report',
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              Text(
                'Recent Reports',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              FutureBuilder<List<AreaHeadDailyReport>>(
                future: _reportsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }
                  if (snapshot.hasError) {
                    return _ReportsMessage(
                      icon: Icons.warning_amber,
                      title: 'Unable to load reports',
                      message:
                          'Please check network/RPC permissions and retry.',
                      onRetry: () => setState(() {
                        _reportsFuture = _repository.fetchRecentReports();
                      }),
                    );
                  }
                  final reports = snapshot.data ?? const [];
                  if (reports.isEmpty) {
                    return const _ReportsMessage(
                      icon: Icons.assignment_outlined,
                      title: 'No reports yet',
                      message: 'Submitted daily reports will appear here.',
                    );
                  }
                  return Column(
                    children: reports
                        .map(
                          (report) => _ReportCard(
                            report: report,
                            formatDate: _formatFriendlyDate,
                            onUseForUpdate: () => _prefillFromReport(report),
                          ),
                        )
                        .toList(),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NumberField extends StatelessWidget {
  const _NumberField({
    required this.controller,
    required this.label,
    required this.validator,
  });

  final TextEditingController controller;
  final String label;
  final FormFieldValidator<String> validator;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: const Icon(Icons.numbers_outlined),
        ),
        keyboardType: TextInputType.number,
        textInputAction: TextInputAction.next,
        validator: validator,
      ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({
    required this.report,
    required this.formatDate,
    required this.onUseForUpdate,
  });

  final AreaHeadDailyReport report;
  final String Function(DateTime?) formatDate;
  final VoidCallback onUseForUpdate;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    formatDate(report.reportDate),
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                TextButton(
                  onPressed: onUseForUpdate,
                  child: const Text('Use for update'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _MetricChip(label: 'Contacted', value: report.expertsContacted),
                _MetricChip(label: 'Onboarded', value: report.expertsOnboarded),
                _MetricChip(label: 'Shops', value: report.shopsVisited),
                _MetricChip(label: 'Jobs', value: report.jobsFollowedUp),
                _MetricChip(
                  label: 'Complaints',
                  value: report.complaintsHandled,
                ),
              ],
            ),
            if (report.hardwareShopName.isNotEmpty ||
                report.shopOwnerName.isNotEmpty ||
                report.shopArea.isNotEmpty ||
                report.shopMobileMasked.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                [
                  report.hardwareShopName,
                  report.shopOwnerName,
                  report.shopArea,
                  report.shopMobileMasked,
                ].where((value) => value.isNotEmpty).join(' • '),
              ),
            ],
            if (report.fieldNotes.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(report.fieldNotes),
            ],
          ],
        ),
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text('$label: $value'),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _ReportsMessage extends StatelessWidget {
  const _ReportsMessage({
    required this.icon,
    required this.title,
    required this.message,
    this.onRetry,
  });

  final IconData icon;
  final String title;
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(icon, size: 42, color: Colors.white54),
            const SizedBox(height: 10),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(message, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 12),
              OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ],
        ),
      ),
    );
  }
}
