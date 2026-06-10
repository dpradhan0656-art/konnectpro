import 'package:area_head_flutter_app/features/jobs/data/jobs_repository.dart';
import 'package:area_head_flutter_app/shared/models/area_head_job.dart';
import 'package:flutter/material.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  final _repository = JobsRepository();
  late Future<List<AreaHeadJob>> _future;

  @override
  void initState() {
    super.initState();
    _future = _repository.fetchMyJobs();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Jobs')),
      body: SafeArea(
        child: FutureBuilder<List<AreaHeadJob>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return _JobsMessage(
                icon: Icons.warning_amber,
                title: 'Unable to load jobs',
                message: 'Please check network/RPC permissions and retry.',
                onRetry: () => setState(() {
                  _future = _repository.fetchMyJobs();
                }),
              );
            }

            final jobs = snapshot.data ?? const [];
            if (jobs.isEmpty) {
              return const _JobsMessage(
                icon: Icons.work_outline,
                title: 'No recent jobs',
                message: 'Assigned area jobs will appear here.',
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: jobs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) => _JobCard(job: jobs[index]),
            );
          },
        ),
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job});

  final AreaHeadJob job;

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
                    job.serviceName,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                _StatusBadge(status: job.status),
              ],
            ),
            const SizedBox(height: 10),
            Text('Amount: ₹${job.amount.toStringAsFixed(0)}'),
            Text('Area: ${job.area}'),
            if (job.assignedExpertName.isNotEmpty)
              Text(
                'Expert: ${job.assignedExpertName}'
                '${job.assignedExpertPhoneMasked.isNotEmpty ? ' (${job.assignedExpertPhoneMasked})' : ''}',
              ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(status.replaceAll('_', ' ')),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _JobsMessage extends StatelessWidget {
  const _JobsMessage({
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
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: Colors.white54),
            const SizedBox(height: 12),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(message, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ],
        ),
      ),
    );
  }
}
