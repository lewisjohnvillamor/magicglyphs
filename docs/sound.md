# Sound

Every icon has a short synthesized sound that matches its motion. Sound is **off** unless you ask for it, and browsers only allow it after the visitor clicks or presses a key.

## Turn it on

```html
<magic-glyph name="bell" sound></magic-glyph>          <!-- this icon only -->
<script>MagicGlyphs.sound.enable(true);</script>      <!-- every icon on the page -->
```

In React and Vue, pass the `sound` prop.

## Shape the sound

Every setting is optional. Leave one out to keep the icon's own.

| Setting | Range | Default | What it does |
|---|---|---|---|
| `sound` | a sound name | the icon's own | Use a different sound |
| `volume` | 0 to 2 | 1 | Louder or quieter than the others |
| `pitch` | -12 to 12 | 0 | Semitones up or down |
| `speed` | 0.5 to 2 | 1 | Faster or slower |
| `tone` | -1 to 1 | 0 | Softer (muffled) to brighter |
| `pan` | 0 to 1 | 1 | How far the sound follows the icon left and right on screen |
| `delay` | 0 to 2000 ms, or `auto` | `auto` | When it starts. `auto` lines impact sounds up with the moment of impact in the motion |

**On the element**, with `sound-` in front of each name (`sound-name` for the sound itself):

```html
<magic-glyph name="bell" sound sound-pitch="-3" sound-tone="-0.4"></magic-glyph>
```

**In React and Vue**, with `soundOptions`:

```jsx
<MagicGlyph name="bell" sound soundOptions={{ sound: 'chime', pitch: 2, volume: 0.8 }} />
```

**For every use of an icon**, or for every icon:

```js
MagicGlyphs.sound.set('bell', { sound: 'chime', pitch: 2 });   // null clears it
MagicGlyphs.sound.defaults({ volume: 0.8, pan: 0.5 });
MagicGlyphs.sound.volume(0.4);                                  // master volume, 0 to 1
```

Icons you make or remix in the [icon maker](https://magicglyphs.com/maker/) carry their sound settings with them, so the exported React, Vue and HTML play exactly what you chose.

## A mute switch for visitors

Put a speaker button on the page. Visitors turn icon sounds on or off, and the choice is remembered in their browser:

```html
<magic-glyphs-sound-toggle default="off"></magic-glyphs-sound-toggle>
```

Attributes: `default` (`on` or `off`), `size`, `show-label`, `label-on`, `label-off`. In React and Vue, use `<SoundToggle defaultOn={false} />` from `magic-glyphs/react` or `magic-glyphs/vue`. From script: `MagicGlyphs.sound.toggle()`. When a visitor mutes, every icon is silent, including ones with the `sound` attribute.

## Sound for native apps

Lottie files carry the motion but no sound. Export each icon's sound as a WAV file and play it alongside the animation:

```bash
npx magic-glyphs add bell --format lottie --sound --out assets   # bell.lottie.json and bell.wav
npx magic-glyphs add bell --format wav --out assets              # the sound alone
```

The icon maker exports WAV too, with your sound settings applied.

## Levels

All sounds are measured with the same hearing-weighted loudness curve used for broadcast audio and trimmed to a common level, so no icon is suddenly louder than the rest, and none clip at any volume setting.

## Be considerate

Give visitors a mute control if you turn sound on for a whole page, and keep it off for icons people see constantly, like navigation.

Hear every sound on the website: https://magicglyphs.com/docs/sound/
