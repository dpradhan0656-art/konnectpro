import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_ui_helpers.dart';
import 'package:area_head_flutter_app/shared/models/area_head_dashboard_stats.dart';
import 'package:flutter/material.dart';

Future<void> showLinkedExpertsSheet(
  BuildContext context,
  List<AreaHeadDashboardExpertSummary> experts,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: DashboardColors.background,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (context) {
      return SafeArea(
        child: DraggableScrollableSheet(
          expand: false,
          minChildSize: 0.35,
          initialChildSize: experts.length > 3 ? 0.72 : 0.55,
          maxChildSize: 0.92,
          builder: (context, scrollController) {
            return ListView(
              controller: scrollController,
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              children: [
                Text(
                  'Linked Experts',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: DashboardColors.slate,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '${experts.length} expert${experts.length == 1 ? '' : 's'} connected to your area',
                  style: const TextStyle(color: DashboardColors.mutedText),
                ),
                const SizedBox(height: 18),
                if (experts.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: DashboardColors.card,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: DashboardColors.border),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.groups_outlined,
                          color: DashboardColors.emerald,
                          size: 28,
                        ),
                        SizedBox(height: 12),
                        Text(
                          'No linked experts yet',
                          style: TextStyle(
                            color: DashboardColors.slate,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Approved expert leads will appear here with field status.',
                          style: TextStyle(
                            color: DashboardColors.mutedText,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  ...experts.map(
                    (expert) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: LinkedExpertCard(expert: expert),
                    ),
                  ),
              ],
            );
          },
        ),
      );
    },
  );
}

class LinkedExpertCard extends StatelessWidget {
  const LinkedExpertCard({super.key, required this.expert});

  final AreaHeadDashboardExpertSummary expert;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DashboardColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: DashboardColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F0F172A),
            blurRadius: 14,
            offset: Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: DashboardColors.emeraldSoft,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.person_outline_rounded,
                  color: DashboardColors.emerald,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      expert.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: DashboardColors.slate,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      expert.fieldCategory,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: DashboardColors.mutedText),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _StatusChip(
                label: 'Status',
                value: titleCaseStatus(expert.status),
                color: _statusColor(expert.status),
              ),
              _StatusChip(
                label: 'KYC',
                value: titleCaseStatus(expert.kycStatus),
                color: _kycColor(expert.kycStatus),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return DashboardColors.teal;
      case 'pending':
        return DashboardColors.amber;
      case 'inactive':
      case 'rejected':
        return DashboardColors.rose;
      default:
        return DashboardColors.mutedText;
    }
  }

  Color _kycColor(String kycStatus) {
    switch (kycStatus.toLowerCase()) {
      case 'approved':
      case 'verified':
        return DashboardColors.teal;
      case 'pending':
        return DashboardColors.amber;
      case 'rejected':
        return DashboardColors.rose;
      default:
        return DashboardColors.mutedText;
    }
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withAlpha(24),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Text(
        '$label: $value',
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
