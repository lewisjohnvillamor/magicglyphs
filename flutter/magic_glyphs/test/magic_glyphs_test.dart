import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:magic_glyphs/magic_glyphs.dart';

void main() {
  test('lists the 120 free icons with their sounds', () {
    expect(MagicGlyphs.names.length, 120);
    expect(MagicGlyphs.info('heart')?.sound, isNotNull);
    expect(MagicGlyphs.info('no-such-icon'), isNull);
  });

  testWidgets('draws an icon in every style and plays it on tap', (tester) async {
    for (final style in GlyphStyle.values) {
      final key = GlobalKey<MagicGlyphState>();
      await tester.pumpWidget(Directionality(textDirection: TextDirection.ltr, child: Center(child: MagicGlyph('bell', key: key, size: 48, style: style, color: const Color(0xFF2747F5), label: 'Alerts'))));
      await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 300)));
      await tester.pump();
      expect(tester.getSize(find.byType(MagicGlyph)), const Size(48, 48));
      expect(find.bySemanticsLabel('Alerts'), findsOneWidget);
      await tester.tap(find.byType(MagicGlyph));
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pumpAndSettle();
    }
  });

  testWidgets('every free icon loads in every style', (tester) async {
    for (final name in MagicGlyphs.names) {
      for (final style in GlyphStyle.values) {
        await tester.pumpWidget(Directionality(textDirection: TextDirection.ltr, child: MagicGlyph(name, style: style, trigger: GlyphTrigger.appear)));
        await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 20)));
        await tester.pump();
        expect(tester.takeException(), isNull, reason: '$name ${style.name}');
      }
    }
  });
}
