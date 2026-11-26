#!/usr/bin/env node
// Builds the Godot 4 add-on (Godot Asset Library) into dist/godot/addons/magic_glyphs, with a demo scene beside it.
// A MagicGlyph Control node draws the 120 free icons from one data file: fills pre-triangulated (so holes stay holes),
// strokes as polylines, the paint for each style, and the spring motion as one 2D matrix per layer per frame.
//   node tools/godot-addon.js
const fs = require('fs'), path = require('path');
const earcutMod = require('earcut'), earcut = earcutMod.default || earcutMod;
const L = require('../lib.js'), B = require('./baked.js'), A = require('./audio.js'), Lic = require('../licence.js');
const root = path.join(__dirname, '..'), proj = path.join(root, 'dist', 'godot'), out = path.join(proj, 'addons', 'magic_glyphs');
const version = require('../package.json').version, FPS = 30, STYLES = ['outline', 'solid', 'duotone'];
const r3 = (v) => Math.round(v * 1000) / 1000;

// even-odd fill of several rings: rings inside an odd number of others are holes of the ring around them
function inside(p, ring) { let c = false; for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) { const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; }
function triangulate(rings) {
  const depth = rings.map((r, i) => rings.reduce((n, o, j) => n + (j !== i && inside([r[0], r[1]], o) ? 1 : 0), 0));
  const verts = [], idx = [];
  rings.forEach((outer, i) => {
    if (depth[i] % 2) return;
    const holes = rings.filter((h, j) => depth[j] === depth[i] + 1 && inside([h[0], h[1]], outer));
    const flat = outer.slice(), holeIdx = [];
    for (const h of holes) { holeIdx.push(flat.length / 2); flat.push(...h); }
    const base = verts.length / 2;
    for (const t of earcut(flat, holeIdx.length ? holeIdx : undefined, 2)) idx.push(base + t);
    verts.push(...flat);
  });
  return { v: verts.map(r3), i: idx };
}

(async () => {
  fs.rmSync(proj, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'sounds'), { recursive: true });
  const free = L.index.map((x) => x.name || x.n).filter((n) => Lic.isFree(n) && L.byName.has(n));
  if (free.length !== 120) throw new Error('expected the 120 free icons, found ' + free.length);
  const icons = {}, sounds = new Set();
  for (const n of free) {
    const ic = L.byName.get(n), bs = STYLES.map((s) => B.bake(L.MG, ic, { style: s, fps: FPS, polys: true }));
    icons[n] = {
      c: ic.c, s: ic.s || null, f: bs[0].frames,
      L: bs[0].layers.map((l, i) => {
        const ident = !l.m || l.m.every((m) => m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0);
        return {
          m: ident ? null : l.m.flat().map((v) => Math.round(v * 10000) / 10000),
          p: l.paths.map((p) => {
            const rings = p.polys.filter((q) => q.closed && q.pts.length >= 6).map((q) => q.pts);
            return { fill: p.fill || null, tri: rings.length ? triangulate(rings) : null, lines: p.polys.map((q) => [q.pts.map(r3), q.closed]) };
          }),
          st: Object.fromEntries(STYLES.map((s, k) => { const pt = bs[k].layers[i].paint; return [s, [pt.fill || '', pt.fillOpacity || 1, pt.stroke || '']]; })),
        };
      }),
    };
    if (ic.s) sounds.add(ic.s);
  }
  fs.writeFileSync(path.join(out, 'glyphs.json'), JSON.stringify({ fps: FPS, icons }));
  for (const s of sounds) fs.writeFileSync(path.join(out, 'sounds', s + '.wav'), Buffer.from(L.MG.sound.wav(await L.MG.sound.render(s, { delay: 0, pan: 0 }, A.OfflineContext))));
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(out, 'LICENSE'));
  fs.writeFileSync(path.join(out, 'icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#4a35d6"/><path d="M10.5 6c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>\n`);

  fs.writeFileSync(path.join(out, 'plugin.cfg'), `[plugin]

name="Magic Glyphs"
description="Animated icons with sound: 120 free icons with spring motion in outline, solid and duotone, as a MagicGlyph node."
author="Lewis John Villamor"
version="${version}"
script="plugin.gd"
`);
  fs.writeFileSync(path.join(out, 'plugin.gd'), `@tool
extends EditorPlugin
# The MagicGlyph node registers itself with class_name, so enabling the plugin only needs to exist for the Asset Library.
`);

  fs.writeFileSync(path.join(out, 'magic_glyph.gd'), `@tool
@icon("res://addons/magic_glyphs/icon.svg")
class_name MagicGlyph
extends Control
## An animated Magic Glyphs icon. It springs into motion and can play its own short sound.
##
## Add a MagicGlyph node, pick its [member icon], and it plays when hovered or clicked.
## [codeblock]
## var g := MagicGlyph.new()
## g.icon = "heart"
## g.sound = true
## add_child(g)
## [/codeblock]

## Emitted each time the icon plays, with the name of its sound ("" if it has none).
signal played(sound_name: String)

enum Variant { OUTLINE, SOLID, DUOTONE }
enum Trigger { HOVER, CLICK, READY, MANUAL }

const DATA_PATH := "res://addons/magic_glyphs/glyphs.json"
const SOUND_DIR := "res://addons/magic_glyphs/sounds/"
const _STYLES := ["outline", "solid", "duotone"]
static var _data: Dictionary = {}
static var _fps := 30.0
## Set to false to mute every MagicGlyph, for a global sound switch.
static var sound_enabled := true

## The icon name, for example "heart". [method MagicGlyph.names] lists them all.
@export var icon := "heart":
\tset(v):
\t\ticon = v
\t\t_reset()
## Outline, solid or duotone.
@export var variant := Variant.OUTLINE:
\tset(v):
\t\tvariant = v
\t\tqueue_redraw()
## The icon colour.
@export var color := Color(0.08, 0.07, 0.17):
\tset(v):
\t\tcolor = v
\t\tqueue_redraw()
## The duotone fill colour. Leave it transparent to use [member color].
@export var secondary := Color(0, 0, 0, 0):
\tset(v):
\t\tsecondary = v
\t\tqueue_redraw()
## The colour behind the icon. The solid style draws its inner details in it.
@export var backdrop := Color.WHITE:
\tset(v):
\t\tbackdrop = v
\t\tqueue_redraw()
## What makes the icon play.
@export var trigger := Trigger.HOVER
## Play the icon's sound with its animation.
@export var sound := false
## Sound volume in decibels.
@export_range(-40, 6) var volume_db := 0.0
## The audio bus for its sound.
@export var bus := &"Master"

var _t := 0.0
var _playing := false
var _audio: AudioStreamPlayer


## Every icon name, sorted.
static func names() -> PackedStringArray:
\t_load()
\tvar n := PackedStringArray(_data.keys())
\tn.sort()
\treturn n


## The name of an icon's sound, or "" if it has none.
static func sound_of(name: String) -> String:
\t_load()
\tvar g = _data.get(name)
\treturn g["s"] if g and g["s"] != null else ""


static func _load() -> void:
\tif not _data.is_empty():
\t\treturn
\tvar parsed = JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
\tif parsed is Dictionary:
\t\t_fps = float(parsed["fps"])
\t\t_data = parsed["icons"]
\t\tfor g in _data.values():
\t\t\tfor layer in g["L"]:
\t\t\t\tif layer["m"] != null:
\t\t\t\t\tlayer["m"] = PackedFloat32Array(layer["m"])
\t\t\t\tfor p in layer["p"]:
\t\t\t\t\tif p["tri"] != null:
\t\t\t\t\t\tp["tri"]["v"] = _points(p["tri"]["v"])
\t\t\t\t\t\tp["tri"]["i"] = PackedInt32Array(p["tri"]["i"])
\t\t\t\t\tfor line in p["lines"]:
\t\t\t\t\t\tline[0] = _points(line[0])
\telse:
\t\tpush_error("Magic Glyphs: could not read " + DATA_PATH)


static func _points(a: Array) -> PackedVector2Array:
\tvar out := PackedVector2Array()
\tout.resize(a.size() / 2)
\tfor i in out.size():
\t\tout[i] = Vector2(a[i * 2], a[i * 2 + 1])
\treturn out


func _ready() -> void:
\t_load()
\tif custom_minimum_size == Vector2.ZERO:
\t\tcustom_minimum_size = Vector2(24, 24)
\tmouse_entered.connect(func(): if trigger == Trigger.HOVER: play())
\t_reset()
\tif trigger == Trigger.READY and not Engine.is_editor_hint():
\t\tplay.call_deferred()


func _gui_input(event: InputEvent) -> void:
\tif (trigger == Trigger.HOVER or trigger == Trigger.CLICK) and event is InputEventMouseButton and event.pressed:
\t\tplay()
\telif (trigger == Trigger.HOVER or trigger == Trigger.CLICK) and event is InputEventScreenTouch and event.pressed:
\t\tplay()


## Plays the animation, and the sound when [member sound] is on.
func play() -> void:
\t_load()
\tvar g = _data.get(icon)
\tif g == null:
\t\treturn
\t_t = 0.0
\t_playing = true
\tset_process(true)
\tvar s: String = g["s"] if g["s"] != null else ""
\tif sound and sound_enabled and s != "":
\t\tif _audio == null:
\t\t\t_audio = AudioStreamPlayer.new()
\t\t\tadd_child(_audio)
\t\t_audio.stream = load(SOUND_DIR + s + ".wav")
\t\t_audio.volume_db = volume_db
\t\t_audio.bus = bus
\t\t_audio.play()
\tplayed.emit(s)
\tqueue_redraw()


## True while the animation is running.
func is_playing() -> bool:
\treturn _playing


## Shows the icon as it is [param seconds] into its motion, without playing it.
func seek(seconds: float) -> void:
\t_playing = false
\t_t = maxf(seconds, 0.0) * _fps
\tqueue_redraw()


func _reset() -> void:
\tvar g = _data.get(icon)
\t_t = float(g["f"] - 1) if g else 0.0
\t_playing = false
\tqueue_redraw()


func _process(delta: float) -> void:
\tif not _playing:
\t\tset_process(false)
\t\treturn
\tvar g = _data.get(icon)
\t_t += delta * _fps
\tif g == null or _t >= g["f"] - 1:
\t\t_playing = false
\t\tif g:
\t\t\t_t = float(g["f"] - 1)
\tqueue_redraw()


func _matrix(a, frames: int) -> Transform2D:
\tif a == null:
\t\treturn Transform2D.IDENTITY
\tvar t := minf(_t, frames - 1)
\tvar k := int(t)
\tvar j := mini(k + 1, frames - 1)
\tvar f := t - k
\tvar v := func(n: int) -> float: return lerpf(a[k * 6 + n], a[j * 6 + n], f)
\treturn Transform2D(Vector2(v.call(0), v.call(1)), Vector2(v.call(2), v.call(3)), Vector2(v.call(4), v.call(5)))


func _role(role: String) -> Color:
\tif role == "bg":
\t\treturn backdrop
\tif role == "sec":
\t\treturn secondary if secondary.a > 0.0 else color
\treturn color


func _draw() -> void:
\t_load()
\tvar g = _data.get(icon)
\tif g == null:
\t\treturn
\tvar k := minf(size.x, size.y) / 24.0
\tvar origin := (size - Vector2(24, 24) * k) / 2.0
\tvar w := 1.75 * k
\tvar style: String = _STYLES[variant]
\tfor layer in g["L"]:
\t\tvar m := Transform2D(0.0, Vector2(k, k), 0.0, origin) * _matrix(layer["m"], g["f"])
\t\tvar paint: Array = layer["st"][style]
\t\tfor p in layer["p"]:
\t\t\tvar fill_role: String = paint[0]
\t\t\tif (p["fill"] != null or fill_role != "") and p["tri"] != null:
\t\t\t\tvar fc: Color = Color(p["fill"]) if p["fill"] != null else _role(fill_role)
\t\t\t\tfc.a *= paint[1]
\t\t\t\tvar pts: PackedVector2Array = m * p["tri"]["v"]
\t\t\t\tvar idx: PackedInt32Array = p["tri"]["i"]
\t\t\t\tif idx.size() >= 3:
\t\t\t\t\tvar cols := PackedColorArray()
\t\t\t\t\tcols.resize(pts.size())
\t\t\t\t\tcols.fill(fc)
\t\t\t\t\tRenderingServer.canvas_item_add_triangle_array(get_canvas_item(), idx, pts, cols)
\t\t\tif paint[2] != "":
\t\t\t\tvar sc := _role(paint[2])
\t\t\t\tfor line in p["lines"]:
\t\t\t\t\tvar pts: PackedVector2Array = m * line[0]
\t\t\t\t\tif pts.size() < 2:
\t\t\t\t\t\tcontinue
\t\t\t\t\tif line[1]:
\t\t\t\t\t\tpts.append(pts[0])
\t\t\t\t\tdraw_polyline(pts, sc, w, true)
\t\t\t\t\tdraw_circle(pts[0], w / 2.0, sc)
\t\t\t\t\tdraw_circle(pts[pts.size() - 1], w / 2.0, sc)
\t\t\t\t\tfor i in range(1, pts.size() - 1):
\t\t\t\t\t\tvar a := (pts[i] - pts[i - 1]).normalized()
\t\t\t\t\t\tvar b := (pts[i + 1] - pts[i]).normalized()
\t\t\t\t\t\tif a.dot(b) < 0.95:
\t\t\t\t\t\t\tdraw_circle(pts[i], w / 2.0, sc)


func _validate_property(property: Dictionary) -> void:
\tif property.name == "icon":
\t\tproperty.hint = PROPERTY_HINT_ENUM_SUGGESTION
\t\tproperty.hint_string = ",".join(names())
`);

  // demo project around the add-on: a grid of every icon, playable, with sound
  fs.mkdirSync(path.join(proj, 'demo'), { recursive: true });
  fs.writeFileSync(path.join(proj, 'project.godot'), `config_version=5

[application]

config/name="Magic Glyphs demo"
run/main_scene="res://demo/demo.tscn"
config/features=PackedStringArray("4.3")

[editor_plugins]

enabled=PackedStringArray("res://addons/magic_glyphs/plugin.cfg")
`);
  fs.writeFileSync(path.join(proj, 'demo', 'demo.gd'), `extends Control
## Every free icon. Hover or click one to play it with its sound.

func _ready() -> void:
\tvar grid := GridContainer.new()
\tgrid.columns = 10
\tgrid.add_theme_constant_override("h_separation", 24)
\tgrid.add_theme_constant_override("v_separation", 24)
\tgrid.position = Vector2(32, 32)
\tadd_child(grid)
\tvar i := 0
\tfor n in MagicGlyph.names():
\t\tvar g := MagicGlyph.new()
\t\tg.icon = n
\t\tg.variant = i % 3
\t\tg.color = Color("#4a35d6") if i % 2 == 0 else Color("#14122b")
\t\tg.custom_minimum_size = Vector2(48, 48)
\t\tg.sound = true
\t\tg.tooltip_text = n
\t\tgrid.add_child(g)
\t\ti += 1
`);
  fs.writeFileSync(path.join(proj, 'demo', 'demo.tscn'), `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://demo/demo.gd" id="1"]

[node name="Demo" type="Control"]
layout_mode = 3
anchors_preset = 15
anchor_right = 1.0
anchor_bottom = 1.0
script = ExtResource("1")
`);
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(proj, 'LICENSE'));
  fs.writeFileSync(path.join(proj, 'README.md'), `# Magic Glyphs for Godot 4

Animated icons with sound. Each icon springs into motion when it is hovered, clicked or appears, and can play its own short sound.

- **${free.length} free icons** in outline, solid and duotone.
- **One node, \`MagicGlyph\`**, drawn as vectors, so it stays sharp at any size. No other plugins.
- **Sound, off by default**, through Godot's own audio, on any bus you choose.

## Install

From the Asset Library (search "Magic Glyphs"), or copy \`addons/magic_glyphs\` into your project. Then enable **Magic Glyphs** under Project Settings → Plugins.

## Use

Add a **MagicGlyph** node and set its **Icon**, **Variant** and **Color** in the Inspector. Or from code:

\`\`\`gdscript
var g := MagicGlyph.new()
g.icon = "heart"
g.variant = MagicGlyph.Variant.DUOTONE
g.color = Color("#e11d48")
g.custom_minimum_size = Vector2(48, 48)
g.sound = true
add_child(g)
\`\`\`

| Property | Default | |
|---|---|---|
| \`icon\` | \`heart\` | The icon name. \`MagicGlyph.names()\` lists them all |
| \`variant\` | \`OUTLINE\` | \`OUTLINE\`, \`SOLID\` or \`DUOTONE\` |
| \`color\` | near black | The icon colour |
| \`secondary\` | transparent | The duotone fill colour; transparent uses \`color\` |
| \`backdrop\` | white | The colour behind the icon; the solid style draws its inner details in it |
| \`trigger\` | \`HOVER\` | \`HOVER\` (hover or click), \`CLICK\`, \`READY\` or \`MANUAL\` |
| \`sound\` | false | Play the icon's sound |
| \`volume_db\`, \`bus\` | 0, Master | Sound volume and audio bus |

Call \`play()\` to play an icon yourself, and connect \`played\` to react to it. Mute every icon with \`MagicGlyph.sound_enabled = false\`. The node's size sets the icon size. The \`demo\` folder shows every icon.

## The full library

The full Magic Glyphs library has more than 8,000 icons, an icon maker for your own artwork, and 528 sounds. Export any of them for Godot with the command line tool: see [magicglyphs.com/docs/godot](https://magicglyphs.com/docs/godot/).

## Licence

MIT: the code, icons and sounds in this add-on. The paid Magic Glyphs icons have their own licence.
`);
  fs.writeFileSync(path.join(proj, '.gitattributes'), '# Only the add-on goes into projects that download it from the Asset Library\n/demo export-ignore\n/project.godot export-ignore\n');
  let bytes = 0; const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : (bytes += fs.statSync(p).size); } }; walk(out);
  console.log('Godot add-on: dist/godot/addons/magic_glyphs  (' + free.length + ' icons, ' + sounds.size + ' sounds, ' + (bytes / 1048576).toFixed(1) + ' MB)');
})().catch((e) => { console.error(e); process.exit(1); });
