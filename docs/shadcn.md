# shadcn

Magic Glyphs has an official shadcn registry. Each icon installs as a small component file in your project, and the `magic-glyphs` package is added for you.

## Set up once

In a shadcn project (one with a `components.json`):

```bash
npx magic-glyphs shadcn
```

This adds the `@magic-glyphs` registry to `components.json`. The 120 free icons work straight away:

```bash
npx shadcn@latest add @magic-glyphs/heart @magic-glyphs/bell
```

## Paid icons

Log in once, then run the setup again with `--env`:

```bash
npx magic-glyphs login YOUR-LICENCE-KEY
npx magic-glyphs shadcn --env
npx shadcn@latest add @magic-glyphs/send
```

`--env` saves your licence key to `.env.local`, where shadcn reads it, and adds `.env.local` to `.gitignore` if it is not already ignored. Keep that file out of version control. In CI, set `MAGIC_GLYPHS_KEY` as a secret instead; a build key from `npx magic-glyphs build-key` is the right one for that.

## Use the component

```tsx
import HeartGlyph from '@/components/magic-glyphs/heart';

<Button variant="ghost"><HeartGlyph size={18} /> Like</Button>
```

Icons take their colour from the text colour, so Tailwind classes such as `text-rose-500` work, as do your theme's `text-foreground` and `text-muted-foreground`.

## Your own icons

Icons you make in the icon maker can be served the same way from your own host:

```bash
npx magic-glyphs registry --from my-icons/ --out public/registry --homepage https://your-site.example
npx shadcn@latest add https://your-site.example/registry/r/my-logo.json
```

Tested with shadcn 4 on Vite + React + TypeScript and Tailwind 4.
