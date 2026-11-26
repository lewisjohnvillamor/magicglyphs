=== Magic Glyphs ===
Contributors: lewisjohnvillamor
Tags: icons, animated icons, svg icons, block, sound
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.8.7
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

120 animated icons with spring motion and short, shapeable sounds. Add them with a block or a shortcode.

== Description ==

Magic Glyphs adds animated icons to your site. Each icon moves with its own spring animation when visitors hover, click or scroll to it, and can play a short sound that matches the motion.

* **120 icons** for interfaces, files, commerce, devices, media, nature and travel.
* **Four styles:** outline, solid, duotone and glass.
* **A Magic Glyph block:** pick the icon, style, size, colour and when it plays, with a live preview in the editor.
* **Sound, off by default.** Turn it on per icon and choose from 100 sounds. Browsers play sound only after a visitor clicks or presses a key, and a visitor mute switch is included.
* **Small and self-contained.** One script, loaded only on pages that use an icon. Nothing is loaded from other sites and no data is collected.
* **Accessible.** Give an icon a label for screen readers, or leave it empty for decoration. Icons respect the visitor's reduced-motion setting.

= Shortcodes =

`[magic_glyph name="heart" variant="duotone" size="32" trigger="hover" label="Like" sound="yes"]`

* `name`: the icon, for example `heart`, `bell`, `rocket`.
* `variant`: `outline`, `solid`, `duotone` or `glass`.
* `size`: in pixels.
* `trigger`: `hover` (hover or tap), `click`, `visible` (when scrolled into view), `load` or `none`.
* `label`: text for screen readers.
* `sound`: `yes` to play its sound. `sound_name` picks a different sound, for example `chime`.
* `color`: a hex colour such as `#2747f5`. Icons otherwise use the text colour around them.

`[magic_glyphs_sound_toggle default="off"]` adds a speaker button visitors use to turn icon sounds on or off. Their choice is remembered in their browser.

You can also type the element into a Custom HTML block: `<magic-glyph name="bell" sound></magic-glyph>`.

= The full library =

These 120 icons are free for personal and commercial use. The full Magic Glyphs library has more than 8,000 icons, an icon maker for your own artwork, and versions for React, Vue, iOS, Android, Flutter, Windows and more, at [magicglyphs.com](https://magicglyphs.com). Nothing in this plugin is locked or time-limited.

= Source code =

Everything in the plugin is readable as shipped. `magic-glyphs.all.js` is the Magic Glyphs runtime followed by the icon data on one line; the runtime's source and the tools that build the icon data are at [github.com/lewisjohnvillamor/magicglyphs](https://github.com/lewisjohnvillamor/magicglyphs) (`web/runtime.js`).

== Installation ==

1. In your dashboard, go to Plugins, Add New, and search for Magic Glyphs. Or upload the plugin folder to `/wp-content/plugins/`.
2. Activate the plugin.
3. In the block editor, add the **Magic Glyph** block. Or use the shortcode in any post, page or widget.

== Frequently Asked Questions ==

= Does it slow my site down? =

The script is about 23 KB compressed with all 120 icons and loads only on pages that show an icon.

= Does it contact other servers or collect data? =

No. Everything is served from the plugin's own folder.

= Why don't I hear the sound? =

Sound is off unless you turn it on for an icon, and browsers allow sound only after a visitor has clicked or pressed a key on the page. Visitors who muted icon sounds with the mute switch hear nothing.

= Can I use other icons? =

The plugin includes 120 icons. The full library is available at magicglyphs.com.

== Screenshots ==

1. The Magic Glyph block with its settings in the editor.
2. Icons in the four styles.

== Changelog ==

= 0.8.7 =
* New Magic Glyph block with a live preview, colour, size and sound settings.
* 100 sounds, level-matched, with a choice per icon.
* Shortcode options for a different sound and a colour.
* Licensed GPLv2 or later.

= 0.7.0 =
* First release: shortcodes for icons and a visitor mute switch.

== Upgrade Notice ==

= 0.8.7 =
Adds a Magic Glyph block and 100 sounds.
