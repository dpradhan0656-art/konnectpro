import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_ui_helpers.dart';
import 'package:area_head_flutter_app/shared/models/area_head_dashboard_stats.dart';
import 'package:area_head_flutter_app/shared/models/area_head_profile.dart';
import 'package:flutter/material.dart';

class DashboardHeroCard extends StatelessWidget {
  const DashboardHeroCard({
    super.key,
    required this.profile,
    required this.stats,
    required this.isLoading,
  });

  final AreaHeadProfile profile;
  final AreaHeadDashboardStats? stats;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(profile.status);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF064E3B), Color(0xFF047857), Color(0xFF0F766E)],
        ),
        border: Border.all(color: Colors.white24),
        boxShadow: [
          BoxShadow(
            color: DashboardColors.emerald.withAlpha(45),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Kshatr Area Head',
                      style: TextStyle(
                        color: Color(0xFFFCD34D),
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      profile.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            height: 1.05,
                          ),
                    ),
                  ],
                ),
              ),
              _StatusBadge(label: profile.status, color: statusColor),
            ],
          ),
          const SizedBox(height: 12),
          _AreaPill(area: profile.assignedArea),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _HeroMetric(
                  label: 'Wallet',
                  value: formatRupees(profile.walletBalance),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HeroMetric(
                  label: 'Income',
                  value: isLoading || stats == null
                      ? '--'
                      : formatRupees(stats!.totalIncome),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HeroMetric(
                  label: 'Experts',
                  value: isLoading || stats == null
                      ? '--'
                      : stats!.totalExpertsCount.toString(),
                ),
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
        return DashboardColors.teal;
      case 'blocked':
        return DashboardColors.rose;
      case 'inactive':
        return DashboardColors.amber;
      default:
        return DashboardColors.mutedText;
    }
  }
}

class _AreaPill extends StatelessWidget {
  const _AreaPill({required this.area});

  final String area;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(18),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(24)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.location_on_outlined,
            color: Color(0xFFFCD34D),
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              area,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroMetric extends StatelessWidget {
  const _HeroMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 58),
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(24),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withAlpha(18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: DashboardColors.mutedText,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          FittedBox(
            alignment: Alignment.centerLeft,
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withAlpha(150)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, color: color, size: 8),
          const SizedBox(width: 6),
          Text(
            titleCaseStatus(label),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
