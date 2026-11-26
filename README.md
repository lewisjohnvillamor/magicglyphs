# Magic Glyphs: animated icons with sound

[![npm](https://img.shields.io/npm/v/magic-glyphs?logo=npm&label=npm)](https://www.npmjs.com/package/magic-glyphs) [![crates.io](https://img.shields.io/crates/v/magic-glyphs?logo=rust&label=crates.io)](https://crates.io/crates/magic-glyphs) [![MCP Registry](https://img.shields.io/badge/MCP_Registry-listed-000000?logo=modelcontextprotocol)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.lewisjohnvillamor/magic-glyphs)

**Animated icons with sound, for the web, mobile, desktop, games and design tools.** Every icon has its own spring animation and a short sound you can shape, in four styles: outline, solid, duotone and glass. It includes an icon maker for your own artwork, a command line tool, and an MCP server so coding assistants can insert icons for you.

![Magic Glyphs: animated icons with sound, plus a maker for your own](https://magicglyphs.com/cover.png)

**[Live demo, docs and free icon browser →](https://magicglyphs.com)**

- **120 free icons** in this package, free for personal and commercial use.
- **8,000+ icons** in the full library with a licence key: interface, arrows, files, commerce, devices, media, food, nature, people, travel and flags.
- **Tiny:** about 10 KB compressed for the code that draws, animates and plays every icon, about 0.2 KB per icon (import single icons: `magic-glyphs/icons/heart`), and no browser dependencies.
- **Animated GIF, APNG, MP4 and WebM** for places that cannot run code: `--format gif`, video with the sound baked in.
- **Accessible:** respects reduced motion, takes an accessible label, and sound is easy to mute.

## Works with

**Web:** [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://magicglyphs.com/docs/react-vue/) [![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://magicglyphs.com/docs/react-vue/) [![Vue](https://img.shields.io/badge/Vue-4FC08D?logo=vuedotjs&logoColor=white)](https://magicglyphs.com/docs/react-vue/) [![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?logo=nuxt&logoColor=white)](https://magicglyphs.com/docs/react-vue/) [![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white)](https://magicglyphs.com/docs/frameworks/) [![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white)](https://magicglyphs.com/docs/frameworks/) [![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)](https://magicglyphs.com/docs/frameworks/) [![Solid](https://img.shields.io/badge/Solid-2C4F7C?logo=solid&logoColor=white)](https://magicglyphs.com/docs/frameworks/) [![shadcn](https://img.shields.io/badge/shadcn-000000?logo=shadcnui&logoColor=white)](https://magicglyphs.com/docs/shadcn/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://magicglyphs.com/docs/theming/) [![HTML](https://img.shields.io/badge/HTML-E34F26?logo=html5&logoColor=white)](https://magicglyphs.com/docs/web/) [![WordPress](https://img.shields.io/badge/WordPress-21759B?logo=wordpress&logoColor=white)](https://magicglyphs.com/docs/web/#wordpress) [![Shopify](https://img.shields.io/badge/Shopify-7AB55C?logo=shopify&logoColor=white)](https://magicglyphs.com/docs/web/#shopify) [![Webflow](https://img.shields.io/badge/Webflow-146EF5?logo=webflow&logoColor=white)](https://magicglyphs.com/docs/site-builders/) [![Framer](https://img.shields.io/badge/Framer-0055FF?logo=framer&logoColor=white)](https://magicglyphs.com/docs/site-builders/)

**Mobile and desktop:** [![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://magicglyphs.com/docs/react-native/) [![SwiftUI](https://img.shields.io/badge/SwiftUI-F05138?logo=swift&logoColor=white)](https://magicglyphs.com/docs/swiftui/) [![Jetpack Compose](https://img.shields.io/badge/Jetpack_Compose-4285F4?logo=jetpackcompose&logoColor=white)](https://magicglyphs.com/docs/jetpack-compose/) [![Compose Multiplatform](https://img.shields.io/badge/Compose_Multiplatform-7F52FF?logo=kotlin&logoColor=white)](https://magicglyphs.com/docs/jetpack-compose/) [![Flutter](https://img.shields.io/badge/Flutter-02569B?logo=flutter&logoColor=white)](https://magicglyphs.com/docs/flutter/) [![Windows (WinUI)](https://img.shields.io/badge/Windows_%28WinUI%29-0078D4)](https://magicglyphs.com/docs/windows/) [![.NET MAUI](https://img.shields.io/badge/.NET_MAUI-512BD4?logo=dotnet&logoColor=white)](https://magicglyphs.com/docs/maui/) [![Avalonia](https://img.shields.io/badge/Avalonia-8B44AC)](https://magicglyphs.com/docs/avalonia/) [![Qt](https://img.shields.io/badge/Qt-41CD52?logo=qt&logoColor=white)](https://magicglyphs.com/docs/qt/) [![Tauri](https://img.shields.io/badge/Tauri-24C8DB?logo=tauri&logoColor=white)](https://magicglyphs.com/docs/tauri-rust/) [![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)](https://magicglyphs.com/docs/rust/)

**Games, design and more:** [![Godot](https://img.shields.io/badge/Godot-478CBF)](https://magicglyphs.com/docs/godot/) [![Unity](https://img.shields.io/badge/Unity-000000?logo=unity&logoColor=white)](https://magicglyphs.com/docs/unity/) [![Figma](https://img.shields.io/badge/Figma-F24E1E?logo=figma&logoColor=white)](https://magicglyphs.com/docs/figma/) [![Lottie](https://img.shields.io/badge/Lottie-00B39B?logo=lottiefiles&logoColor=white)](https://magicglyphs.com/docs/native-lottie/) [![GIF, MP4 and WebM](https://img.shields.io/badge/GIF,_MP4_and_WebM-555555)](https://magicglyphs.com/docs/images-video/) [![MCP server](https://img.shields.io/badge/MCP_server-000000?logo=modelcontextprotocol&logoColor=white)](https://magicglyphs.com/docs/mcp/)

## Install

```bash
npm install magic-glyphs
# or
yarn add magic-glyphs
pnpm add magic-glyphs
bun add magic-glyphs
deno add npm:magic-glyphs
```

Rust: `cargo add magic-glyphs` ([crates.io](https://crates.io/crates/magic-glyphs)). No install at all: `<script src="https://cdn.jsdelivr.net/npm/magic-glyphs/web/magic-glyphs.all.js" defer></script>` gives you the free icons.

The command line tool needs Node.js 18 or later. The browser code has no dependencies.

## Quick start

### HTML, no build step

```html
<script src="https://unpkg.com/magic-glyphs/web/magic-glyphs.all.js" defer></script>

<magic-glyph name="heart"></magic-glyph>
<magic-glyph name="bell" variant="duotone" size="32" sound></magic-glyph>
<magic-glyphs-sound-toggle></magic-glyphs-sound-toggle>  <!-- a mute switch for visitors -->
```

Works the same in Astro, Svelte, SvelteKit, Angular, Solid, Lit, WordPress (plugin included) and Shopify (snippet included). Icons take the text colour, so Tailwind classes like `text-rose-500` work.

### React and Next.js

```bash
npx magic-glyphs add heart bell --format react --out src/icons
```

```tsx
import HeartGlyph from './icons/HeartGlyph';

<HeartGlyph size={24} label="Like" sound soundOptions={{ pitch: 2 }} />
```

Components are typed in TypeScript projects and marked `'use client'`, so they work inside Next.js server components.

### Vue and Nuxt

```bash
npx magic-glyphs add heart bell --format vue --out components
```

```vue
<HeartGlyph :size="24" label="Like" />
```

### shadcn

```bash
npx magic-glyphs shadcn
npx shadcn@latest add @magic-glyphs/heart
```

### React Native, SwiftUI, Jetpack Compose, Flutter, Windows

One ready-to-use component file per icon, with the animation built in and its sound as a WAV file:

```bash
npx magic-glyphs add heart --format react-native --sound   # or swiftui, compose, flutter, winui
```

Lottie files are also available with `--format lottie` for any Lottie player.

### Tauri and other web-view apps

Use the HTML, React, Vue or Svelte setup above: Tauri, Dioxus and Leptos draw their interface in a web view.

## Options

| Attribute | Values | Default |
|---|---|---|
| `name` | Any icon name | required |
| `variant` | `outline`, `solid`, `duotone`, `glass` | `outline` |
| `size` | Pixels | `24` |
| `trigger` | `hover`, `click`, `load`, `visible`, `none` | `hover` |
| `sound` | Present to play the icon's sound; `off` to keep an icon silent | off |
| `label` | Accessible name; leave out for decorative icons | none |

Icons take their colour from CSS `color`. Three CSS variables tune the other styles:

```css
.my-area {
  color: #14162b;
  --mg-secondary: #4a35d6;        /* duotone fill */
  --mg-secondary-opacity: 0.22;
  --mg-bg: #ffffff;               /* colour cut out of solid icons; match your background */
}
```

## Sound

Every icon has a short synthesized sound matched to its motion, panned left or right by where the icon sits on screen. All sounds are levelled to the same loudness. Shape any icon's sound:

```html
<magic-glyph name="bell" sound sound-pitch="-3" sound-speed="1.2" sound-tone="-0.4"></magic-glyph>
```

| Setting | Range |
|---|---|
| `sound-name` | any of the 100 built-in sounds, or the 428 in the extra pack (`import pack from 'magic-glyphs/sounds'; MagicGlyphs.sound.add(pack)`) |
| `sound-src` | your own audio file: a URL or `data:` URI |
| `sound-volume` | 0 to 2 |
| `sound-pitch` | -12 to 12 semitones |
| `sound-speed` | 0.5 to 2 |
| `sound-tone` | -1 (softer) to 1 (brighter) |
| `sound-pan` | 0 (centred) to 1 (follows the icon) |
| `sound-delay` | milliseconds, or `auto` to line impact sounds up with the motion |

In React and Vue, use `soundOptions`. Browsers allow audio only after the visitor's first click or key press. [Hear every sound.](https://magicglyphs.com/docs/sound/)

## Icon maker

Paid licences include the **[icon maker](https://magicglyphs.com/maker/)**. Upload an SVG, paste SVG code, or drop in a PNG or JPG logo to trace it, or remix any library icon. It is fitted to the grid in the same line style. Choose a motion (pop, bounce, drop in, wiggle, swing, spin, slide, shake, float, pulse, tilt), shape its sound, and export SVG, React, Vue, HTML, Lottie, WAV or icon data. Your own icons then work everywhere the library does:

```bash
npx magic-glyphs add my-logo --from my-icons/ --format react
```

## Command line tool

```bash
npx magic-glyphs search shopping cart       # find icons
npx magic-glyphs list --free                # the free set
npx magic-glyphs add heart bell --format react --out src/icons
npx magic-glyphs add rocket --format lottie --sound
npx magic-glyphs bundle heart bell --out public/magic-glyphs.js
npx magic-glyphs static --out public/icons  # plain SVG files and sprites
npx magic-glyphs update                     # newer version and new icons
```

Formats for `add`: `svg`, `react`, `vue`, `html`, `json`, `lottie`, `wav`, `react-native`, `swiftui`, `compose`, `flutter`, `winui`.

## MCP server for coding assistants

```bash
npx -y magic-glyphs-mcp
```

Lets Claude, Cursor and other MCP clients search the library and insert icons in your project's format. It lives in the separate [`magic-glyphs-mcp`](https://www.npmjs.com/package/magic-glyphs-mcp) package so the icon package stays small.

## The full library

```bash
npx magic-glyphs login YOUR-LICENCE-KEY
```

Buy a licence at **[magicscraper.gumroad.com/l/vjaxbp](https://magicscraper.gumroad.com/l/vjaxbp)**. `login` checks the purchase and downloads every icon to your computer; every command above then works with the whole library. Plans: Personal (1 person, 3 devices), Team (10 people, 20 devices), Business (50 people, 100 devices). For CI, `npx magic-glyphs build-key` makes a key that does not use a device.

![A sample of icons from the full library](https://magicglyphs.com/library-light.png)

## Where it works

| Platform | How | Tested |
|---|---|---|
| HTML, JavaScript, no build step | `<magic-glyph>` tag | yes |
| React, Next.js | `magic-glyphs/react`, generated components | Vite + TypeScript, Next.js App Router |
| Vue, Nuxt | `magic-glyphs/vue`, generated components | Vite + TypeScript, Nuxt 4 |
| Astro, Svelte, Tailwind CSS | `<magic-glyph>` tag | Astro 5, Svelte 5 + Tailwind 4 |
| shadcn | official registry | shadcn 4 |
| WordPress | plugin in `wordpress/` | PHP checked |
| Shopify | snippet in `shopify/` | |
| React Native | `--format react-native` | type-checked |
| SwiftUI, Jetpack Compose, Flutter, Windows (WinUI) | `--format swiftui`, `compose`, `flutter`, `winui` | not yet on devices |
| Qt Quick (QML) | `--format qml`, native vectors | rendered in Qt 6.12 |
| Avalonia, .NET MAUI | `--format avalonia`, `maui` | not yet compiled |
| Compose Multiplatform | `--format compose-multiplatform` | not yet compiled |
| Godot, Unity, other game engines | `--format godot`, `unity`, `spritesheet` | not yet in the engines |
| Rust (egui, iced, Slint) | `cargo add magic-glyphs`, `--format rust` | tested |
| Email, slides, Canva, Notion, Slack, Discord | `--format gif`, `apng`, `mp4`, `webm` | decoded and checked |
| Webflow, Framer, Wix, Squarespace, Ghost | script + embed | |
| Figma, FigJam, Figma Slides | Magic Glyphs plugin | panel tested |
| Tauri, Dioxus, Leptos | web setup | |
| Any Lottie player | `--format lottie` | checked against an independent renderer |
| Coding assistants | `magic-glyphs-mcp` | yes |

## Limitations

- **Native app components** (SwiftUI, Compose, Flutter, WinUI, MAUI, Avalonia, Godot, Unity) are generated from tested exports but have not yet been run in those tools. The Qt and Rust outputs have been rendered and tested.
- **MP4 and WebM from the command line** need ffmpeg; the icon maker makes them in the browser without it.
- **Sound in native apps** comes as a separate `.wav` file; Lottie and static SVG themselves are silent.
- **Glass style** is not available in Lottie, native or static SVG exports.
- **Icon maker:** SVG text must be converted to outlines first, and stroke widths are replaced by the library's line weight. Image tracing (beta) suits simple, high-contrast artwork, not photos.
- **Flags** are simplified to fit a small grid.
- **Reduced motion:** when a device asks for reduced motion, icons do not animate.

## Licence

- **Free icons:** use them in any personal or commercial project, no attribution needed.
- **Paid icons:** one-time purchase for the people and devices in your plan.
- **Not allowed:** reselling or redistributing the icons as icons, publishing the paid icons where others can download them, or using them to train or build icon generators.

The full terms are in [`LICENSE.md`](https://unpkg.com/magic-glyphs/LICENSE.md).

## Guides

[Getting started](https://magicglyphs.com/docs/getting-started/) · [HTML, WordPress, Shopify](https://magicglyphs.com/docs/web/) · [React, Next.js, Vue, Nuxt](https://magicglyphs.com/docs/react-vue/) · [shadcn](https://magicglyphs.com/docs/shadcn/) · [Astro, Svelte, Tailwind](https://magicglyphs.com/docs/frameworks/) · [React Native](https://magicglyphs.com/docs/react-native/) · [SwiftUI](https://magicglyphs.com/docs/swiftui/) · [Jetpack Compose](https://magicglyphs.com/docs/jetpack-compose/) · [Flutter](https://magicglyphs.com/docs/flutter/) · [Windows](https://magicglyphs.com/docs/windows/) · [Tauri and Rust](https://magicglyphs.com/docs/tauri-rust/) · [Sound](https://magicglyphs.com/docs/sound/) · [CLI](https://magicglyphs.com/docs/cli/) · [MCP](https://magicglyphs.com/docs/mcp/) · [Every other framework](https://magicglyphs.com/docs/more-frameworks/) · [Webflow, Framer, Wix](https://magicglyphs.com/docs/site-builders/) · [GIF, PNG and video](https://magicglyphs.com/docs/images-video/) · [Qt](https://magicglyphs.com/docs/qt/) · [Avalonia](https://magicglyphs.com/docs/avalonia/) · [.NET MAUI](https://magicglyphs.com/docs/maui/) · [Rust crate](https://magicglyphs.com/docs/rust/) · [Godot](https://magicglyphs.com/docs/godot/) · [Unity](https://magicglyphs.com/docs/unity/) · [Figma](https://magicglyphs.com/docs/figma/)

## Support

Questions, licences, refunds or a bug: **[support@magicglyphs.com](mailto:support@magicglyphs.com)**, or open an issue on GitHub.

© 2026 Magic Glyphs · [magicglyphs.com](https://magicglyphs.com)
