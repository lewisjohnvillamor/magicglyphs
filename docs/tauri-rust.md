# Tauri and Rust

## Tauri, Dioxus and Leptos

These apps draw their interface in a web view, so Magic Glyphs works exactly as on the web, including sound:

```bash
npm install magic-glyphs
```

Then use the `<magic-glyph>` tag, or the React, Vue or Svelte setup your front end uses. Everything runs locally; no network access is needed at run time. For paid icons, bundle what you use with `npx magic-glyphs bundle heart bell --out src/magic-glyphs.js` so the app needs no licence check at run time.

## Native Rust interfaces (egui, iced, Slint)

Export still icons with `npx magic-glyphs static --out assets/icons` and load the SVG files with your toolkit's SVG support, or export Lottie files for a Lottie player. A native Rust crate with animation is planned.
