import type { GlyphSoundStep } from './runtime.d.ts';
/** About 400 designed sounds on top of the 100 built in. Add them with MagicGlyphs.sound.add(pack). */
declare const pack: { v: number; groups: Record<string, string[]>; sounds: Record<string, GlyphSoundStep[]> };
export default pack;
