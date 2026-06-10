import 'package:area_head_flutter_app/features/complaints/data/complaints_repository.dart';
import 'package:flutter/material.dart';

class ComplaintsScreen extends StatefulWidget {
  const ComplaintsScreen({super.key});

  @override
  State<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends State<ComplaintsScreen> {
  final _repository = ComplaintsRepository();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complaints')),
      body: SafeArea(
        child: FutureBuilder(
          future: _repository.fetchMyComplaints(),
          builder: (context, snapshot) {
            final complaints = snapshot.data ?? const [];
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (complaints.isEmpty) {
              return const _ComplaintEmptyState();
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: complaints.length,
              itemBuilder: (context, index) {
                final complaint = complaints[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.report_problem_outlined),
                    title: Text(complaint.category),
                    subtitle: Text(complaint.summary),
                    trailing: Chip(label: Text(complaint.status)),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _ComplaintEmptyState extends StatelessWidget {
  const _ComplaintEmptyState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.report_problem_outlined,
              size: 48,
              color: Colors.white54,
            ),
            SizedBox(height: 12),
            Text('No complaints available'),
            SizedBox(height: 6),
            Text(
              'Complaint schema/RPC is not enabled yet. Read-only list will be connected in the next backend sprint.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
