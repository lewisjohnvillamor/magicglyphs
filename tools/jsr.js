// Builds the JSR package (jsr.io, for Deno, Bun and Node) inside the public package folder.
// JSR takes standard ES modules only, so the runtime is wrapped as one here; its source stays web/runtime.js.
//   jsr.json        name, version and what each import path points to
//   jsr/runtime.js  the runtime as an ES module (default export)
//   jsr/all.js      the runtime with the 120 free icons registered
//   jsr/free-icons.js, jsr/sounds.js   the free icon data and the extra sound pack, as data
const fs = require('fs'), path = require('path');
module.exports = function buildJsr(pub, version) {
  const dir = path.join(pub, 'jsr'); fs.mkdirSync(dir, { recursive: true });
  const rt = fs.readFileSync(path.join(pub, 'web', 'runtime.js'), 'utf8');
  const open = ',function(){', a = rt.indexOf(open), z = rt.lastIndexOf('});');
  if (a < 0 || z < a) throw new Error('jsr: the runtime no longer has the expected wrapper');
  const body = rt.slice(a + open.length, z);
  fs.writeFileSync(path.join(dir, 'runtime.js'),
    '// @ts-self-types="./runtime.d.ts"\n' +
    '/**\n * Magic Glyphs: animated icons with sound. This is the runtime: it draws, animates and plays icons, and defines the\n' +
    ' * `<magic-glyph>` element. Import `./all` for the runtime with the 120 free icons registered.\n *\n' +
    ' * @example\n * ```ts\n * import MagicGlyphs from "jsr:@magicglyphs/magic-glyphs/all";\n * const svg = MagicGlyphs.svg("heart", { style: "duotone", size: 32 });\n' +
    ' * // in a page: <magic-glyph name="bell" sound></magic-glyph>\n * ```\n *\n' +
    ' * More sounds: `import pack from "jsr:@magicglyphs/magic-glyphs/sounds"; MagicGlyphs.sound.add(pack);`\n' +
    ' * Docs: https://magicglyphs.com/docs/  Source: https://github.com/lewisjohnvillamor/magicglyphs (web/runtime.js)\n * @module\n */\n' +
    'const MagicGlyphs = (function(){' + body + '})();\n' +
    '// one runtime per page: script tags and modules share it\n' +
    'if (typeof globalThis !== \'undefined\' && !globalThis.MagicGlyphs) globalThis.MagicGlyphs = MagicGlyphs;\n' +
    'export default MagicGlyphs;\n');
  const dts = fs.readFileSync(path.join(pub, 'web', 'runtime.d.ts'), 'utf8').replace('export = MagicGlyphs;', 'export default MagicGlyphs;');
  if (!/export default MagicGlyphs;/.test(dts)) throw new Error('jsr: could not convert runtime.d.ts');
  fs.writeFileSync(path.join(dir, 'runtime.d.ts'), dts);

  const free = fs.readFileSync(path.join(pub, 'data', 'icons.json'), 'utf8');
  if (JSON.parse(free).icons.length > 200) throw new Error('jsr: refusing to publish more than the free icons');
  fs.writeFileSync(path.join(dir, 'free-icons.js'), '// @ts-self-types="./free-icons.d.ts"\n/** The 120 free Magic Glyphs icons as data, for MagicGlyphs.register(). */\nexport default ' + free.trim() + ';\n');
  fs.writeFileSync(path.join(dir, 'free-icons.d.ts'), '/** The 120 free icons, in the format MagicGlyphs.register() takes. */\ndeclare const icons: { name: string; count: number; icons: unknown[] };\nexport default icons;\n');

  fs.writeFileSync(path.join(dir, 'all.js'), '// @ts-self-types="./runtime.d.ts"\n/*! The Magic Glyphs runtime with the 120 free icons registered. */\nimport MagicGlyphs from \'./runtime.js\';\nimport icons from \'./free-icons.js\';\nMagicGlyphs.register(icons);\nexport default MagicGlyphs;\n');

  const sm = fs.readFileSync(path.join(pub, 'web', 'sounds-more.js'), 'utf8'), s0 = sm.indexOf('{"v":'), s1 = sm.lastIndexOf(');');
  const pack = sm.slice(s0, s1); JSON.parse(pack);
  fs.writeFileSync(path.join(dir, 'sounds.js'), '// @ts-self-types="./sounds.d.ts"\n/** The extra sound pack: MagicGlyphs.sound.add(pack). */\nexport default ' + pack + ';\n');
  fs.writeFileSync(path.join(dir, 'sounds.d.ts'), 'import type { GlyphSoundStep } from \'./runtime.d.ts\';\n/** About 400 designed sounds on top of the 100 built in. Add them with MagicGlyphs.sound.add(pack). */\ndeclare const pack: { v: number; groups: Record<string, string[]>; sounds: Record<string, GlyphSoundStep[]> };\nexport default pack;\n');

  fs.writeFileSync(path.join(pub, 'jsr.json'), JSON.stringify({
    name: '@magicglyphs/magic-glyphs', version,
    exports: { '.': './jsr/runtime.js', './all': './jsr/all.js', './free-icons': './jsr/free-icons.js', './sounds': './jsr/sounds.js' },
    publish: { include: ['jsr/', 'README.md', 'LICENSE.md'] },
  }, null, 2) + '\n');
};
