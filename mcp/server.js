#!/usr/bin/env node
// Magic Glyphs MCP server: lets a coding agent search the icon set and fetch an icon in the form the project needs.
// The MCP libraries are not installed with the icon package, to keep it small. Run this server through the
// companion package instead:  npx -y magic-glyphs-mcp
let McpServer,StdioServerTransport,z;
try{({McpServer}=require('@modelcontextprotocol/sdk/server/mcp.js'));({StdioServerTransport}=require('@modelcontextprotocol/sdk/server/stdio.js'));({z}=require('zod'))}
catch(e){process.stderr.write('magic-glyphs: the MCP server needs its companion package. Run: npx -y magic-glyphs-mcp\n');process.exit(1)}
const L=require('../lib.js');
const server=new McpServer({name:'magic-glyphs',version:require('../package.json').version});
const text=t=>({content:[{type:'text',text:t}]}),err=t=>({content:[{type:'text',text:t}],isError:true});
server.registerTool('search_icons',{title:'Search icons',
  description:'Search the Magic Glyphs animated icon set by keyword. Returns icon names with category and tags, best match first. Use this before get_icon to find the right name.',
  inputSchema:{query:z.string().describe('Words describing the icon, e.g. "shopping cart" or "delete"'),category:z.string().optional().describe('Limit to one category; see list_categories'),limit:z.number().int().min(1).max(100).optional().describe('Maximum results, default 20')},
  annotations:{readOnlyHint:true}},
  async({query,category,limit})=>{
    if(category&&!L.categories()[category])return err('No category "'+category+'". Categories: '+Object.keys(L.categories()).sort().join(', '));
    const r=L.search(query,{category,limit:limit||20});
    return text(r.length?r.map(x=>x.name+'  ['+x.category+(require('../licence.js').isFree(x.name)?', free':'')+']  '+x.tags).join('\n'):'No icons match "'+query+'". Try fewer or more general words.')});
server.registerTool('list_categories',{title:'List categories',description:'List the icon categories with how many icons each has.',inputSchema:{},annotations:{readOnlyHint:true}},
  async()=>{const c=L.categories();return text(Object.keys(c).sort().map(k=>k+': '+c[k]).join('\n')+'\ntotal: '+L.total)});
server.registerTool('get_icon',{title:'Get icon',
  description:'Get one icon ready to use. format: "html" (custom element tag, needs the magic-glyphs script on the page), "react" or "vue" (component file source, needs the magic-glyphs npm package), "svg" (static SVG markup, no animation), "lottie" (animated Lottie JSON for iOS, Android, Windows, macOS and Flutter), "json" (raw icon data). Returns the suggested file name and the content.',
  inputSchema:{name:z.string().describe('Exact icon name from search_icons'),format:z.enum(L.FORMATS.filter(f=>!['gif','apng','webm','mp4','wav','spritesheet','unity'].includes(f))).optional().describe('Default "html"'),style:z.enum(L.STYLES).optional().describe('Default "outline"'),
    color:z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional().describe('Hex colour for svg and lottie output'),secondary:z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional().describe('Hex duotone fill colour'),size:z.number().positive().max(2048).optional().describe('Pixel size for svg and html')},
  annotations:{readOnlyHint:true}},
  async({name,format,style,color,secondary,size})=>{
    if(!L.byName.has(name)&&L.known.has(name)){const Lic=require('../licence.js');return err(Lic.current().ok?'"'+name+'" is in the paid set. The licence is valid, but the full set is not on this computer yet. Run: npx magic-glyphs sync':Lic.lockedMessage([name])+'\nTell the user this icon needs a Magic Glyphs licence, or pick a free icon instead (search results marked "free").')}
    if(!L.byName.has(name)){const s=L.search(name,{limit:5}).map(x=>x.name);return err('No icon named "'+name+'".'+(s.length?' Did you mean: '+s.join(', ')+'?':' Use search_icons to find one.'))}
    {const Lic=require('../licence.js'),paid=L.locked([name]);if(paid.length)return err(Lic.lockedMessage(paid))}
    try{const f=L.render(name,format||'html',{style,color,secondary,size});return text('File: '+f.file+'\n\n'+f.text)}catch(e){return err(e.message)}});
server.registerTool('list_sounds',{title:'List sounds',
  description:'List the built-in icon sounds by family, and how to change an icon\'s sound or give it your own audio file or designed sound. Use it when the user wants a different or custom sound.',
  inputSchema:{family:z.string().optional().describe('Only one family, e.g. "alerts" or "game"')},annotations:{readOnlyHint:true}},
  async({family})=>{const g=L.MG.sound.groups();delete g.yours;if(family&&!g[family])return err('No sound family "'+family+'". Families: '+Object.keys(g).join(', '));
    const fams=family?{[family]:g[family]}:g;
    return text(Object.keys(fams).map(k=>k+': '+fams[k].join(', ')).join('\n')+'\n\nUse one on an element: <magic-glyph name="bell" sound sound-name="ping"></magic-glyph>; in React or Vue: soundOptions={{ sound: \'ping\' }}.'+
      '\nYour own audio file: sound-src="/sounds/x.mp3" (React and Vue: soundOptions={{ src: \'/sounds/x.mp3\' }}), or MagicGlyphs.sound.define(\'name\', { src: \'/sounds/x.mp3\' }).'+
      '\nA designed sound: MagicGlyphs.sound.define(\'name\', { synth: [[\'t\', hz, startSec, lengthSec, level, wave, endHz?], [\'n\', fromHz, toHz, startSec, lengthSec, level, focus?]] }). MagicGlyphs.sound.steps(\'chime\') returns the steps of a built-in sound to start from.'+
      '\nSettings: volume 0-2, pitch -12..12 semitones, speed 0.5-2, tone -1..1, pan 0-1, delay ms or "auto". Details: https://magicglyphs.com/docs/sound/')});
server.registerTool('usage_guide',{title:'Usage guide',description:'How to install and use Magic Glyphs in a given kind of project.',
  inputSchema:{platform:z.enum(['html','react','vue','angular','wordpress','shopify','rust','ios','android','windows','flutter']).describe('The project type')},annotations:{readOnlyHint:true}},
  async({platform})=>text(require('./guides.js')[platform]));
server.connect(new StdioServerTransport()).catch(e=>{process.stderr.write('magic-glyphs-mcp: '+e.message+'\n');process.exit(1)});
