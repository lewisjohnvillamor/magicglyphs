# Unity

Unity gets each icon as a sprite sheet (every frame of the motion on one PNG) and a small component that plays it.

```bash
npx magic-glyphs add bell heart --format unity --size 128 --color "#ffffff" --out Assets/Glyphs
npx magic-glyphs add bell heart --format wav --out Assets/Glyphs    # optional sound
```

1. Select `bell.sheet.png` and set **Texture Type** to *Sprite (2D and UI)*.
2. Add **BellGlyph** to a GameObject with an **Image** (UI) or a **SpriteRenderer**, and drag the sheet to **Sheet** (and `bell.wav` to **Sound**).

It plays on hover and click (UI needs an EventSystem; 2D objects need a collider), or call `Play()`. Pick `--size` for the largest size you show it at.

Other engines (Defold, Bevy, Phaser, GameMaker) can use `--format spritesheet`: a PNG grid plus JSON with the frame size, count and timing.
