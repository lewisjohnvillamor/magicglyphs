// Animated image and video exports for places that cannot run code: email, slides, Canva, Notion, chat emoji, social posts.
//   gif   works everywhere, one bit of transparency (soft edges are blended onto --matte or the background)
//   apng  full transparency and exact timing (Slack, Discord, browsers, Keynote)
//   webm  VP9 video with transparency and the sound baked in      } need ffmpeg on this computer
//   mp4   H.264 video with the sound baked in (solid background)  } (or export them from the icon maker)
const R=require('./raster.js');
const DEF={gif:{size:256,fps:50},apng:{size:128,fps:60},webm:{size:512,fps:60},mp4:{size:512,fps:60}};

function frames(L,name,format,o){
  const ic=L.byName.get(name),d=DEF[format];
  if((o.style||'outline')==='glass'&&format==='gif'&&!(o.background&&o.background!=='transparent'))throw new Error('GIF cannot hold the glass style\'s see-through gradient on a transparent background. Add --background, or use --format apng or webm.');
  const bg=o.background||(format==='mp4'?'#ffffff':'transparent');
  return R.render(L.MG,ic,{size:o.size||d.size,style:o.style,color:o.color||'#000000',secondary:o.secondary,background:bg,fps:d.fps,hold:o.hold,lead:o.lead});
}
const rgb=c=>{const h=R.hex(c,null);return h&&h.map(v=>Math.round(v*255))};

async function gif(L,name,o){const r=frames(L,name,'gif',o);
  return require('./gif.js').encode({width:r.width,height:r.height,frames:r.frames,delays:r.delays,loop:o.loop===undefined?0:+o.loop,background:o.background&&o.background!=='transparent'?rgb(o.background):null,matte:rgb(o.matte||'#ffffff')})}
async function apng(L,name,o){const r=frames(L,name,'apng',o),z=require('zlib');
  return require('./apng.js').encode({width:r.width,height:r.height,frames:r.frames,delays:r.delays,loop:o.loop===undefined?0:+o.loop},b=>z.deflateSync(b,{level:9}))}

// the icon's sound, placed where the motion starts, as 16-bit stereo PCM covering the whole clip
async function soundtrack(L,name,seconds,lead){
  const ic=L.byName.get(name);if(!ic||!ic.s)return null;
  const A=require('./audio.js'),buf=await L.MG.sound.render(name,{},A.OfflineContext),sr=buf.sampleRate,n=Math.ceil(seconds*sr),off=Math.round(lead*sr);
  const Lc=buf.getChannelData(0),Rc=buf.getChannelData(1),pcm=Buffer.alloc(n*4);
  for(let i=0;i<Lc.length&&i+off<n;i++){pcm.writeInt16LE(Math.max(-1,Math.min(1,Lc[i]))*32767|0,(i+off)*4);pcm.writeInt16LE(Math.max(-1,Math.min(1,Rc[i]))*32767|0,(i+off)*4+2)}
  return{pcm,sr};
}

module.exports={DEF,frames,gif,apng,soundtrack,FORMATS:['gif','apng','webm','mp4']};
