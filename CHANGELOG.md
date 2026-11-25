# Changelog

## 0.7.2

- The command line tool no longer starts other programs: `buy` prints the link instead of opening a browser. Removes shell access from the package.

## 0.7.1

- Native app components: `--format react-native`, `swiftui`, `compose`, `flutter`, `winui`.
- `sound="off"` keeps an individual icon silent even when sound is on for the page.
- Loading the script twice reuses the first copy (fixes the Shopify snippet, which loaded once per icon).
- WordPress plugin: sound attribute and a `[magic_glyphs_sound_toggle]` shortcode.
- Six icons moved to the right category; README, keywords and platform guides updated.

## 0.7.0

- Icon maker on the website: upload SVG or PNG/JPG (traced), remix library icons, choose motion, shape sound, export to every format; saves your work in the browser.
- Sound you can shape per icon: volume, pitch, speed, tone, stereo and timing; all sounds levelled to the same loudness; impact sounds timed to the motion.
- Mute switch for visitors: `<magic-glyphs-sound-toggle>`, `SoundToggle` for React and Vue.
- Native app components: `--format react-native`, `swiftui`, `compose`, `flutter`, `winui`; sounds as `.wav` with `--sound` or `--format wav`.
- Official shadcn registry: `npx magic-glyphs shadcn`, then `npx shadcn add @magic-glyphs/<icon>`.
- Your own icons in the CLI and MCP server with `--from` and `MAGIC_GLYPHS_CUSTOM`.
- Typed React and Vue components in TypeScript projects; `'use client'` for Next.js.
- Device limits and build keys for licences; `npx magic-glyphs update`, `buy`, `--version`.

## 0.6.2

- Fixes paid login (0.6.1 shipped the wrong public key).
