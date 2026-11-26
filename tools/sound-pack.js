#!/usr/bin/env node
// Builds the extra sound pack (web/sounds-more.js): about 400 designed sounds on top of the 100 built into the runtime.
// Each sound is a list of steps the runtime plays: ['t', hz, start, length, level, wave, endHz?] or ['n', fromHz, toHz, start, length, level, focus].
// Levels are measured after rendering and trimmed so every sound sits at the same loudness as the built-in ones.
//   node tools/sound-pack.js
const fs = require('fs'), path = require('path');

// ---------- helpers ----------
const NOTE = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
const hz = (n) => { const m = /^([A-G])(#|b)?(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (m[3] - 4) * 12) / 12); };
const F = (x) => typeof x === 'string' ? hz(x) : x;
const T = (f, t, d, g, w, f2) => ['t', F(f), t, d, g, w || 'sine'].concat(f2 ? [F(f2)] : []);
const N = (f, f2, t, d, g, q) => ['n', f, f2, t, d, g, q || 1.2];
const at = (steps, dt) => steps.map((s) => { const x = s.slice(); if (x[0] === 't') x[2] += dt; else x[3] += dt; return x; });
const seq = (notes, step, fn) => notes.flatMap((n, i) => n === null ? [] : at(fn(n), i * step));
const R = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// instrument timbres: one note at time 0
const INST = {
  piano: (f, d = .6) => [T(f, 0, d, .3, 'triangle'), T(F(f) * 2, 0, d * .5, .1), T(F(f) * 3, 0, d * .25, .04)],
  harp: (f, d = .7) => [T(f, 0, d, .25, 'triangle'), T(F(f) * 2, 0, d * .3, .06)],
  marimba: (f, d = .4) => [T(f, 0, d, .35), T(F(f) * 4, 0, d * .15, .1)],
  vibes: (f, d = 1) => [T(f, 0, d, .25), T(F(f) * 4, 0, d * .4, .05), T(F(f) * 1.003, 0, d, .12)],
  kalimba: (f, d = .5) => [T(f, 0, d, .3), T(F(f) * 5.4, 0, .05, .08), T(F(f) * 2.01, 0, d * .3, .05)],
  musicbox: (f, d = .6) => [T(F(f) * 2, 0, d, .2), T(F(f) * 4.02, 0, d * .5, .06)],
  steelpan: (f, d = .6) => [T(f, 0, d, .25), T(F(f) * 2, 0, d * .7, .12), T(F(f) * 3.01, 0, d * .4, .06)],
  celesta: (f, d = .7) => [T(F(f) * 2, 0, d, .22), T(F(f) * 4, 0, d * .3, .07), T(F(f) * 6, 0, d * .15, .03)],
  organ: (f, d = .45) => [T(f, 0, d, .14, 'sine'), T(F(f) * 2, 0, d, .1), T(F(f) * 3, 0, d, .06), T(F(f) * .5, 0, d, .08)],
  flute: (f, d = .4) => [T(f, 0, d, .22, 'sine'), N(F(f), F(f), 0, d * .5, .04, 8)],
  synth: (f, d = .35) => [T(f, 0, d, .14, 'sawtooth'), T(F(f) * 1.008, 0, d, .1, 'sawtooth')],
  pluck: (f, d = .35) => [T(f, 0, d, .18, 'sawtooth', F(f) * .995), T(F(f) * 2, 0, d * .3, .08, 'triangle')],
  bass: (f, d = .4) => [T(F(f) / 2, 0, d, .45, 'triangle'), T(f, 0, d * .5, .12)],
  glass: (f, d = .8) => [T(f, 0, d, .2), T(F(f) * 2.32, 0, d * .6, .08), T(F(f) * 4.25, 0, d * .3, .04)],
  bell: (f, d = 1.2) => [T(f, 0, d, .22), T(F(f) * 2.76, 0, d * .6, .09), T(F(f) * 5.4, 0, d * .35, .04), T(F(f) * 8.93, 0, d * .2, .02)],
  chip: (f, d = .12) => [T(f, 0, d, .14, 'square')],
  softchip: (f, d = .14) => [T(f, 0, d, .2, 'triangle')],
};
// gestures: what an instrument plays
const GEST = {
  up: (i) => seq(['C5', 'E5', 'G5', 'C6'], .07, (n) => INST[i](n, .4)),
  down: (i) => seq(['C6', 'G5', 'E5', 'C5'], .07, (n) => INST[i](n, .4)),
  chord: (i) => ['C5', 'E5', 'G5'].flatMap((n) => INST[i](n, .9)),
};
const P = {}; // name -> [family, steps]
const add = (fam, name, steps) => { if (P[name]) throw new Error('dup ' + name); P[name] = [fam, steps]; };

// ---------- musical: 17 timbres x 6 gestures ----------
for (const i of Object.keys(INST)) for (const g of Object.keys(GEST)) {
  const name = (i === 'chip' ? 'retro' : i === 'softchip' ? 'softretro' : i) + g;
  add(i === 'chip' || i === 'softchip' ? 'game' : 'musical', name, GEST[g](i));
}

// ---------- interface: 8 materials x 5 actions ----------
const MAT = {
  wood: { f: 900, q: 3, tone: 620 }, glass: { f: 4200, q: 6, tone: 2400 }, metal: { f: 3200, q: 9, tone: 1700 }, plastic: { f: 2400, q: 2, tone: 900 },
  paper: { f: 3000, q: .8, tone: 0 }, rubber: { f: 600, q: 1, tone: 260 }, stone: { f: 1400, q: 1.5, tone: 380 }, crystal: { f: 6000, q: 8, tone: 3500 },
};
const hit = (m, t, g = .5, len = .03) => { const x = MAT[m], s = [N(x.f, x.f * .7, t, len, g, x.q)]; if (x.tone) s.push(T(x.tone, t, len * 2.2, g * .45, 'sine', x.tone * .85)); return s; };
for (const m of Object.keys(MAT)) {
  add('interface', m + 'tap', hit(m, 0, .45, .02));
  add('interface', m + 'click', [...hit(m, 0, .5, .03), ...hit(m, .045, .3, .02)]);
  add('interface', m + 'press', [...hit(m, 0, .55, .05), ...(MAT[m].tone ? [T(MAT[m].tone * .7, .01, .12, .15, 'sine')] : [])]);
  add('interface', m + 'release', hit(m, 0, .35, .025).map((s) => (s[0] === 't' ? (s[1] *= 1.25, s) : (s[1] *= 1.3, s))));
}
// interface actions
const UI = {
  toggleon: [T(600, 0, .05, .25, 'sine', 900), N(3000, 2000, 0, .02, .3, 2)],
  toggleoff: [T(900, 0, .05, .25, 'sine', 600), N(2400, 1600, 0, .02, .3, 2)],
  slider: [N(1500, 3500, 0, .12, .25, 3), T(700, 0, .12, .06, 'sine', 1100)],
  expand: [T(400, 0, .14, .22, 'sine', 800), T(800, .02, .12, .08, 'triangle', 1200)],
  collapse: [T(800, 0, .14, .22, 'sine', 400), T(1200, .02, .12, .08, 'triangle', 700)],
  menuopen: [N(1200, 3000, 0, .1, .25, 1.5), T(520, .02, .1, .15, 'sine', 780)],
  menuclose: [N(3000, 1200, 0, .1, .25, 1.5), T(780, .02, .1, .15, 'sine', 520)],
  tabswitch: [T(1100, 0, .04, .2, 'triangle'), T(1400, .05, .05, .16, 'triangle')],
  select: [T(880, 0, .06, .22, 'sine'), T(1320, .04, .08, .12, 'sine')],
  deselect: [T(1320, 0, .06, .18, 'sine'), T(880, .04, .08, .12, 'sine')],
  copy: [T(1000, 0, .04, .2, 'triangle'), T(1000, .07, .04, .16, 'triangle')],
  paste: [N(2000, 1200, 0, .05, .35, 2), T(500, 0, .08, .2, 'sine', 380)],
  cut: [N(3500, 6000, 0, .06, .4, 3), N(5000, 2500, .07, .05, .3, 3)],
  undo: [T(700, 0, .12, .2, 'triangle', 450), T(450, .1, .06, .1, 'sine')],
  redo: [T(450, 0, .12, .2, 'triangle', 700), T(700, .1, .06, .1, 'sine')],
  save: [T(660, 0, .08, .2, 'triangle'), T(990, .07, .18, .2, 'triangle'), N(4000, 4000, .07, .05, .05, 4)],
  send: [N(800, 5000, 0, .2, .35, 1.2), T(500, 0, .2, .2, 'sine', 1400)],
  receive: [T(1400, 0, .12, .2, 'sine', 700), T(1047, .14, .2, .18, 'sine')],
  upload: seq([523, 659, 784], .06, (f) => [T(f, 0, .08, .18, 'triangle')]),
  download: seq([784, 659, 523], .06, (f) => [T(f, 0, .08, .18, 'triangle')]),
  syncing: [...seq([700, 900, 700, 900], .08, (f) => [T(f, 0, .06, .14, 'sine')])],
  refreshed: [N(1000, 3000, 0, .15, .2, 1), T(880, .15, .2, .2, 'sine'), T(1320, .2, .25, .12, 'sine')],
  loading: seq([600, 700, 800, 900, 1000, 1100], .07, (f) => [T(f, 0, .04, .12, 'triangle')]),
  loaded: [T(784, 0, .1, .2, 'triangle'), T(1175, .08, .3, .2, 'triangle')],
  zoomin: [T(300, 0, .2, .2, 'sine', 900), N(600, 2400, 0, .2, .15, 1.5)],
  zoomout: [T(900, 0, .2, .2, 'sine', 300), N(2400, 600, 0, .2, .15, 1.5)],
  scroll: seq([0, 1, 2, 3, 4, 5], .035, () => [N(2600, 2200, 0, .015, .3, 5)]),
  pullrefresh: [T(300, 0, .25, .14, 'sine', 600), T(900, .28, .15, .2, 'triangle')],
  dragstart: [N(1800, 900, 0, .05, .35, 2), T(320, 0, .08, .2, 'sine', 420)],
  dragdrop: [T(420, 0, .08, .25, 'sine', 260), N(1200, 600, .02, .05, .35, 2)],
  pin: [T(1600, 0, .04, .2, 'square'), T(2400, .03, .2, .12, 'sine')],
  unpin: [T(2400, 0, .04, .16, 'sine'), T(1200, .03, .15, .12, 'sine', 900)],
  keypress: [N(3200, 2200, 0, .02, .45, 3), T(260, 0, .03, .15, 'sine')],
  spacebar: [N(1800, 1200, 0, .035, .5, 2), T(150, 0, .05, .25, 'sine'), N(2400, 1800, .07, .02, .25, 3)],
  enterkey: [N(2600, 1800, 0, .03, .5, 2.5), T(200, 0, .05, .25, 'sine'), N(3000, 2000, .06, .02, .3, 3)],
  backspace: [N(3400, 2600, 0, .018, .4, 3), N(3400, 2600, .06, .018, .35, 3)],
  typewriter: [N(3800, 2500, 0, .02, .55, 4), T(1200, 0, .015, .2, 'square'), N(2500, 1500, .03, .03, .3, 2)],
  carriage: [N(1500, 3000, 0, .3, .25, 2), T(2637, .32, .6, .2), T(5274, .32, .3, .06)],
  notifydot: [T(1568, 0, .08, .2, 'sine', 1760)],
  badge: [T(1175, 0, .06, .2, 'triangle'), T(1568, .06, .12, .18, 'triangle')],
  bubblepop: [T(500, 0, .05, .35, 'sine', 1400), N(3000, 3000, .03, .02, .15, 2)],
  lightswitch: [N(2200, 1100, 0, .02, .6, 1.5), T(180, 0, .03, .25, 'sine')],
  focus: [T(1200, 0, .1, .1, 'sine', 1400)],
  shimmer: seq([3000, 3600, 4200, 4800, 4200], .03, (f) => [T(f, 0, .2, .05, 'sine')]),
};
for (const [k, v] of Object.entries(UI)) add('interface', k, v);

// ---------- alerts: bells x gestures, and jingles ----------
const BELLS = { desk: 2093, glassbell: 1568, temple: 392, hand: 1319, cow: 540, ship: 784, church: 262, tiny: 3136, tubular: 523, sleigh: 2600 };
for (const [b, f] of Object.entries(BELLS)) {
  const one = (t, g = 1) => at(b === 'cow' ? [T(f, 0, .3, .3 * g, 'square'), T(f * 1.48, 0, .3, .12 * g, 'square')] : b === 'sleigh' ? seq([0, 1, 2, 3, 4, 5], .03, (i) => [T(f + i * 140, 0, .2, .08 * g), N(8000, 7000, 0, .04, .1 * g, 3)]) : INST.bell(f, b === 'temple' || b === 'church' ? 2.2 : b === 'tiny' ? .5 : 1.2).map((s) => (s[4] *= g, s)), t);
  add('alerts', b + 'bell', one(0));
  add('alerts', b + 'bell2', [...one(0), ...one(.25, .8)]);
}
const JINGLE = {
  dingdong: [['E5', 0, .6], ['C5', .35, .9]], doorbell: [['G5', 0, .5], ['E5', .3, .5], ['C5', .6, .9]], mailin: [['A5', 0, .2], ['E6', .12, .4]],
  mailout: [['E6', 0, .2], ['A5', .12, .4]], messagein: [['G5', 0, .15], ['C6', .1, .15], ['E6', .2, .3]], messageout: [['E6', 0, .15], ['C6', .1, .15], ['G5', .2, .3]],
  reminder: [['C6', 0, .2], ['C6', .25, .2], ['G6', .5, .4]], nudge: [['D5', 0, .1], ['D5', .14, .1]], softalert: [['F5', 0, .4], ['A5', .2, .5]],
  urgent: [['A5', 0, .1], ['A5', .12, .1], ['A5', .24, .1], ['E6', .36, .3]], critical: [['C6', 0, .12], ['F#5', .14, .12], ['C6', .28, .12], ['F#5', .42, .12]],
  correct: [['C6', 0, .1], ['E6', .08, .1], ['G6', .16, .3]], wrong: [['E4', 0, .18], ['C4', .2, .35]], fanfare: [['G4', 0, .12], ['C5', .12, .12], ['E5', .24, .12], ['G5', .36, .5]],
  achievement: [['C5', 0, .1], ['G5', .1, .1], ['C6', .2, .1], ['E6', .3, .1], ['G6', .4, .5]], levelcomplete: [['E5', 0, .12], ['G5', .12, .12], ['E6', .24, .12], ['C6', .36, .12], ['D6', .48, .12], ['G6', .6, .5]],
  checkpoint: [['G5', 0, .1], ['D6', .1, .35]], timerdone: [['A6', 0, .1], ['A6', .2, .1], ['A6', .4, .1], ['A6', .6, .1]], wakeup: [['C5', 0, .2], ['E5', .2, .2], ['G5', .4, .2], ['C6', .6, .5]],
  goodnight: [['C6', 0, .3], ['G5', .25, .3], ['E5', .5, .3], ['C5', .75, .7]], question: [['C5', 0, .15], ['G5', .15, .35]], answer: [['G5', 0, .15], ['C5', .15, .35]],
  hello: [['E5', 0, .1], ['G5', .1, .1], ['B5', .2, .3]], goodbye: [['B5', 0, .1], ['G5', .1, .1], ['E5', .2, .3]], welcome: [['C5', 0, .15], ['E5', .15, .15], ['A5', .3, .15], ['G5', .45, .5]],
  complete: [['D5', 0, .12], ['F#5', .1, .12], ['A5', .2, .12], ['D6', .3, .5]], celebrate: [['C6', 0, .08], ['C6', .1, .08], ['C6', .2, .08], ['G6', .3, .5]],
  sparkle2: [['E6', 0, .2], ['B6', .06, .2], ['G#6', .12, .2], ['E7', .18, .4]], callring: [], oldphone: [], pager: [['C7', 0, .08], ['A6', .1, .08], ['C7', .2, .08], ['A6', .3, .08]],
};
JINGLE.callring = [0, .045, .09, .135, .18, .225, .27, .315].map((t, i) => [i % 2 ? 'E6' : 'G6', t, .045]).concat([0, .045, .09, .135, .18, .225, .27, .315].map((t, i) => [i % 2 ? 'E6' : 'G6', t + .6, .045]));
JINGLE.oldphone = [];
for (const [k, notes] of Object.entries(JINGLE)) {
  if (k === 'oldphone') { add('alerts', k, [...Array(14)].flatMap((_, i) => [T(i % 2 ? 1000 : 1200, i * .04, .04, .12, 'square')]).concat([...Array(14)].flatMap((_, i) => [T(i % 2 ? 1000 : 1200, .7 + i * .04, .04, .12, 'square')]))); continue; }
  const inst = k === 'wrong' ? 'synth' : k === 'pager' || k === 'timerdone' || k === 'callring' ? 'softchip' : k.startsWith('mail') || k.startsWith('message') ? 'marimba' : k === 'fanfare' || k === 'achievement' || k === 'levelcomplete' || k === 'celebrate' ? 'synth' : 'vibes';
  add('alerts', k, notes.flatMap(([n, t, d]) => at(INST[inst](n, Math.max(d, .1)), t)));
}

// ---------- game: retro actions ----------
const sq = 'square', tr = 'triangle';
const GAME = {
  gem: [T(1976, 0, .06, .15, sq), T(2637, .05, .06, .15, sq), T(3951, .1, .3, .12, sq)], key: [T(1568, 0, .08, .15, sq), T(2093, .08, .08, .15, sq), T(1568, .16, .2, .12, tr)],
  chest: [...seq([392, 494, 587, 784, 988], .05, (f) => [T(f, 0, .1, .14, sq)]), T(1568, .3, .5, .12, tr)], heart: [T(784, 0, .1, .15, tr), T(1047, .1, .1, .15, tr), T(1319, .2, .3, .15, tr)],
  oneup: seq([1319, 1568, 2637, 2093, 2349, 3136], .07, (f) => [T(f, 0, .07, .13, sq)]), shrink: [T(1200, 0, .5, .14, sq, 200)], grow: [T(200, 0, .5, .14, sq, 1200), T(300, 0, .5, .06, tr, 1800)],
  hit: [N(1500, 300, 0, .1, .5, 1), T(200, 0, .1, .25, sq, 80)], hurt: [T(600, 0, .15, .16, sq, 150), T(400, .15, .15, .12, sq, 100)],
  die: seq([784, 740, 698, 659, 622, 587, 554, 523], .08, (f) => [T(f, 0, .08, .13, sq)]), gameover: [T('G4', 0, .3, .15, tr), T('D4', .3, .3, .15, tr), T('B3', .6, .3, .15, tr), T('G3', .9, .9, .15, tr)],
  win: seq(['C5', 'E5', 'G5', 'C6', 'G5', 'C6'], .09, (n) => [T(n, 0, .1, .14, sq)]), selectitem: [T(1760, 0, .05, .12, sq), T(2637, .05, .07, .1, sq)], startgame: seq(['C5', 'G5', 'C6'], .1, (n) => [T(n, 0, .12, .15, sq)]),
  pausegame: [T(1047, 0, .08, .14, sq), T(784, .1, .08, .14, sq), T(1047, .2, .08, .14, sq)], doublejump: [T(300, 0, .12, .16, sq, 700), T(500, .14, .12, .16, sq, 1000)], bigjump: [T(150, 0, .3, .16, sq, 800)],
  shoot: [T(1600, 0, .1, .15, sq, 400), N(5000, 1500, 0, .06, .2, 1)], explode: [N(1200, 60, 0, .8, .7, .7), T(120, 0, .5, .4, sq, 30)], warp: [...seq([0, 1, 2, 3, 4, 5, 6, 7], .04, (i) => [T(400 + i * 180, 0, .05, .1, sq, 600 + i * 180)])],
  teleport: [T(300, 0, .4, .1, 'sine', 2500), T(310, 0, .4, .1, 'sine', 2600), N(2000, 8000, 0, .4, .1, 3)], bonus: seq([1047, 1319, 1568, 2093, 1568, 2093], .05, (f) => [T(f, 0, .06, .12, tr)]),
  combo: seq([880, 1109, 1319], .04, (f) => [T(f, 0, .05, .14, sq)]), streak: seq([523, 659, 784, 1047, 1319, 1568, 2093], .035, (f) => [T(f, 0, .05, .12, sq)]),
  lose: [T(400, 0, .25, .15, tr, 300), T(300, .25, .4, .15, tr, 150)], dash: [N(1000, 6000, 0, .12, .35, 1.5), T(800, 0, .1, .1, sq, 1600)], block: [N(2500, 1500, 0, .05, .5, 3), T(300, 0, .08, .3, sq, 220)],
  heal: seq([523, 784, 1047, 1568], .08, (f) => [T(f, 0, .25, .12), T(f * 2, 0, .15, .04)]), mana: [T(600, 0, .5, .1, 'sine', 1200), T(900, .05, .5, .08, 'sine', 1800), N(4000, 7000, 0, .5, .05, 6)],
  coinbag: [0, .05, .09, .15, .2, .23].flatMap((t, i) => at([T(2400 + (i % 3) * 300, 0, .12, .1, sq), T(3600 + (i % 2) * 400, .03, .1, .06)], t)), bomb: [T(1200, 0, .8, .1, 'sine', 300), N(800, 60, .8, .7, .7, .7)],
  menutick: [T(2000, 0, .025, .12, sq)], confirmchip: [T(1047, 0, .06, .14, sq), T(1568, .06, .12, .14, sq)], cancelchip: [T(784, 0, .06, .14, sq), T(523, .06, .12, .14, sq)],
  pickup: [T(880, 0, .05, .14, sq), T(1760, .05, .08, .14, sq)], throw: [N(600, 3000, 0, .15, .3, 1), T(500, 0, .15, .12, sq, 300)], spring: [T(200, 0, .25, .2, tr, 1200)],
};
for (const [k, v] of Object.entries(GAME)) add('game', k, v);

// ---------- scifi ----------
const SCI = {
  beam: [T(1200, 0, .5, .12, 'sawtooth', 1100), T(1205, 0, .5, .12, 'sawtooth', 1105), N(3000, 3000, 0, .5, .06, 4)], scan: seq([0, 1, 2, 3, 4], .1, (i) => [T(1800 - i * 150, 0, .08, .12, 'sine')]),
  charge: [T(200, 0, .8, .12, 'sawtooth', 1600), T(400, 0, .8, .06, sq, 3200)], discharge: [T(1600, 0, .4, .14, 'sawtooth', 100), N(5000, 300, 0, .4, .3, 1)],
  forcefield: [T(110, 0, .9, .25, 'sawtooth'), T(112, 0, .9, .2, 'sawtooth'), N(800, 800, 0, .9, .1, 2)], hyperdrive: [T(60, 0, 1.4, .3, 'sawtooth', 600), N(200, 4000, 0, 1.4, .3, 1)],
  ufo: seq([0, 1, 2, 3, 4, 5, 6, 7], .08, (i) => [T(i % 2 ? 900 : 1300, 0, .08, .12, 'sine', i % 2 ? 1300 : 900)]), alien: [T(500, 0, .12, .18, 'sine', 900), T(900, .12, .1, .16, 'sine', 400), T(400, .22, .14, .16, 'sine', 1100)],
  computer: seq([1200, 900, 1500, 700, 1300, 1000], .06, (f) => [T(f, 0, .05, .12, sq)]), datastream: seq([...Array(16)].map((_, i) => i), .03, (i) => [T(800 + ((i * 7919) % 13) * 180, 0, .025, .1, sq)]),
  glitch: [N(4000, 1000, 0, .04, .5, 1), T(80, .04, .05, .3, sq), N(8000, 3000, .1, .03, .4, 1), T(1500, .14, .03, .2, sq)], hologram: [T(800, 0, .6, .08, 'sine', 1600), T(803, 0, .6, .08, 'sine', 1610), N(6000, 9000, 0, .6, .05, 5)],
  portal: [T(80, 0, 1, .25, 'sine', 400), N(300, 3000, 0, 1, .25, .8), T(160, 0, 1, .08, 'sawtooth', 800)], plasma: [T(300, 0, .3, .15, 'sawtooth', 1800), N(2000, 6000, 0, .3, .2, 2)],
  sonar: [T(1100, 0, .9, .3), T(1100, .05, .6, .05)], radar: seq([0, 1, 2], .3, () => [T(2400, 0, .06, .2, 'sine', 2200)]), morse: [[0, .06], [.1, .06], [.2, .18], [.42, .18], [.64, .06]].map(([t, d]) => T(800, t, d, .2, 'sine')),
  transmission: [N(2500, 2500, 0, .4, .2, .6), ...seq([0, 1, 2, 3], .1, (i) => [T(1400 + i * 100, 0, .06, .1, sq)])], staticnoise: [N(4000, 3000, 0, .6, .25, .4)], modem: seq([...Array(10)].map((_, i) => i), .05, (i) => [T([1070, 1270, 2025, 2225][i % 4], 0, .05, .1, 'sine')]),
  boot: [T(100, 0, .6, .2, 'sine', 400), T(800, .5, .4, .15), T(1200, .6, .5, .12)], shutdown: [T(1200, 0, .3, .12), T(800, .15, .3, .14), T(400, .3, .7, .2, 'sine', 60)],
  airlock: [N(3000, 500, 0, .8, .4, .6), T(90, 0, .3, .3, 'sine')], hatch: [N(1800, 400, 0, .2, .5, 1), T(140, .05, .2, .4, 'sine', 60), N(3500, 1500, .25, .1, .3, 2)], tractor: [T(200, 0, 1, .12, 'sawtooth', 180), T(300, 0, 1, .08, 'sine', 600), N(500, 1500, 0, 1, .08, 3)],
  cloak: [T(2000, 0, .5, .1, 'sine', 200), N(8000, 500, 0, .5, .15, 1)], decloak: [T(200, 0, .5, .1, 'sine', 2000), N(500, 8000, 0, .5, .15, 1)], energy: [T(400, 0, .5, .12, 'sawtooth', 800), T(600, 0, .5, .1, 'sine', 1200)],
  phaser: [T(3000, 0, .25, .1, 'sawtooth', 600), T(3100, 0, .25, .1, 'sawtooth', 650)], blaster: [T(1800, 0, .15, .18, sq, 200), N(3000, 500, 0, .15, .3, 1.5)], railgun: [T(100, 0, .3, .15, 'sawtooth', 3000), N(8000, 200, .3, .3, .5, 1)],
  lightsabre: [T(90, 0, .6, .25, 'sawtooth', 110), T(91.5, 0, .6, .2, 'sawtooth', 112), N(300, 900, 0, .6, .1, 4)], robotwalk: [0, .2, .4].flatMap((t) => at([N(1500, 800, 0, .05, .45, 2), T(180, 0, .08, .3, sq, 140)], t)),
  servo: [T(300, 0, .25, .12, 'sawtooth', 500), T(500, .25, .1, .1, 'sawtooth', 480)], beepboop: seq([1200, 600, 1500, 800], .1, (f) => [T(f, 0, .08, .14, 'sine')]), countdownsci: seq([0, 1, 2], .25, (i) => [T(i < 2 ? 880 : 1760, 0, i < 2 ? .1 : .4, .18, 'sine')]),
  satellite: seq([0, 1, 2, 3], .2, (i) => [T(3000 - i * 300, 0, .1, .1, 'sine')]), mutation: [T(300, 0, .6, .12, 'sawtooth', 200), T(450, .1, .5, .1, 'sawtooth', 900), T(600, .2, .4, .08, 'sawtooth', 300)],
};
for (const [k, v] of Object.entries(SCI)) add('scifi', k, v);

// ---------- cartoon ----------
const CAR = {
  slideup: [T(400, 0, .5, .2, 'sine', 1600)], slidedown: [T(1600, 0, .5, .2, 'sine', 400)], slideupdown: [T(500, 0, .3, .2, 'sine', 1400), T(1400, .3, .3, .2, 'sine', 500)],
  bonk: [T(700, 0, .15, .35, 'sine', 350), N(2000, 800, 0, .04, .3, 2)], splat: [N(800, 200, 0, .25, .55, .8), T(150, 0, .15, .3, 'sine', 60)], squish: [N(400, 1600, 0, .2, .4, 2), T(300, 0, .2, .15, 'sine', 500)],
  honk: [T(300, 0, .25, .2, 'sawtooth', 280), T(450, 0, .25, .1, sq, 430)], honkhonk: [T(300, 0, .15, .2, 'sawtooth'), T(450, 0, .15, .1, sq), T(300, .22, .2, .2, 'sawtooth'), T(450, .22, .2, .1, sq)],
  tiptoe: seq([0, 1, 2, 3], .18, (i) => [T(i % 2 ? 1400 : 1200, 0, .05, .16, 'sine')]), sneak: seq(['A3', 'C4', 'E4', 'D#4'], .18, (n) => [T(n, 0, .12, .2, 'triangle')]),
  running: seq([0, 1, 2, 3, 4, 5, 6, 7], .06, (i) => [N(1200, 700, 0, .03, .4, 2), T(i % 2 ? 260 : 220, 0, .04, .15, 'sine')]), dizzy: seq([0, 1, 2, 3, 4, 5], .1, (i) => [T(i % 2 ? 1800 : 1500, 0, .1, .12, 'sine', i % 2 ? 1500 : 1800)]),
  tweet: [T(3000, 0, .06, .14, 'sine', 3800), T(3200, .08, .06, .14, 'sine', 4000), T(2800, .16, .1, .12, 'sine', 3600)], kazoo: [T(350, 0, .4, .15, 'sawtooth', 390), N(700, 700, 0, .4, .05, 3)],
  rubber: [T(200, 0, .2, .3, 'sine', 500), T(500, .2, .2, .2, 'sine', 250)], springy: seq([0, 1, 2, 3, 4], .07, (i) => [T(300 + i * 50, 0, .07, .2 - i * .03, 'sine', 600 + i * 80)]),
  cuckoo: [T('E6', 0, .25, .2), T('C6', .3, .35, .2)], ricochet: [T(3000, 0, .4, .14, 'sine', 1200), N(5000, 2500, 0, .05, .3, 3)], falling: [T(2000, 0, 1.2, .14, 'sine', 300)],
  bombfall: [T(2400, 0, 1, .12, 'sine', 600), N(900, 60, 1, .8, .6, .7)], swanee: [T(600, 0, .35, .18, 'sine', 1500), T(1500, .35, .5, .18, 'sine', 500)], boing2: [T(100, 0, .5, .3, 'sine', 300), T(120, 0, .5, .1, tr, 360)],
  wobbly: seq([0, 1, 2, 3, 4, 5], .06, (i) => [T(i % 2 ? 260 : 380, 0, .06, .2, 'sine', i % 2 ? 380 : 260)]), plop: [T(200, 0, .08, .4, 'sine', 700), T(400, .05, .05, .1, 'sine', 900)],
  thud2: [T(110, 0, .2, .5, 'sine', 50), N(600, 200, 0, .08, .3, 1)], poke: [T(900, 0, .06, .3, 'sine', 1300)], peek: [T(800, 0, .1, .2, 'sine', 1600), T(1600, .12, .08, .12, 'sine')],
  gasp: [N(1200, 2400, 0, .25, .3, 1.5), T(600, 0, .2, .05, 'sine', 900)], tada2: [N(2000, 4000, 0, .2, .2, 1), ...['C5', 'E5', 'G5', 'C6'].flatMap((n) => [T(n, .15, .6, .1, tr)])],
  zing: [T(1500, 0, .3, .14, 'sine', 4000), T(2000, 0, .3, .05, sq, 5000)], plink2: [T(2400, 0, .15, .25, 'sine', 2300), T(4800, 0, .05, .06)], wahwah: [T('G4', 0, .35, .18, tr, 'F#4'), T('F#4', .4, .35, .18, tr, 'F4'), T('F4', .8, .8, .18, tr, 'E4')],
};
for (const [k, v] of Object.entries(CAR)) add('cartoon', k, v);

// ---------- nature and weather ----------
const r = R(7);
const NAT = {
  gust: [N(300, 900, 0, 1, .3, .8), N(600, 1500, .2, .7, .15, 1.5)], windhowl: [N(400, 700, 0, 1.4, .25, 6), N(500, 400, .3, 1.1, .2, 8)], drizzle: [...Array(18)].map((_, i) => N(5000 + r() * 4000, 4000, i * .06 + r() * .03, .02, .2, 4)),
  heavyrain: [N(3000, 2500, 0, 1.2, .3, .5), ...[...Array(20)].map((_, i) => N(4000 + r() * 3000, 3000, i * .05, .02, .25, 4))], hail: [...Array(16)].map((_, i) => N(3000 + r() * 3000, 2000, i * .06 + r() * .03, .02, .45, 3)),
  waves: [N(300, 1200, 0, .8, .35, .5), N(1200, 300, .8, .9, .25, .5)], stream: [...Array(14)].map((_, i) => T(500 + r() * 900, i * .07, .05, .1, 'sine', 900 + r() * 900)), waterfall: [N(800, 700, 0, 1.4, .35, .4), N(2500, 2200, 0, 1.4, .15, .6)],
  campfire: [N(400, 300, 0, 1.2, .12, .5), ...[...Array(10)].map((_, i) => N(2000 + r() * 3000, 1000, i * .11 + r() * .05, .015, .5, 3))], cricket: seq([0, 1, 2, 3, 4, 5], .06, () => [T(4500, 0, .03, .12, 'sine')]).concat(seq([0, 1, 2, 3, 4, 5], .06, () => [T(4500, 0, .03, .12, 'sine')]).map((s) => (s[2] += .6, s))),
  frog: [T(180, 0, .12, .35, 'sawtooth', 140), T(200, .18, .12, .3, 'sawtooth', 150)], owl: [T(380, 0, .3, .25, 'sine', 360), T(400, .45, .5, .25, 'sine', 340)], birdtrill: seq([...Array(9)].map((_, i) => i), .04, (i) => [T(3200 + (i % 2) * 600, 0, .04, .12, 'sine', 3600)]),
  birdsong: [T(2600, 0, .1, .14, 'sine', 3400), T(3400, .12, .08, .12, 'sine', 2800), T(3000, .24, .2, .14, 'sine', 3800), T(3800, .46, .06, .1, 'sine', 3000)], bees: [T(220, 0, 1, .15, 'sawtooth', 240), T(225, 0, 1, .12, 'sawtooth', 230)],
  rustle: [...Array(12)].map((_, i) => N(2500 + r() * 2500, 3000, i * .06, .05, .25, 1)), snowstep: [N(1200, 600, 0, .12, .45, 1), N(1500, 700, .3, .12, .4, 1)], icecrack: [N(6000, 2000, 0, .05, .5, 2), T(2500, 0, .3, .1, 'sine', 900), N(4000, 1500, .1, .08, .35, 2)],
  thunderfar: [N(200, 60, 0, 1.6, .5, .5), T(40, .1, 1.2, .2, 'sine', 30)], thunderclap: [N(3000, 300, 0, .2, .6, .6), N(400, 60, .1, 1.4, .5, .5)], quake: [T(35, 0, 1.4, .4, 'sawtooth', 28), N(120, 60, 0, 1.4, .4, .5)],
  lava: [...Array(8)].map((_, i) => T(120 + r() * 80, i * .14, .1, .35, 'sine', 300 + r() * 200)), geyser: [N(500, 4000, 0, 1, .4, .6), T(80, 0, .5, .2, 'sine', 160)], seagull: [T(1400, 0, .3, .14, 'sawtooth', 900), T(1500, .35, .25, .12, 'sawtooth', 1000)],
  wolf: [T(400, 0, 1.2, .2, 'sine', 700), T(800, 0, 1.2, .05, 'triangle', 1400)], purrcat: [...Array(12)].map((_, i) => T(28, i * .08, .07, .4, 'sawtooth', 26)).concat([N(200, 200, 0, 1, .1, 2)]), mosquito: [T(600, 0, 1, .06, 'sawtooth', 640), T(605, 0, 1, .05, 'sawtooth', 645)],
  droplets: [...Array(6)].map((_, i) => T(1200 + r() * 1400, i * .12, .05, .3, 'sine', 500)), puddle: [N(1500, 400, 0, .2, .45, 1), T(400, .05, .1, .15, 'sine', 900)], breezelight: [N(500, 1200, 0, 1.2, .15, .6)],
};
for (const [k, v] of Object.entries(NAT)) add('nature', k, v);

// ---------- hits and drums ----------
const drum = (f, d, g = .7, nz = .1) => [T(f, 0, d, g, 'sine', f * .55), N(f * 8, f * 4, 0, d * .3, nz, 1)];
const IMP = {
  tomhigh: drum(240, .3), tommid: drum(170, .35), tomlow: drum(120, .4), floortom: drum(85, .5, .8), rimshot: [N(3000, 2000, 0, .04, .6, 3), T(450, 0, .05, .35, 'triangle')],
  agogo: [T(900, 0, .25, .2, sq), T(1350, .15, .25, .16, sq)], clave: [T(2500, 0, .06, .4, 'sine')], shaker: [N(7000, 6000, 0, .1, .35, 1.5), N(7000, 6000, .15, .1, .3, 1.5)], tambourine: [N(8000, 7000, 0, .25, .3, 4), ...seq([0, 1, 2], .02, () => [T(5200, 0, .2, .04)])],
  ride: [N(8000, 6000, 0, .9, .2, 3), T(3500, 0, .9, .05)], crash: [N(6000, 3000, 0, 1.5, .4, .6)], splashcymbal: [N(9000, 5000, 0, .5, .35, .8)], congahigh: drum(380, .22, .6, .05), congalow: drum(260, .28, .6, .05),
  bongohigh: drum(520, .15, .55, .05), bongolow: drum(380, .18, .55, .05), timpani: [T(98, 0, 1.2, .5, 'sine', 92), T(147, 0, .8, .15), N(400, 200, 0, .1, .2, 1)], gavel: [N(1200, 600, 0, .05, .6, 2), T(400, 0, .1, .4, 'sine', 300), N(1200, 600, .25, .05, .5, 2), T(400, .25, .1, .35, 'sine', 300)],
  punch: [N(800, 200, 0, .1, .6, .8), T(120, 0, .15, .5, 'sine', 50)], slap: [N(3000, 1200, 0, .08, .6, .8)], stomp: [T(70, 0, .25, .7, 'sine', 35), N(500, 150, 0, .1, .4, .8)], doorslam: [N(1000, 150, 0, .3, .6, .6), T(80, 0, .3, .5, 'sine', 40)],
  woodhit: [N(1100, 800, 0, .06, .5, 3), T(500, 0, .1, .3, 'sine', 420)], metalhit: [T(830, 0, .7, .15), T(2200, 0, .5, .08), T(3700, 0, .3, .05), N(5000, 3000, 0, .04, .3, 3)], glassbreak: [N(6000, 3000, 0, .4, .4, 1), ...[...Array(8)].map((_, i) => T(3000 + i * 700, .02 + i * .04, .15, .06))],
  whipcrack: [N(2000, 9000, 0, .06, .5, 1.5), N(8000, 3000, .06, .05, .5, 2)], arrowthunk: [N(2000, 6000, 0, .15, .2, 1.2), N(900, 400, .15, .06, .5, 2), T(220, .15, .15, .3, 'sine', 160)], swordclash: [N(6000, 4000, 0, .06, .5, 3), T(2300, 0, .8, .1), T(3400, 0, .6, .06), T(5600, 0, .4, .04)],
  shieldblock: [N(1500, 800, 0, .08, .6, 2), T(300, 0, .3, .25, 'triangle', 260), T(900, 0, .25, .06)], anvil: [T(1100, 0, 1.2, .18), T(2900, 0, .8, .08), T(4500, 0, .5, .04), N(4000, 2000, 0, .03, .4, 3)],
  bassdrum: drum(60, .4, .9, .05), snaretight: [N(3500, 2500, 0, .12, .55, 1), T(260, 0, .06, .3, 'triangle', 200)], fingersnap: [N(2800, 2000, 0, .03, .7, 2), T(1800, 0, .02, .15, 'sine')], knucklecrack: [N(2000, 1000, 0, .02, .6, 2), N(2500, 1200, .05, .02, .5, 2)],
  basketball: [T(140, 0, .12, .5, 'sine', 90), N(800, 400, 0, .05, .3, 1)], tennis: [T(400, 0, .06, .5, 'sine', 300), N(2000, 1000, 0, .03, .4, 2)], golfhit: [N(4000, 2500, 0, .04, .6, 3), T(1800, 0, .1, .15)], bowling: [N(500, 200, 0, .6, .3, .5), ...seq([0, 1, 2, 3, 4], .04, () => [N(1500, 700, .6, .08, .45, 2)])],
};
for (const [k, v] of Object.entries(IMP)) add('impacts', k, v);

// ---------- motion ----------
const wh = (f1, f2, d, g = .4, q = 1.2) => [N(f1, f2, 0, d, g, q)];
const MOV = {
  whooshshort: wh(700, 3500, .15), whooshlong: wh(400, 2500, .6), whooshlow: wh(200, 900, .4, .5, 1), whooshhigh: wh(1500, 7000, .25, .35, 1.5), whooshdown: wh(4000, 500, .35), airswipe: wh(1200, 5000, .1, .4, 2),
  swordswing: [N(800, 4000, 0, .2, .35, 2), N(4000, 1500, .1, .1, .2, 2)], flagflap: [...Array(6)].map((_, i) => N(800, 1600, i * .09, .07, .3, 1)), cloth: [N(1200, 2500, 0, .25, .3, .8), N(2000, 1200, .2, .2, .2, .8)],
  paperslide: [N(2500, 4500, 0, .3, .3, .7)], cardflick: [N(3000, 1500, 0, .04, .5, 1.5), N(4000, 6000, .04, .08, .2, 1)], shuffle: [...Array(10)].map((_, i) => N(3000, 2500, i * .035, .03, .35, 1.2)),
  pageturn: [N(1500, 4500, 0, .25, .3, .8), N(3000, 2000, .22, .06, .3, 1.5)], bookclose: [N(1500, 300, 0, .1, .6, .8), T(110, 0, .15, .35, 'sine', 60)], velcro: [...Array(20)].map((_, i) => N(3500, 3000, i * .02, .015, .35, 4)),
  taperip: [N(2500, 1200, 0, .3, .45, 1.2), ...[...Array(8)].map((_, i) => N(4000, 3000, i * .035, .01, .25, 3))], spray: [N(6000, 7000, 0, .5, .3, .7)], swooshup: [N(500, 4000, 0, .3, .35, 1.5), T(300, 0, .3, .08, 'sine', 1200)],
  swooshdown: [N(4000, 500, 0, .3, .35, 1.5), T(1200, 0, .3, .08, 'sine', 300)], spin: [...Array(6)].map((_, i) => N(1000 + i * 300, 2500 + i * 300, i * .07, .07, .3, 2)), slidein: [N(400, 2000, 0, .25, .3, 1), T(200, .2, .1, .2, 'sine', 120)],
  slideout: [T(120, 0, .08, .2, 'sine', 200), N(2000, 400, .05, .25, .3, 1)], fold: [N(2000, 800, 0, .12, .4, 1), N(1500, 700, .12, .1, .3, 1)], unfold: [N(800, 2000, 0, .12, .3, 1), N(900, 2200, .12, .12, .35, 1)],
  bounceball: [0, .3, .52, .68, .79].flatMap((t, i) => [T(160, t, .1, .5 - i * .08, 'sine', 90)]), rollaway: [...Array(10)].map((_, i) => N(600, 500, i * .07, .06, .3 - i * .02, 2)), fly: [N(1500, 1500, 0, .9, .1, 6), T(120, 0, .9, .1, 'sawtooth', 110)],
  hover2: [T(150, 0, .9, .15, 'sine', 160), T(300, 0, .9, .05, 'sine', 320)], launch: [N(200, 5000, 0, .8, .4, .7), T(60, 0, .8, .3, 'sawtooth', 300)], landing: [N(3000, 300, 0, .4, .35, .8), T(90, .38, .2, .5, 'sine', 50)],
};
for (const [k, v] of Object.entries(MOV)) add('motion', k, v);

// ---------- machines and home ----------
const MAC = {
  microwave: [T(2000, 0, .15, .2, 'sine'), T(2000, .3, .15, .2, 'sine'), T(2000, .6, .15, .2, 'sine')], microwaveding: [T(3500, 0, 1, .15), T(7000, 0, .4, .04)], kettle: [T(2200, 0, 1.2, .1, 'sine', 2500), N(2400, 2600, 0, 1.2, .15, 8)],
  toaster: [N(1200, 600, 0, .06, .55, 2), T(500, 0, .2, .25, 'sine', 900)], fridge: [T(60, 0, 1.2, .3, 'sawtooth'), T(120, 0, 1.2, .1, 'sine')], washer: [...Array(6)].map((_, i) => T(90, i * .2, .18, .3, 'sawtooth', 80)),
  vacuum: [N(1500, 2500, 0, 1.2, .3, 1), T(200, 0, 1.2, .1, 'sawtooth', 260)], blender: [T(140, 0, 1, .2, 'sawtooth', 220), N(1200, 2000, 0, 1, .2, 1.5)], drill: [T(400, 0, .9, .15, 'sawtooth', 600), T(800, 0, .9, .06, sq, 1200)],
  saw: [...Array(8)].map((_, i) => N(1800, 3000, i * .1, .08, .4, 2)), printer: [...Array(12)].map((_, i) => T(i % 2 ? 600 : 500, i * .06, .05, .15, sq)), scanner: [T(300, 0, 1, .12, 'sawtooth', 320), N(2000, 2200, 0, 1, .08, 4)],
  faxmachine: seq([...Array(8)].map((_, i) => i), .08, (i) => [T([1100, 2100, 1650, 1850][i % 4], 0, .08, .1, 'sine')]), register: [T(3000, 0, .3, .15, sq), N(1500, 800, .05, .3, .3, 1), T(2637, .3, .6, .15), T(3520, .35, .7, .12)],
  flashcharge: [T(800, 0, 1, .1, 'sine', 6000)], filmreel: [...Array(14)].map((_, i) => N(2500, 2000, i * .05, .02, .35, 3)), vinylscratch: [N(800, 3000, 0, .12, .5, 2), N(3000, 600, .12, .14, .5, 2)],
  taperewind: [T(800, 0, .8, .08, 'sawtooth', 2400), N(3000, 5000, 0, .8, .1, 2)], carstart: [...Array(5)].map((_, i) => T(40 + i * 4, i * .09, .08, .4, 'sawtooth')).concat([T(70, .45, .7, .35, 'sawtooth', 90)]),
  enginerev: [T(70, 0, .9, .35, 'sawtooth', 220), T(140, 0, .9, .12, sq, 440)], motorbike: [T(90, 0, 1, .3, sq, 250), T(91, 0, 1, .2, 'sawtooth', 252)], trainhorn: [T(311, 0, 1, .12, 'sawtooth'), T(370, 0, 1, .12, 'sawtooth'), T(466, 0, 1, .1, 'sawtooth')],
  shiphorn: [T(98, 0, 1.4, .3, 'sawtooth'), T(147, 0, 1.4, .12, 'sawtooth')], cardoor: [N(800, 200, 0, .2, .55, .8), T(90, 0, .2, .45, 'sine', 50), N(3000, 1500, .22, .05, .3, 2)], seatbelt: [T(1400, 0, .5, .15), T(1400, .6, .5, .15)],
  turnsignal: [...Array(4)].flatMap((_, i) => [N(3000, 2000, i * .4, .02, .5, 3), N(2500, 1800, i * .4 + .2, .02, .4, 3)]), elevator: [T('E6', 0, .9, .18), T('C6', .45, 1.2, .18)], helicopter: [...Array(14)].map((_, i) => N(400, 200, i * .08, .06, .45, .8)),
  jetflyby: [N(800, 3000, 0, .7, .3, .8), N(3000, 600, .7, .8, .3, .8)], propeller: [...Array(16)].map((_, i) => T(90, i * .05, .04, .35, 'sawtooth', 70)), sirenwail: [T(600, 0, .6, .12, 'sawtooth', 1200), T(1200, .6, .6, .12, 'sawtooth', 600)],
  sirenyelp: [...Array(6)].map((_, i) => T(700, i * .15, .15, .12, 'sawtooth', 1300)), foghorn: [T(110, 0, 1.4, .3, 'sawtooth', 105), T(165, 0, 1.4, .1, 'sawtooth', 160)], buzzer: [T(110, 0, .6, .25, sq), T(112, 0, .6, .2, 'sawtooth')],
  alarmclock: [...Array(12)].map((_, i) => T(2400, i * .06, .04, .15, sq)), smokealarm: [T(3200, 0, .2, .2, sq), T(3200, .3, .2, .2, sq), T(3200, .6, .2, .2, sq)], doorlock: [N(2500, 1500, 0, .03, .6, 3), T(300, 0, .06, .3, 'triangle', 240), N(3000, 1800, .1, .03, .5, 3)],
  keys: [...Array(8)].map((_, i) => T(3000 + ((i * 37) % 9) * 300, i * .05, .15, .06)), coffee: [...Array(10)].map((_, i) => T(200 + r() * 200, i * .1, .08, .2, 'sine', 500 + r() * 300)).concat([N(4000, 3000, 0, 1, .06, 2)]), dishwasher: [N(1500, 1200, 0, 1, .15, .6), T(200, 0, 1, .06, 'sawtooth')],
  zipclose: [...Array(12)].map((_, i) => N(1500 + i * 300, 2000 + i * 300, i * .02, .015, .35, 6)), lighter: [N(4000, 2000, 0, .05, .5, 2), N(1500, 1200, .06, .5, .2, .8)], match: [N(3000, 1200, 0, .15, .45, 1), N(800, 700, .15, .5, .15, .8)],
  vendingmachine: [T(1000, 0, .1, .15, sq), N(600, 200, .2, .4, .4, .8), T(100, .6, .2, .5, 'sine', 50)], arcade: seq([523, 659, 784, 659, 523, 392], .07, (f) => [T(f, 0, .07, .12, sq)]),
};
for (const [k, v] of Object.entries(MAC)) add('machines', k, v);

// ---------- check, level and write ----------
const A = require('./audio.js'), MG = require('../lib.js').MG;
const okStep = (s) => MG.sound.check({ synth: [s] });
const kweight = (x, sr) => { const bq = (x, t, f, q, gdb) => { const Aa = Math.pow(10, gdb / 40), w = 2 * Math.PI * f / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q); let b0, b1, b2, a0, a1, a2;
  if (t === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al } else { const sqq = 2 * Math.sqrt(Aa) * al; b0 = Aa * ((Aa + 1) + (Aa - 1) * c + sqq); b1 = -2 * Aa * ((Aa - 1) + (Aa + 1) * c); b2 = Aa * ((Aa + 1) + (Aa - 1) * c - sqq); a0 = (Aa + 1) - (Aa - 1) * c + sqq; a1 = 2 * ((Aa - 1) - (Aa + 1) * c); a2 = (Aa + 1) - (Aa - 1) * c - sqq }
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v } return y };
  return bq(bq(x, 'hs', 1681, .707, 4), 'hp', 38, .5, 0) };
async function measure(steps) {
  MG.sound.define('zzmeasure', null); MG.sound.define('zzmeasure', { synth: steps });
  const buf = await MG.sound.render('zzmeasure', { delay: 0, pan: 0 }, A.OfflineContext), L = buf.getChannelData(0), sr = buf.sampleRate, win = Math.round(sr * .01), k = kweight(L, sr);
  let peak = 0, sum = 0, cnt = 0, last = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]));
  for (let i = 0; i < k.length; i += win) { let e = 0; for (let j = i; j < Math.min(i + win, k.length); j++) e += k[j] * k[j]; const rms = Math.sqrt(e / win); if (rms > .003) { sum += rms * rms; cnt++; last = (i + win) / sr } }
  return { peak, loud: cnt ? Math.sqrt(sum / cnt) : 0, len: last };
}
(async () => {
  const TARGET = 0.054, out = {}, groups = {}, problems = [];
  const builtIn = new Set(MG.sound.names());
  for (const [name, [fam, steps0]] of Object.entries(P)) {
    if (!/^[a-z0-9]{1,20}$/.test(name)) { problems.push(name + ': bad name'); continue; }
    if (builtIn.has(name)) { problems.push(name + ': clashes with a built-in sound'); continue; }
    let steps = steps0.filter((s) => s[1] <= 18000 && (s[0] !== 'n' || s[2] <= 18000) && (s[0] !== 't' || !s[6] || s[6] <= 18000)).map((s) => s.map((v) => typeof v === 'number' ? +v.toFixed(4) : v)).filter((s) => (s[0] === 't' ? s[2] : s[3]) < 2.5);
    steps = steps.map((s) => { if (s[0] === 't' && s[2] + s[3] > 2.5) s[3] = +(2.5 - s[2]).toFixed(3); if (s[0] === 'n' && s[3] + s[4] > 2.5) s[4] = +(2.5 - s[3]).toFixed(3); return s; });
    if (steps.length > 48) steps = steps.slice(0, 48);
    if (!MG.sound.check({ synth: steps })) { problems.push(name + ': invalid ' + JSON.stringify(steps.find((s) => !okStep(s)))); continue; }
    const m = await measure(steps);
    if (m.loud < 1e-3) { problems.push(name + ': silent'); continue; }
    let g = TARGET / m.loud; if (m.peak * g > .9) g = .9 / m.peak;
    const lv = steps.map((s) => { const x = s.slice(), i = x[0] === 't' ? 4 : 5; x[i] = +Math.max(.001, Math.min(1, x[i] * g)).toFixed(4); return x; });
    const chk = await measure(lv);
    out[name] = lv; (groups[fam] = groups[fam] || []).push(name);
    if (chk.peak > .98) problems.push(name + ': clips at ' + chk.peak.toFixed(2));
  }
  const pack = { v: 1, groups, sounds: out };
  const file = path.join(__dirname, '..', 'web', 'sounds-more.js');
  fs.writeFileSync(file, '/*! Magic Glyphs extra sounds: ' + Object.keys(out).length + ' designed sounds on top of the 100 built in. Load after the runtime; they are added with MagicGlyphs.sound.add. */\n' +
    '(function(root,pack){if(typeof module===\'object\'&&module.exports)module.exports=pack;var MG=root&&root.MagicGlyphs;if(MG&&MG.sound&&MG.sound.add)MG.sound.add(pack)})(typeof self!==\'undefined\'?self:this,' + JSON.stringify(pack) + ');\n');
  console.log('sounds:', Object.keys(out).length, Object.entries(groups).map(([k, v]) => k + ' ' + v.length).join(', '));
  console.log('size:', Math.round(fs.statSync(file).size / 1024) + ' KB', 'gzip:', Math.round(require('zlib').gzipSync(fs.readFileSync(file)).length / 1024) + ' KB');
  if (problems.length) { console.log('problems:\n' + problems.join('\n')); process.exitCode = 1; }
})();
