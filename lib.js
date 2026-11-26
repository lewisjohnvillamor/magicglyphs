// Shared by the CLI and the MCP server: load the set, search it, and produce each output format.
const fs=require('fs'),path=require('path');
const MG=require('./web/runtime.js');
// the extra sound pack, so the command line tool and MCP server know every sound (pages load it only when asked)
try{MG.sound.add(require('./web/sounds-more.js'))}catch(e){}
const Lic=require('./licence.js');
// The published package carries the free icons. After `magic-glyphs login`, the full set is downloaded to the
// user's home folder and used from there for as long as the stored licence key stays valid.
const packaged=JSON.parse(fs.readFileSync(path.join(__dirname,'data','icons.json'),'utf8'));
const fullFile=()=>path.join(Lic.home(),'icons.json');
function loadData(){if(fs.existsSync(fullFile())&&Lic.current().ok){try{const d=JSON.parse(fs.readFileSync(fullFile(),'utf8'));if(d&&Array.isArray(d.icons)&&d.icons.length>=packaged.icons.length)return d}catch(e){}}return packaged}
const data=loadData();MG.register(data);
// index.json lists every icon (name, category, tags) so search still finds icons this copy cannot export yet
const idxFile=path.join(__dirname,'data','index.json');
const index=(()=>{let ix=null;try{ix=JSON.parse(fs.readFileSync(idxFile,'utf8'))}catch(e){}const own=data.icons.map(i=>({n:i.n,c:i.c,t:i.t}));return ix&&ix.length>own.length?ix:own})();
const known=new Set(index.map(i=>i.n)),total=index.length;
const STYLES=['outline','solid','duotone','glass'],FORMATS=['svg','lottie','json','react','vue','html','react-native','swiftui','compose','flutter','winui','gif','apng','webm','mp4','wav','maui','avalonia','qml','godot','unity','compose-multiplatform','rust','spritesheet'];
const byName=new Map(data.icons.map(i=>[i.n,i]));
const categories=()=>{const c={};index.forEach(i=>c[i.c]=(c[i.c]||0)+1);return c};
function search(query,opt){
  opt=opt||{};const words=String(query||'').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const out=[];
  for(const ic of index){
    if(opt.category&&ic.c!==opt.category)continue;
    let score=words.length?0:1;const name=ic.n,tags=' '+ic.t+' ';
    for(const w of words){
      if(name===w)score+=100;else if(name.split('-').includes(w))score+=40;else if(name.includes(w))score+=20;
      if(tags.includes(' '+w+' '))score+=15;else if(tags.includes(w))score+=5;
      if(ic.c===w)score+=8;
    }
    if(score>0)out.push({name,category:ic.c,tags:ic.t,score});
  }
  out.sort((a,b)=>b.score-a.score||a.name.length-b.name.length||a.name.localeCompare(b.name));
  return out.slice(0,opt.limit||30);
}
const pascal=n=>n.split(/[^a-z0-9]+/i).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join('').replace(/^(\d)/,'Glyph$1');
// SVG with real colours instead of CSS variables, for files that live outside a web page
function staticSvg(name,o){
  o=o||{};const col=o.color||'currentColor',sec=o.secondary||col,bg=o.background||'#fff',op=o.secondaryOpacity===undefined?.18:o.secondaryOpacity;
  return MG.svg(name,{style:o.style||'outline',size:o.size||24,title:o.title})
    .replace(/var\(--mg-bg,#fff\)/g,bg)
    .replace(/style="fill:var\(--mg-secondary,currentColor\);fill-opacity:var\(--mg-secondary-opacity,.18\)"/g,`fill="${sec}" fill-opacity="${op}"`)
    .replace(/var\(--mg-secondary,currentColor\)/g,sec)
    .replace(/currentColor/g,col).replace(' overflow="visible"','');
}
function render(name,format,o){
  const ic=byName.get(name);if(!ic)throw new Error(known.has(name)?'"'+name+'" is in the paid set and is not on this computer yet. Run: magic-glyphs login YOUR-KEY':'No icon named "'+name+'". Try: magic-glyphs search '+name);
  o=o||{};const style=o.style||'outline';
  if(!STYLES.includes(style))throw new Error('Unknown style "'+style+'". Use one of: '+STYLES.join(', '));
  switch(format){
    case 'svg':return{ext:'svg',file:name+(style==='outline'?'':'.'+style)+'.svg',text:staticSvg(name,o)};
    case 'lottie':{if(style==='glass')throw new Error('Lottie export supports outline, solid and duotone (glass uses a gradient that Lottie players handle inconsistently).');
      const {toLottie}=require('./tools/lottie.js');return{ext:'json',file:name+(style==='outline'?'':'.'+style)+'.lottie.json',text:JSON.stringify(toLottie(ic,Object.assign({},o,{color:o.color||'#000000'})))}}
    case 'json':return{ext:'json',file:name+'.json',text:JSON.stringify(ic)};
    // native apps: one file each, with the Lottie animation inside (see tools/native.js)
    case 'react-native':case 'swiftui':case 'compose':case 'flutter':case 'winui':{if(style==='glass')throw new Error('Native formats support outline, solid and duotone.');
      const f=require('./tools/native.js')[format](ic,Object.assign({},o,{style}));return{ext:f.file.split('.').pop(),file:f.file,text:f.text}}
    // more native targets (tools/native2.js); unity and spritesheet also write a PNG sprite sheet
    case 'maui':case 'avalonia':case 'qml':case 'godot':case 'unity':case 'compose-multiplatform':case 'rust':{if(style==='glass')throw new Error('Native formats support outline, solid and duotone.');
      const f=require('./tools/native2.js')[format](ic,Object.assign({},o,{style,MG}));return{ext:f.file.split('.').pop(),file:f.file,text:f.text,extra:f.extra}}
    case 'spritesheet':{if(style==='glass')throw new Error('Sprite sheets support outline, solid and duotone.');
      const s=require('./tools/native2.js').spritesheet(ic,Object.assign({},o,{style,MG,size:o.size||128}));return{ext:'png',file:name+'.sheet.png',data:s.png,extra:[{file:name+'.sheet.json',data:JSON.stringify(s.meta,null,2)}]}}
    case 'react':{const P=pascal(name),ts=!!o.ts;
      // "use client" lets the component sit inside a Next.js server component tree; other bundlers ignore it
      return{ext:ts?'tsx':'jsx',file:P+'Glyph.'+(ts?'tsx':'jsx'),text:`'use client';\nimport { MagicGlyph, register${ts?', type MagicGlyphProps':''} } from 'magic-glyphs/react';\n\nregister([${JSON.stringify(ic)}]);\n\n/** Animated "${name}" icon. Props: variant, size, trigger, label, sound, className, style. */\nexport default function ${P}Glyph(props${ts?": Omit<MagicGlyphProps, 'name'>":''}) {\n  return <MagicGlyph name="${name}" variant="${style}" {...props} />;\n}\n`}}
    case 'vue':return{ext:'vue',file:pascal(name)+'Glyph.vue',text:`<script setup${o.ts?' lang="ts"':''}>\nimport { ref } from 'vue';\nimport { MagicGlyph, register } from 'magic-glyphs/vue';\n\nregister([${JSON.stringify(ic)}]);\n\n// play() from a template ref: <${pascal(name)}Glyph ref="icon" /> then icon.value.play()\nconst glyph = ref${o.ts?'<{ play(): void } | null>':''}(null);\ndefineExpose({ play: () => glyph.value?.play() });\n</script>\n\n<template>\n  <MagicGlyph ref="glyph" name="${name}" variant="${style}" v-bind="$attrs" />\n</template>\n`};
    case 'html':return{ext:'html',file:name+'.html',text:`<magic-glyph name="${name}"${style==='outline'?'':' variant="'+style+'"'}${o.size?' size="'+o.size+'"':''}></magic-glyph>`};
    default:throw new Error('Unknown format "'+format+'". Use one of: '+FORMATS.join(', '));
  }
}
// ---- your own icons: JSON from the icon maker (one icon, a list, or {icons:[...]}), from files or folders ----
// They need no licence. Everything is checked so a file can only ever contain drawing and motion data.
const custom=new Set();
const PATH_OK=/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]*$/,ID_OK=/^[A-Za-z0-9_-]{1,40}$/,NAME_OK=/^[a-z0-9][a-z0-9-]{0,59}$/;
function checkIcon(ic,src){const bad=m=>{throw new Error(src+': '+m)};
  if(!ic||typeof ic!=='object')bad('not an icon');if(typeof ic.n!=='string'||!NAME_OK.test(ic.n))bad('the name must be lowercase letters, numbers and dashes');
  if(!Array.isArray(ic.L)||!ic.L.length||ic.L.length>200)bad('"'+ic.n+'" has no drawing');
  for(const l of ic.L){if(!ID_OK.test(String(l.i))||!['c','o','i','d','f'].includes(l.k)||!Array.isArray(l.p))bad('"'+ic.n+'" has a malformed layer');
    for(const p of l.p){if(typeof p.d!=='string'||p.d.length>100000||!PATH_OK.test(p.d))bad('"'+ic.n+'" has path data that is not plain drawing commands');
      for(const k of Object.keys(p))if(!['d','r'].includes(k))bad('"'+ic.n+'" has an unknown path field "'+k+'"');
      if(p.r!==undefined&&!(Array.isArray(p.r)&&p.r.length===3&&p.r.every(Number.isFinite)))bad('"'+ic.n+'" has a malformed rotation')}}
  if(ic.A!==undefined&&!Array.isArray(ic.A))bad('"'+ic.n+'" has malformed motion');
  for(const a of ic.A||[]){if(typeof a.l!=='string'||!a.l.split(' ').every(x=>ID_OK.test(x))||!['tx','ty','r','s','sx','sy'].includes(a.p)||!Array.isArray(a.k)||!a.k.every(k=>Array.isArray(k)&&k.length===2&&k.every(Number.isFinite))||!Number.isFinite(a.st)||!Number.isFinite(a.d))bad('"'+ic.n+'" has malformed motion');
    if(a.o!==undefined&&!(Array.isArray(a.o)&&a.o.length===2&&a.o.every(Number.isFinite)))bad('"'+ic.n+'" has a malformed motion origin');if(a.from!==undefined&&!Number.isFinite(a.from))bad('"'+ic.n+'" has a malformed motion start')}
  const out={n:ic.n,c:typeof ic.c==='string'&&NAME_OK.test(ic.c)?ic.c:'custom',t:typeof ic.t==='string'?ic.t.replace(/[<>"&]/g,'').slice(0,200):'',L:ic.L,A:ic.A||[]};
  if(typeof ic.s==='string'&&/^[a-z0-9]{1,20}$/.test(ic.s))out.s=ic.s;
  if(ic.S&&typeof ic.S==='object'){const S={};for(const k of ['sound','volume','pitch','speed','tone','pan','delay']){const v=ic.S[k];if(typeof v==='number'&&isFinite(v))S[k]=v;else if(k==='sound'&&typeof v==='string'&&/^[a-z0-9]{1,20}$/.test(v))S[k]=v;else if(k==='delay'&&v==='auto')S[k]=v}
    // the icon's own sound: a designed synth or an audio file (checked the same way the runtime checks it)
    if(ic.S.custom!==undefined){const c=MG.sound.check(ic.S.custom);if(!c)bad('"'+ic.n+'" has a custom sound that is not valid');S.custom=c}if(Object.keys(S).length)out.S=S}
  return out}
function addCustom(where){const files=[];
  for(const w of [].concat(where).filter(Boolean)){const p=path.resolve(w);if(!fs.existsSync(p))throw new Error('No such file or folder: '+w);
    if(fs.statSync(p).isDirectory())fs.readdirSync(p).filter(f=>f.endsWith('.json')).sort().forEach(f=>files.push(path.join(p,f)));else files.push(p)}
  const added=[];
  for(const f of files){let d;try{d=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){throw new Error(path.basename(f)+': not valid JSON')}
    for(const raw of Array.isArray(d)?d:Array.isArray(d.icons)?d.icons:[d]){const ic=checkIcon(raw,path.basename(f));
      if(known.has(ic.n)&&!custom.has(ic.n))throw new Error(path.basename(f)+': "'+ic.n+'" is already a library icon name. Rename yours.');
      MG.register([ic]);byName.set(ic.n,ic);custom.add(ic.n);if(!known.has(ic.n)){index.push({n:ic.n,c:ic.c,t:ic.t});known.add(ic.n)}added.push(ic.n)}}
  module.exports.total=index.length;return added}
// your own icons never need a licence
const locked=names=>Lic.locked(names.filter(n=>!custom.has(n)));
// MAGIC_GLYPHS_CUSTOM: files or folders of your icons, separated like PATH, loaded for every command and the MCP server
if(process.env.MAGIC_GLYPHS_CUSTOM)try{addCustom(process.env.MAGIC_GLYPHS_CUSTOM.split(path.delimiter))}catch(e){process.stderr.write('magic-glyphs: MAGIC_GLYPHS_CUSTOM: '+e.message+'\n')}
module.exports={MG,data,byName,index,known,total:index.length,fullFile,categories,search,render,staticSvg,pascal,STYLES,FORMATS,addCustom,custom,locked,checkIcon};
