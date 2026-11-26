/// Magic Glyphs: animated icons with sound for Flutter.
///
/// ```dart
/// MagicGlyph('heart', size: 32, color: Colors.pink, sound: true)
/// ```
library;

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/widgets.dart';
import 'package:lottie/lottie.dart';

part 'src/icons.dart';

/// The drawing style of an icon.
enum GlyphStyle { outline, solid, duotone }

/// What makes an icon play its animation.
enum GlyphTrigger {
  /// When the pointer moves over it, or when it is tapped.
  hover,

  /// When it is tapped.
  tap,

  /// Once, as soon as it appears.
  appear,

  /// Only when you call [MagicGlyphState.play] through a [GlobalKey].
  manual,
}

/// The name, category and sound of an icon.
class GlyphInfo {
  const GlyphInfo(this.name, this.category, this.sound);
  final String name;
  final String category;

  /// The name of the icon's sound, or null if it has none.
  final String? sound;
}

/// Lists and looks up the icons in this package.
class MagicGlyphs {
  MagicGlyphs._();

  /// Every icon name, sorted.
  static List<String> get names => glyphIcons.keys.toList()..sort();

  /// The details of one icon, or null if there is no icon with that name.
  static GlyphInfo? info(String name) => glyphIcons[name];

  /// Whether sounds play at all. Set it to false for a global mute switch.
  static bool soundEnabled = true;
}

/// An animated icon that springs into motion and can play its own short sound.
class MagicGlyph extends StatefulWidget {
  const MagicGlyph(
    this.name, {
    super.key,
    this.size = 24,
    this.color,
    this.style = GlyphStyle.outline,
    this.trigger = GlyphTrigger.hover,
    this.sound = false,
    this.volume = 1.0,
    this.label,
    this.background,
  });

  /// The icon name, for example 'heart'. See [MagicGlyphs.names].
  final String name;
  final double size;

  /// The icon colour. Defaults to the surrounding icon colour.
  final Color? color;
  final GlyphStyle style;
  final GlyphTrigger trigger;

  /// Play the icon's sound with its animation.
  final bool sound;

  /// Sound volume, 0 to 1.
  final double volume;

  /// Text for screen readers. Leave it null when the icon is decoration.
  final String? label;

  /// The colour behind the icon. The solid style draws its inner details in it, so set it on dark backgrounds. Defaults to white.
  final Color? background;

  @override
  State<MagicGlyph> createState() => MagicGlyphState();
}

/// The state of a [MagicGlyph]. Call [play] through a GlobalKey to play it yourself.
class MagicGlyphState extends State<MagicGlyph> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this);
  AudioPlayer? _audio;
  bool _loaded = false, _pending = false;

  @override
  void initState() {
    super.initState();
    if (widget.trigger == GlyphTrigger.appear) _pending = true;
  }

  /// Plays the animation, and the sound when [MagicGlyph.sound] is on.
  void play() {
    if (!_loaded) { _pending = true; return; }
    _controller.forward(from: 0);
    final s = glyphIcons[widget.name]?.sound;
    if (widget.sound && s != null && MagicGlyphs.soundEnabled) {
      final a = _audio ??= AudioPlayer()..audioCache = AudioCache(prefix: '');
      a.setVolume(widget.volume.clamp(0.0, 1.0));
      a.play(AssetSource('packages/magic_glyphs/assets/sounds/$s.wav'));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _audio?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    assert(glyphIcons.containsKey(widget.name), 'There is no Magic Glyphs icon named "${widget.name}".');
    final color = widget.color ?? IconTheme.of(context).color ?? const Color(0xFF000000);
    final cut = widget.background ?? const Color(0xFFFFFFFF);
    Widget child = Lottie.asset(
      'assets/lottie/${widget.name}.${widget.style.name}.json',
      package: 'magic_glyphs',
      controller: _controller,
      width: widget.size,
      height: widget.size,
      delegates: LottieDelegates(values: [
        ValueDelegate.color(const ['**', 'ink'], value: color),
        ValueDelegate.strokeColor(const ['**', 'ink'], value: color),
        ValueDelegate.color(const ['**', 'cut'], value: cut),
        ValueDelegate.strokeColor(const ['**', 'cut'], value: cut),
      ]),
      onLoaded: (c) {
        _controller.duration = c.duration;
        _loaded = true;
        if (_pending) { _pending = false; play(); }
      },
    );
    if (widget.trigger == GlyphTrigger.hover) child = MouseRegion(onEnter: (_) => play(), child: child);
    if (widget.trigger == GlyphTrigger.hover || widget.trigger == GlyphTrigger.tap) {
      child = GestureDetector(behavior: HitTestBehavior.opaque, onTap: play, child: child);
    }
    return Semantics(label: widget.label, excludeSemantics: widget.label == null, button: widget.label != null, child: child);
  }
}
