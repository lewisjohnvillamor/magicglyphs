# magic-glyphs (Rust)

Animated icons with sound for Rust apps. Each icon is a few layers of SVG paths plus its spring motion,
pre-computed as one 2D matrix per layer per frame. Ask for the SVG at any moment of the motion and draw it with
whatever you use: `resvg`/`tiny-skia`, `egui` (with an SVG image loader), `iced`, `slint`, or a webview.

No dependencies, `no_std` (with `alloc`), no unsafe code.

```rust
use magic_glyphs::{icons, Style};

let bell = icons::BELL;                       // or icons::by_name("bell")
let style = Style::duotone().color("#2747f5").size(32);
let svg = bell.svg(&style);                   // resting icon
let frame = bell.svg_at(0.12, &style);        // 120 ms into its motion
let length = bell.duration();                 // seconds; redraw each frame until bell.done(t)
let m = bell.matrix(0, 0.12);                 // or draw it yourself: [a b c d e f] for layer 0
```

The crate includes the 120 free icons. The full library (8,000+ icons) is generated into your project by the
command line tool once you log in with your licence key:

```sh
npx magic-glyphs login YOUR-LICENCE-KEY
npx magic-glyphs add rocket heart --format rust --out src/glyphs
```

Each generated file holds one `pub const ICON: Icon`. Sounds: `icon.sound` names the icon's sound, one of 100 built-in
sounds (528 with the optional pack). Export the audio with `npx magic-glyphs add bell --format wav` and play it with
`rodio` (or your audio library) when the motion starts. Icons you make in the icon maker, including ones with your own
designed or uploaded sound, export to WAV the same way.

Tauri, Dioxus, Leptos and Yew apps can also use the web component from the `magic-glyphs` npm package, which plays the sound for you.

Docs: https://magicglyphs.com/docs/rust/ · Support: support@magicglyphs.com · Licence: see LICENSE.md (free icons may be used in any project; the full library is licensed per buyer).
