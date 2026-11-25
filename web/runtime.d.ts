// Types for the Magic Glyphs web runtime: import MagicGlyphs from 'magic-glyphs'
export type GlyphStyle = 'outline' | 'solid' | 'duotone' | 'glass';
export interface GlyphPlayer { play(): void; }
export interface GlyphSoundOptions {
  sound?: string;
  /** 0 to 2. */
  volume?: number;
  /** Semitones, -12 to 12. */
  pitch?: number;
  /** 0.5 to 2. */
  speed?: number;
  /** -1 softer to 1 brighter. */
  tone?: number;
  /** 0 centred to 1 follows the icon on screen. */
  pan?: number;
  /** Milliseconds, or "auto". */
  delay?: number | 'auto';
}
export interface GlyphSound {
  /** Turn sound on or off for every icon. Off by default. */
  enable(on?: boolean): void;
  enabled(): boolean;
  /** Get or set the volume, 0 to 1. */
  volume(v?: number): number;
  /** Play a sound by name, optionally shaped. Needs a click or key press on the page first. */
  play(name: string, element?: Element | null, options?: GlyphSoundOptions): boolean;
  /** Play an icon's own sound with its settings. */
  icon(name: string, element?: Element | null, options?: GlyphSoundOptions): boolean;
  /** Settings for every use of an icon; null clears them. */
  set(name: string, options: GlyphSoundOptions | null): MagicGlyphsRuntime;
  /** The settings an icon would play with (on an element, if given). */
  get(name: string, element?: Element | null): Required<GlyphSoundOptions>;
  /** Change the defaults for every icon. */
  defaults(options?: GlyphSoundOptions): Required<GlyphSoundOptions>;
  /** Render a sound offline to an AudioBuffer, without needing a click. */
  render(name: string, options?: GlyphSoundOptions & { panTo?: number }, offlineContext?: unknown): Promise<AudioBuffer>;
  names(): string[];
  unlocked(): boolean;
  /** Turn sound on or off for every icon and remember the choice in this browser (a visitor's mute switch). */
  toggle(on?: boolean): boolean;
  /** Apply the visitor's remembered choice, or the default given. Returns whether sound is on. */
  remember(defaultOn?: boolean): boolean;
  /** True when the visitor has muted icon sounds. */
  muted(): boolean;
  /** Encode a rendered sound as a WAV file. */
  wav(buffer: AudioBuffer): ArrayBuffer;
}
export interface MagicGlyphsRuntime {
  /** Add icon data, from a generated component or magic-glyphs/icons.json. */
  register(icons: unknown): MagicGlyphsRuntime;
  /** SVG markup for an icon in its resting pose. */
  svg(name: string, options?: { style?: GlyphStyle; size?: number | string; title?: string }): string;
  /** Make an element holding the icon's SVG playable. */
  attach(element: Element, name: string): GlyphPlayer;
  has(name: string): boolean;
  names(): string[];
  sound: GlyphSound;
  [key: string]: unknown;
}
declare const MagicGlyphs: MagicGlyphsRuntime;
export = MagicGlyphs;
