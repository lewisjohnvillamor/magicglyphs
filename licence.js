// Licence keys for Magic Glyphs. A key is "MG1.<payload>.<signature>": the payload is base64url JSON
// ({id,email,plan,seats,issued,expires}) and the signature is Ed25519 over "MG1.<payload>".
// Keys are checked offline against the public key in data/licence-public.pem; only the seller holds the private key.
const crypto=require('crypto'),fs=require('fs'),path=require('path'),os=require('os');
const PUB=path.join(__dirname,'data','licence-public.pem');
const FREE=new Set(JSON.parse(fs.readFileSync(path.join(__dirname,'data','free.json'),'utf8')));
const PLANS=['personal','team','business'];
const enc=b=>Buffer.from(b).toString('base64url'),dec=s=>Buffer.from(s,'base64url');
const home=()=>process.env.MAGIC_GLYPHS_HOME||path.join(os.homedir(),'.magic-glyphs');
const storeFile=()=>path.join(home(),'licence.json');
function keygen(){const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');
  return{publicPem:publicKey.export({type:'spki',format:'pem'}),privatePem:privateKey.export({type:'pkcs8',format:'pem'})}}
function issue(payload,privatePem){
  if(!payload||!payload.email||!/^\S+@\S+\.\S+$/.test(payload.email))throw new Error('A licence needs a valid email.');
  if(!PLANS.includes(payload.plan))throw new Error('Plan must be one of: '+PLANS.join(', '));
  const p=Object.assign({id:crypto.randomBytes(6).toString('hex'),seats:payload.plan==='personal'?1:payload.plan==='team'?10:50,issued:new Date().toISOString().slice(0,10)},payload);
  const head='MG1.'+enc(JSON.stringify(p));
  return head+'.'+enc(crypto.sign(null,Buffer.from(head),crypto.createPrivateKey(privatePem)));}
function verify(key,publicPem){
  if(typeof key!=='string')return{ok:false,reason:'No licence key.'};
  const m=key.trim().match(/^MG1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);if(!m)return{ok:false,reason:'That does not look like a Magic Glyphs licence key.'};
  let pub;try{pub=crypto.createPublicKey(publicPem||fs.readFileSync(PUB,'utf8'))}catch(e){return{ok:false,reason:'This copy has no licence public key installed.'}}
  let good=false;try{good=crypto.verify(null,Buffer.from('MG1.'+m[1]),pub,dec(m[2]))}catch(e){}
  if(!good)return{ok:false,reason:'The licence key signature is not valid.'};
  let payload;try{payload=JSON.parse(dec(m[1]).toString('utf8'))}catch(e){return{ok:false,reason:'The licence key is damaged.'}}
  if(payload.expires&&payload.expires<new Date().toISOString().slice(0,10))return{ok:false,reason:'This licence expired on '+payload.expires+'.',payload};
  return{ok:true,payload};}
function storedKey(){if(process.env.MAGIC_GLYPHS_KEY)return process.env.MAGIC_GLYPHS_KEY;try{return JSON.parse(fs.readFileSync(storeFile(),'utf8')).key}catch(e){return null}}
function current(){const k=storedKey();return k?verify(k):{ok:false,reason:'No licence key. Run: magic-glyphs login YOUR-KEY'}}
function login(key){const r=verify(key);if(!r.ok)throw new Error(r.reason);fs.mkdirSync(home(),{recursive:true});fs.writeFileSync(storeFile(),JSON.stringify({key:key.trim()}),{mode:0o600});return r.payload}
// a random id for this computer, so the licence server can count devices; it holds nothing about the machine or the person
function deviceId(){const f=path.join(home(),'device');try{const d=fs.readFileSync(f,'utf8').trim();if(/^[A-Za-z0-9_-]{8,64}$/.test(d))return d}catch(e){}
  const d=crypto.randomBytes(16).toString('base64url');try{fs.mkdirSync(home(),{recursive:true});fs.writeFileSync(f,d)}catch(e){}return d}
function logout(){try{fs.unlinkSync(storeFile());return true}catch(e){return false}}
const isFree=n=>FREE.has(n);
// names the caller may not export yet; empty when licensed or when every name is in the free set
function locked(names){const paid=names.filter(n=>!FREE.has(n));if(!paid.length)return[];return current().ok?[]:paid}
function lockedMessage(paid){return (paid.length===1?'"'+paid[0]+'" is':paid.length+' of these icons are')+' in the paid set. '+current().reason.replace(/^No licence key\. /,'')+(paid.length>1&&paid.length<=8?' Paid: '+paid.join(', ')+'.':'')+' Free icons: magic-glyphs list --free'+buyLine()}
function buyLine(){let u=process.env.MAGIC_GLYPHS_BUY;if(!u)try{u=(require('./package.json').magicGlyphs||{}).buy}catch(e){}return u?'\nBuy a licence: '+u+'  (or run: npx magic-glyphs buy)':''}
module.exports={home,FREE,PLANS,keygen,issue,verify,current,login,logout,isFree,locked,lockedMessage,storeFile,deviceId};
