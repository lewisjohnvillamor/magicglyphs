import * as React from 'react';
export type GlyphVariant = 'outline' | 'solid' | 'duotone' | 'glass';
/** Shape the icon's sound. Leave a field out to keep the icon's own setting. */
export interface GlyphSoundOptions {
  /** Use a different sound, by name (see sound.names()). */
  sound?: string;
  /** 0 to 2. Default 1. */
  volume?: number;
  /** Semitones, -12 to 12. Default 0. */
  pitch?: number;
  /** 0.5 to 2. Default 1. */
  speed?: number;
  /** -1 softer to 1 brighter. Default 0. */
  tone?: number;
  /** 0 centred to 1 follows the icon across the screen. Default 1. */
  pan?: number;
  /** 0 to 1. How much the sound follows the icon's own movement while it plays: sideways motion sweeps it left and right, rising motion brightens it. Default 1; 0 keeps it still. */
  move?: number;
  /** Milliseconds before the sound, or "auto" to line impact sounds up with the motion. */
  delay?: number | 'auto';
  /** Your own audio file instead of a named sound: a URL or a data: URI. */
  src?: string;
}
export interface MagicGlyphProps {
  name?: string;
  variant?: GlyphVariant;
  size?: number;
  /** When the animation plays. Default "hover". */
  trigger?: 'hover' | 'click' | 'load' | 'visible' | 'none';
  /** Accessible name. Leave out for decorative icons. */
  label?: string;
  /** Play the icon's sound with its animation. Browsers allow audio only after the first click or key press. */
  sound?: boolean;
  soundOptions?: GlyphSoundOptions;
  className?: string;
  style?: React.CSSProperties;
  playerRef?: React.Ref<{ play(): void }>;
}
export function MagicGlyph(props: MagicGlyphProps & { name: string }): React.ReactElement;
export function register(icons: unknown): void;
export const sound: import('../web/runtime').GlyphSound;
export interface SoundToggleProps {
  /** Sound on before the visitor chooses. Default false. */
  defaultOn?: boolean;
  size?: number;
  labelOn?: string;
  labelOff?: string;
  /** Show the label next to the speaker. */
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
/** A speaker button visitors use to turn icon sounds on or off. Their choice is remembered in the browser. */
export function SoundToggle(props: SoundToggleProps): React.ReactElement;
