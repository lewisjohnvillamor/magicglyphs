// Magic Glyphs for Vue 3. Usage: <MagicGlyph name="heart" variant="duotone" trigger="hover" :size="32" label="Like" />
const {h,ref,computed,onMounted,onBeforeUnmount,watch,defineComponent}=require('vue');const MG=require('../web/runtime.js');
const MagicGlyph=defineComponent({name:'MagicGlyph',
  props:{name:{type:String,required:true},variant:{type:String,default:'outline'},size:{type:[Number,String],default:24},trigger:{type:String,default:'hover'},label:String,sound:Boolean,soundOptions:Object},
  setup(props,{expose}){
    const el=ref(null);let player=null;
    const html=computed(()=>MG.svg(props.name,{style:props.variant,size:props.size,title:props.label}));
    const bind=()=>{if(el.value)player=MG.attach(el.value,props.name)};
    const play=()=>player&&player.play();
    let io=null;
    onMounted(()=>{bind();if(props.trigger==='load')play();
      if(props.trigger==='visible'&&typeof IntersectionObserver!=='undefined'&&el.value){io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){play();io.disconnect();io=null}}));io.observe(el.value)}});
    onBeforeUnmount(()=>{if(io)io.disconnect()});
    watch(html,()=>Promise.resolve().then(bind));
    expose({play});
    return()=>{const so={};if(props.soundOptions)for(const k of ['sound','volume','pitch','speed','tone','pan','move','delay','src'])if(props.soundOptions[k]!==undefined)so['sound-'+(k==='sound'?'name':k)]=String(props.soundOptions[k]);return h('span',{...so,ref:el,sound:props.sound?'':undefined,style:{display:'inline-flex'},innerHTML:html.value,
      onMouseenter:props.trigger==='hover'?play:undefined,onFocusin:props.trigger==='hover'?play:undefined,onClick:props.trigger==='hover'||props.trigger==='click'?play:undefined})};
  }});
// A speaker button visitors use to turn icon sounds on or off; their choice is remembered in the browser.
const SoundToggle=defineComponent({name:'SoundToggle',props:{defaultOn:Boolean,size:{type:[Number,String],default:20},labelOn:String,labelOff:String,showLabel:Boolean},
  setup(props){return()=>h('magic-glyphs-sound-toggle',{default:props.defaultOn?'on':'off',size:String(props.size),'label-on':props.labelOn,'label-off':props.labelOff,'show-label':props.showLabel?'':undefined})}});
module.exports={MagicGlyph,SoundToggle,register:MG.register,sound:MG.sound};
