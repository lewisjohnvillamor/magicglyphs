/**
 * The 120 free Magic Glyphs icons as data: each icon's layers, spring motion and sound name.
 *
 * @example
 * ```ts
 * import MagicGlyphs from "jsr:@magicglyphs/magic-glyphs";
 * import icons from "jsr:@magicglyphs/magic-glyphs/free-icons";
 * MagicGlyphs.register(icons);
 * ```
 * @module
 */

/** One icon: its name, category, tags, sound, drawing layers and motion. */
export interface GlyphIcon {
  /** The icon name, such as "heart". */
  n: string;
  /** Its category, such as "ui". */
  c: string;
  /** Space-separated search tags. */
  t: string;
  /** The name of its sound. */
  s?: string;
  /** Its layers of SVG paths. */
  L: unknown[];
  /** Its spring motion. */
  A: unknown[];
}

/** The free icon set, in the format MagicGlyphs.register() takes. */
declare const icons: { name: string; count: number; icons: GlyphIcon[] };
export default icons;
