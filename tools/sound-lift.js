// Works out the LIFT table in web/runtime.js: extra gain for sounds that come across quieter than the rest.
// Loudness is measured halfway between full range and a small speaker (300 Hz high-pass), over the loudest 100 ms.
// Each sound is rendered several times, because noise-based sounds peak differently every play, and lifted only up to -3 dBFS.
// Usage: node tools/sound-lift.js            (prints the table and writes it into web/runtime.js)
const fs = require('fs'), path = require('path');
const RT = path.join(__dirname, '..', 'web', 'runtime.js');
// measure without the current table
const src = fs.readFileSync(RT, 'utf8');
fs.writeFileSync(RT, src.replace(/var LIFT=\{[^}]*\};/, 'var LIFT={};'));
for (const k of Object.keys(require.cache)) delete require.cache[k];
const L = require('../lib.js'), A = require('./audio.js');
const TRIES = 12, CEIL = -3, MAXLIFT = 12;
function measure(d, sr) {
  const hp = new Float32Array(d.length); { const rc = 1 / (2 * Math.PI * 300), a = rc / (rc + 1 / sr); let y = 0, px = 0; for (let i = 0; i < d.length; i++) { y = a * (y + d[i] - px); px = d[i]; hp[i] = y; } }
  const win = Math.round(sr * .1), best = (x) => { let m = 0, s = 0; for (let i = 0; i < x.length; i++) { s += x[i] * x[i]; if (i >= win) s -= x[i - win] * x[i - win]; if (i >= win - 1) m = Math.max(m, s / win); } return 10 * Math.log10(m + 1e-12); };
  let pk = 0; for (const v of d) pk = Math.max(pk, Math.abs(v));
  return { loud: (best(d) + best(hp)) / 2, peak: 20 * Math.log10(pk + 1e-12) };
}
(async () => {
  const names = L.MG.sound.names(), res = {};
  for (const n of names) {
    let loud = 0, peak = -120;
    for (let i = 0; i < TRIES; i++) { const b = await L.MG.sound.render(n, { delay: 0, pan: 0 }, A.OfflineContext); const m = measure(b.getChannelData(0), b.sampleRate); loud += m.loud / TRIES; peak = Math.max(peak, m.peak); }
    res[n] = { loud, peak };
  }
  const sorted = Object.values(res).map((r) => r.loud).sort((a, b) => a - b), target = sorted[sorted.length >> 1];
  const lift = {};
  for (const [n, r] of Object.entries(res)) { const db = Math.max(0, Math.min(target - r.loud, CEIL - r.peak, MAXLIFT)); if (db >= 1.5) lift[n] = +Math.pow(10, db / 20).toFixed(2); }
  fs.writeFileSync(RT, src.replace(/var LIFT=\{[^}]*\};/, 'var LIFT=' + JSON.stringify(lift) + ';'));
  console.log(`${names.length} sounds, target ${target.toFixed(1)} dB; lifted ${Object.keys(lift).length}`);
})().catch((e) => { fs.writeFileSync(RT, src); console.error(e); process.exit(1); });
