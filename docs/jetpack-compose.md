# Jetpack Compose

## Install

```kotlin
implementation("com.airbnb.android:lottie-compose:6.6.0")
```

```bash
npx magic-glyphs add heart bell --format compose --sound --out app/src/main/java/magicglyphs
```

Each icon is one `.kt` file with its animation built in. For sound, move the `.wav` files to `res/raw` (dashes become underscores, so `heart.wav` stays `heart.wav`, `chat-reply.wav` becomes `chat_reply.wav`).

## Use

```kotlin
HeartGlyph(size = 28.dp, sound = true, label = "Like")
```

> Generated from the same Lottie export as the other platforms, which is checked against an independent Lottie renderer. These component files have not yet been run on real devices; please report anything that does not work.
