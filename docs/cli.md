# CLI

```bash
npx magic-glyphs --help
```

## Finding icons

```bash
magic-glyphs search shopping cart          # best matches first
magic-glyphs search arrow --category ui --limit 10
magic-glyphs list --category arrows
magic-glyphs categories
magic-glyphs info heart
```

Add `--json` to `search` and `list` for machine-readable output.

## Adding icons to a project

```bash
magic-glyphs add <name...> [options]
magic-glyphs add --category <category> [options]
magic-glyphs add --all [options]
```

| Option | Meaning | Default |
|---|---|---|
| `--format` | `svg`, `lottie`, `react`, `vue`, `json`, `html` | `svg` |
| `--style` | `outline`, `solid`, `duotone`, `glass` | `outline` |
| `--out` | Folder to write into | `./magic-glyphs` |
| `--color` | Main colour, hex | `currentColor` for SVG, `#000000` for Lottie |
| `--secondary` | Duotone fill colour, hex | same as `--color` |
| `--background` | Colour knocked out of solid icons | `#ffffff` |
| `--size` | SVG width and height in px | `24` |
| `--stdout` | Print one icon instead of writing a file | off |
| `--dry-run` | Report what would be written | off |

### What each format writes

| Format | File | Animated |
|---|---|---|
| `svg` | `heart.svg` | No. A still image. |
| `lottie` | `heart.lottie.json` | Yes |
| `react` | `HeartGlyph.jsx` | Yes (needs the `magic-glyphs` package) |
| `vue` | `HeartGlyph.vue` | Yes (needs the `magic-glyphs` package) |
| `json` | `heart.json` | Raw data for `MagicGlyphs.register` |
| `html` | `heart.html` | The `<magic-glyph>` tag |

Files for non-outline styles carry the style in the name, for example `heart.duotone.svg`.

## Exit codes

`0` on success, `1` on any error. Errors go to stderr and say what to do next.

## Licence and bundles

```bash
npx magic-glyphs login YOUR-LICENCE-KEY   # the key from your Gumroad receipt (no < > around it); downloads the full library
npx magic-glyphs buy                     # shows the link where you can buy a licence
npx magic-glyphs update                  # tells you if a newer version is out, then downloads new paid icons
npx magic-glyphs build-key               # a key for CI and build servers that does not use a device
npx magic-glyphs shadcn --env            # connect a shadcn project (see the shadcn guide)
npx magic-glyphs --version
npx magic-glyphs licence              # who this computer is licensed to
npx magic-glyphs licence --show-key   # prints the key to use on a build server
npx magic-glyphs sync                 # download the full library again
npx magic-glyphs logout

npx magic-glyphs bundle --out public/magic-glyphs.js             # runtime plus every icon you are licensed for
npx magic-glyphs bundle heart bell cart --out public/icons.js    # runtime plus only these
npx magic-glyphs static --out public/icons --styles outline,solid
```

On a build server, set the `MAGIC_GLYPHS_KEY` environment variable instead of running `login`, then run `sync`.

## Your own icons

Icons from the icon maker (exported as icon data, `.json`) work with every command. They need no licence:

```bash
npx magic-glyphs add my-logo --from my-icons/ --format react --out src/icons
npx magic-glyphs static --from my-icons/ --out public/icons
MAGIC_GLYPHS_CUSTOM=./my-icons npx magic-glyphs add my-logo --stdout
```

`--from` takes a file or a folder. `MAGIC_GLYPHS_CUSTOM` loads them for every command and for the MCP server, so your coding assistant can use them too. Files are checked so they can only contain drawing, motion and sound settings.
