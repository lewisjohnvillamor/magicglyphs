//! Prints an icon as SVG at a moment of its motion: cargo run --example svg -- bell 0.15
use magic_glyphs::{icons, Style};
fn main() {
    let mut a = std::env::args().skip(1);
    let name = a.next().unwrap_or_else(|| "bell".into());
    let t: f32 = a.next().and_then(|v| v.parse().ok()).unwrap_or(f32::INFINITY);
    let icon = icons::by_name(&name).expect("one of the 120 free icons");
    println!("{}", icon.svg_at(t, &Style::duotone().color("#7c3aed").size(96)));
}
