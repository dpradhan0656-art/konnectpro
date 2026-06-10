import 'package:area_head_flutter_app/features/experts/data/expert_lead_submit_errors.dart';
import 'package:area_head_flutter_app/features/experts/data/experts_repository.dart';
import 'package:flutter/material.dart';

class AddExpertScreen extends StatefulWidget {
  const AddExpertScreen({super.key});

  @override
  State<AddExpertScreen> createState() => _AddExpertScreenState();
}

class _AddExpertScreenState extends State<AddExpertScreen> {
  static const _categories = [
    'Electrician',
    'Plumber',
    'AC Technician',
    'RO Technician',
    'Carpenter',
    'CCTV Technician',
    'Painter',
    'Other',
  ];

  final _repository = ExpertsRepository();
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  final _experienceController = TextEditingController(text: '0');
  final _noteController = TextEditingController();
  String _category = _categories.first;
  bool _submitting = false;
  String _error = '';

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _experienceController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  String _normalizePhone(String value) {
    final digits = value.replaceAll(RegExp('[^0-9]'), '');
    if (digits.length == 12 && digits.startsWith('91')) {
      return digits.substring(2);
    }
    return digits;
  }

  Future<void> _submit() async {
    if (_submitting) return;
    setState(() => _error = '');

    if (!_formKey.currentState!.validate()) return;

    final experience = num.tryParse(_experienceController.text.trim()) ?? 0;
    setState(() => _submitting = true);
    try {
      await _repository.submitExpertLead(
        name: _nameController.text.trim(),
        phone: _normalizePhone(_phoneController.text),
        category: _category,
        city: _cityController.text.trim(),
        experienceYears: experience,
        localNote: _noteController.text.trim().isEmpty
            ? null
            : _noteController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Expert submitted for verification')),
      );
      Navigator.of(context).pop(true);
    } on ExpertLeadSubmitFailure catch (error) {
      setState(() => _error = error.userMessage);
    } catch (error) {
      setState(() => _error = mapExpertLeadSubmitError(error));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Expert Lead')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Area Heads can only submit expert leads for central verification. Approval, payout, KYC and bank details are admin-only.',
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                textInputAction: TextInputAction.next,
                validator: (value) {
                  if ((value ?? '').trim().length < 2) {
                    return 'Enter at least 2 characters.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Mobile Number',
                  hintText: '10 digits or +91XXXXXXXXXX',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                validator: (value) {
                  final phone = _normalizePhone(value ?? '');
                  if (!RegExp(r'^[6-9][0-9]{9}$').hasMatch(phone)) {
                    return 'Enter a valid Indian mobile number.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _category,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  prefixIcon: Icon(Icons.handyman_outlined),
                ),
                items: _categories
                    .map(
                      (category) => DropdownMenuItem(
                        value: category,
                        child: Text(category),
                      ),
                    )
                    .toList(),
                onChanged: _submitting
                    ? null
                    : (value) => setState(() {
                        _category = value ?? _categories.first;
                      }),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'City / Area',
                  prefixIcon: Icon(Icons.location_city_outlined),
                ),
                textInputAction: TextInputAction.next,
                validator: (value) {
                  if ((value ?? '').trim().length < 2) {
                    return 'Enter city or area.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _experienceController,
                decoration: const InputDecoration(
                  labelText: 'Experience Years',
                  prefixIcon: Icon(Icons.timeline_outlined),
                ),
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.next,
                validator: (value) {
                  final years = num.tryParse((value ?? '').trim());
                  if (years == null || years < 0 || years > 60) {
                    return 'Experience must be between 0 and 60.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _noteController,
                decoration: const InputDecoration(
                  labelText: 'Field Note (optional)',
                  hintText: 'Short operational note only. No KYC/bank data.',
                  prefixIcon: Icon(Icons.note_alt_outlined),
                ),
                maxLines: 3,
              ),
              if (_error.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(_error, style: const TextStyle(color: Colors.redAccent)),
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
                  _submitting ? 'Submitting...' : 'Submit for Verification',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
