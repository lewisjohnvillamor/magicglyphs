// A small offline audio renderer for Node, so the command line tool can write an icon's sound to a WAV file.
// It implements just the Web Audio nodes the Magic Glyphs sounds use (oscillator, noise buffer, biquad filter,
// gain, stereo panner) and follows the Web Audio specification for their maths, so files match the browser closely.
class Param{constructor(v){this.value=v;this.ev=[]}
  setValueAtTime(v,t){this.ev.push({x:'s',t,v});this.ev.sort((a,b)=>a.t-b.t);return this}
  exponentialRampToValueAtTime(v,t){this.ev.push({x:'e',t,v});this.ev.sort((a,b)=>a.t-b.t);return this}
  linearRampToValueAtTime(v,t){this.ev.push({x:'l',t,v});this.ev.sort((a,b)=>a.t-b.t);return this}
  at(t){let pt=0,pv=this.value;for(const e of this.ev){if(e.t<=t){pt=e.t;pv=e.v;continue}
      if(e.x==='s')break;const f=(t-pt)/Math.max(e.t-pt,1e-9);
      return e.x==='e'&&pv>0&&e.v>0?pv*Math.pow(e.v/pv,f):pv+(e.v-pv)*f}return pv}}
class Node{constructor(c){this.c=c;this.ins=[];this.i=-1;this.y=0}connect(d){d.ins.push(this);return d}disconnect(){}
  sum(i){let s=0;for(const n of this.ins){const v=n.pull(i);s+=Array.isArray(v)?(v[0]+v[1])/2:v}return s}
  pull(i){if(this.i!==i){this.i=i;this.y=this.run(i)}return this.y}}
class Gain extends Node{constructor(c){super(c);this.gain=new Param(1)}run(i){return this.sum(i)*this.gain.at(i/this.c.sampleRate)}}
class Osc extends Node{constructor(c){super(c);this.frequency=new Param(440);this.type='sine';this.ph=0;this.t0=Infinity;this.t1=Infinity}
  start(t){this.t0=t||0}stop(t){this.t1=t}
  run(i){const sr=this.c.sampleRate,t=i/sr;if(t<this.t0||t>=this.t1)return 0;const p=this.ph;this.ph=(p+this.frequency.at(t)/sr)%1;
    switch(this.type){case 'square':return p<.5?1:-1;case 'sawtooth':return 2*p-1;case 'triangle':return p<.5?4*p-1:3-4*p;default:return Math.sin(2*Math.PI*p)}}}
class Src extends Node{constructor(c){super(c);this.buffer=null;this.loop=false;this.t0=Infinity;this.t1=Infinity}start(t){this.t0=t||0}stop(t){this.t1=t}
  run(i){const sr=this.c.sampleRate,t=i/sr;if(!this.buffer||t<this.t0||t>=this.t1)return 0;const d=this.buffer.getChannelData(0),k=i-Math.round(this.t0*sr);
    return this.loop?d[k%d.length]:k<d.length?d[k]:0}}
class Biquad extends Node{constructor(c){super(c);this.type='lowpass';this.frequency=new Param(350);this.Q=new Param(1);this.gain=new Param(0);this.x1=this.x2=this.y1=this.y2=0;this.k=null}
  coef(t){const sr=this.c.sampleRate,f=Math.min(this.frequency.at(t),sr/2-1),w=2*Math.PI*f/sr,cs=Math.cos(w),sn=Math.sin(w),Q=this.Q.at(t),G=this.gain.at(t);let b0,b1,b2,a0,a1,a2;
    if(this.type==='bandpass'){const al=sn/(2*Math.max(Q,1e-4));b0=al;b1=0;b2=-al;a0=1+al;a1=-2*cs;a2=1-al}
    else if(this.type==='highshelf'){const A=Math.pow(10,G/40),al=sn/2*Math.sqrt(2),sq=2*Math.sqrt(A)*al;b0=A*((A+1)+(A-1)*cs+sq);b1=-2*A*((A-1)+(A+1)*cs);b2=A*((A+1)+(A-1)*cs-sq);a0=(A+1)-(A-1)*cs+sq;a1=2*((A-1)-(A+1)*cs);a2=(A+1)-(A-1)*cs-sq}
    else{const al=sn/(2*Math.pow(10,Q/20));b0=(1-cs)/2;b1=1-cs;b2=(1-cs)/2;a0=1+al;a1=-2*cs;a2=1-al}// lowpass (Q in dB, as Web Audio defines it)
    return[b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]}
  run(i){if(!this.k||i%16===0)this.k=this.coef(i/this.c.sampleRate);const [b0,b1,b2,a1,a2]=this.k,x=this.sum(i),y=b0*x+b1*this.x1+b2*this.x2-a1*this.y1-a2*this.y2;
    this.x2=this.x1;this.x1=x;this.y2=this.y1;this.y1=y;return y}}
class Pan extends Node{constructor(c){super(c);this.pan=new Param(0)}run(i){const x=this.sum(i),p=(Math.max(-1,Math.min(1,this.pan.at(i/this.c.sampleRate)))+1)/2;return[x*Math.cos(p*Math.PI/2),x*Math.sin(p*Math.PI/2)]}}
class Dest extends Node{}
class OfflineContext{
  constructor(ch,len,sr){this.length=len;this.sampleRate=sr;this.currentTime=0;this.destination=new Dest(this)}
  createGain(){return new Gain(this)}createOscillator(){return new Osc(this)}createBufferSource(){return new Src(this)}createBiquadFilter(){return new Biquad(this)}createStereoPanner(){return new Pan(this)}
  createBuffer(ch,len,sr){const d=Array.from({length:ch},()=>new Float32Array(len));return{sampleRate:sr,length:len,numberOfChannels:ch,getChannelData:k=>d[k]}}
  startRendering(){const n=this.length,L=new Float32Array(n),R=new Float32Array(n);
    for(let i=0;i<n;i++){let l=0,r=0;for(const s of this.destination.ins){const v=s.pull(i);if(Array.isArray(v)){l+=v[0];r+=v[1]}else{l+=v;r+=v}}L[i]=l;R[i]=r}
    const sr=this.sampleRate;return Promise.resolve({sampleRate:sr,length:n,numberOfChannels:2,duration:n/sr,getChannelData:k=>k?R:L})}}
// render an icon's sound (with its settings, or overrides) to WAV bytes
async function wav(MG,name,opts){const buf=await MG.sound.render(name,opts||{},OfflineContext);return Buffer.from(MG.sound.wav(buf))}
module.exports={OfflineContext,wav};
