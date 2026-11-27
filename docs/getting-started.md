# Getting started

## Install

```bash
npm install magic-glyphs
```

The package includes 120 free icons and works straight away. If you bought the full set, log in once per computer with the licence key from your Gumroad receipt:

```bash
npx magic-glyphs login XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
```

That checks your purchase and downloads every icon to your computer. After that, `add`, `bundle`, `static` and the MCP server can use all of them. On a build server, set the `MAGIC_GLYPHS_KEY` variable to the `MG1...` key that `npx magic-glyphs licence --show-key` prints, then run `npx magic-glyphs sync`.

Pick the row that matches your project.

| Your project | Install | Then read |
|---|---|---|
| A plain HTML page | `npx magic-glyphs bundle --out magic-glyphs.js`, then load that file | [Web](web.md) |
| Angular, Svelte, Astro, Alpine, htmx | `npm install magic-glyphs` | [Web](web.md) |
| React or Next.js | `npm install magic-glyphs` | [React and Vue](react-vue.md) |
| Vue or Nuxt | `npm install magic-glyphs` | [React and Vue](react-vue.md) |
| WordPress | Upload [magic-glyphs-wordpress.zip](https://magicglyphs.com/downloads/magic-glyphs-wordpress.zip) as a plugin | [Web](web.md#wordpress) |
| Shopify | Add one asset and one snippet to the theme | [Web](web.md#shopify) |
| iOS, macOS, Android, Windows, Flutter | `npx magic-glyphs add ... --format lottie` | [Native](native-lottie.md) |
| You only want SVG files | `npx magic-glyphs add ... --format svg` | [CLI](cli.md) |

## Two ways to ship icons on the web

1. **One script.** `npx magic-glyphs bundle --out public/magic-glyphs.js` writes the runtime plus every icon you are licensed for (name icons after `bundle` to include only those). The `magic-glyphs.all.js` inside the package holds the free set only. Good for prototypes, CMS sites and internal tools.
2. **Only what you use.** Load the 7 KB runtime and register the icons you need. The CLI writes these files for you:

```bash
npx magic-glyphs add heart bell cart --format react --out src/icons
```

## Finding an icon

```bash
npx magic-glyphs search shopping cart
npx magic-glyphs list --category arrows
```

Or browse the sampler page.
