import 'package:flutter/material.dart';
import 'package:magic_glyphs/magic_glyphs.dart';

void main() => runApp(const MaterialApp(home: Gallery()));

/// Every free icon. Hover or tap one to play it with its sound.
class Gallery extends StatelessWidget {
  const Gallery({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Magic Glyphs')),
      body: GridView.extent(
        maxCrossAxisExtent: 96,
        children: [
          for (final name in MagicGlyphs.names)
            Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              MagicGlyph(name, size: 40, sound: true, style: GlyphStyle.duotone, color: Colors.indigo),
              const SizedBox(height: 6),
              Text(name, style: const TextStyle(fontSize: 11)),
            ]),
        ],
      ),
    );
  }
}
