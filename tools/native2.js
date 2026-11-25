// More native targets. Most draw the icon's own vectors and play the motion baked by tools/baked.js,
// so they need no animation library: Qt Quick (QML), Avalonia, Godot, Rust. .NET MAUI and Compose Multiplatform use
// their usual Lottie players; Unity (and any game engine) gets a sprite sheet.
const B=require('./baked.js');
const pascal=(n)=>n.split(/[^a-z0-9]+/i).filter(Boolean).map((w)=>w[0].toUpperCase()+w.slice(1)).join('').replace(/^(\d)/,'Glyph$1');
const snake=(n)=>n.replace(/[^a-z0-9]+/gi,'_').toLowerCase().replace(/^(\d)/,'glyph_$1');
const num=(v)=>(Math.round(v*1000)/1000).toString();
const fl=(v)=>{const t=num(v);return /[.e]/.test(t)?t:t+'.0'};
const rot=(r)=>{if(!r)return null;const t=r[0]*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return[c,s,-s,c,r[1]-c*r[1]+s*r[2],r[2]-s*r[1]-c*r[2]].map(num)};
const colours=(o)=>({fg:o.color||'#000000',bg:o.background||'#ffffff',sec:o.secondary||o.color||'#000000'});

// ---------- Qt Quick (Qt 6.6+) ----------
function qml(ic,o){
  const b=B.bake(o.MG,ic,{style:o.style,fps:30}),P=pascal(ic.n),c=colours(o);
  const role=(r)=>r==='fg'?'root.color':r==='bg'?'root.background':'root.secondary';
  const M='['+b.layers.map(l=>l.m?'['+l.m.flat().map(num).join(',')+']':'null').join(',\n    ')+']';
  const shapes=b.layers.map((l,i)=>`        Item {
            width: 24; height: 24
            transform: Matrix4x4 { matrix: root.mat(${i}) }
${l.paths.map(p=>{const r=rot(p.r);return `            Shape {
                width: 24; height: 24; preferredRendererType: Shape.CurveRenderer${r?`
                transform: Matrix4x4 { matrix: Qt.matrix4x4(${r[0]}, ${r[2]}, 0, ${r[4]}, ${r[1]}, ${r[3]}, 0, ${r[5]}, 0, 0, 1, 0, 0, 0, 0, 1) }`:''}
                ShapePath {
                    strokeColor: ${l.paint.stroke?role(l.paint.stroke):'"transparent"'}; strokeWidth: ${l.paint.stroke?1.75:0}
                    capStyle: ShapePath.RoundCap; joinStyle: ShapePath.RoundJoin
                    fillColor: ${p.fill?JSON.stringify(p.fill):l.paint.fill?(l.paint.fillOpacity?`Qt.rgba(${role(l.paint.fill)}.r, ${role(l.paint.fill)}.g, ${role(l.paint.fill)}.b, ${l.paint.fillOpacity})`:role(l.paint.fill)):'"transparent"'}
                    PathSvg { path: ${JSON.stringify(p.d)} }
                }
            }`}).join('\n')}
        }`).join('\n');
  return{file:P+'Glyph.qml',text:`// Animated "${ic.n}" icon from Magic Glyphs for Qt Quick (Qt 6.6 or newer). No plugins or Lottie needed:
// it draws the icon's own vectors and plays its spring motion, pre-computed at ${b.fps} frames per second.
// Use: ${P}Glyph { size: 32; color: "#2747f5" }   Sound, optional: put ${ic.n}.wav next to this file and set sound: true (uses Qt Multimedia).
import QtQuick
import QtQuick.Shapes

Item {
    id: root
    property real size: 24
    property color color: ${JSON.stringify(c.fg)}
    property color background: ${JSON.stringify(c.bg)}   // knocked-out details in the solid style
    property color secondary: ${o.secondary?JSON.stringify(o.secondary):'color'}
    property string trigger: "hover"   // hover | click | none (call play() yourself)
    property bool sound: false
    property real frame: ${b.frames-1}
    readonly property int frames: ${b.frames}
    readonly property var motion: ${M}
    width: size; height: size

    property var fx: null
    // Qt Multimedia is only loaded when sound is on, so apps without it still work
    function play() {
        anim.restart();
        if (!sound) return;
        if (!fx) fx = Qt.createQmlObject('import QtMultimedia; SoundEffect { source: "' + Qt.resolvedUrl("${ic.n}.wav") + '" }', root);
        fx.play();
    }
    function mat(i) {
        var a = motion[i], t = frame;
        if (!a) return Qt.matrix4x4();
        var k = Math.floor(t), f = t - k, j = Math.min(k + 1, frames - 1);
        function v(n) { return a[k * 6 + n] + (a[j * 6 + n] - a[k * 6 + n]) * f }
        return Qt.matrix4x4(v(0), v(2), 0, v(4), v(1), v(3), 0, v(5), 0, 0, 1, 0, 0, 0, 0, 1);
    }
    NumberAnimation { id: anim; target: root; property: "frame"; from: 0; to: root.frames - 1; duration: ${Math.round((b.frames-1)/b.fps*1000)} }
    HoverHandler { onHoveredChanged: if (hovered && root.trigger === "hover") root.play() }
    TapHandler { onTapped: if (root.trigger !== "none") root.play() }

    Item {
        width: 24; height: 24
        transform: Scale { xScale: root.size / 24; yScale: root.size / 24 }
${shapes}
    }
}
`};
}

// ---------- Avalonia 11 ----------
function avalonia(ic,o){
  const b=B.bake(o.MG,ic,{style:o.style,fps:30}),P=pascal(ic.n),c=colours(o);
  const brush=(r,op)=>r?(op?`WithOpacity(${r==='fg'?'fg':r==='bg'?'bg':'sec'}, ${op})`:(r==='fg'?'fg':r==='bg'?'bg':'sec')):'null';
  const M=b.layers.map(l=>l.m?'new double[] { '+l.m.flat().map(num).join(', ')+' }':'null').join(',\n        ');
  const build=b.layers.map((l,i)=>`        _layers[${i}] = Layer(root${l.paths.map(p=>{const r=rot(p.r);return `,
            Shape(${JSON.stringify(p.d)}, ${p.fill?`Brush.Parse(${JSON.stringify(p.fill)})`:brush(l.paint.fill,l.paint.fillOpacity)}, ${brush(l.paint.stroke)}${r?`, new Matrix(${r.join(', ')})`:''})`}).join('')});`).join('\n');
  return{file:P+'Glyph.Avalonia.cs',text:`// Animated "${ic.n}" icon from Magic Glyphs for Avalonia 11. No extra packages:
// it draws the icon's own vectors and plays its spring motion, pre-computed at ${b.fps} frames per second.
// Use: new ${P}Glyph(size: 32, color: "#2747f5")  It plays on hover and click; call Play() yourself for other triggers.
// Sound: Avalonia has no built-in audio, so handle the Played event with the audio library you use and ${ic.n}.wav.
using System;
using System.Diagnostics;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Shapes;
using Avalonia.Media;
using Avalonia.Threading;

namespace MagicGlyphs;

public sealed class ${P}Glyph : Viewbox
{
    private static readonly double[]?[] Motion =
    {
        ${M}
    };
    private const int Frames = ${b.frames};
    private const double Fps = ${b.fps};
    private readonly Canvas[] _layers = new Canvas[${b.layers.length}];
    private readonly DispatcherTimer _timer;
    private readonly Stopwatch _clock = new();
    public event EventHandler? Played;

    public ${P}Glyph(double size = 24, string color = ${JSON.stringify(c.fg)}, string background = ${JSON.stringify(c.bg)}, string? secondary = null)
    {
        Width = Height = size;
        IBrush fg = Brush.Parse(color), bg = Brush.Parse(background), sec = Brush.Parse(secondary ?? color);
        var root = new Canvas { Width = 24, Height = 24 };
        Child = root;
${build}
        _timer = new DispatcherTimer(TimeSpan.FromMilliseconds(15), DispatcherPriority.Render, (_, _) => Tick());
        PointerEntered += (_, _) => Play();
        PointerPressed += (_, _) => Play();
        Apply(Frames - 1);
    }

    public void Play() { _clock.Restart(); _timer.Start(); Played?.Invoke(this, EventArgs.Empty); }

    private void Tick()
    {
        var t = _clock.Elapsed.TotalSeconds * Fps;
        if (t >= Frames - 1) { t = Frames - 1; _timer.Stop(); }
        Apply(t);
    }

    private void Apply(double t)
    {
        int k = (int)t, j = Math.Min(k + 1, Frames - 1);
        double f = t - k;
        for (var i = 0; i < _layers.Length; i++)
        {
            var a = Motion[i];
            if (a == null) continue;
            double V(int n) => a[k * 6 + n] + (a[j * 6 + n] - a[k * 6 + n]) * f;
            _layers[i].RenderTransform = new MatrixTransform(new Matrix(V(0), V(1), V(2), V(3), V(4), V(5)));
        }
    }

    private static Canvas Layer(Canvas root, params Path[] paths)
    {
        var c = new Canvas { Width = 24, Height = 24, RenderTransformOrigin = new RelativePoint(0, 0, RelativeUnit.Absolute) };
        foreach (var p in paths) c.Children.Add(p);
        root.Children.Add(c);
        return c;
    }

    private static Path Shape(string d, IBrush? fill, IBrush? stroke, Matrix? turn = null) => new()
    {
        Data = Geometry.Parse(d), Fill = fill, Stroke = stroke, StrokeThickness = stroke == null ? 0 : 1.75,
        StrokeLineCap = PenLineCap.Round, StrokeJoin = PenLineJoin.Round,
        RenderTransformOrigin = new RelativePoint(0, 0, RelativeUnit.Absolute),
        RenderTransform = turn is { } m ? new MatrixTransform(m) : null,
    };

    private static IBrush WithOpacity(IBrush b, double o) => b is ISolidColorBrush s ? new SolidColorBrush(s.Color, o) : b;
}
`};
}

// ---------- .NET MAUI (SkiaSharp Lottie) ----------
function maui(ic,o){
  const P=pascal(ic.n),j=require('./native.js').lottieJson(ic,Object.assign({},o,{style:o.style})).replace(/"/g,'""');
  return{file:P+'Glyph.Maui.cs',text:`// Animated "${ic.n}" icon from Magic Glyphs for .NET MAUI (Android, iOS, macOS, Windows).
// Needs: dotnet add package SkiaSharp.Extended.UI.Maui   and in MauiProgram.cs: builder.UseSkiaSharp();
// Sound, optional: dotnet add package Plugin.Maui.Audio, add ${ic.n}.wav under Resources/Raw, then pass an IAudioManager.
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Maui.Controls;
using SkiaSharp.Extended.UI.Controls;

namespace MagicGlyphs;

public sealed class ${P}Glyph : ContentView
{
    private const string Json = @"${j}";
    private readonly SKLottieView _view;
    public Func<Task>? PlaySound { get; set; }

    public ${P}Glyph(double size = 24)
    {
        WidthRequest = HeightRequest = size;
        _view = new SKLottieView
        {
            Source = new SKStreamLottieImageSource { Stream = _ => Task.FromResult<Stream?>(new MemoryStream(Encoding.UTF8.GetBytes(Json))) },
            RepeatCount = 0,
            IsAnimationEnabled = false,
        };
        Content = _view;
        var tap = new TapGestureRecognizer();
        tap.Tapped += (_, _) => Play();
        GestureRecognizers.Add(tap);
    }

    public void Play()
    {
        _view.Progress = TimeSpan.Zero;
        _view.IsAnimationEnabled = true;
        PlaySound?.Invoke();
    }
}
`};
}

// ---------- Compose Multiplatform (Compottie) ----------
function composeMp(ic,o){
  const P=pascal(ic.n),j=require('./native.js').lottieJson(ic,o).replace(/\$/g,'${"$"}');
  return{file:P+'Glyph.kt',text:`// Animated "${ic.n}" icon from Magic Glyphs for Compose Multiplatform (Android, iOS, desktop, web).
// Needs: implementation("io.github.alexzhirkevich:compottie:2.0.0")   (any 2.x)
// Sound: play ${ic.n}.wav with your platform's audio API from onPlay.
package magicglyphs

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import io.github.alexzhirkevich.compottie.*

private const val ${P.toUpperCase()}_JSON = """${j}"""

@Composable
fun ${P}Glyph(modifier: Modifier = Modifier, size: Dp = 24.dp, onPlay: () -> Unit = {}) {
    val composition by rememberLottieComposition { LottieCompositionSpec.JsonString(${P.toUpperCase()}_JSON) }
    var plays by remember { mutableStateOf(0) }
    val progress by animateLottieCompositionAsState(composition, isPlaying = plays > 0, restartOnPlay = true, iterations = 1)
    androidx.compose.foundation.Image(
        painter = rememberLottiePainter(composition, progress = { if (plays == 0) 1f else progress }),
        contentDescription = null,
        modifier = modifier.size(size).clickable { plays++; onPlay() },
    )
}
`};
}

// ---------- Godot 4 ----------
function godot(ic,o){
  const b=B.bake(o.MG,ic,{style:o.style,fps:30,polys:true}),c=colours(o);
  const col=(r,op)=>r?`Color(${r==='fg'?'color':r==='bg'?'background':'secondary'}, ${op||1})`:'null';
  const layers=b.layers.map(l=>`\t{"m": ${l.m?'PackedFloat32Array(['+l.m.flat().map(num).join(', ')+'])':'null'}, "shapes": [${l.paths.map(p=>`{"polys": [${p.polys.map(q=>`[PackedVector2Array([${q.pts.reduce((a,v,i)=>i%2?a:a.concat(`Vector2(${num(q.pts[i])}, ${num(q.pts[i+1])})`),[]).join(', ')}]), ${q.closed}]`).join(', ')}], "fill": ${p.fill?`Color(${JSON.stringify(p.fill)})`:`"${l.paint.fill||''}"`}, "fill_opacity": ${l.paint.fillOpacity||1}, "stroke": "${l.paint.stroke||''}"}`).join(', ')}]}`).join(',\n');
  return{file:snake(ic.n)+'_glyph.gd',text:`# Animated "${ic.n}" icon from Magic Glyphs for Godot 4. No plugins:
# it draws the icon's own vectors and plays its spring motion, pre-computed at ${b.fps} frames per second.
# Use: add a Control node, attach this script, set its size. Plays on hover and click; call play() for other triggers.
# Sound, optional: put ${ic.n}.wav in res://, set sound_stream to it.
extends Control

@export var color := Color(${JSON.stringify(c.fg)})
@export var background := Color(${JSON.stringify(c.bg)})
@export var secondary := Color(${JSON.stringify(c.sec)})
@export var sound_stream: AudioStream
@export var play_on_hover := true

const FRAMES := ${b.frames}
const FPS := ${b.fps}.0
var LAYERS := [
${layers}
]
var _t := float(FRAMES - 1)
var _playing := false
var _audio: AudioStreamPlayer

func _ready() -> void:
\tmouse_entered.connect(func(): if play_on_hover: play())
\tif custom_minimum_size == Vector2.ZERO:
\t\tcustom_minimum_size = Vector2(24, 24)

func _gui_input(event: InputEvent) -> void:
\tif event is InputEventMouseButton and event.pressed:
\t\tplay()

func play() -> void:
\t_t = 0.0
\t_playing = true
\tif sound_stream:
\t\tif _audio == null:
\t\t\t_audio = AudioStreamPlayer.new()
\t\t\tadd_child(_audio)
\t\t_audio.stream = sound_stream
\t\t_audio.play()

func _process(delta: float) -> void:
\tif not _playing:
\t\treturn
\t_t = min(_t + delta * FPS, FRAMES - 1)
\tif _t >= FRAMES - 1:
\t\t_playing = false
\tqueue_redraw()

func _matrix(a) -> Transform2D:
\tif a == null:
\t\treturn Transform2D.IDENTITY
\tvar k := int(_t)
\tvar j := mini(k + 1, FRAMES - 1)
\tvar f := _t - k
\tvar v := func(n): return lerpf(a[k * 6 + n], a[j * 6 + n], f)
\treturn Transform2D(Vector2(v.call(0), v.call(1)), Vector2(v.call(2), v.call(3)), Vector2(v.call(4), v.call(5)))

func _paint(role: String) -> Color:
\treturn color if role == "fg" else background if role == "bg" else secondary

func _draw() -> void:
\tvar k := minf(size.x, size.y) / 24.0
\tvar w := 1.75 * k
\tfor layer in LAYERS:
\t\tvar m := Transform2D().scaled(Vector2(k, k)) * _matrix(layer["m"])
\t\tfor shape in layer["shapes"]:
\t\t\tfor poly in shape["polys"]:
\t\t\t\tvar pts: PackedVector2Array = m * poly[0]
\t\t\t\tvar fill = shape["fill"]
\t\t\t\tif fill is Color or fill != "":
\t\t\t\t\tvar fc: Color = fill if fill is Color else _paint(fill)
\t\t\t\t\tfc.a *= shape["fill_opacity"]
\t\t\t\t\tif pts.size() >= 3:
\t\t\t\t\t\tdraw_colored_polygon(pts, fc)
\t\t\t\tif shape["stroke"] != "":
\t\t\t\t\tvar sc := _paint(shape["stroke"])
\t\t\t\t\tif poly[1]:
\t\t\t\t\t\tpts.append(pts[0])
\t\t\t\t\tdraw_polyline(pts, sc, w, true)
\t\t\t\t\tfor p in pts:
\t\t\t\t\t\tdraw_circle(p, w / 2.0, sc)
`};
}

// ---------- Rust (the magic-glyphs crate) ----------
function rust(ic,o){
  const b=B.bake(o.MG,ic,{style:'outline',fps:30}),k={c:'Main',o:'Line',i:'Detail',d:'Dot',f:'Fill'};
  const layers=ic.L.map((l,i)=>`        Layer { kind: Kind::${k[l.k]}, paths: &[${l.p.map(p=>`Path { d: ${JSON.stringify(p.d)}, turn: ${p.r?`Some([${p.r.map(fl).join(', ')}])`:'None'}, fill: ${p.f?`Some(${JSON.stringify(p.f)})`:'None'} }`).join(', ')}], motion: ${b.layers[i].m?'Some(&['+b.layers[i].m.flat().map(fl).join(', ')+'])':'None'} },`).join('\n');
  return{file:snake(ic.n)+'.rs',text:`// Animated "${ic.n}" icon from Magic Glyphs, for the magic-glyphs crate (cargo add magic-glyphs).
// Use: mod ${snake(ic.n)}; let icon = ${snake(ic.n)}::ICON;   then icon.svg_at(t, &style) or the egui widget.
use magic_glyphs::{Icon, Kind, Layer, Path};

pub const ICON: Icon = Icon {
    name: ${JSON.stringify(ic.n)},
    sound: ${ic.s?`Some(${JSON.stringify(ic.s)})`:'None'},
    fps: ${b.fps},
    frames: ${b.frames},
    layers: &[
${layers}
    ],
};
`};
}

// ---------- sprite sheet: one PNG with every frame in a grid, plus frame data (Unity, game engines, CSS) ----------
function spritesheet(ic,o){
  const R=require('./raster.js'),z=require('zlib'),size=o.size||128,fps=o.fps||30;
  const r=R.render(o.MG,ic,{size,style:o.style,color:o.color||'#000000',secondary:o.secondary,background:o.background||'transparent',fps,lead:0,hold:0});
  const n=r.frames.length,cols=Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols),W=cols*size,H=rows*size,img=new Uint8Array(W*H*4);
  r.frames.forEach((f,i)=>{const x0=(i%cols)*size,y0=Math.floor(i/cols)*size;for(let y=0;y<size;y++)img.set(f.subarray(y*size*4,(y+1)*size*4),((y0+y)*W+x0)*4)});
  const png=pngFile(W,H,img,z),meta={name:ic.n,frameWidth:size,frameHeight:size,columns:cols,rows,frames:n,fps,durations:r.delays.map(d=>Math.round(d*1000)),sound:ic.s?ic.n+'.wav':null};
  return{png,meta};
}
function pngFile(W,H,rgba,z){
  const CRC=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CRC[n]=c>>>0}
  const crc=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
  const chunk=(t,d)=>{const b=Buffer.alloc(12+d.length);b.writeUInt32BE(d.length,0);b.write(t,4);Buffer.from(d).copy(b,8);b.writeUInt32BE(crc(b.subarray(4,8+d.length)),8+d.length);return b};
  const raw=Buffer.alloc(H*(W*4+1));for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*W*4,W*4).copy(raw,y*(W*4+1)+1)}
  const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',z.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
// ---------- Unity: a component that plays the sprite sheet (written next to it) ----------
function unity(ic,o){
  const s=spritesheet(ic,Object.assign({},o,{size:o.size||128})),P=pascal(ic.n);
  return{file:P+'Glyph.cs',extra:[{file:ic.n+'.sheet.png',data:s.png}],text:`// Animated "${ic.n}" icon from Magic Glyphs for Unity (UI Image or SpriteRenderer).
// Import ${ic.n}.sheet.png as a Texture (Read/Write not needed), assign it to Sheet, and add this to a GameObject
// that has an Image (UI) or a SpriteRenderer. Sound, optional: assign ${ic.n}.wav to Sound.
using System.Collections;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class ${P}Glyph : MonoBehaviour, IPointerEnterHandler, IPointerClickHandler
{
    public Texture2D Sheet;
    public AudioClip Sound;
    public bool PlayOnHover = true;
    const int FrameSize = ${s.meta.frameWidth}, Columns = ${s.meta.columns}, Frames = ${s.meta.frames};
    static readonly int[] DurationsMs = { ${s.meta.durations.join(', ')} };
    Sprite[] _sprites;
    Image _image;
    SpriteRenderer _renderer;
    AudioSource _audio;
    Coroutine _run;

    void Awake()
    {
        _image = GetComponent<Image>();
        _renderer = GetComponent<SpriteRenderer>();
        _sprites = new Sprite[Frames];
        var rows = Mathf.CeilToInt(Frames / (float)Columns);
        for (var i = 0; i < Frames; i++)
        {
            int x = i % Columns, y = rows - 1 - i / Columns; // textures start at the bottom row
            _sprites[i] = Sprite.Create(Sheet, new Rect(x * FrameSize, y * FrameSize, FrameSize, FrameSize), new Vector2(0.5f, 0.5f), FrameSize);
        }
        Show(Frames - 1);
    }

    public void Play()
    {
        if (_run != null) StopCoroutine(_run);
        _run = StartCoroutine(Run());
        if (Sound)
        {
            if (!_audio) _audio = gameObject.AddComponent<AudioSource>();
            _audio.PlayOneShot(Sound);
        }
    }

    IEnumerator Run()
    {
        for (var i = 0; i < Frames; i++) { Show(i); yield return new WaitForSeconds(DurationsMs[i] / 1000f); }
    }

    void Show(int i) { if (_image) _image.sprite = _sprites[i]; if (_renderer) _renderer.sprite = _sprites[i]; }
    public void OnPointerEnter(PointerEventData e) { if (PlayOnHover) Play(); }
    public void OnPointerClick(PointerEventData e) => Play();
    void OnMouseDown() => Play();
}
`};
}
module.exports={qml,avalonia,maui,'compose-multiplatform':composeMp,godot,rust,unity,spritesheet,pngFile};
