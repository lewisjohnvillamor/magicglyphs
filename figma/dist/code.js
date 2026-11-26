// Magic Glyphs for Figma: the plugin's main thread. The panel (ui.html) draws icons and GIFs; this file puts them
// on the canvas and keeps the licence key in Figma's client storage.
figma.showUI(__html__, { width: 360, height: 560, themeColors: true });

async function boot() {
  let device = await figma.clientStorage.getAsync('mg-device');
  if (!device) { device = 'fig-' + Math.random().toString(36).slice(2) + Date.now().toString(36); await figma.clientStorage.setAsync('mg-device', device); }
  figma.ui.postMessage({ type: 'boot', key: (await figma.clientStorage.getAsync('mg-key')) || '', device });
}
boot();

function place(node) {
  const c = figma.viewport.center;
  node.x = Math.round(c.x - node.width / 2); node.y = Math.round(c.y - node.height / 2);
  const sel = figma.currentPage.selection[0];
  // drop into the selected frame when there is one
  if (sel && 'appendChild' in sel && sel.type !== 'INSTANCE') { sel.appendChild(node); node.x = 0; node.y = 0; } else figma.currentPage.appendChild(node);
  figma.currentPage.selection = [node];
}

figma.ui.onmessage = async (m) => {
  if (m.type === 'svg') {
    const node = figma.createNodeFromSvg(m.svg);
    node.name = 'magic-glyphs/' + m.name;
    place(node);
    figma.notify('Added ' + m.name);
  } else if (m.type === 'gif') {
    const img = figma.createImage(new Uint8Array(m.bytes));
    const r = figma.createRectangle();
    r.name = 'magic-glyphs/' + m.name + ' (animated)';
    r.resize(m.size, m.size);
    r.fills = [{ type: 'IMAGE', imageHash: img.hash, scaleMode: 'FIT' }];
    place(r);
    figma.notify('Added animated ' + m.name + ' (plays in prototypes and presentations)');
  } else if (m.type === 'save-key') {
    await figma.clientStorage.setAsync('mg-key', m.key || '');
  } else if (m.type === 'notify') {
    figma.notify(m.text, { error: !!m.error });
  }
};
