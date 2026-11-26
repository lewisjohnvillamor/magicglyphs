import type { DefineComponent } from 'vue';
export type GlyphVariant = 'outline' | 'solid' | 'duotone' | 'glass';
export interface MagicGlyphProps {
  name: string;
  variant?: GlyphVariant;
  size?: number | string;
  /** When the animation plays. Default "hover". */
  trigger?: 'hover' | 'click' | 'load' | 'visible' | 'none';
  /** Accessible name. Leave out for decorative icons. */
  label?: string;
  /** Play the icon's sound with its animation. */
  sound?: boolean;
  /** Shape the sound: { sound, volume, pitch, speed, tone, pan, delay, src }. */
  soundOptions?: { sound?: string; volume?: number; pitch?: number; speed?: number; tone?: number; pan?: number; delay?: number | 'auto'; src?: string };
}
export const MagicGlyph: DefineComponent<MagicGlyphProps>;
export function register(icons: unknown): void;
export const sound: import('../web/runtime').GlyphSound;
/** A speaker button visitors use to turn icon sounds on or off. Their choice is remembered in the browser. */
export const SoundToggle: DefineComponent<{ defaultOn?: boolean; size?: number | string; labelOn?: string; labelOff?: string; showLabel?: boolean }>;
