// A small animated PNG (APNG) encoder: full alpha, exact timing, no dependencies.
// encode({width, height, frames:[RGBA], delays:[seconds], loop}, deflate) -> Promise<Uint8Array>
// `deflate(bytes)` must return zlib-format data (Node: zlib.deflateSync; browsers: CompressionStream('deflate')).
// Frames that repeat the previous one are merged into a longer delay.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MGApng=factory()})(this,function(){
  const CRC=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CRC[n]=c>>>0}
  const crc=(b)=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
  function chunk(type,data){const out=new Uint8Array(12+data.length),v=new DataView(out.buffer);v.setUint32(0,data.length);
    for(let i=0;i<4;i++)out[4+i]=type.charCodeAt(i);out.set(data,8);v.setUint32(8+data.length,crc(out.subarray(4,8+data.length)));return out}
  const u32=(v,a,o)=>new DataView(a.buffer).setUint32(o,v),u16=(v,a,o)=>new DataView(a.buffer).setUint16(o,v);
  function same(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}
  // PNG rows with the "sub" filter (good for flat icon art)
  function rows(f,W,H){const out=new Uint8Array(H*(W*4+1));for(let y=0;y<H;y++){const o=y*(W*4+1),s=y*W*4;out[o]=1;
      for(let x=0;x<W*4;x++)out[o+1+x]=(f[s+x]-(x>=4?f[s+x-4]:0))&255}return out}
  async function encode(o,deflate){
    const W=o.width,H=o.height,fr=[],dl=[];
    o.frames.forEach((f,i)=>{if(fr.length&&same(f,fr[fr.length-1]))dl[dl.length-1]+=o.delays[i];else{fr.push(f);dl.push(o.delays[i])}});
    const parts=[new Uint8Array([137,80,78,71,13,10,26,10])];
    const ih=new Uint8Array(13);u32(W,ih,0);u32(H,ih,4);ih[8]=8;ih[9]=6;parts.push(chunk('IHDR',ih));
    const ac=new Uint8Array(8);u32(fr.length,ac,0);u32(o.loop===undefined?0:o.loop,ac,4);parts.push(chunk('acTL',ac));
    let seq=0;
    for(let i=0;i<fr.length;i++){
      // after the first frame only the rectangle that changed is stored; it replaces those pixels (blend "source")
      let x0=0,y0=0,x1=W,y1=H;
      if(i>0){const a=fr[i],b=fr[i-1];x0=W;y0=H;x1=0;y1=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const j=(y*W+x)*4;if(a[j]!==b[j]||a[j+1]!==b[j+1]||a[j+2]!==b[j+2]||a[j+3]!==b[j+3]){if(x<x0)x0=x;if(x>=x1)x1=x+1;if(y<y0)y0=y;if(y>=y1)y1=y+1}}}
      const cw=x1-x0,chh=y1-y0,sub=new Uint8Array(cw*chh*4);for(let y=0;y<chh;y++)sub.set(fr[i].subarray(((y0+y)*W+x0)*4,((y0+y)*W+x1)*4),y*cw*4);
      const fc=new Uint8Array(26);u32(seq++,fc,0);u32(cw,fc,4);u32(chh,fc,8);u32(x0,fc,12);u32(y0,fc,16);
      // delay as a fraction of a second in milliseconds
      u16(Math.max(1,Math.round(dl[i]*1000)),fc,20);u16(1000,fc,22);fc[24]=0;fc[25]=0;parts.push(chunk('fcTL',fc));
      const z=await deflate(rows(sub,cw,chh));
      if(i===0)parts.push(chunk('IDAT',z));else{const d=new Uint8Array(4+z.length);u32(seq++,d,0);d.set(z,4);parts.push(chunk('fdAT',d))}}
    parts.push(chunk('IEND',new Uint8Array(0)));
    let n=0;for(const p of parts)n+=p.length;const out=new Uint8Array(n);let k=0;for(const p of parts){out.set(p,k);k+=p.length}return out;
  }
  return{encode};
});
