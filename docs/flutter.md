# Flutter

## Install

```bash
flutter pub add lottie audioplayers
npx magic-glyphs add heart bell --format flutter --sound --out lib/icons
```

Each icon is one `.dart` file with its animation built in. For sound, move the `.wav` files to `assets/` and list them in `pubspec.yaml`.

## Use

```dart
const HeartGlyph(size: 28, sound: true, label: 'Like')
```

> Generated from the same Lottie export as the other platforms, which is checked against an independent Lottie renderer. These component files have not yet been run on real devices; please report anything that does not work.
