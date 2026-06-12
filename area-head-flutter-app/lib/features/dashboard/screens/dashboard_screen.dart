import 'package:area_head_flutter_app/features/complaints/screens/complaints_screen.dart';
import 'package:area_head_flutter_app/features/daily_reports/screens/daily_report_screen.dart';
import 'package:area_head_flutter_app/features/dashboard/data/dashboard_repository.dart';
import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_action_tile.dart';
import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_hero_card.dart';
import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_stat_card.dart';
import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_ui_helpers.dart';
import 'package:area_head_flutter_app/features/dashboard/widgets/linked_experts_sheet.dart';
import 'package:area_head_flutter_app/features/experts/screens/my_experts_screen.dart';
import 'package:area_head_flutter_app/features/jobs/screens/jobs_screen.dart';
import 'package:area_head_flutter_app/shared/models/area_head_dashboard_stats.dart';
import 'package:area_head_flutter_app/shared/models/area_head_profile.dart';
import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.profile,
    required this.onLogout,
  });

  final AreaHeadProfile profile;
  final Future<void> Function() onLogout;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _repository = DashboardRepository();
  late Future<AreaHeadDashboardStats> _statsFuture;

  @override
  void initState() {
    super.initState();
    _statsFuture = _repository.fetchStats();
  }

  void _refreshStats() {
    setState(() {
      _statsFuture = _repository.fetchStats();
    });
  }

  void _openScreen(Widget screen) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DashboardColors.background,
      appBar: AppBar(
        backgroundColor: DashboardColors.background,
        foregroundColor: DashboardColors.slate,
        surfaceTintColor: DashboardColors.background,
        title: const Text('Area Head Dashboard'),
        actions: [
          IconButton(
            tooltip: 'Refresh dashboard',
            onPressed: _refreshStats,
            icon: const Icon(Icons.refresh_rounded),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: DashboardColors.emerald,
          backgroundColor: DashboardColors.card,
          onRefresh: () async {
            _refreshStats();
            await _statsFuture;
          },
          child: FutureBuilder<AreaHeadDashboardStats>(
            future: _statsFuture,
            builder: (context, snapshot) {
              final isLoading =
                  snapshot.connectionState == ConnectionState.waiting;
              final stats = snapshot.data;
              final hasError =
                  snapshot.hasError || (!isLoading && stats == null);

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
                children: [
                  DashboardHeroCard(
                    profile: widget.profile,
                    stats: stats,
                    isLoading: isLoading,
                  ),
                  const SizedBox(height: 18),
                  _SectionHeader(
                    title: 'Operational Stats',
                    subtitle: 'Backend totals for your area',
                    trailing: isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : null,
                  ),
                  const SizedBox(height: 10),
                  if (hasError)
                    _DashboardErrorCard(onRetry: _refreshStats)
                  else ...[
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.42,
                      children: [
                        DashboardStatCard(
                          icon: Icons.payments_outlined,
                          title: 'Total Income',
                          value: stats == null
                              ? '--'
                              : formatRupees(stats.totalIncome),
                          subtitle: 'Area commission',
                          accentColor: DashboardColors.emerald,
                          tintColor: DashboardColors.emeraldSoft,
                        ),
                        DashboardStatCard(
                          icon: Icons.groups_outlined,
                          title: 'Linked Experts',
                          value: stats == null
                              ? '--'
                              : stats.totalExpertsCount.toString(),
                          subtitle: 'Tap to view',
                          accentColor: DashboardColors.blue,
                          tintColor: DashboardColors.blueSoft,
                          onTap: stats == null
                              ? null
                              : () => showLinkedExpertsSheet(
                                  context,
                                  stats.experts,
                                ),
                        ),
                        DashboardStatCard(
                          icon: Icons.account_balance_wallet_outlined,
                          title: 'Wallet Balance',
                          value: formatRupees(widget.profile.walletBalance),
                          subtitle: 'Current balance',
                          accentColor: DashboardColors.violet,
                          tintColor: DashboardColors.violetSoft,
                        ),
                        DashboardStatCard(
                          icon: Icons.assignment_turned_in_outlined,
                          title: 'Daily Report',
                          value: 'Today',
                          subtitle: 'Submit report',
                          highlight: true,
                          accentColor: DashboardColors.amber,
                          tintColor: DashboardColors.amberSoft,
                          onTap: () => _openScreen(const DailyReportScreen()),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 22),
                  const _SectionHeader(
                    title: 'Quick Actions',
                    subtitle: 'Field tools for daily operations',
                  ),
                  const SizedBox(height: 10),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 2.15,
                    children: [
                      DashboardActionTile(
                        icon: Icons.groups_outlined,
                        title: 'My Experts',
                        subtitle: 'View and add expert leads',
                        accentColor: DashboardColors.emerald,
                        tintColor: DashboardColors.emeraldSoft,
                        onTap: () => _openScreen(const MyExpertsScreen()),
                      ),
                      DashboardActionTile(
                        icon: Icons.work_outline_rounded,
                        title: 'Jobs',
                        subtitle: 'Track assigned area jobs',
                        accentColor: DashboardColors.blue,
                        tintColor: DashboardColors.blueSoft,
                        onTap: () => _openScreen(const JobsScreen()),
                      ),
                      DashboardActionTile(
                        icon: Icons.report_problem_outlined,
                        title: 'Complaints',
                        subtitle: 'Handle field issues',
                        accentColor: DashboardColors.rose,
                        tintColor: DashboardColors.roseSoft,
                        onTap: () => _openScreen(const ComplaintsScreen()),
                      ),
                      DashboardActionTile(
                        icon: Icons.assignment_outlined,
                        title: 'Daily Report',
                        subtitle: 'Submit today\'s field report',
                        emphasized: true,
                        accentColor: DashboardColors.amber,
                        tintColor: DashboardColors.amberSoft,
                        onTap: () => _openScreen(const DailyReportScreen()),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _DailyReportCtaCard(
                    onTap: () => _openScreen(const DailyReportScreen()),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: DashboardColors.slate,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  color: DashboardColors.mutedText,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

class _DashboardErrorCard extends StatelessWidget {
  const _DashboardErrorCard({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: DashboardColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: DashboardColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.cloud_off_outlined,
            color: DashboardColors.amber,
            size: 28,
          ),
          const SizedBox(height: 12),
          const Text(
            'Unable to load dashboard. Please retry.',
            style: TextStyle(
              color: DashboardColors.slate,
              fontWeight: FontWeight.w800,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Check your connection and try again.',
            style: TextStyle(color: DashboardColors.mutedText),
          ),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class _DailyReportCtaCard extends StatelessWidget {
  const _DailyReportCtaCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: DashboardColors.emeraldSoft,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: DashboardColors.emerald.withAlpha(120)),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: DashboardColors.emerald.withAlpha(22),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.edit_note_rounded,
                  color: DashboardColors.emerald,
                ),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Submit today\'s report',
                      style: TextStyle(
                        color: DashboardColors.slate,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Daily field report / Aaj ki report',
                      style: TextStyle(
                        color: DashboardColors.mutedText,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_rounded,
                color: DashboardColors.emerald,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
