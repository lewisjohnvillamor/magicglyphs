# Data format

`data/icons.json` is the single source every package is generated from.

```
{ name, format: 1, grid: 24, stroke: 1.75, count, icons: [icon] }

icon   { n: name, c: category, t: "space separated tags", s: sound name, L: [layer], A: [animation] }
layer  { i: id, k: kind, p: [shape] }
shape  { d: "SVG path data", r?: [degrees, cx, cy] }      // r rotates the shape about a point
anim   { l: "layer ids", p: property, o?: [x, y], k: [[ms, target], ...], st: stiffness, d: damping, from?: number }
```

## Layer kinds

| Kind | Outline | Solid | Duotone |
|---|---|---|---|
| `c` closed shape | stroke | fill + stroke | tinted fill + stroke |
| `o` open stroke | stroke | stroke | stroke |
| `i` inner detail | stroke | stroke in the background colour | stroke |
| `d` inner dot | fill | fill in the background colour | fill |
| `f` always filled | fill | fill | fill |

Layers are listed bottom first. Strokes are 1.75 wide with round caps and joins on a 24 by 24 grid.

## Animation

Each animation drives one property of one or more layers with a spring.

| Property | Meaning | Unit |
|---|---|---|
| `tx`, `ty` | Move | grid units |
| `r` | Rotate | degrees |
| `s` | Scale both axes | added to 1 |
| `sx`, `sy` | Scale one axis | added to 1 |

- `k` is a list of `[time in ms, target]`. At each time the spring's target changes; the last target is normally 0, which returns the layer to rest.
- `from` starts the spring away from rest (for example `sy` from `-1` grows a shape from nothing).
- `o` is the pivot. Rotation and scale keep separate pivots: the first `r` animation's pivot is used for rotation, the first scale animation's for scale; each falls back to the other, then to `[12, 12]`.

### The engine

For each spring, in fixed steps of `h = 1/240` s:

```
v += (-st * (x - target) - d * v) * h
x += v * h
```

Values for the same layer and property add up. The layer's transform is

```
translate(tx, ty) · rotate(r about the rotation pivot) · scale(1 + s + sx, 1 + s + sy about the scale pivot)
```

The animation has settled when every spring has passed its last keyframe, is within 0.01 of its target and slower than 0.05 per second. Then the transforms are removed.

Reference implementations: `web/runtime.js` (JavaScript) and `rust/src/lib.rs` (Rust). The Rust tests check that both produce the same numbers.
