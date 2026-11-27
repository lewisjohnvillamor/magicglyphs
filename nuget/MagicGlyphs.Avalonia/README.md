# Magic Glyphs for Avalonia

[![GitHub stars](https://img.shields.io/github/stars/lewisjohnvillamor/magicglyphs?style=social)](https://github.com/lewisjohnvillamor/magicglyphs/stargazers)

Animated icons with sound for Avalonia 11 and 12. Each icon springs into motion when it is hovered, clicked or appears, and can play its own short sound.

- **120 free icons** in outline, solid and duotone.
- **One control**, `MagicGlyph`, with no dependencies beyond Avalonia. It draws vectors, so it is sharp at any size.
- **Sound, off by default.** Played with the system's own audio on Windows, macOS and Linux, or handle the `Played` event to use your own audio library.

## Install

```sh
dotnet add package MagicGlyphs.Avalonia
```

## Use

```xml
<Window xmlns:mg="using:MagicGlyphs">
  <StackPanel Orientation="Horizontal" Spacing="12">
    <mg:MagicGlyph Icon="heart" Size="32" Foreground="#E11D48" Sound="True" />
    <mg:MagicGlyph Icon="bell" Variant="Duotone" Trigger="Load" />
  </StackPanel>
</Window>
```

| Property | Default | |
|---|---|---|
| `Icon` | `heart` | The icon name. `Glyphs.Names` lists them all |
| `Variant` | `Outline` | `Outline`, `Solid` or `Duotone` |
| `Size` | 24 | Width and height |
| `Foreground` | inherited | The icon colour, inherited like text colour |
| `Secondary` | `Foreground` | The duotone fill colour |
| `Backdrop` | white | The colour behind the icon; the solid style draws its inner details in it |
| `Trigger` | `Hover` | `Hover` (hover or click), `Click`, `Load` or `Manual` |
| `Sound` | false | Play the icon's sound |

Call `Play()` to play an icon yourself. Mute every icon with `Glyphs.SoundEnabled = false`. To play sounds with your own audio library, handle `Played` and open the sound with `Glyphs.OpenSound(e.SoundName)`, a WAV stream.

## The full library

The full Magic Glyphs library has 10,100+ icons, each in outline, solid, duotone and glass, plus an icon maker for your own artwork and 528 sounds. Get a licence at [magicglyphs.com](https://magicglyphs.com/#pricing), then log in once and export the icons you want for Avalonia with the command line tool:

```sh
npx magic-glyphs login YOUR-LICENCE-KEY
npx magic-glyphs add rocket heart --format avalonia
```

See [magicglyphs.com/docs/avalonia](https://magicglyphs.com/docs/avalonia/) for the details.

## Licence

This package, its code, icons and sounds, is MIT licensed. The paid Magic Glyphs icons have their own licence: [magicglyphs.com/docs/terms](https://magicglyphs.com/docs/terms/).
