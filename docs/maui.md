# .NET MAUI

Each icon becomes one C# view that plays the icon's Lottie animation with SkiaSharp.

```bash
dotnet add package SkiaSharp.Extended.UI.Maui
npx magic-glyphs add bell heart --format maui --out Glyphs
```

In `MauiProgram.cs` add `builder.UseSkiaSharp();`, then:

```csharp
var bell = new MagicGlyphs.BellGlyph(size: 32);
layout.Children.Add(bell); // plays on tap; call bell.Play() for other triggers
```

Colours and style are set when you export: `--color "#2747f5" --style duotone`. For sound, add `Plugin.Maui.Audio`, put `bell.wav` (from `--format wav`) under `Resources/Raw`, and set `PlaySound`.
