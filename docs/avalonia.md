# Avalonia

Each icon becomes one C# control that draws the icon's own vectors and plays its spring motion. No packages needed.

```bash
npx magic-glyphs add bell heart --format avalonia --out Glyphs
```

```csharp
var bell = new MagicGlyphs.BellGlyph(size: 32, color: "#2747f5");
panel.Children.Add(bell);
bell.Play(); // also plays on hover and click
```

Styles: add `--style solid` or `--style duotone` (with `secondary:`). Sound: Avalonia has no built-in audio, so export the WAV (`--format wav`) and play it from the `Played` event with the audio library you use.
