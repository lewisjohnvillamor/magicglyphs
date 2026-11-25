# Static SVG files and sprites

For projects that want plain SVG with no JavaScript and no animation: email templates, PDFs, design tools, server-rendered pages.

```
npx magic-glyphs static --out public/icons --styles outline,solid,duotone
```

This writes:

| Path | What it is |
|---|---|
| `svg/<style>/<name>.svg` | One file per icon. Colour follows CSS `color`. |
| `sprite-<style>.svg` | Every icon as a `<symbol id="name">`. |
| `index.json` | Names, categories and tags for search. |

## Using a file

```html
<img src="/icons/svg/outline/heart.svg" width="24" height="24" alt="">
```

An `<img>` cannot inherit text colour. To recolour, inline the SVG or use the sprite.

## Using the sprite

```html
<svg width="24" height="24" style="color:#2747f5"><use href="/icons/sprite-outline.svg#heart"/></svg>
```

## Notes

- Styles: outline, solid and duotone. Glass relies on a gradient and is not exported as a static file.
- Solid icons knock inner details out in white. Pass `--background "#111111"` to match a dark surface.
- Flags keep their own colours in every style.
- Without a licence key the command writes the 120 free icons. See [licence.md](licence.md).
