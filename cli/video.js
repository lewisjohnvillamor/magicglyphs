// WebM and MP4 export for the command line. Video encoding needs ffmpeg, which this calls directly
// (an argument list, never a shell). It is only loaded for --format webm or mp4.
// Without ffmpeg, the icon maker at https://magicglyphs.com/maker/ exports the same videos in the browser.
const fs=require('fs'),os=require('os'),path=require('path');
const M=require('../tools/motion.js');

function findFfmpeg(){
  const env=process.env.MAGIC_GLYPHS_FFMPEG;if(env)return env;
  const exe=process.platform==='win32'?'ffmpeg.exe':'ffmpeg';
  for(const dir of (process.env.PATH||'').split(path.delimiter)){const p=path.join(dir,exe);try{if(fs.statSync(p).isFile())return p}catch(e){}}
  return null;
}
async function video(L,name,format,o){
  const ff=findFfmpeg();
  if(!ff)throw new Error('WebM and MP4 export needs ffmpeg (https://ffmpeg.org: winget install ffmpeg, brew install ffmpeg or apt install ffmpeg).\nOr export the video in your browser: https://magicglyphs.com/maker/ (open the icon, then Export > MP4 or WebM).\nGIF and APNG need nothing extra: --format gif or --format apng.');
  const r=M.frames(L,name,format,o),fps=r.fps,W=r.width,H=r.height;
  // constant frame rate: each frame repeats for as long as it is shown
  const seq=[];r.frames.forEach((f,i)=>{for(let k=Math.max(1,Math.round(r.delays[i]*fps));k>0;k--)seq.push(f)});
  const seconds=seq.length/fps,snd=o.sound===false?null:await M.soundtrack(L,name,seconds,r.lead);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'magic-glyphs-')),out=path.join(tmp,'out.'+format);
  const args=['-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',W+'x'+H,'-r',String(fps),'-i','pipe:0'];
  if(snd){const wav=path.join(tmp,'sound.wav');fs.writeFileSync(wav,wavFile(snd.pcm,snd.sr));args.push('-i',wav)}
  if(format==='mp4')args.push('-c:v','libx264','-pix_fmt','yuv420p','-preset','veryfast','-crf','18','-movflags','+faststart',...(snd?['-c:a','aac','-b:a','160k']:[]));
  else args.push('-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','30','-row-mt','1','-deadline','good',...(snd?['-c:a','libopus','-b:a','128k']:[]));
  args.push('-shortest',out);
  const{spawn}=require('child_process');
  await new Promise((ok,no)=>{const p=spawn(ff,args,{stdio:['pipe','ignore','pipe'],shell:false});let err='';
    p.stderr.on('data',d=>{err+=d});p.on('error',e=>no(new Error('Could not start ffmpeg: '+e.message)));
    p.on('close',c=>c===0?ok():no(new Error('ffmpeg could not encode the video'+(err?': '+err.trim().split('\n').pop():'.'))));
    p.stdin.on('error',()=>{});
    (async()=>{for(const f of seq){if(!p.stdin.write(Buffer.from(f.buffer,f.byteOffset,f.byteLength)))await new Promise(r=>p.stdin.once('drain',r))}p.stdin.end()})()});
  const data=fs.readFileSync(out);fs.rmSync(tmp,{recursive:true,force:true});return data;
}
function wavFile(pcm,sr){const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+pcm.length,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(2,22);
  h.writeUInt32LE(sr,24);h.writeUInt32LE(sr*4,28);h.writeUInt16LE(4,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);return Buffer.concat([h,pcm])}
module.exports={video,findFfmpeg};
