// Draws an icon's animation into pixel frames, with no native modules: GIF, APNG, WebM and MP4 export start here.
// Geometry is flattened once; each frame applies the spring transforms (the same engine the browser uses), then
// fills are scanline-filled (non-zero rule, 4 sub-rows with exact horizontal coverage) and strokes are drawn as
// round-capped capsules (distance to each segment), which is exactly what stroke-linecap/linejoin="round" draws.
const svgpath=require('svgpath');
const STROKE_W=1.75;

function hex(c,fb){if(c==='transparent'||c==='none')return null;const m=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c||'');if(!m)return fb===undefined?[0,0,0]:fb;let h=m[1];if(h.length===3)h=h.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)}

// path data -> polylines in icon units: [{pts:[x,y,...], closed}]
function flatten(d,rot,tol){
  let p=svgpath(d);if(rot)p=p.rotate(rot[0],rot[1],rot[2]);
  const out=[];let cur=null,x=0,y=0;
  const start=(px,py)=>{cur={pts:[px,py],closed:false};out.push(cur);x=px;y=py};
  const line=(ex,ey)=>{if(!cur)start(x,y);cur.pts.push(ex,ey);x=ex;y=ey};
  const cubic=(x1,y1,x2,y2,ex,ey)=>{if(!cur)start(x,y);
    const len=Math.hypot(x1-x,y1-y)+Math.hypot(x2-x1,y2-y1)+Math.hypot(ex-x2,ey-y2),n=Math.max(2,Math.min(64,Math.ceil(Math.sqrt(len/tol))));
    for(let i=1;i<=n;i++){const t=i/n,u=1-t;cur.pts.push(u*u*u*x+3*u*u*t*x1+3*u*t*t*x2+t*t*t*ex,u*u*u*y+3*u*u*t*y1+3*u*t*t*y2+t*t*t*ey)}x=ex;y=ey};
  p.abs().unarc().unshort().iterate(s=>{const c=s[0];
    if(c==='M')start(s[1],s[2]);
    else if(c==='L')line(s[1],s[2]);else if(c==='H')line(s[1],y);else if(c==='V')line(x,s[1]);
    else if(c==='C')cubic(s[1],s[2],s[3],s[4],s[5],s[6]);
    else if(c==='Q')cubic(x+2/3*(s[1]-x),y+2/3*(s[2]-y),s[3]+2/3*(s[1]-s[3]),s[4]+2/3*(s[2]-s[4]),s[3],s[4]);
    else if(c==='Z'||c==='z'){if(cur){cur.closed=true;x=cur.pts[0];y=cur.pts[1];cur=null}}});
  return out.filter(q=>q.pts.length>=2);
}

// what each layer kind paints in each style (mirrors paint() in web/runtime.js)
function paints(style,kind,o){
  const col=o.color,bg=o.bg||[1,1,1],sec=o.secondary||col,so=o.secondaryOpacity===undefined?.18:o.secondaryOpacity;
  const F=(c,a)=>({t:'fill',c,a:a===undefined?1:a}),S=(c,a)=>({t:'stroke',c,a:a===undefined?1:a});
  if(kind==='f')return[F(col)];
  if(kind==='d')return[F(style==='solid'?bg:col)];
  if(kind==='o')return[S(col)];
  if(kind==='i')return[S(style==='solid'?bg:col)];
  if(style==='solid')return[F(col),S(col)];
  if(style==='duotone')return[F(sec,so),S(col)];
  if(style==='glass')return[{t:'fill',c:sec,a:1,glass:true},S(col,.6)];
  return[S(col)];
}

// icon -> drawing list, bottom first: {layer, t:'fill'|'stroke', c, a, glass, polys}
function geometry(ic,style,o){
  const list=[];
  for(const l of ic.L){const ps=paints(style,l.k,o);
    for(const p of l.p){const polys=flatten(p.d,p.r,.02);
      for(const pt of ps)list.push({layer:l.i,t:pt.t,c:pt.t==='fill'&&p.f?hex(p.f):pt.c,a:pt.a,glass:pt.glass,polys})}}
  return list;
}

// spring transforms sampled at fps: [{layerId:{tx,ty,r,s,sx,sy}}], first frame is the pose before the motion starts
function sample(MG,ic,fps,maxSec){
  if(!ic.A||!ic.A.length)return[{}];
  const st=MG.state(ic);st.start();const start={};
  ic.A.forEach(a=>{if(a.from!==undefined)a.l.split(' ').forEach(id=>{(start[id]=start[id]||{tx:0,ty:0,r:0,s:0,sx:0,sy:0})[a.p]+=a.from})});
  const frames=[start],sub=Math.max(1,Math.ceil(240/fps)),dt=1/(fps*sub);
  for(let f=1;f<=fps*(maxSec||6);f++){let acc=null,done=false;for(let k=0;k<sub;k++){acc=st.step(dt);if(!acc){done=true;break}}if(done||!acc)break;frames.push(acc)}
  frames.push({});return frames;
}

// a 2D affine matrix [a,b,c,d,e,f] for one layer's transform (same order as transform() in the runtime)
function matrix(v,oR,oS){
  if(!v)return null;const r=v.r*Math.PI/180,cs=Math.cos(r),sn=Math.sin(r),kx=1+v.s+v.sx,ky=1+v.s+v.sy;
  // p' = T(t) · R(about oR) · S(about oS) · p
  const sx=x=>oS[0]+(x-oS[0])*kx,sy=y=>oS[1]+(y-oS[1])*ky;
  return(x,y)=>{const X=sx(x),Y=sy(y),dx=X-oR[0],dy=Y-oR[1];return[oR[0]+dx*cs-dy*sn+v.tx,oR[1]+dx*sn+dy*cs+v.ty]};
}

class Canvas{
  constructor(w,h,bg){this.w=w;this.h=h;this.px=new Float32Array(w*h*4);this.cov=new Float32Array(w*h);this.bg=bg;this.clear()}
  clear(){const p=this.px;if(this.bg){for(let i=0;i<p.length;i+=4){p[i]=this.bg[0];p[i+1]=this.bg[1];p[i+2]=this.bg[2];p[i+3]=1}}else p.fill(0)}
  // composite the coverage buffer in colour c with opacity a (premultiplied "over"), alphaAt for gradients
  paint(c,a,box,alphaAt){const{w,px,cov}=this;
    for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){const i=y*w+x,k=cov[i];if(!k)continue;cov[i]=0;
      const al=Math.min(1,k)*a*(alphaAt?alphaAt(x+.5,y+.5):1),j=i*4,q=1-al;
      px[j]=c[0]*al+px[j]*q;px[j+1]=c[1]*al+px[j+1]*q;px[j+2]=c[2]*al+px[j+2]*q;px[j+3]=al+px[j+3]*q}}
  fill(polys){const{w,h,cov}=this,edges=[];let x0=w,x1=0,y0=h,y1=0;
    for(const q of polys){const p=q.pts,n=p.length/2;for(let i=0;i<n;i++){const j=(i+1)%n;if(j===0&&n<3)break;
        const ax=p[i*2],ay=p[i*2+1],bx=p[j*2],by=p[j*2+1];x0=Math.min(x0,ax);x1=Math.max(x1,ax);y0=Math.min(y0,ay);y1=Math.max(y1,ay);
        if(ay!==by)edges.push(ay<by?[ax,ay,bx,by,1]:[bx,by,ax,ay,-1])}}
    if(!edges.length)return null;
    const box=[Math.max(0,Math.floor(x0)),Math.max(0,Math.floor(y0)),Math.min(w,Math.ceil(x1)+1),Math.min(h,Math.ceil(y1)+1)];
    const SUB=4,xs=[];
    for(let y=box[1];y<box[3];y++)for(let s=0;s<SUB;s++){const sy=y+(s+.5)/SUB;xs.length=0;
      for(const e of edges)if(sy>=e[1]&&sy<e[3])xs.push([e[0]+(sy-e[1])/(e[3]-e[1])*(e[2]-e[0]),e[4]]);
      if(xs.length<2)continue;xs.sort((a,b)=>a[0]-b[0]);let wn=0;
      for(let i=0;i<xs.length-1;i++){wn+=xs[i][1];if(!wn)continue;
        let a=Math.max(0,xs[i][0]),b=Math.min(w,xs[i+1][0]);if(b<=a)continue;
        const ia=Math.floor(a),ib=Math.floor(b),row=y*w;
        if(ia===ib){cov[row+ia]+=(b-a)/SUB;continue}
        cov[row+ia]+=(ia+1-a)/SUB;for(let x=ia+1;x<ib;x++)cov[row+x]+=1/SUB;if(ib<w)cov[row+ib]+=(b-ib)/SUB}}
    return box}
  stroke(polys,width){const{w,h,cov}=this,r=width/2;let box=null;
    // coverage is the max over segments, so joins and overlaps never darken twice (like a real stroke)
    const seg=(ax,ay,bx,by)=>{const x0=Math.max(0,Math.floor(Math.min(ax,bx)-r-1)),x1=Math.min(w,Math.ceil(Math.max(ax,bx)+r+1)),y0=Math.max(0,Math.floor(Math.min(ay,by)-r-1)),y1=Math.min(h,Math.ceil(Math.max(ay,by)+r+1));
      if(x0>=x1||y0>=y1)return;box=box?[Math.min(box[0],x0),Math.min(box[1],y0),Math.max(box[2],x1),Math.max(box[3],y1)]:[x0,y0,x1,y1];
      const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;
      for(let y=y0;y<y1;y++){const py=y+.5;for(let x=x0;x<x1;x++){const px=x+.5;let t=L?((px-ax)*dx+(py-ay)*dy)/L:0;t=t<0?0:t>1?1:t;
          const d=Math.hypot(px-ax-t*dx,py-ay-t*dy),k=r-d+.5;if(k<=0)continue;const i=y*w+x,v=k>1?1:k;if(v>cov[i])cov[i]=v}}};
    for(const q of polys){const p=q.pts,n=p.length/2;if(n===1){seg(p[0],p[1],p[0],p[1]);continue}
      for(let i=0;i<n-1;i++)seg(p[i*2],p[i*2+1],p[i*2+2],p[i*2+3]);if(q.closed)seg(p[n*2-2],p[n*2-1],p[0],p[1])}
    return box}
}

// render(MG, icon, opts) -> {width, height, fps, frames:[Uint8ClampedArray RGBA], delays:[seconds]}
//   opts: size (px, default 256), style, color, secondary, background ('transparent' default), pad (icon units, default 2.5),
//         fps (default 50), hold (seconds shown still after the motion, default .6), lead (still before, default .15), loop (play count, informational)
function render(MG,ic,o){
  o=o||{};const style=o.style||'outline',size=Math.max(16,Math.min(2048,o.size||256)),pad=o.pad===undefined?2.5:o.pad,fps=o.fps||50;
  const bg=hex(o.background||'transparent',null),col=hex(o.color||'#000000'),sec=o.secondary?hex(o.secondary):null;
  const geo=geometry(ic,style,{color:col,secondary:sec,bg:bg||[1,1,1],secondaryOpacity:o.secondaryOpacity});
  const org=MG.origins(ic),k=size/(24+pad*2),Z=null;
  const samples=sample(MG,ic,fps,o.maxSeconds);
  const cv=new Canvas(size,size,bg),frames=[];
  const toPx=(x,y)=>[(x+pad)*k,(y+pad)*k];
  for(const f of samples){cv.clear();
    for(const g of geo){const v=f[g.layer]||Z,oR=org[g.layer+'|r']||org[g.layer+'|s']||[12,12],oS=org[g.layer+'|s']||org[g.layer+'|r']||[12,12],M=matrix(v,oR,oS);
      const polys=g.polys.map(q=>{const p=q.pts,out=new Array(p.length);for(let i=0;i<p.length;i+=2){const t=M?M(p[i],p[i+1]):[p[i],p[i+1]],r=toPx(t[0],t[1]);out[i]=r[0];out[i+1]=r[1]}return{pts:out,closed:q.closed}});
      const sw=STROKE_W*k*(v?Math.sqrt(Math.abs((1+v.s+v.sx)*(1+v.s+v.sy))):1);
      const box=g.t==='fill'?cv.fill(polys):cv.stroke(polys,sw);if(!box)continue;
      let alphaAt=null;
      // glass: the runtime's gradient runs corner to corner of each shape, from .8 to .12 opacity
      if(g.glass){let a=1/0,b=1/0,c=-1/0,d=-1/0;for(const q of polys)for(let i=0;i<q.pts.length;i+=2){a=Math.min(a,q.pts[i]);c=Math.max(c,q.pts[i]);b=Math.min(b,q.pts[i+1]);d=Math.max(d,q.pts[i+1])}
        alphaAt=(x,y)=>{const u=c>a?(x-a)/(c-a):0,w=d>b?(y-b)/(d-b):0,t=Math.max(0,Math.min(1,(u+w)/2));return .8+(.12-.8)*t}}
      cv.paint(g.c,g.a,box,alphaAt)}
    const out=new Uint8ClampedArray(size*size*4),p=cv.px;
    // un-premultiply for the encoders
    for(let i=0;i<p.length;i+=4){const a=p[i+3];if(a<=0){out[i+3]=0;continue}out[i]=p[i]/a*255+.5;out[i+1]=p[i+1]/a*255+.5;out[i+2]=p[i+2]/a*255+.5;out[i+3]=a*255+.5}
    frames.push(out)}
  // timing: a short still lead-in, the motion, then a hold on the final pose
  const lead=o.lead===undefined?.15:o.lead,hold=o.hold===undefined?.6:o.hold,delays=frames.map(()=>1/fps);
  delays[0]+=lead;
  // the springs settle long after the eye stops seeing movement: frames that look the same as the final pose become the hold
  const last=frames[frames.length-1],near=f=>{for(let i=0;i<f.length;i++)if(Math.abs(f[i]-last[i])>3)return false;return true};
  while(frames.length>2&&near(frames[frames.length-2])){frames.splice(frames.length-2,1);delays.splice(delays.length-2,1)}
  delays[delays.length-1]+=hold;
  return{width:size,height:size,fps,frames,delays,lead};
}
module.exports={render,geometry,sample,flatten,hex};
