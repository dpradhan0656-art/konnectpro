import 'package:area_head_flutter_app/features/experts/data/experts_repository.dart';
import 'package:area_head_flutter_app/features/experts/screens/add_expert_screen.dart';
import 'package:area_head_flutter_app/shared/models/area_head_expert.dart';
import 'package:flutter/material.dart';

class MyExpertsScreen extends StatefulWidget {
  const MyExpertsScreen({super.key});

  @override
  State<MyExpertsScreen> createState() => _MyExpertsScreenState();
}

class _MyExpertsScreenState extends State<MyExpertsScreen> {
  final _repository = ExpertsRepository();
  final _searchController = TextEditingController();
  late Future<List<AreaHeadExpert>> _future;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _future = _repository.fetchMyExperts();
  }

  void _refreshExperts() {
    setState(() {
      _future = _repository.fetchMyExperts();
    });
  }

  Future<void> _openAddExpert() async {
    final added = await Navigator.of(
      context,
    ).push<bool>(MaterialPageRoute(builder: (_) => const AddExpertScreen()));
    if (added == true) _refreshExperts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<AreaHeadExpert> _filter(List<AreaHeadExpert> experts) {
    final q = _query.trim().toLowerCase();
    if (q.isEmpty) return experts;
    return experts.where((expert) {
      return expert.name.toLowerCase().contains(q) ||
          expert.serviceCategory.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Experts'),
        actions: [
          TextButton.icon(
            onPressed: _openAddExpert,
            icon: const Icon(Icons.add),
            label: const Text('Add Expert'),
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<List<AreaHeadExpert>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return _MessageState(
                icon: Icons.warning_amber,
                title: 'Unable to load experts',
                message: 'Please check network/RPC permissions and retry.',
                onRetry: _refreshExperts,
              );
            }

            final experts = _filter(snapshot.data ?? const []);
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    labelText: 'Search by name or category',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (value) => setState(() => _query = value),
                ),
                const SizedBox(height: 16),
                if ((snapshot.data ?? const []).isEmpty)
                  _MessageState(
                    icon: Icons.groups_outlined,
                    title: 'No experts onboarded yet',
                    message: 'Submit your first expert lead for verification.',
                    onRetry: _openAddExpert,
                  )
                else if (experts.isEmpty)
                  const _MessageState(
                    icon: Icons.search_off,
                    title: 'No matching experts',
                    message: 'Try another name or category.',
                  )
                else
                  ...experts.map((expert) => _ExpertCard(expert: expert)),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ExpertCard extends StatelessWidget {
  const _ExpertCard({required this.expert});

  final AreaHeadExpert expert;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.person_outline, color: Colors.tealAccent),
        title: Text(expert.name),
        subtitle: Text(
          '${expert.serviceCategory} • ${expert.status}'
          '${expert.phoneMasked.isNotEmpty ? '\n${expert.phoneMasked}' : ''}',
        ),
        trailing: Text(
          expert.rating > 0 ? expert.rating.toStringAsFixed(1) : 'New',
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}

class _MessageState extends StatelessWidget {
  const _MessageState({
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
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
    );
  }
}
