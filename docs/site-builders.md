# Webflow, Framer, Wix and other site builders

Every builder that accepts custom code can use Magic Glyphs. Add the script once for the whole site, then place icons with an embed. For WordPress and Shopify, see [HTML, WordPress, Shopify](https://magicglyphs.com/docs/web/).

The script for the free icons:

```html
<script src="https://unpkg.com/magic-glyphs/web/magic-glyphs.all.js" defer></script>
```

For paid icons, make your own file with `npx magic-glyphs bundle heart bell rocket --out magic-glyphs.js`, upload it to the builder's file storage, and point the script at it.

An icon anywhere on a page:

```html
<magic-glyph name="rocket" size="32" sound></magic-glyph>
```

| Builder | Where the script goes | Where icons go |
| --- | --- | --- |
| **Webflow** | Site settings → Custom code → Footer code | An **Embed** element |
| **Framer** | Site settings → General → Custom code (end of body) | An **Embed** component (HTML) |
| **Ghost** | Settings → Code injection → Site footer | An **HTML** card |
| **Squarespace** | Settings → Advanced → Code injection → Footer | A **Code** block |
| **Wix** | Settings → Custom code → Body end (all pages) | **Embed code** → Embed HTML |

Webflow and Framer can also play Lottie files directly: export with `npx magic-glyphs add rocket --format lottie` or from the [icon maker](https://magicglyphs.com/maker/) and use their Lottie element (without sound). Where scripts are not allowed at all, use an [animated GIF or video](https://magicglyphs.com/docs/images-video/).
