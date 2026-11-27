# Magic Glyphs plugin

Find animated icons with sound and add them to your project without leaving your assistant. The plugin connects to the [Magic Glyphs](https://magicglyphs.com) library of 10,100+ animated icons (120 free under the MIT licence) and teaches the assistant how to pick the right icon for a button or state and add it with code that fits your framework: plain HTML, React, Next.js, Vue, Nuxt, Svelte, Astro, shadcn, React Native, SwiftUI, Jetpack Compose, Flutter, desktop frameworks, game engines and Lottie.

## What's included

| Part | What it does |
|---|---|
| `magic-glyphs` MCP server | Remote, read-only server at `https://magicglyphs.com/mcp` with four tools: `search_icons`, `get_icon`, `list_categories` and `get_guide`. |
| `add-animated-icon` skill | Finds an icon by meaning, checks whether it is free, and adds it with the right snippet for your project. |
| `setup-magic-glyphs` skill | Installs Magic Glyphs in a project by following the official guide for your framework, then covers theming, sound and licence setup. |

## Install

In Claude Code:

```
/plugin marketplace add lewisjohnvillamor/magicglyphs
/plugin install magic-glyphs@magic-glyphs
```

Then ask, for example: "Add an animated bell to the notifications button" or "Set up Magic Glyphs in this Next.js app".

## Free and paid icons

120 icons are free. The full library needs a licence from [magicglyphs.com/docs/licence](https://magicglyphs.com/docs/licence/). You enter your key yourself in your terminal with `npx magic-glyphs login <your-key>`; the plugin never asks for it and never writes it into your files.

## Data and privacy

The plugin runs no code on your computer. Its MCP server is hosted at `https://magicglyphs.com/mcp` and receives only what the tools need: search words, an icon name, a style or a guide topic. It returns public catalogue data and documentation, needs no account, stores nothing about you and changes nothing. Install commands that a skill suggests (such as `npm install magic-glyphs`) come from your normal package registry and run only when you or your assistant run them in your project. Privacy policy: [magicglyphs.com/legal/privacy](https://magicglyphs.com/legal/privacy/).

## Support

Email [support@magicglyphs.com](mailto:support@magicglyphs.com) or open an issue at [github.com/lewisjohnvillamor/magicglyphs](https://github.com/lewisjohnvillamor/magicglyphs/issues).

## Licence

MIT. See [LICENSE](LICENSE). The plugin is MIT; paid icons are covered by the [Magic Glyphs terms](https://magicglyphs.com/docs/terms/).
