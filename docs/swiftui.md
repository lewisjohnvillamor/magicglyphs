# SwiftUI

## Install

Add the [Lottie package](https://github.com/airbnb/lottie-ios) (4.4 or later) to your Xcode project, then:

```bash
npx magic-glyphs add heart bell --format swiftui --sound --out MyApp/Icons
```

Each icon is one `.swift` file with its animation built in. Add the `.wav` files to the app bundle for sound.

## Use

```swift
HeartGlyph(size: 28, label: "Like")
HeartGlyph(size: 28, sound: false)
```

The icon plays when tapped, and its sound plays with it if the WAV is in the bundle.

> Generated from the same Lottie export as the other platforms, which is checked against an independent Lottie renderer. These component files have not yet been run on real devices; please report anything that does not work.
