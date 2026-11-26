/**
 * The extra sound pack: 428 designed sounds in ten families, on top of the 100 built into the runtime.
 *
 * @example
 * ```ts
 * import MagicGlyphs from "jsr:@magicglyphs/magic-glyphs/all";
 * import pack from "jsr:@magicglyphs/magic-glyphs/sounds";
 * MagicGlyphs.sound.add(pack);
 * MagicGlyphs.sound.set("bell", { sound: "templebell" });
 * ```
 * @module
 */
import type { GlyphSoundStep } from './runtime.d.ts';
/** About 400 designed sounds on top of the 100 built in. Add them with MagicGlyphs.sound.add(pack). */
declare const pack: { v: number; groups: Record<string, string[]>; sounds: Record<string, GlyphSoundStep[]> };
export default pack;
