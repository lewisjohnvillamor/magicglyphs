// Static SVG files and sprites: no JavaScript, no animation. Used by `magic-glyphs static`.
//   svg/<style>/<name>.svg   one file per icon, colour follows CSS `color` (currentColor)
//   sprite-<style>.svg       every icon as a <symbol id="name">, for <svg><use href="sprite-outline.svg#heart"/></svg>
//   index.json               names, categories and tags
const fs=require('fs'),path=require('path');
function build(L,out,o){o=o||{};const styles=o.styles||['outline','solid','duotone'],names=o.names||L.data.icons.map(i=>i.n);let files=0,bytes=0;
  for(const st of styles){if(!L.STYLES.includes(st)||st==='glass')throw new Error('Static files support outline, solid and duotone.');
    const dir=path.join(out,'svg',st);fs.mkdirSync(dir,{recursive:true});let sprite='';
    for(const n of names){const svg=L.staticSvg(n,{style:st,background:o.background});fs.writeFileSync(path.join(dir,n+'.svg'),svg+'\n');files++;bytes+=svg.length;
      const m=svg.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/);const keep=(m[1].match(/ (?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin)="[^"]*"/g)||[]).join('');
      sprite+=`<symbol id="${n}" viewBox="0 0 24 24"${keep}>${m[2]}</symbol>`}
    fs.writeFileSync(path.join(out,'sprite-'+st+'.svg'),'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'+sprite+'</svg>\n')}
  fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(names.map(n=>{const i=L.byName.get(n);return{name:n,category:i.c,tags:i.t}})));
  return{files,bytes,styles,count:names.length}}
module.exports={build};
