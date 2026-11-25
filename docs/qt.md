# Qt Quick (QML)

Each icon becomes one `.qml` file that draws the icon's own vectors with Qt Quick Shapes and plays its spring motion (pre-computed, so there is nothing to install). Qt 6.6 or newer.

```bash
npx magic-glyphs add bell heart --format qml --out qml/glyphs
npx magic-glyphs add bell --format wav --out qml/glyphs    # optional sound
```

```qml
import "glyphs"

BellGlyph { size: 32; color: "#2747f5" }
HeartGlyph { size: 32; color: palette.text; trigger: "click"; sound: true }
```

| Property | Default | |
| --- | --- | --- |
| `size` | 24 | Width and height |
| `color` | black | Line and fill colour |
| `secondary` | `color` | Duotone fill (`--style duotone`) |
| `background` | white | Knocked-out details in the solid style |
| `trigger` | `"hover"` | `hover`, `click` or `none` (then call `play()`) |
| `sound` | false | Plays `<name>.wav` next to the file, using Qt Multimedia (only loaded when on) |

Python apps with PySide6 or PyQt6 load the same files.
