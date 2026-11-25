# React and Vue

```bash
npm install magic-glyphs
```

## React

```jsx
import { MagicGlyph, register } from 'magic-glyphs/react';
import icons from 'magic-glyphs/icons.json';

register(icons); // once, at app start

export function LikeButton() {
  return <button><MagicGlyph name="heart" variant="duotone" size={20} label="Like" /></button>;
}
```

Props: `name`, `variant`, `size`, `trigger`, `label`, `className`, `style`, and `playerRef` (a ref that receives `{ play() }`).

The SVG is rendered on the server too, so it works with Next.js server rendering. In the App Router, put it in a client component (`'use client'`) because it uses effects.

## Vue 3

```vue
<script setup>
import { MagicGlyph, register } from 'magic-glyphs/vue';
import icons from 'magic-glyphs/icons.json';
register(icons);
</script>

<template>
  <MagicGlyph name="heart" variant="duotone" :size="20" label="Like" />
</template>
```

Call `play()` through a template ref: `<MagicGlyph ref="g" ... />` then `g.value.play()`.

## Shipping only the icons you use

The `icons.json` in the package holds the 120 free icons. For paid icons, and to ship only what you use, let the CLI write one small component per icon (after `npx magic-glyphs login`):

```bash
npx magic-glyphs add heart bell cart --format react --out src/icons
npx magic-glyphs add heart bell cart --format vue   --out src/icons
```

```jsx
import HeartGlyph from './icons/HeartGlyph';
<HeartGlyph size={20} label="Like" />
```

Each file registers just its own icon, so the bundle contains the 7 KB engine plus the icons you added.

In a TypeScript project (one with a `tsconfig.json`), the CLI writes typed components: `.tsx` for React and `<script setup lang="ts">` for Vue, so `tsc` and `vue-tsc` builds pass. Add `--js` or `--ts` to choose yourself. React components start with `'use client'`, so they work inside Next.js server components.

Tested with the default Vite React + TypeScript and Vue + TypeScript templates, Next.js (App Router) and Nuxt 4. In Nuxt, generated components in `components/` are picked up automatically, and icons render on the server.

## A mute switch

```jsx
import { SoundToggle } from 'magic-glyphs/react';   // or 'magic-glyphs/vue'
<SoundToggle defaultOn={false} />
```

## Module format

The package is CommonJS today. Vite, webpack, Next.js and Nuxt import it without configuration. A native ES module build is planned.
