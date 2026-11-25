// The motion of an icon pre-computed for platforms without a spring engine or a Lottie player:
// per layer, a 2D matrix [a,b,c,d,e,f] per frame (x' = a·x + c·y + e, y' = b·x + d·y + f), sampled at `fps`,
// plus what each path paints. Players step through the frames and interpolate between them.
const R=require('./raster.js');
const r3=v=>Math.round(v*1000)/1000;
function matrix(v,oR,oS){
  if(!v)return[1,0,0,1,0,0];
  const kx=1+v.s+v.sx,ky=1+v.s+v.sy,t=v.r*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
  // S about oS, then R about oR, then translate
  const S=[kx,0,0,ky,oS[0]*(1-kx),oS[1]*(1-ky)],Rm=[c,s,-s,c,oR[0]-c*oR[0]+s*oR[1],oR[1]-s*oR[0]-c*oR[1]];
  const mul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];
  const M=mul(Rm,S);M[4]+=v.tx;M[5]+=v.ty;return M.map(r3);
}
// paint per layer kind and style, as {fill, stroke, fillOpacity} with colour roles: 'fg' | 'bg' | 'sec' | null
function paint(style,k){
  if(k==='f')return{fill:'fg'};if(k==='d')return{fill:style==='solid'?'bg':'fg'};
  if(k==='o')return{stroke:'fg'};if(k==='i')return{stroke:style==='solid'?'bg':'fg'};
  if(style==='solid')return{fill:'fg',stroke:'fg'};if(style==='duotone')return{fill:'sec',fillOpacity:.18,stroke:'fg'};
  return{stroke:'fg'};
}
function bake(MG,ic,o){
  o=o||{};const fps=o.fps||30,style=o.style||'outline',org=MG.origins(ic),samples=R.sample(MG,ic,fps);
  const layers=ic.L.map(l=>{
    const oR=org[l.i+'|r']||org[l.i+'|s']||[12,12],oS=org[l.i+'|s']||org[l.i+'|r']||[12,12];
    const m=samples.map(f=>matrix(f[l.i],oR,oS)),still=m.every(x=>x.join()===m[0].join())&&m[0].join()==='1,0,0,1,0,0';
    return{id:l.i,paint:paint(style,l.k),paths:l.p.map(p=>({d:p.d,r:p.r||null,fill:p.f||null,polys:o.polys?R.flatten(p.d,p.r,.05).map(q=>({pts:q.pts.map(r3),closed:q.closed})):undefined})),m:still?null:m};
  });
  return{name:ic.n,fps,frames:samples.length,layers,sound:ic.s||null};
}
module.exports={bake,matrix,paint};
