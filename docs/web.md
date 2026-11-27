# Web: the `<magic-glyph>` element

> `magic-glyphs.all.js` inside the package contains the 120 free icons. If you have a licence, run `npx magic-glyphs bundle --out magic-glyphs.js` to build the same kind of file with every icon you are licensed for (or name only the icons you need), and load that file instead.

One script defines a custom element that works in any HTML, with or without a framework.

```html
<script src="magic-glyphs.all.js" defer></script>
<magic-glyph name="heart"></magic-glyph>
```

## Attributes

| Attribute | Values | Default |
|---|---|---|
| `name` | Any icon name | required |
| `variant` | `outline`, `solid`, `duotone`, `glass` | `outline` |
| `size` | Pixels | `24` |
| `trigger` | `hover`, `click`, `load`, `visible`, `none` | `hover` |
| `label` | Text for screen readers. Leave it off for decorative icons. | none |

`hover` also plays on keyboard focus and on tap. `visible` plays once when the icon scrolls into view.

## Playing from script

```js
document.querySelector('magic-glyph').play();
```

A common pattern is to animate the icon when its button is hovered:

```html
<button onmouseenter="this.querySelector('magic-glyph').play()">
  <magic-glyph name="trash" trigger="none"></magic-glyph> Delete
</button>
```

## Colour

Icons take the text colour. See [Theming](theming.md).

## Accessibility

- Motion is skipped when the visitor's system asks for reduced motion.
- Without `label` the icon is hidden from screen readers. Add `label` when the icon is the only content of a button or link.

## Loading only some icons

```html
<script src="runtime.js"></script>
<script>
  fetch('my-icons.json').then(r => r.json()).then(icons => MagicGlyphs.register(icons));
</script>
```

Make `my-icons.json` with `npx magic-glyphs add heart bell --format json` and combine the files into one array.
Icons already on the page draw themselves as soon as their data is registered.

## Angular

1. `npm install magic-glyphs`
2. In `angular.json`, add `"node_modules/magic-glyphs/web/magic-glyphs.all.js"` to the build `scripts` array.
3. Add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to the component (or module) that uses the tag.
4. Use `<magic-glyph name="heart" [attr.variant]="variant"></magic-glyph>` in templates.

## WordPress

1. Download [magic-glyphs-wordpress.zip](https://magicglyphs.com/downloads/magic-glyphs-wordpress.zip) and upload it in **Plugins → Add New → Upload Plugin** (or copy the `wordpress/magic-glyphs` folder from the [GitHub repository](https://github.com/lewisjohnvillamor/magicglyphs) into `wp-content/plugins/`), then activate **Magic Glyphs**.
2. Use the shortcode anywhere shortcodes work:

```
[magic_glyph name="heart" variant="duotone" size="32" trigger="hover" label="Like"]
```

The script loads only on pages that use the shortcode. The plugin also allows the `<magic-glyph>` tag in Custom HTML blocks.

## Shopify

1. Upload `web/magic-glyphs.all.js` to the theme's **assets**.
2. Save `shopify/magic-glyph.liquid` as `snippets/magic-glyph.liquid`.
3. Render it in any template or section:

```liquid
{% render 'magic-glyph', name: 'cart', variant: 'duotone', size: 28, label: 'Cart' %}
```

## Sound

Every icon has a short synthesized sound that matches its motion. Sound is off unless you ask for it.

```html
<!-- one icon -->
<magic-glyph name="bell" sound></magic-glyph>

<!-- or every icon on the page -->
<script>MagicGlyphs.sound.enable(true); MagicGlyphs.sound.volume(0.4);</script>
```

- **Position:** the sound is placed left or right in stereo according to where the icon sits on screen.
- **First interaction:** browsers block audio until the visitor clicks or presses a key, so hover sounds start after that.
- **React and Vue:** pass the `sound` prop, or import `sound` and call `sound.enable(true)`.
- **Shape it:** change the sound, volume, pitch, speed, tone, stereo and timing per icon. See the Sound page.
- **Be considerate:** give visitors a mute control if you turn sound on for a whole page.
