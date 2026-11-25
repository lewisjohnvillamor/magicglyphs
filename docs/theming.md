# Theming

## The four styles

| Style | Look |
|---|---|
| `outline` | 1.75-unit strokes, no fill |
| `solid` | Filled shapes, inner details knocked out in the background colour |
| `duotone` | Outline plus a tinted fill in a second colour |
| `glass` | Outline plus a diagonal gradient fill |

## On the web: CSS

```css
magic-glyph {
  color: #2747f5;                    /* main colour: strokes and solid fills */
  --mg-secondary: #f5b83d;           /* duotone and glass fill */
  --mg-secondary-opacity: .35;       /* duotone fill strength, default .18 */
  --mg-bg: #ffffff;                  /* colour knocked out of solid icons: set it to the surface behind the icon */
}
.dark magic-glyph { color: #e8ecf4; --mg-bg: #10141c; }
```

Because these are ordinary CSS properties they inherit, so setting them on a container themes every icon inside it.

**Solid icons on coloured surfaces:** set `--mg-bg` to the surface colour, otherwise the knocked-out details show as white.

## In exported files

SVG and Lottie exports take colours as options instead:

```bash
npx magic-glyphs add heart --format svg    --style duotone --color "#2747f5" --secondary "#f5b83d"
npx magic-glyphs add heart --format lottie --style solid   --color "#2747f5" --background "#10141c"
```

SVG exports default to `currentColor`, so an inlined SVG still follows the text colour.
