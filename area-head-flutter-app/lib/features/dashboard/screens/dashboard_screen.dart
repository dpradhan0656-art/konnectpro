import 'package:area_head_flutter_app/features/complaints/screens/complaints_screen.dart';
import 'package:area_head_flutter_app/features/daily_reports/screens/daily_report_screen.dart';
import 'package:area_head_flutter_app/features/experts/screens/my_experts_screen.dart';
import 'package:area_head_flutter_app/features/jobs/screens/jobs_screen.dart';
import 'package:area_head_flutter_app/shared/models/area_head_profile.dart';
import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({
    super.key,
    required this.profile,
    required this.onLogout,
  });

  final AreaHeadProfile profile;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Area Head Dashboard'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: onLogout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Kshatr Area Head',
                      style: TextStyle(
                        color: Colors.tealAccent,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      profile.name,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 12),
                    _InfoRow(
                      icon: Icons.map_outlined,
                      label: 'Assigned Area',
                      value: profile.assignedArea,
                    ),
                    _InfoRow(
                      icon: Icons.verified_user_outlined,
                      label: 'Status',
                      value: profile.status,
                    ),
                    _InfoRow(
                      icon: Icons.account_balance_wallet_outlined,
                      label: 'Wallet Balance',
                      value: '₹${profile.walletBalance.toStringAsFixed(0)}',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const _ModuleCard(
              icon: Icons.groups_outlined,
              title: 'My Experts',
              screen: MyExpertsScreen(),
            ),
            const _ModuleCard(
              icon: Icons.work_outline,
              title: 'Jobs',
              screen: JobsScreen(),
            ),
            const _ModuleCard(
              icon: Icons.report_problem_outlined,
              title: 'Complaints',
              screen: ComplaintsScreen(),
            ),
            const _ModuleCard(
              icon: Icons.assignment_outlined,
              title: 'Daily Report',
              screen: DailyReportScreen(),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.tealAccent),
          const SizedBox(width: 10),
          Expanded(
            child: Text(label, style: const TextStyle(color: Colors.white70)),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  const _ModuleCard({
    required this.icon,
    required this.title,
    required this.screen,
  });

  final IconData icon;
  final String title;
  final Widget screen;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: Colors.tealAccent),
        title: Text(title),
        subtitle: const Text('Read-only Phase-2'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
        },
      ),
    );
  }
}
