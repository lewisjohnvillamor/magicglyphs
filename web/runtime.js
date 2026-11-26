/*! Magic Glyphs runtime — renders and animates icons from the canonical icon data. No dependencies. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MagicGlyphs=root.MagicGlyphs&&root.MagicGlyphs.register?root.MagicGlyphs:factory()})(typeof self!=='undefined'?self:this,function(){
  'use strict';
  var REG={},uid=0;
  var STROKE='stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
  function register(data){(data.icons||(Array.isArray(data)?data:[data])).forEach(function(ic){REG[ic.n]=ic;var cu=ic.S&&ic.S.custom;if(cu&&typeof cu.src==='string'&&typeof window!=='undefined')setTimeout(function(){var d=cleanDef(cu);if(d&&d.src)load(d.src).catch(function(){})},0)}); // a set, a list, or one icon
    // elements already on the page were upgraded before their data arrived: draw them now
    if(typeof document!=='undefined')Array.prototype.forEach.call(document.querySelectorAll('magic-glyph'),function(e){if(e._render)e._render()});
    return api}
  function paint(style,kind,gid){
    var S='fill="none" stroke="currentColor"',BG='var(--mg-bg,#fff)';
    if(kind==='f')return 'fill="currentColor" stroke="none"';
    if(kind==='d')return style==='solid'?'fill="'+BG+'" stroke="none"':'fill="currentColor" stroke="none"';
    if(kind==='o')return S;
    if(kind==='i')return style==='solid'?'fill="none" stroke="'+BG+'"':S;
    if(style==='solid')return 'fill="currentColor" stroke="currentColor"';
    if(style==='duotone')return 'style="fill:var(--mg-secondary,currentColor);fill-opacity:var(--mg-secondary-opacity,.18)" stroke="currentColor"';
    if(style==='glass')return 'fill="url(#'+gid+')" stroke="currentColor" stroke-opacity=".6"';
    return S;
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  // svg(name, {style, size, title}) -> SVG markup string (works on a server too)
  function svg(name,opt){
    var ic=REG[name];if(!ic)return '';
    opt=opt||{};var style=opt.style||'outline',size=opt.size||24,gid='mg'+(++uid);
    var defs=style==='glass'?'<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--mg-secondary,currentColor)" stop-opacity=".8"/><stop offset="1" stop-color="var(--mg-secondary,currentColor)" stop-opacity=".12"/></linearGradient></defs>':'';
    var body=ic.L.map(function(l){return '<g data-l="'+l.i+'" '+paint(style,l.k,gid)+'>'+l.p.map(function(s){return '<path d="'+s.d+'"'+(s.f?' fill="'+s.f+'"':'')+(s.r?' transform="rotate('+s.r.join(' ')+')"':'')+'/>'}).join('')+'</g>'}).join('');
    var a11y=opt.title?'role="img" aria-label="'+esc(opt.title)+'"':'aria-hidden="true"';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" '+STROKE+' '+a11y+' overflow="visible">'+defs+body+'</svg>';
  }
  // The spring engine. state(ic) returns {start(), step(dtSeconds) -> {id:{tx,ty,r,s,sx,sy}} | null when settled}
  function state(ic){
    var springs=[],el=0;
    return{start:function(){
        var old={};springs.forEach(function(s){old[s.id+s.p]=s});springs=[];el=0;
        ic.A.forEach(function(a){a.l.split(' ').forEach(function(id){var prev=old[id+a.p];
          springs.push({id:id,p:a.p,k:a.k,i:0,st:a.st,d:a.d,target:0,x:a.from!==undefined?a.from:(prev&&a.k[a.k.length-1][1]===0?prev.x:0),v:prev&&a.from===undefined?prev.v:0})})});
      },
      step:function(dt){
        dt=Math.min(.05,dt);el+=dt*1000;var busy=false,acc={};
        springs.forEach(function(s){
          while(s.i<s.k.length&&s.k[s.i][0]<=el){s.target=s.k[s.i][1];s.i++}
          for(var left=dt;left>1e-9;left-=1/240){var h=Math.min(left,1/240);s.v+=(-s.st*(s.x-s.target)-s.d*s.v)*h;s.x+=s.v*h}
          if(s.i<s.k.length||Math.abs(s.x-s.target)>.01||Math.abs(s.v)>.05)busy=true;
          (acc[s.id]=acc[s.id]||{tx:0,ty:0,r:0,s:0,sx:0,sy:0})[s.p]+=s.x;
        });
        if(!busy){springs=[];return null}
        return acc;
      }};
  }
  function origins(ic){var o={};ic.A.forEach(function(a){a.l.split(' ').forEach(function(id){var k=id+(a.p==='r'?'|r':'|s');if(a.o&&!o[k])o[k]=a.o})});return o}
  function transform(v,o,q){return 'translate('+v.tx.toFixed(3)+' '+v.ty.toFixed(3)+') rotate('+v.r.toFixed(2)+' '+o[0]+' '+o[1]+') translate('+q[0]+' '+q[1]+') scale('+(1+v.s+v.sx).toFixed(4)+' '+(1+v.s+v.sy).toFixed(4)+') translate('+(-q[0])+' '+(-q[1])+')'}
  // attach(element, name) -> {play()} : animates an SVG already produced by svg()
  function attach(host,name){
    var ic=REG[name];if(!ic)return{play:function(){}};
    var layers={},org=origins(ic),st=state(ic),raf=0,last=0;
    Array.prototype.forEach.call(host.querySelectorAll('g[data-l]'),function(g){layers[g.getAttribute('data-l')]=g});
    function frame(now){
      var acc=st.step((now-last)/1000);last=now;
      if(!acc){raf=0;for(var id in layers)layers[id].removeAttribute('transform');return}
      for(var k in acc){var g=layers[k];if(g)g.setAttribute('transform',transform(acc[k],org[k+'|r']||org[k+'|s']||[12,12],org[k+'|s']||org[k+'|r']||[12,12]))}
      raf=requestAnimationFrame(frame);
    }
    return{play:function(){
      if(wantsSound(host)){hook();playFor(ic,host)}
      if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      st.start();last=performance.now();if(!raf)raf=requestAnimationFrame(frame);
    }};
  }

  // ---- sound: small synthesized effects, off until asked for. Stereo position follows where the icon sits on screen. ----
  // Every sound can be shaped per icon: volume (0-2), pitch (semitones, -12..12), speed (0.5-2), tone (-1 softer .. 1 brighter),
  // pan (0 = centred, 1 = follows the icon across the screen) and delay (ms; "auto" lines impact sounds up with the motion).
  var AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext),ctx=null,master=null,soundAll=false,unlocked=false,vol=.5,hooked=false;
  var muted=false,cur=null,DEF={volume:1,pitch:0,speed:1,tone:0,pan:1,delay:'auto'},PER={};
  function noiseFor(c){if(!c._mgNoise){var b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;c._mgNoise=b}return c._mgNoise}
  function ensureAudio(){if(!AC)return null;try{
      if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination)}
      if(ctx.state==='suspended'&&ctx.resume){var pr=ctx.resume();if(pr&&pr.catch)pr.catch(function(){})}
    }catch(e){return null}return ctx}
  // browsers only allow audio after a click or key press; hover alone is not enough
  function hook(){if(hooked||typeof document==='undefined')return;hooked=true;var un=function(){unlocked=true;ensureAudio()};
    document.addEventListener('pointerdown',un,true);document.addEventListener('keydown',un,true)}
  // tone and noise read the context, pitch, speed and start time of the sound being rendered from cur
  function tone(out,f,t,dur,g,type,f2){if(cur.rec){cur.rec.push(['t',f,t,dur,g,type||'sine'].concat(f2?[f2]:[]));return}var C=cur.C,o=C.createOscillator(),a=C.createGain(),at=cur.t0+t/cur.sp,du=dur/cur.sp,pm=cur.pm;
    o.type=type||'sine';o.frequency.setValueAtTime(f*pm,at);if(f2)o.frequency.exponentialRampToValueAtTime(f2*pm,at+du);
    a.gain.setValueAtTime(.0001,at);a.gain.exponentialRampToValueAtTime(g,at+Math.min(.006,du/3));a.gain.exponentialRampToValueAtTime(.0001,at+du);
    o.connect(a);a.connect(out);o.start(at);o.stop(at+du+.05)}
  function noise(out,f,f2,t,dur,g,q){if(cur.rec){cur.rec.push(['n',f,f2,t,dur,g,q||1.2]);return}var C=cur.C,s=C.createBufferSource(),b=C.createBiquadFilter(),a=C.createGain(),at=cur.t0+t/cur.sp,du=dur/cur.sp,pm=cur.pm;
    s.buffer=noiseFor(C);s.loop=true;b.type='bandpass';b.Q.value=q||1.2;b.frequency.setValueAtTime(Math.min(f*pm,18000),at);b.frequency.exponentialRampToValueAtTime(Math.min(f2*pm,18000),at+du);
    a.gain.setValueAtTime(.0001,at);a.gain.exponentialRampToValueAtTime(g,at+du*.3);a.gain.exponentialRampToValueAtTime(.0001,at+du);
    s.connect(b);b.connect(a);a.connect(out);s.start(at);s.stop(at+du+.05)}
  var SOUNDS={
  bounce:o=>{tone(o,190,0,.11,.5,'sine',85);tone(o,170,.3,.09,.35,'sine',80)},
  siren:o=>{tone(o,620,0,.22,.14,'triangle',900);tone(o,900,.22,.22,.14,'triangle',620)},
  bubble:o=>{tone(o,300,0,.09,.3,'sine',700);tone(o,400,.12,.08,.25,'sine',900)},
  crunch:o=>{noise(o,1800,900,0,.06,.4,2);noise(o,1500,700,.09,.07,.35,2)},
  sizzle:o=>noise(o,5000,7000,0,.5,.18,3),
  fizz:o=>{noise(o,6000,9000,0,.4,.15,4);tone(o,500,.05,.06,.15,'sine',1000);tone(o,650,.18,.06,.12,'sine',1200)},
  horn:o=>{tone(o,350,0,.2,.16,'square');tone(o,440,0,.2,.12,'square')},
  rotor:o=>{for(let i=0;i<6;i++)tone(o,115,i*.07,.05,.3,'sine',70)},
  chirp:o=>{tone(o,2600,0,.07,.15,'sine',3400);tone(o,2800,.1,.07,.15,'sine',3600)},
  whistle:o=>{tone(o,2350,0,.3,.16,'sine',2500);tone(o,2420,.02,.28,.1,'sine',2380)},
  ding:o=>{tone(o,1320,0,1.1,.3);tone(o,2648,0,.7,.1);tone(o,3960,0,.4,.04)},
  thump:o=>{tone(o,150,0,.18,.6,'sine',50);tone(o,130,.25,.2,.45,'sine',45)},
  liftoff:o=>{noise(o,250,3500,0,.55,.5);tone(o,90,0,.5,.25,'sawtooth',260)},
  whoosh:o=>noise(o,500,3200,0,.42,.5),
  swish:o=>noise(o,900,4200,0,.2,.35),
  breeze:o=>noise(o,300,900,0,.7,.25,.7),
  chime:o=>{tone(o,1319,0,.6,.2);tone(o,1760,.07,.6,.18);tone(o,2637,.14,.8,.14)},
  glow:o=>{tone(o,660,0,.7,.16);tone(o,990,.05,.7,.1)},
  soft:o=>tone(o,392,0,.7,.2,'sine',330),
  tick2:o=>{tone(o,2100,0,.03,.2,'square');tone(o,1700,.16,.03,.16,'square')},
  blink:o=>tone(o,1500,0,.04,.12,'triangle',900),
  ratchet:o=>{for(let i=0;i<6;i++)tone(o,1800+i*60,i*.055,.025,.14,'square')},
  clank:o=>{noise(o,2500,1200,0,.07,.4,3);tone(o,260,0,.18,.3,'triangle',180);noise(o,1800,900,.27,.06,.3,3)},
  click:o=>{noise(o,3000,1500,.22,.04,.5,2);tone(o,420,.22,.06,.3,'square',300)},
  pop:o=>tone(o,380,0,.09,.4,'sine',920),
  pops:o=>{tone(o,520,0,.07,.3,'sine',900);tone(o,620,.09,.07,.3,'sine',1000);tone(o,740,.18,.07,.3,'sine',1150)},
  drop:o=>{tone(o,760,0,.16,.35,'sine',240);tone(o,180,.19,.08,.3,'sine',120)},
  zap:o=>{tone(o,1400,0,.17,.22,'sawtooth',90);noise(o,4000,800,0,.12,.25,2)},
  notes:o=>{tone(o,523,0,.22,.3,'triangle');tone(o,659,.15,.3,.3,'triangle')},
  shutter:o=>{noise(o,3500,2000,0,.035,.5,2);noise(o,2600,1500,.09,.05,.45,2)},
  knock:o=>{tone(o,210,0,.07,.5,'sine',140);tone(o,200,.13,.07,.45,'sine',130)},
  success:o=>{tone(o,660,0,.14,.25,'triangle');tone(o,990,.11,.3,.25,'triangle')},
  tap:o=>tone(o,900,0,.05,.3,'triangle',600),
  beep:o=>{tone(o,880,0,.09,.2,'sine');tone(o,1175,.1,.12,.2,'sine')},
  alert:o=>{tone(o,740,0,.1,.16,'square');tone(o,740,.16,.1,.16,'square')},
  buzz:o=>{tone(o,95,0,.12,.3,'sawtooth');tone(o,95,.17,.12,.3,'sawtooth')},
  coin:o=>{tone(o,1568,0,.08,.2,'square');tone(o,2093,.07,.35,.2,'square')},
  scribble:o=>{noise(o,2200,3200,0,.09,.3,4);noise(o,2800,2000,.1,.09,.3,4);noise(o,2200,3400,.2,.1,.3,4)},
  ticktock:o=>{tone(o,1900,0,.025,.22,'square');tone(o,1300,.3,.025,.2,'square');tone(o,1900,.6,.025,.16,'square')},
  // ---- added in 0.8.5 ----
  boop:o=>tone(o,520,0,.12,.35,'sine',260),
  blip:o=>tone(o,1250,0,.05,.16,'square'),
  hover:o=>tone(o,2200,0,.035,.08,'sine',2000),
  switchon:o=>{noise(o,3000,1500,0,.02,.4,2);tone(o,700,.01,.07,.25,'sine',1050)},
  switchoff:o=>{noise(o,2500,1200,0,.02,.4,2);tone(o,950,.01,.07,.25,'sine',620)},
  typing:o=>{[0,.09,.15,.27,.33,.46].forEach((t,i)=>noise(o,2600+i%3*500,1800,t,.03,.4,3))},
  flip:o=>{noise(o,1500,4000,0,.09,.4,1.2);noise(o,1800,4500,.1,.09,.3,1.2)},
  plink:o=>{tone(o,2093,0,.35,.25,'triangle');tone(o,4186,0,.12,.06)},
  pluck:o=>{tone(o,330,0,.4,.16,'sawtooth',326);tone(o,660,0,.18,.12,'triangle')},
  marimba:o=>{tone(o,523,0,.45,.35);tone(o,2093,0,.08,.12)},
  harp:o=>{[523,659,784,1047,1319].forEach((f,i)=>tone(o,f,i*.06,.5,.18,'triangle'))},
  bell:o=>{tone(o,880,0,1.6,.25);tone(o,2429,0,.9,.1);tone(o,4752,0,.5,.05)},
  gong:o=>{tone(o,98,0,2.2,.4);tone(o,147,.01,1.8,.2);tone(o,233,.02,1.4,.12);noise(o,400,200,0,.6,.08,1)},
  magic:o=>{tone(o,523,0,.6,.1,'triangle',1047);[1568,2093,2637,3136].forEach((f,i)=>tone(o,f,.1+i*.07,.4,.08))},
  sparkle:o=>{[2637,3136,2349,3520,2794,3951].forEach((f,i)=>tone(o,f,i*.05,.25,.09))},
  ping:o=>{tone(o,1760,0,.8,.25);tone(o,3520,0,.3,.06)},
  pong:o=>{tone(o,880,0,.25,.35);tone(o,1760,0,.08,.08)},
  incoming:o=>{tone(o,1175,0,.18,.22);tone(o,1568,.12,.35,.22)},
  bikebell:o=>{for(let i=0;i<2;i++){tone(o,2100,i*.16,.5,.14);tone(o,2700,i*.16,.4,.08)}},
  trill:o=>{for(let i=0;i<10;i++)tone(o,i%2?1600:1300,i*.045,.045,.14,'triangle')},
  alarm:o=>{for(let i=0;i<4;i++)tone(o,1050,i*.15,.09,.15,'square')},
  countdown:o=>{tone(o,880,0,.08,.2);tone(o,880,.3,.08,.2);tone(o,1760,.6,.3,.22)},
  tada:o=>{tone(o,523,0,.1,.2,'triangle');tone(o,659,.08,.1,.2,'triangle');[1047,1319,1568].forEach(f=>tone(o,f,.18,.7,.14,'triangle'))},
  error:o=>{tone(o,196,0,.14,.2,'square');tone(o,185,.17,.22,.2,'square')},
  warning:o=>{[0,1,2].forEach(i=>{tone(o,880,i*.22,.1,.16,'triangle');tone(o,660,i*.22+.11,.1,.16,'triangle')})},
  fail:o=>{tone(o,494,0,.16,.22,'triangle');tone(o,392,.17,.16,.22,'triangle');tone(o,311,.34,.4,.22,'triangle',290)},
  cancel:o=>{tone(o,660,0,.1,.22,'triangle');tone(o,440,.1,.18,.22,'triangle')},
  unlock:o=>{noise(o,3200,1800,0,.03,.4,3);noise(o,2600,1400,.09,.04,.4,3);tone(o,1568,.16,.35,.16);tone(o,2093,.22,.45,.14)},
  lock:o=>{noise(o,2400,1200,0,.04,.45,3);tone(o,220,0,.12,.35,'triangle',140)},
  rise:o=>{tone(o,330,0,.5,.15,'triangle',660);tone(o,495,0,.5,.08,'sine',990)},
  fall:o=>{tone(o,900,0,.45,.18,'triangle',300);tone(o,1350,0,.3,.06,'sine',450)},
  swoop:o=>{tone(o,350,0,.22,.25,'sine',1500);noise(o,800,3500,0,.22,.2,1)},
  whip:o=>{noise(o,1500,8000,0,.1,.5,1.5);noise(o,6000,3000,.1,.04,.4,2)},
  zipper:o=>{for(let i=0;i<10;i++)noise(o,2000+i*350,2500+i*350,i*.025,.018,.7,6)},
  boing:o=>{tone(o,140,0,.09,.35,'sine',420);tone(o,420,.09,.1,.3,'sine',230);tone(o,230,.19,.1,.25,'sine',340);tone(o,340,.29,.14,.18,'sine',260)},
  wobble:o=>{for(let i=0;i<4;i++)tone(o,i%2?480:300,i*.09,.09,.2,'triangle',i%2?300:480)},
  squeak:o=>{tone(o,1700,0,.08,.14,'sine',2600);tone(o,2500,.09,.1,.12,'sine',1700)},
  gulp:o=>{tone(o,180,0,.08,.4,'sine',420);tone(o,420,.09,.07,.3,'sine',160)},
  drip:o=>{tone(o,1400,0,.06,.35,'sine',500);tone(o,900,.07,.05,.12,'sine',1500)},
  splash:o=>{noise(o,2200,400,0,.45,.5,.8);tone(o,500,.05,.08,.15,'sine',1100);tone(o,700,.15,.07,.12,'sine',1300)},
  rain:o=>{[0,.07,.11,.2,.26,.31,.4,.47,.55,.6,.68].forEach((t,i)=>noise(o,4000+(i*1300)%4000,3000,t,.025,.6,5))},
  thunder:o=>{noise(o,600,80,0,1.4,.6,.5);noise(o,300,60,.15,1.2,.5,.5);tone(o,45,0,1.2,.3,'sine',30)},
  rumble:o=>{tone(o,55,0,.9,.3,'sawtooth',45);noise(o,180,90,0,.9,.35,.6)},
  crackle:o=>{[0,.05,.13,.16,.28,.34,.45,.52].forEach((t,i)=>noise(o,1500+(i*900)%3000,800,t,.02,.4+(i%3)*.1,4))},
  crumple:o=>{[0,.04,.09,.12,.19,.25,.28].forEach((t,i)=>noise(o,1200+(i*700)%2600,2000,t,.05,.35,2))},
  clap:o=>{[0,.012,.024].forEach(t=>noise(o,1400,1100,t,.05,.45,1.5));noise(o,1300,900,.035,.18,.25,1)},
  heartbeat:o=>{tone(o,90,0,.12,.6,'sine',45);tone(o,80,.17,.14,.45,'sine',40)},
  woodblock:o=>{tone(o,820,0,.07,.5,'sine',760);tone(o,1650,0,.03,.15,'triangle')},
  clang:o=>{tone(o,523,0,.9,.18,'triangle');tone(o,1347,0,.6,.12);tone(o,2273,0,.4,.08);noise(o,3000,1500,0,.05,.3,2)},
  kick:o=>{tone(o,150,0,.3,.8,'sine',42);noise(o,2000,600,0,.02,.2,1)},
  snare:o=>{noise(o,2200,1600,0,.18,.5,.7);tone(o,200,0,.1,.35,'triangle',160)},
  hihat:o=>{noise(o,9000,8000,0,.05,.4,1);noise(o,9000,8000,.15,.05,.3,1)},
  boom:o=>{tone(o,90,0,.8,.7,'sine',28);noise(o,700,80,0,.9,.6,.6)},
  kaching:o=>{noise(o,2500,1200,0,.06,.4,3);tone(o,2637,.06,.6,.16,'triangle');tone(o,3520,.12,.8,.14)},
  levelup:o=>{[523,659,784,1047].forEach((f,i)=>tone(o,f,i*.07,i<3?.08:.3,.16,'square'))},
  powerup:o=>{tone(o,220,0,.45,.14,'square',1320);tone(o,330,0,.45,.08,'triangle',1980)},
  powerdown:o=>{tone(o,1100,0,.5,.14,'square',140);tone(o,550,0,.5,.08,'triangle',70)},
  jump:o=>tone(o,280,0,.16,.2,'square',760),
  laser:o=>{tone(o,2400,0,.18,.18,'sawtooth',180);tone(o,1800,.02,.16,.1,'square',140)},
  robot:o=>{[330,494,262,415].forEach((f,i)=>tone(o,f,i*.08,.07,.13,'square'))},
  engine:o=>{for(let i=0;i<12;i++)tone(o,70+i*6,i*.05,.045,.35,'sawtooth',60+i*6)}
  };
  // families, for pickers and docs; every sound is in exactly one
  var GROUPS={
    interface:['tap','click','blink','hover','blip','boop','switchon','switchoff','tick2','ticktock','typing','flip','scribble','shutter'],
    alerts:['ding','chime','ping','pong','beep','incoming','alert','success','error','warning','fail','cancel','alarm','countdown','bell','bikebell','trill','tada'],
    motion:['whoosh','swish','swoop','breeze','rise','fall','whip','zipper','wobble','boing','bounce','drop','liftoff'],
    impacts:['thump','knock','clank','clang','woodblock','kick','snare','hihat','clap','heartbeat','boom','crunch','crumple'],
    nature:['bubble','drip','splash','rain','thunder','rumble','sizzle','fizz','crackle','chirp','whistle','gulp','squeak'],
    musical:['plink','pluck','marimba','harp','gong','notes','glow','soft','sparkle','magic'],
    game:['coin','kaching','levelup','powerup','powerdown','jump','laser','zap','pop','pops','robot'],
    machines:['horn','siren','rotor','engine','ratchet','buzz','lock','unlock']
  };
  // loudness trims measured offline so every sound plays at about the same level and none clips (see tools/sound-audit.js)
  var NORM={"bounce":0.55,"siren":1.67,"bubble":0.85,"crunch":2.48,"sizzle":2.44,"fizz":2.04,"horn":0.9,"rotor":0.93,"chirp":0.98,"whistle":0.82,"ding":0.62,"thump":0.5,"liftoff":1.34,"whoosh":1.76,"swish":1.73,"breeze":2.5,"chime":0.71,"glow":1.14,"soft":1.08,"tick2":0.83,"blink":1.8,"ratchet":1.15,"clank":0.96,"click":0.63,"pop":0.58,"pops":0.76,"drop":0.71,"zap":1.04,"notes":0.9,"shutter":1.42,"knock":0.51,"success":1,"tap":0.93,"beep":1.05,"alert":1.07,"buzz":1.2,"coin":0.7,"scribble":2.5,"ticktock":0.88,"boop":0.68,"blip":1,"hover":1.88,"switchon":0.97,"switchoff":0.97,"typing":2.19,"flip":1.46,"plink":0.77,"pluck":1.74,"marimba":0.64,"harp":0.84,"bell":0.76,"gong":0.56,"magic":1.29,"sparkle":1.04,"ping":0.68,"pong":0.63,"incoming":0.85,"bikebell":0.88,"trill":1.74,"alarm":1.05,"countdown":0.85,"tada":1,"error":0.93,"warning":1.54,"fail":1.19,"cancel":1.17,"unlock":0.97,"lock":0.77,"rise":1.4,"fall":1.27,"swoop":0.9,"whip":1.15,"zipper":1.88,"boing":0.88,"wobble":1.37,"squeak":1.27,"gulp":0.69,"drip":0.82,"splash":1.11,"rain":1.3,"thunder":1.12,"rumble":1.2,"crackle":2.37,"crumple":1.85,"clap":1.96,"heartbeat":0.6,"woodblock":0.45,"clang":0.99,"kick":0.35,"snare":0.76,"hihat":0.9,"boom":0.43,"kaching":0.85,"levelup":1.03,"powerup":1.14,"powerdown":1.06,"jump":0.9,"laser":1.01,"robot":1.34,"engine":1.31};
  var num=function(v,d,lo,hi){v=parseFloat(v);return isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
  // ---- custom sounds: a designed synth (a list of steps) or an audio file, attached to an icon (S.custom) or named with sound.define ----
  // a step is ['t', hz, start s, length s, level 0-1, wave, end hz?] for a tone or ['n', hz, end hz, start s, length s, level 0-1, q?] for filtered noise
  var WAVES={sine:1,triangle:1,square:1,sawtooth:1},DEFS={},BUFS={},LOADING={},EXTRA={},EXTRA_GROUPS={};
  var fin=function(v,lo,hi){return typeof v==='number'&&isFinite(v)&&v>=lo&&v<=hi};
  function cleanSteps(a){if(!Array.isArray(a)||!a.length||a.length>48)return null;var out=[];
    for(var i=0;i<a.length;i++){var x=a[i];if(!Array.isArray(x))return null;
      if(x[0]==='t'&&fin(x[1],20,20000)&&fin(x[2],0,2.5)&&fin(x[3],.005,2.5)&&fin(x[4],.001,1)&&WAVES[x[5]||'sine']&&(x[6]===undefined||x[6]===null||fin(x[6],20,20000)))out.push(['t',x[1],x[2],x[3],x[4],x[5]||'sine'].concat(x[6]?[x[6]]:[]));
      else if(x[0]==='n'&&fin(x[1],20,20000)&&fin(x[2],20,20000)&&fin(x[3],0,2.5)&&fin(x[4],.005,2.5)&&fin(x[5],.001,1)&&(x[6]===undefined||fin(x[6],.1,30)))out.push(['n',x[1],x[2],x[3],x[4],x[5],x[6]||1.2]);
      else return null}return out}
  // audio may be a data: URI (what the icon maker stores) or a URL your page can fetch
  function cleanDef(d){if(!d||typeof d!=='object')return null;if(d.synth){var st=cleanSteps(d.synth);return st?{synth:st}:null}
    if(typeof d.src==='string'&&d.src.length<=1500000&&(/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(d.src)||/^(https?:)?\/\/|^\.{0,2}\//.test(d.src)))return{src:d.src};return null}
  function bytes(src){if(src.slice(0,5)==='data:'){var b=atob(src.slice(src.indexOf(',')+1)),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return Promise.resolve(u.buffer)}
    return fetch(src).then(function(r){if(!r.ok)throw new Error('Could not load the sound '+src+' ('+r.status+').');return r.arrayBuffer()})}
  // decode once and keep it; level it so a quiet or loud recording plays at about the same level as the built-in sounds
  function load(src,c){if(BUFS[src])return Promise.resolve(BUFS[src]);if(LOADING[src])return LOADING[src];
    var dc=c||(typeof window!=='undefined'&&(window.OfflineAudioContext||window.webkitOfflineAudioContext)?new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,1,44100):ensureAudio());
    if(!dc)return Promise.reject(new Error('Audio is not available here.'));
    return LOADING[src]=bytes(src).then(function(ab){return new Promise(function(ok,no){var pr=dc.decodeAudioData(ab,ok,no);if(pr&&pr.then)pr.then(ok,no)})}).then(function(buf){
      var pk=0;for(var ch=0;ch<buf.numberOfChannels;ch++){var d=buf.getChannelData(ch);for(var i=0;i<d.length;i+=2){var a=d[i]<0?-d[i]:d[i];if(a>pk)pk=a}}
      delete LOADING[src];return BUFS[src]={buf:buf,gain:pk>1e-4?Math.min(6,.45/pk):1}},function(e){delete LOADING[src];throw e})}
  function sample(out,b){var C=cur.C,s=C.createBufferSource(),a=C.createGain();s.buffer=b.buf;if(s.playbackRate)s.playbackRate.value=cur.pm*cur.sp;a.gain.value=b.gain;s.connect(a);a.connect(out);s.start(cur.t0)}
  // the definition behind a sound name, if it is not built in
  // an icon may carry the steps of a sound from the extra pack, so it plays even where the pack is not loaded
  function defOf(o){return o.sound==='custom'?o.custom:DEFS[o.sound]||(o.custom&&!SOUNDS[o.sound]?o.custom:null)}
  function synthFn(st){return function(o){st.forEach(function(x){x[0]==='t'?tone(o,x[1],x[2],x[3],x[4],x[5],x[6]):noise(o,x[1],x[2],x[3],x[4],x[5],x[6])})}}
  // settings for one play: defaults < sound.set(icon) < the icon's own data (ic.S) < attributes on the element
  function settings(ic,el,extra){var o={},k;for(k in DEF)o[k]=DEF[k];
    var add=function(x){if(x)for(var k in x)if(x[k]!==undefined&&x[k]!==null&&x[k]!=='')o[k]=x[k]};
    if(ic){add(PER[ic.n]);add(ic.S)}
    if(el&&el.getAttribute)add({sound:el.getAttribute('sound-name'),volume:el.getAttribute('sound-volume'),pitch:el.getAttribute('sound-pitch'),speed:el.getAttribute('sound-speed'),tone:el.getAttribute('sound-tone'),pan:el.getAttribute('sound-pan'),delay:el.getAttribute('sound-delay'),src:el.getAttribute('sound-src')});
    add(extra);o.sound=o.sound||(ic&&ic.s)||null;
    if(o.src){o.custom=cleanDef({src:o.src});o.sound='custom';delete o.src}else if(o.custom)o.custom=cleanDef(o.custom);
    o.volume=num(o.volume,1,0,2);o.pitch=num(o.pitch,0,-12,12);o.speed=num(o.speed,1,.5,2);o.tone=num(o.tone,0,-1,1);o.pan=num(o.pan,1,0,1);
    o.delay=o.delay==='auto'?(ic?beat(ic,o.sound):0):num(o.delay,0,0,2000);return o}
  // impact sounds wait for the moment of impact. The animations mark it: a reaction (a squash, a tray dipping, a lid jumping)
  // is a part of the motion that starts later than the rest; its start time is when the hit happens. No reaction: play at once.
  var IMPACT={thump:1,knock:1,drop:1,bounce:1,clank:1,crunch:1};
  function beat(ic,name){if(!IMPACT[name]||!ic.A)return 0;if(ic._beat!==undefined)return ic._beat;var hit=0;
    ic.A.forEach(function(a){var t=a.k&&a.k[0]&&a.k[0][0];if(t>40&&t<600&&(!hit||t<hit))hit=t});
    return ic._beat=hit}
  // build the sound graph into any audio context: volume and tone, then position
  function render(c,dest,o,pan){var def=defOf(o),fn=def?(def.synth?synthFn(def.synth):def.src&&BUFS[def.src]?function(g){sample(g,BUFS[def.src])}:null):SOUNDS[o.sound];if(!fn)return false;
    var g=c.createGain();g.gain.value=(def?1:NORM[o.sound]||1)*o.volume;var node=g;
    if(o.tone<0){var lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=20000*Math.pow(2,o.tone*5);lp.Q.value=.5;g.connect(lp);node=lp}
    else if(o.tone>0){var hs=c.createBiquadFilter();hs.type='highshelf';hs.frequency.value=2500;hs.gain.value=o.tone*9;g.connect(hs);node=hs}
    if(c.createStereoPanner&&pan){var p=c.createStereoPanner();p.pan.setValueAtTime(Math.max(-1,Math.min(1,pan)),c.currentTime);node.connect(p);p.connect(dest)}else node.connect(dest);
    cur={C:c,pm:Math.pow(2,o.pitch/12),sp:o.speed,t0:c.currentTime+o.delay/1000};try{fn(g)}finally{cur=null}return true}
  // sound="off" on an element always wins, so decorative or autoplaying icons stay silent even when sound is on for the page
  function wantsSound(el){if(el&&el.getAttribute&&el.getAttribute('sound')==='off')return false;return soundAll||!!(el&&el.hasAttribute&&el.hasAttribute('sound'))}
  function playFor(ic,el,extra){if(muted||!unlocked||!ensureAudio())return false;var o=settings(ic,el,extra);if(!o.sound||!o.volume)return false;
    var def=defOf(o);if(def&&def.src&&!BUFS[def.src]){var asked=Date.now();load(def.src).then(function(){if(Date.now()-asked<700)playFor(ic,el,extra)},function(e){if(typeof console!=='undefined')console.warn('magic-glyphs: '+e.message)});return true}
    var pan=0;if(o.pan&&el&&el.getBoundingClientRect&&typeof innerWidth==='number'&&innerWidth>0){var r=el.getBoundingClientRect();pan=((r.left+r.width/2)/innerWidth*2-1)*.85*o.pan}
    try{return render(ctx,master,o,pan)}catch(e){return false}}
  function playSound(name,el,extra){var x={sound:name};if(extra)for(var k in extra)x[k]=extra[k];return playFor(null,el,x)}
  // the visitor's own choice: muted silences every icon, even ones with the sound attribute, and is remembered in this browser
  var STORE='magic-glyphs-sound';
  function tell(){if(typeof document!=='undefined'&&document.dispatchEvent&&typeof CustomEvent==='function')document.dispatchEvent(new CustomEvent('magic-glyphs-sound',{detail:{on:soundAll&&!muted}}))}
  function setOn(on,keep){on=!!on;soundAll=on;muted=!on;if(on)hook();if(keep)try{localStorage.setItem(STORE,on?'on':'off')}catch(e){}tell();return on}
  var soundApi={enable:function(on){soundAll=on!==false;if(soundAll){muted=false;hook()}tell();return soundAll},enabled:function(){return soundAll&&!muted},
    // a mute switch for visitors: on and off are remembered; remember() applies the stored choice (or the default you give)
    toggle:function(on){return setOn(on===undefined?!(soundAll&&!muted):on,true)},
    remember:function(defaultOn){var v=null;try{v=localStorage.getItem(STORE)}catch(e){}return setOn(v?v==='on':!!defaultOn,false)},
    muted:function(){return muted},
    volume:function(v){if(typeof v==='number'){vol=Math.max(0,Math.min(1,v));if(master)master.gain.value=vol}return vol},
    // play a sound by name, with optional settings: sound.play('chime', el, {pitch:3})
    play:function(name,el,opts){hook();return playSound(name,el,opts)},
    // play an icon's own sound with its settings: sound.icon('send', el)
    icon:function(name,el,opts){hook();return playFor(REG[name]||{n:name},el,opts)},
    // settings for every use of an icon: sound.set('send', {sound:'whoosh', pitch:-2}); sound.set('send', null) clears
    set:function(name,o){if(o===null)delete PER[name];else PER[name]=o;return api},
    get:function(name,el){return settings(REG[name]||{n:name},el)},
    defaults:function(o){if(o)for(var k in o)if(k in DEF)DEF[k]=o[k];var c={};for(var k2 in DEF)c[k2]=DEF[k2];return c},
    // render to an AudioBuffer offline (no click needed), for previews, tests and exporting audio
    render:function(name,opts,Offline){var OAC=Offline||typeof window!=='undefined'&&(window.OfflineAudioContext||window.webkitOfflineAudioContext);if(!OAC)return Promise.reject(new Error('Offline audio is not available here.'));
      var o=REG[name]?settings(REG[name],null,opts):settings(null,null,Object.assign({sound:name},opts||{}));var c=new OAC(2,Math.ceil(44100*(2.6+o.delay/1000)),44100);
      var def=defOf(o);return (def&&def.src?load(def.src,c):Promise.resolve()).then(function(){
        if(!render(c,c.destination,o,(opts&&opts.panTo)||0))throw new Error(o.sound==='custom'?'This icon\'s own sound is missing or not valid.':'No sound named "'+o.sound+'".');return c.startRendering()})},
    // encode a rendered buffer as a 16-bit stereo WAV file (ArrayBuffer), trimming the silence at the end
    wav:function(buf){var L=buf.getChannelData(0),R=buf.numberOfChannels>1?buf.getChannelData(1):L,n=L.length;
      while(n>1&&Math.abs(L[n-1])<1e-4&&Math.abs(R[n-1])<1e-4)n--;n=Math.min(L.length,n+Math.round(buf.sampleRate*.02));
      var ab=new ArrayBuffer(44+n*4),v=new DataView(ab),w=function(o,t){for(var i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
      w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
      v.setUint32(24,buf.sampleRate,true);v.setUint32(28,buf.sampleRate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
      for(var i=0,o=44;i<n;i++,o+=4){v.setInt16(o,Math.max(-1,Math.min(1,L[i]))*32767,true);v.setInt16(o+2,Math.max(-1,Math.min(1,R[i]))*32767,true)}return ab},
    names:function(){return Object.keys(SOUNDS).concat(Object.keys(DEFS))},
    // the built-in sounds by family: {interface:[...], alerts:[...], ...}
    groups:function(){var g={},k;for(k in GROUPS)g[k]=GROUPS[k].slice();for(k in EXTRA_GROUPS)g[k]=(g[k]||[]).concat(EXTRA_GROUPS[k]);
      var mine=Object.keys(DEFS).filter(function(n){return !EXTRA[n]});if(mine.length)g.yours=mine;return g},
    // add a pack of sounds, like the extra pack in magic-glyphs/sounds: {groups:{family:[names]}, sounds:{name:steps}}
    add:function(pack){if(!pack||!pack.sounds)return api;var n,c;for(n in pack.sounds){if(SOUNDS[n]||!/^[a-z0-9-]{1,40}$/.test(n))continue;c=cleanDef({synth:pack.sounds[n]});if(c){DEFS[n]=c;EXTRA[n]=1}}
      for(var g in pack.groups||{}){var have=EXTRA_GROUPS[g]||[];EXTRA_GROUPS[g]=have.concat((pack.groups[g]||[]).filter(function(x){return EXTRA[x]&&have.indexOf(x)<0}))}return api},
    // true for the 100 sounds built into the runtime
    builtIn:function(name){return !!SOUNDS[name]},
    // your own sound under a name: sound.define('pling', {src:'/sounds/pling.mp3'}) or {synth:[['t',880,0,.2,.3,'sine']]}; null removes it
    define:function(name,d){if(!/^[a-z0-9-]{1,40}$/.test(name)||SOUNDS[name])throw new Error('Pick a sound name of lowercase letters, digits and dashes that is not built in.');
      if(d===null){delete DEFS[name];return api}var c=cleanDef(d);if(!c)throw new Error('A sound needs {src: a URL or data: URI} or {synth: a list of steps}.');DEFS[name]=c;return api},
    // start loading an audio file ahead of the first play
    preload:function(src){return load(src).then(function(){})},
    // the steps a built-in sound is made of, to start a design from: [['t',hz,start,len,level,wave,endHz], ['n',hz,endHz,start,len,level,q]]
    steps:function(name){var d=DEFS[name];if(d&&d.synth)return JSON.parse(JSON.stringify(d.synth));var fn=SOUNDS[name];if(!fn)return null;var rec=[],was=cur;cur={rec:rec};try{fn(null)}finally{cur=was}
      return rec.map(function(x){return x.map(function(v){return typeof v==='number'?+v.toFixed(4):v})})},
    // check a custom sound definition: the cleaned copy, or null
    check:cleanDef,unlocked:function(){return unlocked}};
  var api={sound:soundApi,register:register,svg:svg,attach:attach,state:state,origins:origins,transform:transform,has:function(n){return !!REG[n]},names:function(){return Object.keys(REG)},icon:function(n){return REG[n]}};
  // <magic-glyph name="heart" variant="duotone" trigger="hover" size="32" label="Like"></magic-glyph>
  if(typeof customElements!=='undefined'&&typeof HTMLElement!=='undefined'&&!customElements.get('magic-glyph')){
    var El=function(){return Reflect.construct(HTMLElement,[],El)};
    El.prototype=Object.create(HTMLElement.prototype);El.prototype.constructor=El;Object.setPrototypeOf(El,HTMLElement);
    El.observedAttributes=['name','variant','size','label'];
    El.prototype.connectedCallback=function(){
      var me=this;this.style.display=this.style.display||'inline-flex';this._render();
      if(this.hasAttribute('sound'))hook();
      if(this._bound)return;this._bound=true;
      var go=function(){me.play()};
      this.addEventListener('mouseenter',function(){var t=me.getAttribute('trigger')||'hover';if(t==='hover')go()});
      this.addEventListener('focusin',function(){var t=me.getAttribute('trigger')||'hover';if(t==='hover')go()});
      this.addEventListener('click',function(){var t=me.getAttribute('trigger')||'hover';if(t==='click'||t==='hover')go()});
      var t=this.getAttribute('trigger');
      if(t==='load')setTimeout(go,0);
      if(t==='visible'&&typeof IntersectionObserver!=='undefined'){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){go();io.disconnect()}})});io.observe(this)}
    };
    El.prototype.attributeChangedCallback=function(){if(this.isConnected)this._render()};
    El.prototype._render=function(){
      var n=this.getAttribute('name');
      this.innerHTML=svg(n,{style:this.getAttribute('variant')||'outline',size:this.getAttribute('size')||24,title:this.getAttribute('label')});
      this._p=attach(this,n);
    };
    El.prototype.play=function(){if(this._p)this._p.play()};
    customElements.define('magic-glyph',El);
  }
    // <magic-glyphs-sound-toggle default="off"></magic-glyphs-sound-toggle>: a speaker button visitors use to turn icon sounds on or off
  if(typeof customElements!=='undefined'&&typeof HTMLElement!=='undefined'&&!customElements.get('magic-glyphs-sound-toggle')){
    var SPK='<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/>',ON=SPK+'<path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10"/>',OFF=SPK+'<path d="M16 10l4 4M20 10l-4 4"/>';
    var T=function(){return Reflect.construct(HTMLElement,[],T)};T.prototype=Object.create(HTMLElement.prototype);T.prototype.constructor=T;Object.setPrototypeOf(T,HTMLElement);
    T.prototype.connectedCallback=function(){var me=this;if(this._b)return;this._b=true;
      var b=document.createElement('button');b.type='button';b.className='magic-glyphs-sound-toggle';b.style.cssText='display:inline-flex;align-items:center;gap:.4em;font:inherit;color:inherit;background:none;border:0;padding:.25em;cursor:pointer';
      this.appendChild(b);var size=parseFloat(this.getAttribute('size'))||20;
      var draw=function(on){b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?(me.getAttribute('label-on')||'Sound on'):(me.getAttribute('label-off')||'Sound off'));
        b.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+STROKE+' aria-hidden="true">'+(on?ON:OFF)+'</svg>'+(me.hasAttribute('show-label')?'<span>'+esc(on?(me.getAttribute('label-on')||'Sound on'):(me.getAttribute('label-off')||'Sound off'))+'</span>':'')};
      b.addEventListener('click',function(){unlocked=true;ensureAudio();var on=soundApi.toggle();if(on)playSound('tap',b)});
      document.addEventListener('magic-glyphs-sound',function(e){draw(e.detail.on)});
      draw(soundApi.remember(this.getAttribute('default')==='on'))};
    customElements.define('magic-glyphs-sound-toggle',T)}
  return api;
});
