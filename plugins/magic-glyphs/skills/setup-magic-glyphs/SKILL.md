---
name: setup-magic-glyphs
description: Set up the Magic Glyphs animated icon library in a project (web frameworks, native mobile and desktop apps, game engines, Lottie, GIF or video exports), including theming, sound settings and licence setup for the full library. Use when the user wants to install Magic Glyphs, wire it into a framework, or configure colours, sound or a licence.
---

# Set up Magic Glyphs

Use the `magic-glyphs` MCP tool `get_guide` to fetch the official setup guide, and follow it instead of relying on memory, because install commands and APIs change between versions.

## Steps

1. **Identify the target.** Read the project files (for example `package.json`, `pubspec.yaml`, `Cargo.toml`, an Xcode or Gradle project) or ask which framework the user is on.

2. **Fetch the guide.** Call `get_guide` with the closest topic. Topics include `getting-started`, `html`, `react`, `nextjs`, `vue`, `nuxt`, `svelte`, `astro`, `angular`, `shadcn`, `tailwind`, `wordpress`, `shopify`, `react-native`, `swiftui`, `jetpack-compose`, `flutter`, `winui`, `maui`, `avalonia`, `qt`, `tauri`, `rust`, `godot`, `unity`, `lottie`, `images-video`, `gif`, `figma`, `cli`, `sound`, `theming` and `licence`. Use `getting-started` when nothing fits.

3. **Install.** Run or show the install command from the guide (for npm projects, `npm install magic-glyphs`, or the equivalent for the user's package manager). Install only what the guide names.

4. **Add one icon to prove it works.** Use the `add-animated-icon` skill, or call `get_icon` for a free icon such as `bell` or `heart`, and place it on a page or screen the user can see.

5. **Configure.** If the user asks about colours, size, dark mode or styles, fetch the `theming` guide. For sound (on by default for some components, adjustable volume, pitch and sound choice), fetch the `sound` guide. Keep sound off for actions people repeat often unless the user wants it.

## Licence

The 120 free icons need no key. For the full library, the user runs `npx magic-glyphs login <their-key>` in their own terminal with the key from their Gumroad receipt; it exchanges the key for a signed Magic Glyphs key and downloads the full set. Never ask for the key in the conversation, and never write it into source files, config files or commits. For CI and build servers, fetch the `licence` guide: it explains `npx magic-glyphs build-key` and storing the result as a secret named `MAGIC_GLYPHS_KEY`.

## What this skill sends

`get_guide` and the other tools send only the topic, search words or icon name to https://magicglyphs.com/mcp and return public documentation. Package installs come from the user's normal package registry.
