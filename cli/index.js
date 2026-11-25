#!/usr/bin/env node
// magic-glyphs — find icons and add them to a project as SVG, Lottie, React, Vue or raw data.
const fs=require('fs'),path=require('path');const L=require('../lib.js'),Lic=require('../licence.js');
const HELP=`magic-glyphs — animated icons for any project

Usage
  magic-glyphs search <words...> [--category <c>] [--limit <n>] [--json]
  magic-glyphs list [--category <c>] [--free] [--json]
  magic-glyphs categories
  magic-glyphs info <name>
  magic-glyphs add <name...> [options]        write icons into your project
  magic-glyphs add --category <c> [options]
  magic-glyphs add --all [options]
  magic-glyphs bundle [name...] [--out <file>]                         one script for web pages: the runtime plus the icons you name (all if none)
  magic-glyphs static [--out <dir>] [--styles outline,solid,duotone]   plain SVG files and sprites, no JavaScript
  magic-glyphs registry [--out <dir>] [--homepage <url>]              shadcn registry files to host
  magic-glyphs login YOUR-KEY | sync | logout | licence                  paid icons need a licence key; sync re-downloads the full set
  magic-glyphs update                                                  check for a newer version and download new paid icons
  magic-glyphs --version
  magic-glyphs shadcn [--env]                                          connect a shadcn project: npx shadcn add @magic-glyphs/<icon>
  magic-glyphs build-key                                               a key for CI and build servers (does not use a device slot)
  magic-glyphs buy                                                     show the link where you can buy a licence

Options for add
  --format <f>      svg (default) | lottie | react | vue | json | html | wav (the icon's sound)
                    react-native | swiftui | compose | flutter | winui (one ready-to-use component file)
  --sound           with --format lottie, also write each icon's sound as a .wav file
  --style <s>       outline (default) | solid | duotone | glass
  --out <dir>       where to write (default ./magic-glyphs)
  --color <hex>     main colour      (svg default: currentColor, lottie default: #000000)
  --secondary <hex> duotone fill colour
  --background <hex> colour knocked out of solid icons (default #ffffff)
  --size <px>       svg width and height (default 24)
  --ts | --js       typed or plain React/Vue components (default: typed when the project has a tsconfig.json)
  --from <path>     your own icons: JSON from the icon maker (a file or a folder), no licence needed
  --stdout          print a single icon instead of writing a file
  --dry-run         show what would be written

Examples
  magic-glyphs search shopping cart
  magic-glyphs add heart bell --format react --out src/icons
  magic-glyphs add my-logo --from my-icons/ --format lottie
  magic-glyphs add --category arrows --format lottie --color "#2747f5" --out assets/lottie

Docs: https://magicglyphs.com/docs/    Support: support@magicglyphs.com
`;
function parse(argv){const pos=[],opt={};for(let i=0;i<argv.length;i++){const a=argv[i];
    if(a.startsWith('--')){const k=a.slice(2);if(['json','all','stdout','dry-run','help','free','show-key','version','ts','js','sound','env'].includes(k))opt[k]=true;else{if(i+1>=argv.length)fail('Option --'+k+' needs a value.');opt[k]=argv[++i]}}
    else if(a==='-h')opt.help=true;else if(a==='-v')opt.version=true;else pos.push(a)}return{pos,opt}}
// fetch the full set for a valid key; the server address comes from MAGIC_GLYPHS_API or package.json "magicGlyphs.api"
const apiBase=()=>(process.env.MAGIC_GLYPHS_API||(require('../package.json').magicGlyphs||{}).api||'').replace(/\/$/,'');
// swap the licence key from a Gumroad receipt for a Magic Glyphs key; the server checks the purchase with Gumroad
async function redeem(gumroadKey){
  if(!/^[A-Za-z0-9]{8}(-[A-Za-z0-9]{8}){3}$/.test(gumroadKey))throw new Error('That does not look like a licence key. Copy it from your Gumroad receipt (four groups of eight characters).');
  const api=apiBase();if(!/^https?:\/\//.test(api))throw new Error('no licence server is configured');
  let r;try{r=await fetch(api+'/v1/redeem',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({licence_key:gumroadKey})})}catch(e){throw new Error('The licence server could not be reached. Check your connection and try again.')}
  let d={};try{d=await r.json()}catch(e){}if(!r.ok||!d.key)throw new Error(d.error||'The licence server answered '+r.status+'.');return d.key}
async function download(force){
  const api=(process.env.MAGIC_GLYPHS_API||(require('../package.json').magicGlyphs||{}).api||'').replace(/\/$/,'');
  if(!force&&L.data.icons.length>=L.known.size-L.custom.size&&!process.env.MAGIC_GLYPHS_API)return 0;
  if(!/^https?:\/\//.test(api))throw new Error('no download server is configured');
  const key=process.env.MAGIC_GLYPHS_KEY||JSON.parse(fs.readFileSync(Lic.storeFile(),'utf8')).key;
  const r=await fetch(api+'/v1/icons.json',{headers:{authorization:'Bearer '+key,'x-mg-device':Lic.deviceId()}});
  if(!r.ok){let m='server answered '+r.status;try{m=(await r.json()).error||m}catch(e){}throw new Error(m)}
  const text=await r.text(),d=JSON.parse(text);if(!d||!Array.isArray(d.icons))throw new Error('the server sent something unexpected');
  fs.mkdirSync(Lic.home(),{recursive:true});fs.writeFileSync(L.fullFile(),text);return d.icons.length}
function fail(msg){process.stderr.write('magic-glyphs: '+msg+'\n');process.exit(1)}
// where to buy a licence; MAGIC_GLYPHS_BUY or package.json "magicGlyphs.buy"
const buyUrl=()=>process.env.MAGIC_GLYPHS_BUY||(require('../package.json').magicGlyphs||{}).buy||'';
const BUYLINE=()=>buyUrl()?'Buy a licence: '+buyUrl()+'  (or run: npx magic-glyphs buy)':'';
// the buy link is printed, never opened: the CLI does not start other programs
function openBuy(){return false}
function failBuy(msg){process.stderr.write('magic-glyphs: '+msg+'\n');const b=BUYLINE();if(b)process.stderr.write(b+'\n');process.exit(1)}
const {pos,opt}=parse(process.argv.slice(2)),cmd=pos.shift();
// --from: your own icons (JSON exported from the icon maker), a file or a folder; several separated by commas
if(opt.from)try{const got=L.addCustom(String(opt.from).split(','));if(!got.length)fail('No icons found in '+opt.from+'.')}catch(e){fail(e.message)}
try{
  if(opt.version||cmd==='version'){console.log(require('../package.json').version);process.exit(0)}
  if(!cmd||opt.help||cmd==='help'){process.stdout.write(HELP);process.exit(cmd||opt.help?0:1)}
  if(opt.category&&!L.categories()[opt.category])fail('No category "'+opt.category+'". Run: magic-glyphs categories');
  if(cmd==='categories'){const c=L.categories();Object.keys(c).sort().forEach(k=>console.log(k.padEnd(12)+String(c[k]).padStart(5)));console.log('total'.padEnd(12)+String(L.total).padStart(5))}
  else if(cmd==='list'||cmd==='search'){
    const rows=cmd==='list'?L.index.filter(i=>(!opt.category||i.c===opt.category)&&(!opt.free||Lic.isFree(i.n))).map(i=>({name:i.n,category:i.c,tags:i.t,free:Lic.isFree(i.n)})):L.search(pos.join(' '),{category:opt.category,limit:+opt.limit||30});
    if(cmd==='search'&&!pos.length)fail('Give at least one word to search for.');
    if(opt.json)console.log(JSON.stringify(rows));
    else if(!rows.length)console.log('No icons match. Try fewer or different words.');
    else rows.forEach(r=>console.log(r.name.padEnd(28)+r.category.padEnd(11)+r.tags));
  }
  else if(cmd==='info'){
    if(!pos[0])fail('Give an icon name.');const ic=L.byName.get(pos[0]);if(!ic)fail(L.known.has(pos[0])?'"'+pos[0]+'" is in the paid set. Run: magic-glyphs login YOUR-KEY'+(buyUrl()?'\n'+BUYLINE():''):'No icon named "'+pos[0]+'". Try: magic-glyphs search '+pos[0]);
    console.log(['name      '+ic.n,'category  '+ic.c,'tags      '+ic.t,'layers    '+ic.L.map(l=>l.i).join(', '),'animated  '+(ic.A.length?'yes ('+ic.A.length+' spring'+(ic.A.length>1?'s':'')+')':'no'),'html      <magic-glyph name="'+ic.n+'"></magic-glyph>'].join('\n'));
  }
  else if(cmd==='add'){
    let names=pos;if(opt.all)names=L.index.map(i=>i.n);else if(opt.category)names=L.index.filter(i=>i.c===opt.category).map(i=>i.n);
    if(!names.length)fail('Name the icons to add, or use --category or --all.');
    const missing=names.filter(n=>!L.known.has(n));if(missing.length)fail('Unknown icon'+(missing.length>1?'s':'')+': '+missing.join(', ')+'. Try: magic-glyphs search '+missing[0]);
    const paid=L.locked(names);if(paid.length)fail(Lic.lockedMessage(paid));
    const away=names.filter(n=>!L.byName.has(n));if(away.length)fail('Your licence is valid, but the full icon set is not on this computer yet. Run: magic-glyphs sync');
    const format=opt.format||'svg',o={style:opt.style,color:opt.color,secondary:opt.secondary,background:opt.background,size:opt.size&&+opt.size};
    // React and Vue components come out typed in TypeScript projects (.tsx, lang="ts") (a tsconfig.json in this folder or above), .jsx otherwise; --ts or --js overrides
    if(format==='react'||format==='vue')o.ts=opt.ts?true:opt.js?false:(()=>{let d=process.cwd();for(;;){if(fs.existsSync(path.join(d,'tsconfig.json')))return true;const up=path.dirname(d);if(up===d)return false;d=up}})();
    if(opt.size&&!(+opt.size>0))fail('--size must be a positive number.');
    for(const k of ['color','secondary','background'])if(opt[k]&&!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(opt[k])&&!(format==='svg'&&/^[a-z]+$/i.test(opt[k])))fail('--'+k+' must be a hex colour such as #2747f5.');
    // wav: the icon's sound as an audio file, for native apps (Lottie and static exports are silent); --sound adds one next to each Lottie file
    if(format==='wav'||(['lottie','react-native','swiftui','compose','flutter','winui'].includes(format)&&opt.sound)){if(opt.stdout)fail('Audio cannot be printed; use --out.');const A=require('../tools/audio.js'),dir=path.resolve(opt.out||'magic-glyphs');
      (async()=>{const files=[];for(const n of names){if(format!=='wav')files.push(L.render(n,format,o));const ic=L.byName.get(n);if(!ic.s){if(format==='wav')console.log(n+' has no sound; skipped.');continue}
          files.push({file:n+'.wav',data:await A.wav(L.MG,n)})}
        if(!opt['dry-run']){fs.mkdirSync(dir,{recursive:true});files.forEach(f=>fs.writeFileSync(path.join(dir,f.file),f.data||f.text))}
        console.log((opt['dry-run']?'Would write ':'Wrote ')+files.length+' file'+(files.length===1?'':'s')+' to '+dir+(files.length<=6?': '+files.map(f=>f.file).join(', '):''))})().catch(e=>fail(e.message));return}
    if(opt.stdout){if(names.length!==1)fail('--stdout prints one icon; name exactly one.');process.stdout.write(L.render(names[0],format,o).text+'\n')}
    else{const dir=path.resolve(opt.out||'magic-glyphs');const files=names.map(n=>L.render(n,format,o));
      if(!opt['dry-run']){fs.mkdirSync(dir,{recursive:true});files.forEach(f=>fs.writeFileSync(path.join(dir,f.file),f.text))}
      console.log((opt['dry-run']?'Would write ':'Wrote ')+files.length+' file'+(files.length>1?'s':'')+' to '+dir+(files.length<=6?': '+files.map(f=>f.file).join(', '):''));
      if(format==='react'||format==='vue')console.log('These components import from the "magic-glyphs" package, so keep it installed.');}
  }
  else if(cmd==='update'){const mine=require('../package.json').version;
    const newer=(a,b)=>{const x=a.split(/[.-]/).map(Number),y=b.split(/[.-]/).map(Number);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0)}return false};
    (async()=>{let latest=null;try{const r=await fetch('https://registry.npmjs.org/magic-glyphs/latest');if(r.ok)latest=(await r.json()).version}catch(e){}
      if(!latest)console.log('Could not reach npm to check for a newer version. This is '+mine+'.');
      else if(newer(latest,mine))console.log('Version '+latest+' is out (this is '+mine+'). Install it with:\n  npm install magic-glyphs@latest\nThen run: npx magic-glyphs update');
      else console.log('You have the latest version ('+mine+').');
      if(!Lic.current().ok){console.log(Lic.FREE.size+' free icons included. '+(BUYLINE()||''));return}
      const n=await download(true).catch(e=>{fail(e.message)});console.log(n?'Icons up to date: '+n+' icons.':'Icons up to date.')})();return}
  // connect a shadcn project to the official registry: npx shadcn add @magic-glyphs/heart
  else if(cmd==='shadcn'){const f=path.resolve(opt.out||'components.json');if(!fs.existsSync(f))fail('No components.json here. Run this in a shadcn project (npx shadcn@latest init), or pass --out path/to/components.json.');
    let cfg;try{cfg=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){fail('components.json is not valid JSON.')}
    // shadcn refuses every item from a registry whose key variable is missing, so the key header is only added for licensed users
    const lic=Lic.current(),url=apiBase()+'/r/{name}.json';
    cfg.registries=Object.assign({},cfg.registries,{'@magic-glyphs':lic.ok?{url,headers:{Authorization:'Bearer ${MAGIC_GLYPHS_KEY}'}}:url});
    fs.writeFileSync(f,JSON.stringify(cfg,null,2)+'\n');
    console.log('Added the @magic-glyphs registry to '+path.relative(process.cwd(),f)+'.\n\nAdd icons with:\n  npx shadcn@latest add @magic-glyphs/heart @magic-glyphs/bell\n');
    if(!lic.ok){console.log('The 120 free icons work now. For the rest, log in (npx magic-glyphs login YOUR-KEY), then run this command again.'+(buyUrl()?'\n'+BUYLINE():''));return}
    const dir=path.dirname(f),envFile=path.join(dir,'.env.local'),key=process.env.MAGIC_GLYPHS_KEY||JSON.parse(fs.readFileSync(Lic.storeFile(),'utf8')).key;
    if(opt.env){let t=fs.existsSync(envFile)?fs.readFileSync(envFile,'utf8'):'';t=t.replace(/^MAGIC_GLYPHS_KEY=.*\n?/m,'');fs.writeFileSync(envFile,(t&&!t.endsWith('\n')?t+'\n':t)+'MAGIC_GLYPHS_KEY='+key+'\n',{mode:0o600});
      const gi=path.join(dir,'.gitignore'),g=fs.existsSync(gi)?fs.readFileSync(gi,'utf8'):'';
      if(!/^\.env(\.local|\*|.*\*)?\s*$/m.test(g)&&!/^\*\.local\s*$/m.test(g)){fs.writeFileSync(gi,(g&&!g.endsWith('\n')?g+'\n':g)+'.env.local\n');console.log('Added .env.local to .gitignore.')}
      console.log('Saved your licence key to .env.local for shadcn. Keep that file out of version control.')}
    else console.log('Paid icons need your licence key where shadcn can read it. Either run this again with --env to save it to .env.local,\nor add this line to .env.local yourself (keep it out of version control):\n  MAGIC_GLYPHS_KEY=<the key from: npx magic-glyphs licence --show-key>')}
  else if(cmd==='buy'){const u=buyUrl();if(!u)fail('No buy page is configured.');console.log('Buy a licence: '+u)}
  else if(cmd==='login'||cmd==='sync'){
    if(cmd==='login'){if(!pos[0]||/^<.*>$/.test(pos[0])||/gumroad-key|your-.*key|^x{8}(-x{8}){3}$/i.test(pos[0])){const o=openBuy();
        failBuy('Give the licence key from your Gumroad receipt, like: magic-glyphs login ABCD1234-EFGH5678-IJKL9012-MNOP3456'+(o?'\nOpening the buy page in your browser.':''))}
      if(!/^MG1\./.test(pos[0].trim())){redeem(pos[0].trim()).then(k=>{const p=Lic.login(k);console.log('Licence saved for '+p.email+' ('+p.plan+', '+p.seats+' seat'+(p.seats>1?'s':'')+').');return download()}).then(n=>console.log(n?'Downloaded the full set: '+n+' icons.':'This copy already has every icon.')).catch(e=>failBuy(e.message));return}
      const p=Lic.login(pos[0]);console.log('Licence saved for '+p.email+' ('+p.plan+', '+p.seats+' seat'+(p.seats>1?'s':'')+').')}
    else if(!Lic.current().ok)fail(Lic.current().reason);
    download().then(n=>console.log(n?'Downloaded the full set: '+n+' icons.':'This copy already has every icon.')).catch(e=>fail('The key is saved, but the full set could not be downloaded ('+e.message+'). Try again with: magic-glyphs sync'));}
  else if(cmd==='logout'){let key=null;try{key=JSON.parse(fs.readFileSync(Lic.storeFile(),'utf8')).key}catch(e){}
    // free this computer's device slot on the server too; logging out still works offline
    const done=()=>console.log(Lic.logout()?'Licence key removed from this computer.':'No licence key was stored.');
    const api=apiBase();if(!key||!/^https?:\/\//.test(api)){done();return}
    fetch(api+'/v1/deactivate',{method:'POST',headers:{authorization:'Bearer '+key,'x-mg-device':Lic.deviceId()}}).then(r=>r.json()).then(d=>{done();if(d&&d.cap)console.log('This computer no longer counts towards the licence ('+d.devices+' of '+d.cap+' devices in use).')},()=>{done();console.log('Could not reach the licence server, so this computer still counts as a device until it has been unused for 30 days.')});return}
  else if(cmd==='build-key'){const r=Lic.current();if(!r.ok)failBuy(r.reason);if(r.payload.build)fail('This is already a build key.');
    const api=apiBase();if(!/^https?:\/\//.test(api))fail('No licence server is configured.');
    fetch(api+'/v1/build-key',{method:'POST',headers:{authorization:'Bearer '+(process.env.MAGIC_GLYPHS_KEY||JSON.parse(fs.readFileSync(Lic.storeFile(),'utf8')).key)}}).then(async res=>{const d=await res.json().catch(()=>({}));if(!res.ok||!d.key)fail(d.error||'The licence server answered '+res.status+'.');
      console.log(d.key+'\n\nThis is a build key for CI and build servers. It does not use a device slot.\nStore it as a secret named MAGIC_GLYPHS_KEY, then run: npx magic-glyphs sync');},e=>fail('The licence server could not be reached.'));return}
  else if(cmd==='licence'||cmd==='license'){const r=Lic.current();if(opt['show-key']){if(!r.ok)fail(r.reason);console.log(process.env.MAGIC_GLYPHS_KEY||JSON.parse(fs.readFileSync(Lic.storeFile(),'utf8')).key);process.exit(0)}console.log(r.ok?'Licensed to '+r.payload.email+' ('+r.payload.plan+', '+r.payload.seats+' seat'+(r.payload.seats>1?'s':'')+(r.payload.expires?', until '+r.payload.expires:'')+'). All '+L.total+' icons available.':r.reason+'\n'+Lic.FREE.size+' free icons available: magic-glyphs list --free')}
  else if(cmd==='bundle'){
    // with --from and no names, only your own icons; otherwise everything this copy may use
    const names=pos.length?pos:opt.from?[...L.custom]:L.index.map(i=>i.n).filter(n=>L.byName.has(n)&&(Lic.current().ok||Lic.isFree(n)||L.custom.has(n)));
    const missing=names.filter(n=>!L.known.has(n));if(missing.length)fail('Unknown icon'+(missing.length>1?'s':'')+': '+missing.join(', '));
    const paid=L.locked(names);if(paid.length)fail(Lic.lockedMessage(paid));
    if(names.some(n=>!L.byName.has(n)))fail('Your licence is valid, but the full icon set is not on this computer yet. Run: magic-glyphs sync');
    const file=path.resolve(opt.out||'magic-glyphs.bundle.js'),d=Object.assign({},L.data,{icons:names.map(n=>L.byName.get(n)),count:names.length});
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,fs.readFileSync(path.join(__dirname,'..','web','runtime.js'),'utf8')+'\nMagicGlyphs.register('+JSON.stringify(d)+');\n');
    console.log('Wrote '+names.length+' icon'+(names.length>1?'s':'')+' to '+file+' ('+(fs.statSync(file).size/1024).toFixed(0)+' KB). Load it with a <script> tag, then use <magic-glyph name="...">.');
    if(!pos.length&&!opt.from&&names.length<L.total)console.log('Free set only ('+names.length+' of '+L.total+'). Run magic-glyphs login YOUR-KEY for the rest.')}
  else if(cmd==='static'||cmd==='registry'){
    const all=L.index.map(i=>i.n),names=opt.from?[...L.custom]:all.filter(n=>L.byName.has(n)&&(Lic.current().ok||Lic.isFree(n)||L.custom.has(n))),dir=path.resolve(opt.out||(cmd==='static'?'magic-glyphs-static':'magic-glyphs-registry'));
    if(cmd==='static'){const r=require('../tools/static.js').build(L,dir,{names,styles:opt.styles&&opt.styles.split(','),background:opt.background});console.log('Wrote '+r.files+' SVG files and '+r.styles.length+' sprite'+(r.styles.length>1?'s':'')+' for '+r.count+' icon'+(r.count===1?'':'s')+' to '+dir)}
    else{const r=require('../tools/registry.js').build(L,dir,{names,homepage:opt.homepage});console.log('Wrote registry.json and '+r.count+' item'+(r.count===1?'':'s')+' to '+dir)}
    if(!opt.from&&names.length<all.length)console.log('Free set only ('+names.length+' of '+all.length+'). Run magic-glyphs login YOUR-KEY for the rest.')}
  else fail('Unknown command "'+cmd+'". Run: magic-glyphs --help');
}catch(e){fail(e.message)}
