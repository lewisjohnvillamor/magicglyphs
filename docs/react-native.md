# React Native

## Install

```bash
npm install lottie-react-native
npx magic-glyphs add heart bell --format react-native --sound --out src/icons
```

Each icon is one `.tsx` file with its animation built in. `--sound` also writes `heart.wav` and `bell.wav`.

## Use

```tsx
import HeartGlyph from './src/icons/HeartGlyph';

<HeartGlyph size=28 accessibilityLabel="Like" />
```

The icon plays when pressed. Props: `size`, `playOnPress`, `onPlay`, `accessibilityLabel`, `style`.

## Sound

Play the WAV from `onPlay` with the audio library you already use, for example Expo:

```tsx
import { useAudioPlayer } from 'expo-audio';
const player = useAudioPlayer(require('./src/icons/heart.wav'));
<HeartGlyph onPlay={() => { player.seekTo(0); player.play(); }} />
```

The generated component type-checks against `react-native` and `lottie-react-native`.

> Generated from the same Lottie export as the other platforms, which is checked against an independent Lottie renderer. These component files have not yet been run on real devices; please report anything that does not work.
