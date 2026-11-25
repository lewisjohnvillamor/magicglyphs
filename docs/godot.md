# Godot

Each icon becomes one GDScript file for a `Control` node. It draws the icon's own vectors and plays its spring motion; nothing to install.

```bash
npx magic-glyphs add bell heart --format godot --out glyphs
npx magic-glyphs add bell --format wav --out glyphs     # optional sound
```

1. Add a **Control** node, set its size (for example 32 × 32), and attach `bell_glyph.gd`.
2. In the Inspector, set **Color** (and **Secondary** for duotone), and **Sound Stream** to `bell.wav` if you want sound.

It plays on hover and click; call `play()` for anything else. For sprite-based games, `--format spritesheet` writes a PNG of every frame plus a JSON file with the timing.
