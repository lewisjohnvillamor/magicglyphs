---
name: add-animated-icon
description: Find the right Magic Glyphs animated icon for a UI element (a like button, a notification bell, a success state, a navigation arrow) and add it to the user's project with code that fits their framework. Use when the user asks for an icon, an animated icon, an icon with sound, or to replace a still icon with an animated one.
---

# Add an animated icon

Magic Glyphs is a library of 10,100+ animated icons with optional sound, in outline, solid, duotone and glass styles. 120 icons are free under the MIT licence; the rest need a licence key.

Use the `magic-glyphs` MCP tools for every icon name, tag, free/paid status and snippet. Never guess icon names or invent code: the library only renders names that exist.

## Steps

1. **Work out what the icon is for.** Read the user's request and, when there is a project, the surrounding code: the button label, the action, the state it shows. Note the framework (plain HTML, React, Next.js, Vue, Nuxt, Svelte, Astro, React Native, SwiftUI, Jetpack Compose, Flutter and others).

2. **Search.** Call `search_icons` with two or three plain words for the meaning, not the look, for example `"notification"` or `"add to cart"`. Try a synonym if nothing fits. Use `list_categories` only when the user wants to browse. If the user said they only want free icons, or no licence is mentioned and a free icon fits as well, pass `free_only: true`.

3. **Choose.** Prefer the icon whose name and tags match the action most directly. If two or three are equally good, show them with their `page` links and let the user pick. Say whether each one is free or needs a licence.

4. **Get the code.** Call `get_icon` with the chosen name, and the `style` the user asked for (default `outline`). Use the snippet that matches the project:
   - Plain HTML or any site builder: the `html` snippet (one script tag, then `<magic-glyph name="…">`).
   - React, Vue and other frameworks: the `cli` command, which writes a small component file into the project, then the matching usage snippet.
   - shadcn projects: the `shadcn` command.
   For anything else, call `get_guide` with the framework (for example `"flutter"` or `"swiftui"`) and follow it.

5. **Add it.** When you can edit the project, put the icon where it belongs and keep the existing button label or `aria-label`, because the icon is decorative unless it is the only content of a control. Mention the `sound` attribute or prop: sound is optional and should stay off for frequent actions unless the user wants it.

## Paid icons

If the chosen icon is not free, tell the user before adding it. To use paid icons they run `npx magic-glyphs login <their-key>` in their own terminal, with the licence key from their Gumroad receipt. Never ask for the licence key in the conversation and never write it into project files or commits. For CI, the guide from `get_guide` with topic `"licence"` explains build keys stored as a secret named `MAGIC_GLYPHS_KEY`. Users without a licence can buy one at https://magicglyphs.com/docs/licence/.

## What this skill sends

The MCP tools send only the search words, icon names, style and guide topic to https://magicglyphs.com/mcp. They read public catalogue data and change nothing.
