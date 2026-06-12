import 'package:flutter/material.dart';

class DashboardColors {
  const DashboardColors._();

  static const background = Color(0xFFF8FAFC);
  static const emeraldDark = Color(0xFF064E3B);
  static const emerald = Color(0xFF047857);
  static const emeraldSoft = Color(0xFFE8F5EF);
  static const teal = Color(0xFF0F766E);
  static const tealSoft = Color(0xFFE6F7F4);
  static const blue = Color(0xFF2563EB);
  static const blueSoft = Color(0xFFEFF6FF);
  static const violet = Color(0xFF7C3AED);
  static const violetSoft = Color(0xFFF5F3FF);
  static const amber = Color(0xFFF59E0B);
  static const amberSoft = Color(0xFFFFF7E6);
  static const rose = Color(0xFFFB7185);
  static const roseSoft = Color(0xFFFFF1F2);
  static const slate = Color(0xFF0F172A);
  static const mutedText = Color(0xFF64748B);
  static const border = Color(0xFFE2E8F0);
  static const card = Colors.white;
}

String formatRupees(num value) {
  final normalized = value.toDouble().abs().toStringAsFixed(2);
  final parts = normalized.split('.');
  final whole = parts.first;
  final decimals = parts.last;
  final buffer = StringBuffer();

  for (var index = 0; index < whole.length; index += 1) {
    final remaining = whole.length - index;
    buffer.write(whole[index]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }

  final sign = value < 0 ? '-' : '';
  return '$sign₹$buffer.$decimals';
}

String titleCaseStatus(String value) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) return 'Unknown';
  return '${trimmed[0].toUpperCase()}${trimmed.substring(1).toLowerCase()}';
}
