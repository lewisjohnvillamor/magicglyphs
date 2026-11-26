/* Magic Glyph block for the WordPress editor. No build step: plain script using the editor's own libraries. */
(function (wp) {
  var el = wp.element.createElement, __ = wp.i18n.__;
  var B = wp.blockEditor, C = wp.components;
  var MG = window.MagicGlyphs;
  var names = MG ? MG.names().slice().sort() : ['heart'];
  var sounds = MG && MG.sound ? MG.sound.names().slice().sort() : [];
  var opts = function (list) { return list.map(function (v) { return { label: v, value: v }; }); };

  wp.blocks.registerBlockType('magic-glyphs/icon', {
    apiVersion: 2,
    title: __('Magic Glyph', 'magic-glyphs'),
    description: __('An animated icon with sound.', 'magic-glyphs'),
    category: 'media',
    icon: 'star-filled',
    keywords: ['icon', 'animated', 'svg', 'glyph'],
    supports: { html: false, align: ['left', 'center', 'right'] },
    attributes: {
      name: { type: 'string', default: 'heart' }, variant: { type: 'string', default: 'outline' }, size: { type: 'number', default: 32 },
      trigger: { type: 'string', default: 'hover' }, label: { type: 'string', default: '' }, sound: { type: 'boolean', default: false },
      soundName: { type: 'string', default: '' }, color: { type: 'string', default: '' }
    },
    edit: function (props) {
      var a = props.attributes, set = props.setAttributes;
      var preview = el('magic-glyph', { name: a.name, variant: a.variant, size: String(a.size), trigger: 'hover', style: a.color ? { color: a.color } : undefined, key: a.name + a.variant + a.size });
      return el('div', B.useBlockProps(),
        el(B.InspectorControls, null,
          el(C.PanelBody, { title: __('Icon', 'magic-glyphs') },
            el(C.ComboboxControl, { label: __('Icon', 'magic-glyphs'), value: a.name, options: opts(names), onChange: function (v) { if (v) set({ name: v }); } }),
            el(C.SelectControl, { label: __('Style', 'magic-glyphs'), value: a.variant, options: opts(['outline', 'solid', 'duotone', 'glass']), onChange: function (v) { set({ variant: v }); } }),
            el(C.RangeControl, { label: __('Size (px)', 'magic-glyphs'), value: a.size, min: 12, max: 256, onChange: function (v) { set({ size: v || 32 }); } }),
            el(C.SelectControl, { label: __('Plays on', 'magic-glyphs'), value: a.trigger, options: [
              { label: __('Hover or tap', 'magic-glyphs'), value: 'hover' }, { label: __('Click', 'magic-glyphs'), value: 'click' },
              { label: __('When scrolled into view', 'magic-glyphs'), value: 'visible' }, { label: __('Page load', 'magic-glyphs'), value: 'load' }], onChange: function (v) { set({ trigger: v }); } }),
            el(C.TextControl, { label: __('Label for screen readers', 'magic-glyphs'), help: __('Leave empty if the icon is decoration.', 'magic-glyphs'), value: a.label, onChange: function (v) { set({ label: v }); } })),
          el(C.PanelBody, { title: __('Colour', 'magic-glyphs'), initialOpen: false },
            el(C.ColorPalette, { value: a.color, onChange: function (v) { set({ color: v || '' }); } })),
          el(C.PanelBody, { title: __('Sound', 'magic-glyphs'), initialOpen: false },
            el(C.ToggleControl, { label: __('Play its sound', 'magic-glyphs'), help: __('Browsers play sound only after a visitor clicks or presses a key on the page.', 'magic-glyphs'), checked: a.sound, onChange: function (v) { set({ sound: v }); } }),
            a.sound && sounds.length ? el(C.SelectControl, { label: __('Sound', 'magic-glyphs'), value: a.soundName, options: [{ label: __("The icon's own", 'magic-glyphs'), value: '' }].concat(opts(sounds)),
              onChange: function (v) { set({ soundName: v }); if (v && MG) { MG.sound.enable(true); MG.sound.play(v); } } }) : null)),
        preview);
    },
    save: function () { return null; }
  });
})(window.wp);
