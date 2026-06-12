import 'package:area_head_flutter_app/features/dashboard/widgets/dashboard_ui_helpers.dart';
import 'package:flutter/material.dart';

class DashboardStatCard extends StatelessWidget {
  const DashboardStatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
    required this.subtitle,
    this.onTap,
    this.highlight = false,
    this.accentColor,
    this.tintColor,
  });

  final IconData icon;
  final String title;
  final String value;
  final String subtitle;
  final VoidCallback? onTap;
  final bool highlight;
  final Color? accentColor;
  final Color? tintColor;

  @override
  Widget build(BuildContext context) {
    final borderColor = highlight
        ? DashboardColors.amber.withAlpha(170)
        : DashboardColors.border;
    final iconColor =
        accentColor ??
        (highlight ? DashboardColors.amber : DashboardColors.emerald);
    final cardColor =
        tintColor ??
        (highlight ? DashboardColors.amberSoft : DashboardColors.card);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          height: 104,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: borderColor),
            boxShadow: const [
              BoxShadow(
                color: Color(0x100F172A),
                blurRadius: 18,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: iconColor.withAlpha(22),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: iconColor, size: 19),
                  ),
                  const Spacer(),
                  if (onTap != null)
                    Icon(
                      highlight
                          ? Icons.arrow_forward_rounded
                          : Icons.keyboard_arrow_up_rounded,
                      color: DashboardColors.mutedText,
                      size: 20,
                    ),
                ],
              ),
              const Spacer(),
              Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: DashboardColors.slate,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: const TextStyle(
                  color: DashboardColors.slate,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: DashboardColors.mutedText,
                  fontSize: 12,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
