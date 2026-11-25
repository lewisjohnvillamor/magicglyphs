# iOS, macOS, Android, Windows and Flutter

Native apps use **Lottie** files. The CLI converts any icon to Lottie JSON with its spring motion baked into keyframes.

```bash
npx magic-glyphs add heart bell cart --format lottie --color "#111111" --out ./glyphs
npx magic-glyphs add --category arrows --format lottie --style duotone --color "#2747f5" --secondary "#f5b83d"
```

- Styles: `outline`, `solid`, `duotone`. The glass style is not exported, because gradient support differs between Lottie players.
- Colours are fixed at export time. Export once per theme, or override colours with your Lottie player's dynamic-property API.
- Files average about 8 KB each. The animation plays once; set your player to not loop.
- The canvas is 24 by 24 units and scales to any size.

## iOS and macOS (lottie-ios 4.3 or later)

Add the `lottie-ios` package with Swift Package Manager and add the JSON files to your target.

```swift
import Lottie
import SwiftUI

struct LikeIcon: View {
  @State private var mode: LottiePlaybackMode = .paused(at: .progress(0))
  var body: some View {
    LottieView(animation: .named("heart.lottie"))
      .playbackMode(mode)
      .frame(width: 32, height: 32)
      .onTapGesture { mode = .playing(.fromProgress(0, toProgress: 1, loopMode: .playOnce)) }
  }
}
```

UIKit and AppKit: `LottieAnimationView(name: "heart.lottie")`, then `view.play()`.

## Android (lottie-compose)

Put the files in `res/raw`. Resource names must be lowercase letters, digits and underscores, so rename `heart.lottie.json` to `heart.json` and `arrow-up.lottie.json` to `arrow_up.json`.

```kotlin
val composition by rememberLottieComposition(LottieCompositionSpec.RawRes(R.raw.heart))
var playing by remember { mutableStateOf(false) }
val progress by animateLottieCompositionAsState(composition, isPlaying = playing, restartOnPlay = true)
LottieAnimation(composition, { progress }, Modifier.size(32.dp).clickable { playing = true })
```

With XML views use `LottieAnimationView` with `app:lottie_rawRes="@raw/heart"` and `app:lottie_loop="false"`.

## Windows (WinUI 3)

Install the `CommunityToolkit.WinUI.Lottie` NuGet package and add the JSON files to the project with Build Action **Content**.

```xml
<AnimatedVisualPlayer x:Name="Heart" AutoPlay="False" Width="32" Height="32">
  <lottie:LottieVisualSource UriSource="ms-appx:///Glyphs/heart.lottie.json" />
</AnimatedVisualPlayer>
```

```csharp
await Heart.PlayAsync(0, 1, looped: false);
```

For UWP use `CommunityToolkit.Uwp.Lottie`. For the best start-up time, Microsoft recommends generating code from the JSON with the `lottiegen` tool instead of loading JSON at run time.

## Flutter

Add the `lottie` package, list the folder under `assets:` in `pubspec.yaml`, then:

```dart
Lottie.asset('assets/glyphs/heart.lottie.json', width: 32, height: 32, repeat: false)
```

## Sound

Lottie carries motion only. Add `--sound` to also write each icon's sound as a `.wav` file, and play it with your platform's audio player when the animation starts:

```bash
npx magic-glyphs add bell --format lottie --sound --out assets
```

## How the export was checked

Every icon was converted and rendered at two mid-animation frames with an independent Lottie library, then compared pixel by pixel with the web engine. All 3,947 icons the library had at the time matched within a small tolerance; icons added since use the same converter. The files have **not** yet been played in lottie-ios, lottie-android or Lottie-Windows; try a handful on a device before relying on them.

## After Effects, Webflow, Framer, LottieFiles

The Lottie files are standard Bodymovin JSON. Import them into After Effects with a Lottie import plugin to edit the motion further, drop them into Webflow's or Framer's Lottie element, or upload them to LottieFiles.

