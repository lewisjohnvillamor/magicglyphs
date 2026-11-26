// Types for the Magic Glyphs web runtime: import MagicGlyphs from 'magic-glyphs'
/** The drawing style of an icon: thin lines, filled shapes, a tinted fill behind the lines, or frosted glass. */
export type GlyphStyle = 'outline' | 'solid' | 'duotone' | 'glass';
/** An element made playable with MagicGlyphs.attach(). */
export interface GlyphPlayer {
  /** Play the icon's animation, and its sound when sound is on. */
  play(): void;
}
/** How one icon's sound plays. Every field is optional; leave one out to keep the icon's own setting. */
export interface GlyphSoundOptions {
  /** A sound name from sound.names(), in place of the icon's own sound. */
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
  /** 0 to 1. How much the sound follows the icon's own movement while it plays: sideways motion sweeps it left and right, rising motion brightens it. Default 1; 0 keeps it still. */
  move?: number;
  /** Milliseconds, or "auto". */
  delay?: number | 'auto';
  /** Play your own audio file instead: a URL or a data: URI (the sound-src attribute). */
  src?: string;
}
/** One layer of a designed sound: a tone ['t', hz, start s, length s, level 0-1, wave, end hz?] or filtered noise ['n', hz, end hz, start s, length s, level 0-1, focus?]. */
export type GlyphSoundStep = ['t', number, number, number, number, 'sine' | 'triangle' | 'square' | 'sawtooth', number?] | ['n', number, number, number, number, number, number?];
/** Your own sound: an audio file, or a design made of steps. */
export type GlyphCustomSound = { src: string } | { synth: GlyphSoundStep[] };
/** Sound for every icon: turn it on, play sounds, shape them, add your own. Available as MagicGlyphs.sound. */
export interface GlyphSound {
  /** Turn sound on or off for every icon. Off by default. */
  enable(on?: boolean): void;
  /** True when sound is on for every icon and the visitor has not muted it. */
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
  /** Every sound name: the built-in ones and any you defined. */
  names(): string[];
  /** The built-in sounds by family (interface, alerts, motion, impacts, nature, musical, game, machines), plus yours. */
  groups(): Record<string, string[]>;
  /** Add a pack of sounds, such as the extra pack: import pack from 'magic-glyphs/sounds'. */
  add(pack: { groups?: Record<string, string[]>; sounds: Record<string, GlyphSoundStep[]> }): MagicGlyphsRuntime;
  /** True for the 100 sounds built into the runtime. */
  builtIn(name: string): boolean;
  /** Add your own named sound; null removes it. Built-in names cannot be replaced. */
  define(name: string, sound: GlyphCustomSound | null): MagicGlyphsRuntime;
  /** Load an audio file ahead of its first play. */
  preload(src: string): Promise<void>;
  /** The steps a built-in or defined sound is made of, to start a design from. */
  steps(name: string): GlyphSoundStep[] | null;
  /** The cleaned copy of a custom sound, or null when it is not valid. */
  check(sound: unknown): GlyphCustomSound | null;
  /** True once the visitor has clicked or pressed a key, which browsers require before playing sound. */
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
/** The Magic Glyphs runtime: registers icon data, draws icons as SVG, plays them, and defines the <magic-glyph> element. */
export interface MagicGlyphsRuntime {
  /** Add icon data, from a generated component or magic-glyphs/icons.json. */
  register(icons: unknown): MagicGlyphsRuntime;
  /** SVG markup for an icon in its resting pose. */
  svg(name: string, options?: { style?: GlyphStyle; size?: number | string; title?: string }): string;
  /** Make an element holding the icon's SVG playable. */
  attach(element: Element, name: string): GlyphPlayer;
  /** True when an icon with this name is registered. */
  has(name: string): boolean;
  /** The names of every registered icon. */
  names(): string[];
  /** Sound for every icon: turn it on, play, shape and add sounds. */
  sound: GlyphSound;
  /** Other helpers the runtime exposes, such as state() and transform(), used by the framework components. */
  [key: string]: unknown;
}
/** The Magic Glyphs runtime. In a page it also defines the <magic-glyph> and <magic-glyphs-sound-toggle> elements. */
declare const MagicGlyphs: MagicGlyphsRuntime;
export = MagicGlyphs;
