# Astro, Svelte, Tailwind

Magic Glyphs works in any framework that renders HTML, because the icons are a standard web component, `<magic-glyph>`.

## Astro

```astro
<magic-glyph name="heart" size="32" sound></magic-glyph>

<script>
  import MG from 'magic-glyphs';
  import icons from 'magic-glyphs/icons.json';
  MG.register(icons);
</script>
```

For paid icons or to ship only what you use, generate a bundle and load it once: `npx magic-glyphs bundle heart bell --out public/magic-glyphs.js`, then `<script src="/magic-glyphs.js" is:inline></script>`. Astro islands with React or Vue can use those components instead.

## Svelte and SvelteKit

```svelte
<script lang="ts">
  import MG from 'magic-glyphs';
  import icons from 'magic-glyphs/icons.json';
  MG.register(icons);
</script>

<magic-glyph name="bell" variant="duotone"></magic-glyph>
```

In SvelteKit, register in a `+layout.svelte` so every page has the icons.

## Tailwind

Icons draw in the current text colour, so colour and size classes just work:

```html
<magic-glyph name="heart" class="text-rose-500 size-10" size="40"></magic-glyph>
<button class="inline-flex items-center gap-2 bg-zinc-900 text-white px-3 py-2 rounded-md">
  <magic-glyph name="heart" size="16"></magic-glyph> Like
</button>
```

For duotone, set the fill with a CSS variable: `style="--mg-secondary: theme(colors.blue.500)"` or an arbitrary property class such as `[--mg-secondary:theme(colors.blue.500)]`.

## Solid, Qwik, Lit, plain HTML

Use the `<magic-glyph>` tag as above. See the HTML guide for every attribute.

Tested with Astro 5, Svelte 5 with Tailwind 4, React 19 with Vite, Next.js App Router, and Vue 3 with TypeScript.
