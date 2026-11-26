# Magic Glyphs for Flutter

Animated icons with sound. Each icon springs into motion when it is hovered, tapped or appears, and can play its own short sound.

- **120 free icons** in three styles: outline, solid and duotone.
- **Any size and colour**, following the surrounding `IconTheme` by default.
- **Sound, off by default**, with a global mute switch.
- **Accessible:** give an icon a label for screen readers, or leave it out for decoration.

## Install

```sh
flutter pub add magic_glyphs
```

## Use

```dart
import 'package:magic_glyphs/magic_glyphs.dart';

MagicGlyph('heart', size: 32, color: Colors.pink, sound: true, label: 'Like')
MagicGlyph('bell', style: GlyphStyle.duotone, trigger: GlyphTrigger.appear)
```

| Option | Default | |
|---|---|---|
| `size` | 24 | Width and height |
| `color` | the `IconTheme` colour | |
| `style` | `GlyphStyle.outline` | `outline`, `solid` or `duotone` |
| `trigger` | `GlyphTrigger.hover` | `hover` (hover or tap), `tap`, `appear` or `manual` |
| `sound` | false | Play the icon's sound |
| `volume` | 1.0 | 0 to 1 |
| `label` | null | Screen reader text |

Play an icon yourself with a `GlobalKey<MagicGlyphState>` and `key.currentState?.play()`. List the icons with `MagicGlyphs.names`, and mute every icon with `MagicGlyphs.soundEnabled = false`.

## The full library

The full Magic Glyphs library has more than 8,000 icons, an icon maker for your own artwork, and 528 sounds. Export any of them for Flutter with the command line tool: see [magicglyphs.com/docs/flutter](https://magicglyphs.com/docs/flutter/).

## Licence

This package, its code, icons and sounds, is MIT licensed. The paid Magic Glyphs icons have their own licence.
