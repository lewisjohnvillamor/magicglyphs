// Converts a Magic Glyphs icon to a Lottie animation. The springs are simulated and baked into keyframes,
// then thinned so that only the keyframes needed to stay within a small error remain.
const svgpath=require('svgpath');const MG=require('../web/runtime.js');
const FR=60;
function hex(c){const m=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c||'');if(!m)return [0,0,0,1];let h=m[1];if(h.length===3)h=h.split('').map(x=>x+x).join('');return [0,2,4].map(i=>+(parseInt(h.slice(i,i+2),16)/255).toFixed(4)).concat(1)}
const r3=v=>+(+v).toFixed(3);
// path data -> Lottie bezier shapes (one per subpath)
function beziers(shape){
  let p=svgpath(shape.d);if(shape.r)p=p.rotate(shape.r[0],shape.r[1],shape.r[2]);
  const out=[];let cur=null,x=0,y=0,sx=0,sy=0;
  const start=(px,py)=>{cur={v:[[px,py]],i:[[0,0]],o:[[0,0]],c:false};out.push(cur);x=sx=px;y=sy=py};
  const cubic=(x1,y1,x2,y2,ex,ey)=>{if(!cur)start(x,y);cur.o[cur.o.length-1]=[x1-x,y1-y];cur.v.push([ex,ey]);cur.i.push([x2-ex,y2-ey]);cur.o.push([0,0]);x=ex;y=ey};
  p.abs().unarc().unshort().iterate(s=>{const c=s[0];
    if(c==='M')start(s[1],s[2]);
    else if(c==='L')cubic(x,y,s[1],s[2],s[1],s[2]);
    else if(c==='H')cubic(x,y,s[1],y,s[1],y);
    else if(c==='V')cubic(x,y,x,s[1],x,s[1]);
    else if(c==='C')cubic(s[1],s[2],s[3],s[4],s[5],s[6]);
    else if(c==='Q')cubic(x+2/3*(s[1]-x),y+2/3*(s[2]-y),s[3]+2/3*(s[1]-s[3]),s[4]+2/3*(s[2]-s[4]),s[3],s[4]);
    else if(c==='Z'||c==='z'){if(cur){cur.c=true;const n=cur.v.length-1;
        if(n>0&&Math.abs(cur.v[n][0]-sx)<1e-4&&Math.abs(cur.v[n][1]-sy)<1e-4){cur.i[0]=cur.i[n];cur.v.pop();cur.i.pop();cur.o.pop()}
        x=sx;y=sy;cur=null}}
    else throw new Error('unsupported path command '+c);
  });
  return out.map(b=>({ty:'sh',ks:{a:0,k:{c:b.c,v:b.v.map(q=>q.map(r3)),i:b.i.map(q=>q.map(r3)),o:b.o.map(q=>q.map(r3))}}}));
}
// keep only the keyframes needed to stay within tol of the baked curve (Ramer–Douglas–Peucker over time)
function thin(frames,tol){
  const keep=new Set([0,frames.length-1]);
  (function go(a,b){let worst=-1,wi=-1;
    for(let k=a+1;k<b;k++){const u=(k-a)/(b-a);let e=0;for(let d=0;d<frames[k].length;d++)e=Math.max(e,Math.abs(frames[k][d]-(frames[a][d]+(frames[b][d]-frames[a][d])*u)));if(e>worst){worst=e;wi=k}}
    if(worst>tol){keep.add(wi);go(a,wi);go(wi,b)}})(0,frames.length-1);
  return [...keep].sort((a,b)=>a-b);
}
function prop(frames,tol,scalar,spatial){
  const same=frames.every(f=>f.every((v,d)=>Math.abs(v-frames[0][d])<1e-6));
  if(same)return{a:0,k:scalar?r3(frames[0][0]):frames[0].map(r3)};
  const ks=thin(frames,tol);
  return{a:1,k:ks.map((f,n)=>{const kf={t:f,s:frames[f].map(r3)};
    if(n<ks.length-1){const dims=spatial?1:frames[f].length;kf.i={x:Array(dims).fill(.833),y:Array(dims).fill(.833)};kf.o={x:Array(dims).fill(.167),y:Array(dims).fill(.167)};if(spatial){kf.i={x:.833,y:.833};kf.o={x:.167,y:.167}}}
    return kf})};
}
// simulate the springs at 60 fps: frames[f][layerId] = {tx,ty,r,s,sx,sy}
function bake(ic){
  const st=MG.state(ic);st.start();const frames=[{}];
  const start={};ic.A.forEach(a=>{if(a.from!==undefined)a.l.split(' ').forEach(id=>{(start[id]=start[id]||{tx:0,ty:0,r:0,s:0,sx:0,sy:0})[a.p]+=a.from})});
  frames[0]=start;
  for(let f=1;f<=FR*6;f++){let acc=null;for(let k=0;k<4;k++)acc=st.step(1/240);if(!acc)break;frames.push(acc)}
  frames.push({});return frames;
}
function toLottie(ic,opt){
  opt=opt||{};const style=opt.style||'outline',col=hex(opt.color||'#000000'),sec=hex(opt.secondary||opt.color||'#000000'),bg=hex(opt.background||'#ffffff'),secO=Math.round((opt.secondaryOpacity===undefined?.18:opt.secondaryOpacity)*100);
  const frames=ic.A.length?bake(ic):[{},{}],N=frames.length,org=MG.origins(ic),Z={tx:0,ty:0,r:0,s:0,sx:0,sy:0};
  const stroke=c=>({ty:'st',c:{a:0,k:c},o:{a:0,k:100},w:{a:0,k:1.75},lc:2,lj:2}),fill=(c,o)=>({ty:'fl',c:{a:0,k:c},o:{a:0,k:o===undefined?100:o},r:1});
  const paint=k=>{
    if(k==='f')return[fill(col)];
    if(k==='d')return[fill(style==='solid'?bg:col)];
    if(k==='o')return[stroke(col)];
    if(k==='i')return[stroke(style==='solid'?bg:col)];
    if(style==='solid')return[stroke(col),fill(col)];
    if(style==='duotone')return[stroke(col),fill(sec,secO)];
    return[stroke(col)];
  };
  const TR={ty:'tr',p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},r:{a:0,k:0},o:{a:0,k:100},sk:{a:0,k:0},sa:{a:0,k:0}};
  const layers=[];let ind=0;
  // Lottie draws the first layer on top, the icon data lists the bottom layer first
  ic.L.slice().reverse().forEach(l=>{
    const oR=org[l.i+'|r']||org[l.i+'|s']||[12,12],oS=org[l.i+'|s']||org[l.i+'|r']||[12,12];
    const tr=frames.map(f=>f[l.i]||Z),split=oR[0]!==oS[0]||oR[1]!==oS[1];
    const pos=tr.map(v=>[oR[0]+v.tx,oR[1]+v.ty]),rot=tr.map(v=>[v.r]),sc=tr.map(v=>[(1+v.s+v.sx)*100,(1+v.s+v.sy)*100]);
    // shapes that carry their own colour (flags) each get their own group; Lottie draws the first group on top
    const own=l.p.some(q=>q.f);
    const shapes=own?l.p.slice().reverse().map((q,n)=>({ty:'gr',nm:l.i+n,it:beziers(q).concat(q.f?[fill(hex(q.f))]:paint(l.k),[TR])})):[{ty:'gr',nm:l.i,it:[].concat(...l.p.map(beziers)).concat(paint(l.k),[TR])}];
    const base={ddd:0,sr:1,ao:0,ip:0,op:N,st:0,bm:0};
    if(!split){
      layers.push(Object.assign({ind:++ind,ty:4,nm:l.i,ks:{o:{a:0,k:100},r:prop(rot,.15,true),p:prop(pos,.02,false,true),a:{a:0,k:[oR[0],oR[1],0]},s:prop(sc,.4)},shapes},base));
    }else{ // rotation and scale pivot on different points: a parent carries move + turn, the shape layer scales
      const child=++ind,parent=++ind;
      layers.push(Object.assign({ind:child,parent,ty:4,nm:l.i,ks:{o:{a:0,k:100},r:{a:0,k:0},p:{a:0,k:[oS[0],oS[1],0]},a:{a:0,k:[oS[0],oS[1],0]},s:prop(sc,.4)},shapes},base));
      layers.push(Object.assign({ind:parent,ty:3,nm:l.i+' pivot',ks:{o:{a:0,k:0},r:prop(rot,.15,true),p:prop(pos,.02,false,true),a:{a:0,k:[oR[0],oR[1],0]},s:{a:0,k:[100,100,100]}}},base));
    }
  });
  return{v:'5.7.4',fr:FR,ip:0,op:N,w:24,h:24,nm:ic.n,ddd:0,assets:[],layers,meta:{g:'Magic Glyphs'}};
}
module.exports={toLottie,bake,FR};
