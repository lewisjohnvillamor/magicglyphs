/**
 * The Magic Glyphs runtime with the 120 free icons already registered: import it and use any free icon.
 *
 * @example
 * ```ts
 * import MagicGlyphs from "jsr:@magicglyphs/magic-glyphs/all";
 * document.body.innerHTML = MagicGlyphs.svg("heart", { size: 48 });
 * // or in a page: <magic-glyph name="bell" sound></magic-glyph>
 * ```
 * @module
 */
import type { MagicGlyphsRuntime } from './runtime.d.ts';
/** The runtime, with the free icons registered. */
declare const MagicGlyphs: MagicGlyphsRuntime;
export default MagicGlyphs;
