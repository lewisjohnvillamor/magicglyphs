<?php
/**
 * Plugin Name:       Magic Glyphs
 * Plugin URI:        https://magicglyphs.com/docs/web/#wordpress
 * Description:       Animated icons with sound. Add them with the Magic Glyph block, or the shortcodes [magic_glyph name="heart" sound="yes"] and [magic_glyphs_sound_toggle] for a visitor mute switch.
 * Version:           0.8.7
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Lewis John Villamor
 * Author URI:        https://magicglyphs.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       magic-glyphs
 */
if (!defined('ABSPATH')) { exit; }

define('MAGIC_GLYPHS_VERSION', '0.8.7');

add_action('init', function () {
    // everything is served from this plugin's own folder; nothing is loaded from other sites
    wp_register_script('magic-glyphs', plugins_url('magic-glyphs.all.js', __FILE__), array(), MAGIC_GLYPHS_VERSION, array('in_footer' => true, 'strategy' => 'defer'));
    wp_register_script('magic-glyphs-block', plugins_url('block.js', __FILE__), array('magic-glyphs', 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'), MAGIC_GLYPHS_VERSION, true);
    wp_set_script_translations('magic-glyphs-block', 'magic-glyphs');
    register_block_type('magic-glyphs/icon', array(
        'api_version'     => 3,
        'editor_script'   => 'magic-glyphs-block',
        'attributes'      => array(
            'name'    => array('type' => 'string', 'default' => 'heart'),
            'variant' => array('type' => 'string', 'default' => 'outline'),
            'size'    => array('type' => 'number', 'default' => 32),
            'trigger' => array('type' => 'string', 'default' => 'hover'),
            'label'   => array('type' => 'string', 'default' => ''),
            'sound'   => array('type' => 'boolean', 'default' => false),
            'soundName' => array('type' => 'string', 'default' => ''),
            'color'   => array('type' => 'string', 'default' => ''),
        ),
        'render_callback' => 'magic_glyphs_render_block',
    ));
});

// the icon preview also plays inside the block editor
add_action('enqueue_block_assets', function () { if (is_admin()) { wp_enqueue_script('magic-glyphs'); } });

function magic_glyphs_tag($name, $variant, $size, $trigger, $label, $sound, $sound_name = '', $color = '') {
    $variants = array('outline', 'solid', 'duotone', 'glass');
    $triggers = array('hover', 'click', 'load', 'visible', 'none');
    $variant = in_array($variant, $variants, true) ? $variant : 'outline';
    $trigger = in_array($trigger, $triggers, true) ? $trigger : 'hover';
    $size = max(8, min(512, intval($size)));
    $out = '<magic-glyph name="' . esc_attr(sanitize_key($name)) . '" variant="' . esc_attr($variant) . '" size="' . esc_attr($size) . '" trigger="' . esc_attr($trigger) . '"';
    if ($label !== '') { $out .= ' label="' . esc_attr($label) . '"'; }
    if ($sound) { $out .= ' sound'; }
    if ($sound_name !== '') { $out .= ' sound-name="' . esc_attr(sanitize_key($sound_name)) . '"'; }
    if ($color !== '' && preg_match('/^#[0-9a-fA-F]{3,8}$/', $color)) { $out .= ' style="color:' . esc_attr($color) . '"'; }
    return $out . '></magic-glyph>';
}

function magic_glyphs_render_block($a) {
    wp_enqueue_script('magic-glyphs');
    return '<span ' . get_block_wrapper_attributes() . '>' . magic_glyphs_tag($a['name'], $a['variant'], $a['size'], $a['trigger'], $a['label'], !empty($a['sound']), $a['soundName'], $a['color']) . '</span>';
}

add_shortcode('magic_glyph', function ($atts) {
    $a = shortcode_atts(array('name' => '', 'variant' => 'outline', 'size' => '24', 'trigger' => 'hover', 'label' => '', 'sound' => '', 'sound_name' => '', 'color' => ''), $atts, 'magic_glyph');
    if ($a['name'] === '') { return ''; }
    wp_enqueue_script('magic-glyphs');
    return magic_glyphs_tag($a['name'], $a['variant'], $a['size'], $a['trigger'], $a['label'], in_array(strtolower($a['sound']), array('yes', 'true', '1', 'on'), true), $a['sound_name'], $a['color']);
});

// A speaker button visitors use to turn icon sounds on or off; their choice is remembered.
add_shortcode('magic_glyphs_sound_toggle', function ($atts) {
    $a = shortcode_atts(array('default' => 'on'), $atts, 'magic_glyphs_sound_toggle');
    wp_enqueue_script('magic-glyphs');
    return '<magic-glyphs-sound-toggle default="' . ($a['default'] === 'off' ? 'off' : 'on') . '"></magic-glyphs-sound-toggle>';
});

// Let the element through the editor's HTML filter so it can also be typed directly into a Custom HTML block.
add_filter('wp_kses_allowed_html', function ($tags, $context) {
    if ($context === 'post') {
        $tags['magic-glyph'] = array('name' => true, 'variant' => true, 'size' => true, 'trigger' => true, 'label' => true, 'class' => true, 'style' => true, 'sound' => true, 'sound-name' => true, 'sound-volume' => true, 'sound-pitch' => true, 'sound-speed' => true, 'sound-tone' => true, 'sound-pan' => true, 'sound-delay' => true);
        $tags['magic-glyphs-sound-toggle'] = array('default' => true, 'size' => true, 'show-label' => true, 'label-on' => true, 'label-off' => true);
    }
    return $tags;
}, 10, 2);
