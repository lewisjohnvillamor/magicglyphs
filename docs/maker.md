# Icon maker guide

The icon maker turns your own artwork into an animated icon with motion and sound, in the same style as the library. It is included with every paid licence; you can try it with the sample before unlocking.

## 1. Unlock

Paste the licence key from your Gumroad receipt at the top of the [icon maker](https://magicglyphs.com/maker/) and press **Unlock**. The browser remembers it. Use **Remove key from this browser** on the [icon browser](https://magicglyphs.com/icons/) when you are on a shared computer.

## 2. Start from your artwork

- **Upload SVG or image:** an `.svg` file, or a PNG, JPG or WebP logo. Images are traced into shapes; this works best on simple, high-contrast artwork with a plain background.
- **Paste SVG code:** straight from Figma, Illustrator or any icon set you own.
- **Remix a library icon:** type its name, for example `rocket`, and press **Remix**. Its drawing, motion and sound are kept, ready for you to change.

The maker fits everything to the 24-pixel grid with a little padding, so it sits nicely next to library icons.

## 3. Shape

- **Line icon or filled shape:** line icons are drawn with the library's stroke; filled shapes are solid.
- **Parts:** each separate shape becomes a part. Untick **Moves** to keep a part still. Tick **Detail** for small inner marks (an eye, a dot) so they stay lines in the solid style.

## 4. Motion

Pick a motion: pop, bounce, drop in, wiggle, swing, spin, slide, shake, float, pulse, tilt or still. **Strength** sets how far it moves; **Snappy**, **Normal** and **Bouncy** set the feel.

**Give each part its own motion.** Select a part in the list: the motion buttons now apply to that part only. Choose a motion and use **Start after** to delay it, so parts move in sequence. For example, a box that pops while its lid spins in 200 ms later. **Same as all parts** returns a part to the shared motion; **Done with this part** goes back to editing all parts.

## 5. Sound

Choose one of 39 sounds, then tune it:

| Slider | What it does |
|---|---|
| Volume | Louder or quieter than other icons |
| Pitch | Higher or lower, in semitones |
| Speed | Faster or slower |
| Tone | Softer (muffled) to brighter |
| Stereo | How far the sound follows the icon left and right on screen |
| Delay | When the sound starts after the motion begins |

Press **Hear it**, or the preview itself, to listen. Browsers play sound only after you have clicked on the page.

## 6. Save

**Save to My icons** keeps the icon with your licence. Your saved icons appear in any browser where you unlock with the same key, and they are also kept in this browser. Up to 100 icons are kept; delete the ones you no longer need. What you are working on right now is kept in the browser too, so a refresh never loses it.

## 7. Export

- **SVG:** a still image.
- **React (.tsx or .jsx), Vue, HTML:** animated, with your sound settings, using the free `magic-glyphs` package.
- **Lottie:** the motion, for any Lottie player on iOS, Android, Windows or Flutter.
- **Sound (.wav):** the sound with your settings, to play alongside Lottie in native apps.
- **Icon data (JSON):** use your icon everywhere the library works:

```bash
npx magic-glyphs add my-logo --from my-icons/ --format react     # or swiftui, flutter, compose, winui
MAGIC_GLYPHS_CUSTOM=./my-icons npx -y magic-glyphs-mcp            # your coding assistant can use them too
```

## Tips

- Simpler artwork animates better. Merge tiny shapes in your design tool before importing.
- Convert text to outlines first; the maker reads shapes, not fonts.
- Your icons are yours. The maker runs in your browser; only icons you save are stored, with your licence.
