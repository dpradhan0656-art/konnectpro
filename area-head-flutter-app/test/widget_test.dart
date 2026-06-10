import 'package:area_head_flutter_app/app/area_head_app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows startup error when config is missing', (tester) async {
    await tester.pumpWidget(
      const AreaHeadApp(startupError: 'Supabase config missing.'),
    );

    await tester.pump();

    expect(find.text('Secure Check Failed'), findsOneWidget);
    expect(find.text('Supabase config missing.'), findsOneWidget);
  });
}
