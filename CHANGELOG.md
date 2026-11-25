# Changelog

## 0.8.4

- 40 new drawings that fill gaps against other popular icon sets: RSS, air vent, wall lamp, utility pole, parking meter, videotape, wallet with cards, hiking stick, stretcher, treadmill, circuit board, NAS server, robot arm, laser, spreadsheet file, admin user, concave and convex lenses, theater masks, gender symbols, electric guitar, vocal mic, tally marks, tic-tac-toe, heart handshake, hand with coins, modern house, train track, electric truck, baggage claim, pool ladder, sundae, three regional globes, wrench and screwdriver, ID lanyard, sun with snow and dimmed sun.

## 0.8.3

- 40 new drawings: paraglider, jetpack, hovercraft, tandem, rickshaw, tuk-tuk, raft, tugboat, catamaran, dinghy, porthole, astrolabe, orrery, planetarium, nebula, supernova, aurora, spacesuit, seismograph, barometer, anemometer, icicle, avalanche, geyser, canyon, cliff, dune, reef, lagoon, tidepool, driftwood, pebbles, stalactite, gemstone, trilobite, amber, geode, doubloon, eyepatch and spyglass.

## 0.8.2

- The full library grows to 7,000 icons: 358 new drawings (animals, food and drink, instruments, zodiac signs, logic gates and circuit symbols, design tools, safety signs, toys, beach, farm and more) and badge variants (plus, minus, check, x, alert, lock, search, edit, sparkle) of about 300 more icons, each with its own motion and sound.
- Repository link points to github.com/lewisjohnvillamor/magicglyphs.

## 0.8.0

- **Animated images and video** for places that cannot run code (email, slides, Canva, Notion, Slack and Discord emoji, social posts): `--format gif`, `apng`, `webm` and `mp4`. Video carries the icon's sound. Drawn without a browser or native modules; video uses ffmpeg when installed. Also in the icon maker.
- **New platforms:** `--format qml` (Qt Quick), `avalonia`, `maui`, `godot`, `unity`, `compose-multiplatform`, `rust` and `spritesheet`. Qt, Avalonia, Godot and Rust draw the icon's own vectors with its motion pre-computed, with no extra libraries.
- **Rust crate** `magic-glyphs`: the free icons, their motion and the SVG at any moment of it. No dependencies.
- **Figma plugin**: search, then insert icons as vectors or animated GIFs.
- **Import single free icons:** `import heart from 'magic-glyphs/icons/heart'`; `register()` accepts one icon, so a bundle holds only the icons you use.
- 24 new icons, including bomb, recycle, sword, biohazard, university, sticker, languages, unplug, test tubes and tickets.
- Guides for Solid, Qwik, Preact, Lit, Angular, Alpine.js, htmx, Remix, SvelteKit, Laravel, Django, Rails, Electron, Ionic, Webflow, Framer, Wix, Squarespace and Ghost.

## 0.7.2

- The command line tool no longer starts other programs: `buy` prints the link instead of opening a browser. Removes shell access from the package.

## 0.7.1

- Native app components: `--format react-native`, `swiftui`, `compose`, `flutter`, `winui`.
- `sound="off"` keeps an individual icon silent even when sound is on for the page.
- Loading the script twice reuses the first copy (fixes the Shopify snippet, which loaded once per icon).
- WordPress plugin: sound attribute and a `[magic_glyphs_sound_toggle]` shortcode.
- Six icons moved to the right category; README, keywords and platform guides updated.

## 0.7.0

- Icon maker on the website: upload SVG or PNG/JPG (traced), remix library icons, choose motion, shape sound, export to every format; saves your work in the browser.
- Sound you can shape per icon: volume, pitch, speed, tone, stereo and timing; all sounds levelled to the same loudness; impact sounds timed to the motion.
- Mute switch for visitors: `<magic-glyphs-sound-toggle>`, `SoundToggle` for React and Vue.
- Native app components: `--format react-native`, `swiftui`, `compose`, `flutter`, `winui`; sounds as `.wav` with `--sound` or `--format wav`.
- Official shadcn registry: `npx magic-glyphs shadcn`, then `npx shadcn add @magic-glyphs/<icon>`.
- Your own icons in the CLI and MCP server with `--from` and `MAGIC_GLYPHS_CUSTOM`.
- Typed React and Vue components in TypeScript projects; `'use client'` for Next.js.
- Device limits and build keys for licences; `npx magic-glyphs update`, `buy`, `--version`.

## 0.6.2

- Fixes paid login (0.6.1 shipped the wrong public key).
