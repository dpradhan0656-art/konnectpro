import 'package:area_head_flutter_app/features/complaints/data/complaints_repository.dart';
import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_ui_helpers.dart';
import 'package:area_head_flutter_app/shared/models/area_head_complaint.dart';
import 'package:flutter/material.dart';

class ComplaintsScreen extends StatefulWidget {
  const ComplaintsScreen({super.key});

  @override
  State<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends State<ComplaintsScreen> {
  final _repository = ComplaintsRepository();
  late Future<List<AreaHeadComplaint>> _future;

  @override
  void initState() {
    super.initState();
    _future = _repository.fetchMyComplaints();
  }

  void _refresh() {
    setState(() {
      _future = _repository.fetchMyComplaints();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DashboardColors.background,
      appBar: AppBar(
        backgroundColor: DashboardColors.background,
        foregroundColor: DashboardColors.slate,
        title: const Text('Complaints'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<List<AreaHeadComplaint>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return _ComplaintMessage(
                icon: Icons.cloud_off_outlined,
                title: 'Unable to load complaints',
                message: 'Please check your connection and retry.',
                actionLabel: 'Retry',
                onAction: _refresh,
              );
            }

            final complaints = snapshot.data ?? const [];
            if (complaints.isEmpty) {
              return const _ComplaintMessage(
                icon: Icons.report_problem_outlined,
                title: 'No complaint activity yet',
                message:
                    'Complaints handled in your daily reports will appear here.',
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: complaints.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                return _ComplaintCard(complaint: complaints[index]);
              },
            );
          },
        ),
      ),
    );
  }
}

class _ComplaintCard extends StatelessWidget {
  const _ComplaintCard({required this.complaint});

  final AreaHeadComplaint complaint;

  Color get _priorityColor {
    switch (complaint.priority.toLowerCase()) {
      case 'high':
        return DashboardColors.rose;
      case 'medium':
        return DashboardColors.amber;
      default:
        return DashboardColors.emerald;
    }
  }

  Color get _priorityTint {
    switch (complaint.priority.toLowerCase()) {
      case 'high':
        return DashboardColors.roseSoft;
      case 'medium':
        return DashboardColors.amberSoft;
      default:
        return DashboardColors.emeraldSoft;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = complaint.reportDate == null
        ? 'Report date unavailable'
        : '${complaint.reportDate!.year}-${complaint.reportDate!.month.toString().padLeft(2, '0')}-${complaint.reportDate!.day.toString().padLeft(2, '0')}';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _priorityTint,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _priorityColor.withAlpha(90)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: _priorityColor.withAlpha(24),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.report_problem_outlined,
                  color: _priorityColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      complaint.category,
                      style: const TextStyle(
                        color: DashboardColors.slate,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      dateLabel,
                      style: const TextStyle(
                        color: DashboardColors.mutedText,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              _Chip(label: complaint.priority, color: _priorityColor),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            complaint.summary,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: DashboardColors.slate, height: 1.3),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _Chip(label: complaint.status, color: DashboardColors.emerald),
              const SizedBox(width: 8),
              Text(
                '${complaint.complaintsCount} handled',
                style: const TextStyle(
                  color: DashboardColors.mutedText,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: color.withAlpha(24),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Text(
        titleCaseStatus(label),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _ComplaintMessage extends StatelessWidget {
  const _ComplaintMessage({
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 44, color: DashboardColors.emerald),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: DashboardColors.slate,
                fontWeight: FontWeight.w900,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: DashboardColors.mutedText),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 14),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}
