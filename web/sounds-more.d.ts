// The extra sound pack: about 400 designed sounds on top of the 100 built into the runtime.
// import MagicGlyphs from 'magic-glyphs'; import pack from 'magic-glyphs/sounds'; MagicGlyphs.sound.add(pack);
import type { GlyphSoundStep } from './runtime';
declare const pack: { v: number; groups: Record<string, string[]>; sounds: Record<string, GlyphSoundStep[]> };
export default pack;
