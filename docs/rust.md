# Rust

```bash
cargo add magic-glyphs
```

The crate has no dependencies (it is `no_std` with `alloc`) and includes the 120 free icons. Each icon has its layers, its sound's name, and its spring motion pre-computed as one 2D matrix per layer per frame.

```rust
use magic_glyphs::{icons, Style};

let bell = icons::BELL;                         // or icons::by_name("bell")
let style = Style::duotone().color("#2747f5").size(32);

let svg = bell.svg(&style);                     // the resting icon
let frame = bell.svg_at(0.12, &style);          // 120 ms into its motion
let done = bell.done(0.12);                     // redraw each frame until true
let m = bell.matrix(0, 0.12);                   // or draw it yourself: [a b c d e f] for layer 0
```

Draw the SVG with what your toolkit uses: `resvg` + `tiny-skia` for a pixmap, an SVG image loader in **egui**, `svg::Handle` in **iced**, or Slint's image support. Start the motion on hover or click, and draw `svg_at(elapsed)` each frame until `done`.

## Paid icons

Log in with your licence key, then generate the icons you use into your project. Each file holds one `pub const ICON: Icon`:

```bash
npx magic-glyphs login YOUR-LICENCE-KEY
npx magic-glyphs add rocket heart --format rust --out src/glyphs
```

```rust
mod glyphs { pub mod rocket; pub mod heart; }
let svg = glyphs::rocket::ICON.svg(&Style::solid());
```

## Sound

`icon.sound` names the icon's sound. Export it with `npx magic-glyphs add bell --format wav` and play it with `rodio` (or your audio library) when the motion starts.

## Tauri, Dioxus, Leptos, Yew

These draw in a web view, so use the [`<magic-glyph>` web component](https://magicglyphs.com/docs/web/), which plays the sound for you. See [Tauri and Rust](https://magicglyphs.com/docs/tauri-rust/).
