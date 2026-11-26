'use client';
// Magic Glyphs for React. Usage: <MagicGlyph name="heart" variant="duotone" trigger="hover" size={32} label="Like" />
// Renders the SVG on the server and the client; animation attaches after mount.
const React=require('react');const MG=require('../web/runtime.js');
function MagicGlyph(props){
  const {name,variant='outline',size=24,trigger='hover',label,className,style,sound,soundOptions}=props;
  const ref=React.useRef(null),player=React.useRef(null);
  const html=React.useMemo(()=>MG.svg(name,{style:variant,size,title:label}),[name,variant,size,label]);
  React.useEffect(()=>{
    if(!ref.current)return;player.current=MG.attach(ref.current,name);
    if(trigger==='load')player.current.play();
    if(trigger==='visible'&&typeof IntersectionObserver!=='undefined'){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){player.current.play();io.disconnect()}}));io.observe(ref.current);return()=>io.disconnect()}
  },[html,trigger,name]);
  const play=()=>player.current&&player.current.play();
  React.useImperativeHandle(props.playerRef,()=>({play}),[]);
  const so={};if(soundOptions)for(const k of ['sound','volume','pitch','speed','tone','pan','move','delay','src'])if(soundOptions[k]!==undefined)so['sound-'+(k==='sound'?'name':k)]=String(soundOptions[k]);
  return React.createElement('span',{...so,ref,className,sound:sound?'':undefined,style:Object.assign({display:'inline-flex'},style),
    onMouseEnter:trigger==='hover'?play:undefined,onFocus:trigger==='hover'?play:undefined,onClick:trigger==='hover'||trigger==='click'?play:undefined,
    dangerouslySetInnerHTML:{__html:html}});
}
// A speaker button visitors use to turn icon sounds on or off; their choice is remembered in the browser.
function SoundToggle(props){const {defaultOn=false,size=20,labelOn,labelOff,showLabel,className,style}=props;
  return React.createElement('magic-glyphs-sound-toggle',{default:defaultOn?'on':'off',size:String(size),'label-on':labelOn,'label-off':labelOff,'show-label':showLabel?'':undefined,class:className,className,style,suppressHydrationWarning:true,
    // the element draws its own button, possibly before React hydrates; an empty innerHTML tells React not to compare or touch those children
    dangerouslySetInnerHTML:EMPTY})}
const EMPTY={__html:''};
module.exports={MagicGlyph,SoundToggle,register:MG.register,sound:MG.sound};
