// shadcn-compatible registry: registry.json plus one item file per icon under r/.
// Host the output folder, then:  npx shadcn@latest add https://your-host/r/heart.json
const fs=require('fs'),path=require('path');
function item(L,name){const ic=L.byName.get(name),f=L.render(name,'react',{});
  const tsx=f.text.replace("export default function "+L.pascal(name)+"Glyph(props) {","export default function "+L.pascal(name)+"Glyph(props: MagicGlyphProps) {").replace("import { MagicGlyph, register } from 'magic-glyphs/react';","import { MagicGlyph, register, type MagicGlyphProps } from 'magic-glyphs/react';");
  return{$schema:'https://ui.shadcn.com/schema/registry-item.json',name,type:'registry:component',title:L.pascal(name)+' glyph',description:'Animated "'+name+'" icon ('+ic.c+'). '+ic.t,
    dependencies:['magic-glyphs'],files:[{path:'registry/magic-glyphs/'+name+'.tsx',type:'registry:component',content:tsx,target:'components/magic-glyphs/'+name+'.tsx'}]}}
function build(L,out,o){o=o||{};const names=o.names||L.data.icons.map(i=>i.n);fs.mkdirSync(path.join(out,'r'),{recursive:true});
  const items=names.map(n=>{const it=item(L,n);fs.writeFileSync(path.join(out,'r',n+'.json'),JSON.stringify(it));const c=Object.assign({},it);delete c.$schema;c.files=c.files.map(f=>({path:f.path,type:f.type,target:f.target}));return c});
  fs.writeFileSync(path.join(out,'registry.json'),JSON.stringify({$schema:'https://ui.shadcn.com/schema/registry.json',name:'magic-glyphs',homepage:o.homepage||'https://example.com',items}));
  return{count:names.length}}
module.exports={build,item};
