//! # Magic Glyphs for Rust
//!
//! Animated icons with sound. Each icon is a few layers of SVG paths plus its spring motion, pre-computed as
//! one 2D matrix per layer per frame. Ask for the SVG at any moment of the motion and draw it with whatever you
//! use: `resvg`/`tiny-skia`, `egui` (via an SVG image loader), `iced`, `slint`, or a webview.
//!
//! ```
//! use magic_glyphs::{icons, Style};
//! let bell = icons::BELL;
//! let style = Style::outline().color("#2747f5");
//! let still = bell.svg(&style);                 // the resting icon
//! let moving = bell.svg_at(0.12, &style);       // 120 ms into its motion
//! assert!(moving.starts_with("<svg"));
//! assert!(bell.duration() > 0.0);
//! ```
//!
//! The 120 free icons come with the crate (`icons::BELL`, `icons::by_name("bell")`). Paid icons are generated for
//! your project with the command line tool after you log in with your licence key:
//! `npx magic-glyphs add rocket --format rust --out src/glyphs`.
//!
//! Sounds: each icon names its sound (`icon.sound`). Export the audio with
//! `npx magic-glyphs add bell --format wav` and play it with `rodio` or your audio library when the motion starts.

#![forbid(unsafe_code)]
#![no_std]
extern crate alloc;
use alloc::string::String;
use core::fmt::Write;

#[cfg(feature = "free-icons")]
pub mod icons;

/// What a layer is, which decides how each style paints it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Kind {
    /// The main shape: a line in outline, filled in solid, lightly filled in duotone.
    Main,
    /// Always a line.
    Line,
    /// Inner detail: a line, knocked out in the background colour in solid.
    Detail,
    /// A small filled mark, knocked out in solid.
    Dot,
    /// Always filled.
    Fill,
}

/// One SVG path. `turn` is a fixed rotation `[degrees, cx, cy]`; `fill` a colour of its own (flags).
#[derive(Clone, Copy, Debug)]
pub struct Path {
    pub d: &'static str,
    pub turn: Option<[f32; 3]>,
    pub fill: Option<&'static str>,
}

/// A group of paths that moves together. `motion` holds 6 numbers per frame (`a b c d e f`), or `None` if still.
#[derive(Clone, Copy, Debug)]
pub struct Layer {
    pub kind: Kind,
    pub paths: &'static [Path],
    pub motion: Option<&'static [f32]>,
}

/// An animated icon.
#[derive(Clone, Copy, Debug)]
pub struct Icon {
    pub name: &'static str,
    /// The name of the icon's sound (export it with `npx magic-glyphs add <name> --format wav`).
    pub sound: Option<&'static str>,
    /// Frames per second of the pre-computed motion.
    pub fps: u32,
    pub frames: u32,
    pub layers: &'static [Layer],
}

/// The four looks of every icon, and the colours to draw them with.
#[derive(Clone, Debug)]
pub struct Style {
    pub variant: Variant,
    pub color: String,
    /// Colour knocked out of solid icons (inner details), usually your background.
    pub background: String,
    /// Duotone fill colour (defaults to `color`) and its opacity.
    pub secondary: Option<String>,
    pub secondary_opacity: f32,
    /// Width and height of the SVG in pixels.
    pub size: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Variant {
    Outline,
    Solid,
    Duotone,
}

impl Default for Style {
    fn default() -> Self {
        Style { variant: Variant::Outline, color: "#000000".into(), background: "#ffffff".into(), secondary: None, secondary_opacity: 0.18, size: 24 }
    }
}

impl Style {
    pub fn outline() -> Self { Self::default() }
    pub fn solid() -> Self { Style { variant: Variant::Solid, ..Self::default() } }
    pub fn duotone() -> Self { Style { variant: Variant::Duotone, ..Self::default() } }
    pub fn color(mut self, c: &str) -> Self { self.color = c.into(); self }
    pub fn background(mut self, c: &str) -> Self { self.background = c.into(); self }
    pub fn secondary(mut self, c: &str) -> Self { self.secondary = Some(c.into()); self }
    pub fn size(mut self, px: u32) -> Self { self.size = px; self }
}

impl Icon {
    /// Length of the motion in seconds.
    pub fn duration(&self) -> f32 {
        if self.frames <= 1 { 0.0 } else { (self.frames - 1) as f32 / self.fps as f32 }
    }

    /// Whether the motion has finished `t` seconds after it started.
    pub fn done(&self, t: f32) -> bool { t >= self.duration() }

    /// A layer's matrix `[a, b, c, d, e, f]` at `t` seconds into the motion (identity when still or finished).
    pub fn matrix(&self, layer: usize, t: f32) -> [f32; 6] {
        let id = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0];
        let Some(l) = self.layers.get(layer) else { return id };
        let Some(m) = l.motion else { return id };
        let n = (m.len() / 6) as u32;
        if n == 0 { return id; }
        let pos = (t.max(0.0) * self.fps as f32).min((n - 1) as f32);
        let k = pos as usize; // pos is never negative, so this is floor()
        let j = (k + 1).min(n as usize - 1);
        let f = pos - k as f32;
        let mut out = [0.0; 6];
        for (i, o) in out.iter_mut().enumerate() {
            *o = m[k * 6 + i] + (m[j * 6 + i] - m[k * 6 + i]) * f;
        }
        out
    }

    /// The resting icon as SVG.
    pub fn svg(&self, style: &Style) -> String { self.svg_at(f32::INFINITY, style) }

    /// The icon as SVG at `t` seconds into its motion. Draw a new one each frame while `!icon.done(t)`.
    pub fn svg_at(&self, t: f32, style: &Style) -> String {
        let mut s = String::with_capacity(512);
        let _ = write!(
            s,
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{0}" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" overflow="visible">"#,
            style.size
        );
        let sec = style.secondary.as_deref().unwrap_or(&style.color);
        for (i, l) in self.layers.iter().enumerate() {
            let m = self.matrix(i, t);
            let (fill, stroke, op) = paint(style, l.kind, sec);
            let _ = write!(s, r#"<g transform="matrix({} {} {} {} {} {})" fill="{}" stroke="{}""#, m[0], m[1], m[2], m[3], m[4], m[5], fill, stroke);
            if op < 1.0 { let _ = write!(s, r#" fill-opacity="{}""#, op); }
            s.push('>');
            for p in l.paths {
                let _ = write!(s, r#"<path d="{}""#, p.d);
                if let Some(f) = p.fill { let _ = write!(s, r#" fill="{}""#, f); }
                if let Some([a, x, y]) = p.turn { let _ = write!(s, r#" transform="rotate({} {} {})""#, a, x, y); }
                s.push_str("/>");
            }
            s.push_str("</g>");
        }
        s.push_str("</svg>");
        s
    }
}

fn paint<'a>(st: &'a Style, k: Kind, sec: &'a str) -> (&'a str, &'a str, f32) {
    let (fg, bg) = (st.color.as_str(), st.background.as_str());
    match (k, st.variant) {
        (Kind::Fill, _) => (fg, "none", 1.0),
        (Kind::Dot, Variant::Solid) => (bg, "none", 1.0),
        (Kind::Dot, _) => (fg, "none", 1.0),
        (Kind::Line, _) => ("none", fg, 1.0),
        (Kind::Detail, Variant::Solid) => ("none", bg, 1.0),
        (Kind::Detail, _) => ("none", fg, 1.0),
        (Kind::Main, Variant::Solid) => (fg, fg, 1.0),
        (Kind::Main, Variant::Duotone) => (sec, fg, st.secondary_opacity),
        (Kind::Main, Variant::Outline) => ("none", fg, 1.0),
    }
}

#[cfg(all(test, feature = "free-icons"))]
mod tests {
    use super::*;
    #[test]
    fn every_free_icon_draws() {
        assert_eq!(icons::ALL.len(), 120);
        for ic in icons::ALL {
            let a = ic.svg(&Style::solid());
            assert!(a.contains("<path"), "{}", ic.name);
            let _ = ic.svg_at(ic.duration() / 3.0, &Style::duotone());
            assert!(ic.done(ic.duration() + 0.01));
        }
    }
    #[test]
    fn motion_returns_to_rest() {
        let b = icons::by_name("bell").unwrap();
        let mid = b.matrix(0, 0.15);
        assert!((mid[1]).abs() > 0.01, "the bell swings");
        assert_eq!(b.matrix(0, 99.0), [1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);
    }
}
