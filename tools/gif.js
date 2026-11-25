// A small animated GIF encoder (no dependencies; runs in Node and in browsers).
// encode({width, height, frames:[RGBA], delays:[seconds], loop:0 forever | n, background:[r,g,b] 0..255 or null for transparent})
// GIF has one bit of transparency, so transparent exports blend soft edges onto `matte` (default white) and keep
// pixels at least half covered. With a background, unchanged areas between frames are skipped to keep files small.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MGGif=factory()})(this,function(){
  // median cut on a 5-bit-per-channel histogram, at most `max` colours
  function palette(hist,max){
    let boxes=[{c:[]}];for(let i=0;i<hist.length;i++)if(hist[i])boxes[0].c.push(i);
    if(!boxes[0].c.length)return[[0,0,0]];
    const ch=(i,k)=>k===0?i>>10:k===1?(i>>5)&31:i&31;
    const range=b=>{let best=-1,bk=0;for(let k=0;k<3;k++){let lo=99,hi=-1;for(const i of b.c){const v=ch(i,k);if(v<lo)lo=v;if(v>hi)hi=v}if(hi-lo>best){best=hi-lo;bk=k}}return[best,bk]};
    while(boxes.length<max){let bi=-1,bv=0;boxes.forEach((b,i)=>{if(b.c.length<2)return;const r=range(b),w=r[0]*Math.log2(1+b.c.reduce((s,i)=>s+hist[i],0));if(r[0]>0&&w>bv){bv=w;bi=i}});
      if(bi<0)break;const b=boxes[bi],k=range(b)[1];b.c.sort((x,y)=>ch(x,k)-ch(y,k));
      const tot=b.c.reduce((s,i)=>s+hist[i],0);let acc=0,cut=1;for(let j=0;j<b.c.length-1;j++){acc+=hist[b.c[j]];if(acc>=tot/2){cut=j+1;break}}
      boxes.splice(bi,1,{c:b.c.slice(0,cut)},{c:b.c.slice(cut)})}
    return boxes.map(b=>{let n=0,r=0,g=0,bl=0;for(const i of b.c){const w=hist[i];n+=w;r+=(i>>10)*w;g+=((i>>5)&31)*w;bl+=(i&31)*w}return[r/n*255/31+.5|0,g/n*255/31+.5|0,bl/n*255/31+.5|0]});
  }
  function lzw(idx,minBits){
    const out=[];let cur=0,bits=0;const put=(code,size)=>{cur|=code<<bits;bits+=size;while(bits>=8){out.push(cur&255);cur>>=8;bits-=8}};
    const clear=1<<minBits,eoi=clear+1;let size=minBits+1,next=eoi+1,dict=new Map();
    put(clear,size);let w=idx[0];
    for(let i=1;i<idx.length;i++){const k=idx[i],key=w*4096+k,hit=dict.get(key);
      if(hit!==undefined){w=hit;continue}
      put(w,size);
      if(next<4096){dict.set(key,next++);if(next>(1<<size)&&size<12)size++}
      else{put(clear,size);dict=new Map();size=minBits+1;next=eoi+1}
      w=k}
    put(w,size);put(eoi,size);if(bits>0)out.push(cur&255);
    const blocks=[];for(let i=0;i<out.length;i+=255){const n=Math.min(255,out.length-i);blocks.push(n);for(let j=0;j<n;j++)blocks.push(out[i+j])}blocks.push(0);return blocks;
  }
  function encode(o){
    const W=o.width,H=o.height,bg=o.background||null,matte=o.matte||[255,255,255],N=W*H;
    // flatten every frame to opaque colours (or "transparent") first
    const flat=o.frames.map(f=>{const c=new Int32Array(N);for(let i=0,j=0;i<N;i++,j+=4){const a=f[j+3]/255;
        if(bg){c[i]=((f[j]*a+bg[0]*(1-a))>>3<<10)|((f[j+1]*a+bg[1]*(1-a))>>3<<5)|((f[j+2]*a+bg[2]*(1-a))>>3)}
        else if(a<.5)c[i]=-1;else c[i]=((f[j]*a+matte[0]*(1-a))>>3<<10)|((f[j+1]*a+matte[1]*(1-a))>>3<<5)|((f[j+2]*a+matte[2]*(1-a))>>3)}return c});
    const hist=new Uint32Array(32768);for(const c of flat)for(let i=0;i<N;i++)if(c[i]>=0)hist[c[i]]++;
    const pal=palette(hist,bg?256:255),T=bg?-1:pal.length,cache=new Int16Array(32768).fill(-1);
    const near=k=>{if(cache[k]>=0)return cache[k];const r=(k>>10)*255/31,g=((k>>5)&31)*255/31,b=(k&31)*255/31;let bi=0,bd=1e9;
      pal.forEach((p,i)=>{const d=(p[0]-r)**2*.3+(p[1]-g)**2*.59+(p[2]-b)**2*.11;if(d<bd){bd=d;bi=i}});return cache[k]=bi};
    let n=pal.length+(bg?0:1),bitsz=1;while((1<<bitsz)<n)bitsz++;const PS=1<<bitsz;
    const B=[];const s=t=>{for(let i=0;i<t.length;i++)B.push(t.charCodeAt(i))},u16=v=>B.push(v&255,v>>8);
    s('GIF89a');u16(W);u16(H);B.push(0xF0|(bitsz-1),0,0);
    for(let i=0;i<PS;i++){const p=pal[i]||[0,0,0];B.push(p[0],p[1],p[2])}
    const loop=o.loop===undefined?0:o.loop;if(loop!==1){B.push(0x21,0xFF,11);s('NETSCAPE2.0');B.push(3,1);u16(loop===0?0:loop-1);B.push(0)}
    let prev=null;
    flat.forEach((c,fi)=>{
      let x0=0,y0=0,x1=W,y1=H;
      // with a solid background only the changed rectangle is written
      if(bg&&prev){x0=W;y0=H;x1=0;y1=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(c[i]!==prev[i]){if(x<x0)x0=x;if(x>=x1)x1=x+1;if(y<y0)y0=y;if(y>=y1)y1=y+1}}if(x1<=x0){x0=0;y0=0;x1=1;y1=1}}
      const cs=Math.max(2,Math.round((o.delays[fi]||.02)*100));
      B.push(0x21,0xF9,4,(bg?1:2)<<2|(bg?0:1));u16(cs);B.push(bg?0:T,0);
      B.push(0x2C);u16(x0);u16(y0);u16(x1-x0);u16(y1-y0);B.push(0);
      const idx=new Uint8Array((x1-x0)*(y1-y0));let k=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=c[y*W+x];idx[k++]=v<0?T:near(v)}
      const mb=Math.max(2,bitsz);B.push(mb);const data=lzw(idx,mb);for(let i=0;i<data.length;i++)B.push(data[i]);
      prev=c});
    B.push(0x3B);return new Uint8Array(B);
  }
  return{encode};
});
