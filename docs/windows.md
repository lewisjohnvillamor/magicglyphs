# Windows (WinUI)

## Install

```bash
dotnet add package CommunityToolkit.WinUI.Lottie
npx magic-glyphs add heart bell --format winui --sound --out Icons
```

Each icon is one `.cs` control with its animation built in. Add the `.wav` files to the project as Content for sound.

## Use

```csharp
var heart = new HeartGlyph(28) { Sound = true };
panel.Children.Add(heart);
```

The icon plays when tapped. Call `heart.Play()` to play it from code.

For WPF, Electron or Tauri on Windows, use the web or Lottie routes instead.

> Generated from the same Lottie export as the other platforms, which is checked against an independent Lottie renderer. These component files have not yet been run on real devices; please report anything that does not work.
