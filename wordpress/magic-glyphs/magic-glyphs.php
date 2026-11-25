<?php
/**
 * Plugin Name: Magic Glyphs
 * Description: Animated icons with sound. Shortcodes: [magic_glyph name="heart" variant="duotone" size="32" trigger="hover" label="Like" sound="yes"] and a mute switch for visitors, [magic_glyphs_sound_toggle].
 * Version: 0.7.0
 * Author: Magic Glyphs
 * Author URI: https://magicglyphs.com
 */
if (!defined('ABSPATH')) { exit; }

add_action('wp_enqueue_scripts', function () {
    wp_register_script('magic-glyphs', plugins_url('magic-glyphs.all.js', __FILE__), array(), '0.7.0', true);
});

add_shortcode('magic_glyph', function ($atts) {
    $a = shortcode_atts(array('name' => '', 'variant' => 'outline', 'size' => '24', 'trigger' => 'hover', 'label' => '', 'sound' => ''), $atts, 'magic_glyph');
    if ($a['name'] === '') { return ''; }
    wp_enqueue_script('magic-glyphs');
    $label = $a['label'] !== '' ? ' label="' . esc_attr($a['label']) . '"' : '';
    $sound = in_array(strtolower($a['sound']), array('yes', 'true', '1', 'on'), true) ? ' sound' : '';
    return '<magic-glyph name="' . esc_attr($a['name']) . '" variant="' . esc_attr($a['variant']) . '" size="' . esc_attr($a['size']) . '" trigger="' . esc_attr($a['trigger']) . '"' . $label . $sound . '></magic-glyph>';
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
