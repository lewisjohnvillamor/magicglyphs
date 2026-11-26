// Proposes better sounds for icons that still use a generic one, now that there are 528 sounds.
// Words in the icon's name decide (tags only as a fallback for a few safe words). Writes tools/sound-match.json for review;
// nothing in the library changes until it is applied with --apply.
// Usage: node tools/sound-match.js [--apply]
const fs = require('fs'), path = require('path');
const DATA = path.join(__dirname, '..', 'data', 'icons.json');
const d = JSON.parse(fs.readFileSync(DATA, 'utf8')), all = d.icons || d;
const L = require('../lib.js'), SOUNDS = new Set(L.MG.sound.names());
// sounds that say nothing specific: icons using these may get a better one
const GENERIC = new Set(['tap', 'pop', 'pops', 'swish', 'blink', 'tick2', 'glow', 'soft', 'beep', 'breeze', 'scribble', 'knock', 'thump', 'click', 'chime', 'whoosh', 'drop', 'notes']);
// one word of the icon's name -> sound (several sounds rotate, so a family does not all sound the same)
const WORD = {
  // interface actions
  copy: 'copy', duplicate: 'copy', clone: 'copy', paste: 'paste', clipboard: 'paste', cut: 'cut', scissors: 'cut', undo: 'undo', redo: 'redo',
  save: 'save', floppy: 'save', send: 'send', upload: 'upload', download: 'download', import: 'download', export: 'upload', sync: 'syncing', refresh: 'refreshed',
  reload: 'refreshed', loader: 'loading', loading: 'loading', spinner: 'loading', hourglass: 'countdown', 'zoom-in': 'zoomin', 'zoom-out': 'zoomout', maximize: 'expand', minimize: 'collapse',
  expand: 'expand', collapse: 'collapse', menu: 'menuopen', sidebar: 'slidein', drawer: 'slidein', panel: 'slidein', tabs: 'tabswitch', tab: 'tabswitch', toggle: 'toggleon',
  switch: 'lightswitch', slider: 'slider', sliders: 'slider', equalizer: 'slider', pin: 'pin', pushpin: 'pin', scroll: 'scroll', drag: 'dragstart', grip: 'dragstart', move: 'dragdrop',
  keyboard: 'keypress', key: 'key', keys: 'keys', type: 'typing', text: 'typing', cursor: 'focus', focus: 'focus', target: 'focus', crosshair: 'focus',   badge: 'badge', notification: 'notifydot', inbox: 'mailin', mail: 'mailin', envelope: 'mailin', 'mail-open': 'mailout', message: 'messagein', chat: 'messagein', comment: 'messagein', reply: 'messageout',
  phone: 'callring', call: 'callring', telephone: 'oldphone', pager: 'pager', bell: 'bell', alarm: 'alarmclock', clock: 'ticktock', timer: 'timerdone', stopwatch: 'countdown', calendar: 'reminder', reminder: 'reminder',
  // objects and machines
  printer: 'printer', print: 'printer', scanner: 'scanner', fax: 'faxmachine', camera: 'shutter', film: 'filmreel', video: 'filmreel', vinyl: 'vinylscratch', record: 'vinylscratch', cassette: 'taperewind', tape: 'taperewind',
  microwave: 'microwave', kettle: 'kettle', toaster: 'toaster', fridge: 'fridge', refrigerator: 'fridge', washer: 'washer', washing: 'washer', vacuum: 'vacuum', blender: 'blender', drill: 'drill', saw: 'saw',
  lighter: 'lighter', match: 'match', matches: 'match', lock: 'lock', padlock: 'lock', unlock: 'unlock', door: 'doorlock', doorbell: 'doorbell',
  register: 'register', 'cash-register': 'register', cash: 'kaching', money: 'kaching', banknote: 'kaching', wallet: 'coinbag', coins: 'coinbag', coin: 'coin', piggy: 'coin', gem: 'gem', diamond: 'gem', crystal: 'crystaltap',
  gift: 'chest', chest: 'chest', treasure: 'chest', trophy: 'achievement', medal: 'achievement', award: 'achievement', party: 'celebrate', confetti: 'celebrate', balloon: 'celebrate', cake: 'celebrate',
  book: 'pageturn', books: 'pageturn', notebook: 'pageturn', page: 'pageturn', newspaper: 'pageturn', paper: 'paperslide', file: 'paperslide', document: 'paperslide', folder: 'paperslide', card: 'cardflick', cards: 'shuffle',
  eraser: 'rubbertap', ruler: 'woodtap', hammer: 'anvil', anvil: 'anvil', wrench: 'ratchet', screwdriver: 'ratchet', tools: 'ratchet', gavel: 'gavel', scale: 'metalclick',
  shirt: 'cloth', jacket: 'cloth', hanger: 'cloth', tshirt: 'cloth', sock: 'cloth', glove: 'velcro', shoe: 'velcro',   spray: 'spray', 'spray-can': 'spray', sword: 'swordswing', swords: 'swordclash', shield: 'shieldblock', bow: 'arrowthunk', archery: 'arrowthunk', bomb: 'bomb', dynamite: 'bomb', explosion: 'explode', magnet: 'charge',
  robot: 'robot', bot: 'beepboop', alien: 'alien', ufo: 'ufo', satellite: 'satellite', radar: 'radar', sonar: 'sonar', antenna: 'transmission',
  radio: 'transmission', broadcast: 'transmission', signal: 'transmission', cpu: 'computer', chip: 'computer', server: 'datastream', database: 'datastream', terminal: 'boot', power: 'boot',
  portal: 'portal', atom: 'energy', flask: 'mutation', dna: 'mutation', virus: 'mutation', telescope: 'satellite', rocket: 'liftoff', planet: 'hyperdrive', galaxy: 'hyperdrive',
  // transport
  car: 'carstart', taxi: 'carstart', truck: 'enginerev', bus: 'enginerev', tractor: 'enginerev', motorcycle: 'motorbike', scooter: 'motorbike', bike: 'bikebell', bicycle: 'bikebell', train: 'trainhorn', tram: 'trainhorn',
  ship: 'shiphorn', boat: 'shiphorn', anchor: 'shipbell', sailboat: 'waves', plane: 'jetflyby', airplane: 'jetflyby', helicopter: 'helicopter', drone: 'propeller', fuel: 'engine', gas: 'engine', elevator: 'elevator', seatbelt: 'seatbelt',
  ambulance: 'sirenwail', siren: 'sirenwail', police: 'sirenyelp', fire_truck: 'sirenwail', horn: 'honk', traffic: 'turnsignal',
  // nature and weather
  rain: 'rain', umbrella: 'drizzle', drizzle: 'drizzle', storm: 'thunderclap', thunder: 'thunderfar', lightning: 'thunderclap', snow: 'snowstep', snowflake: 'snowstep', ice: 'icecrack', hail: 'hail', wind: 'gust', tornado: 'windhowl',
  wave: 'hello', waves: 'waves', ocean: 'waves', beach: 'waves', water: 'stream', river: 'stream', waterfall: 'waterfall', droplet: 'drip', drop: 'drip', fire: 'campfire', flame: 'crackle', campfire: 'campfire', volcano: 'lava',
  earthquake: 'quake', flower: 'birdsong', bird: 'birdtrill', owl: 'owl', frog: 'frog', bee: 'bees', bug: 'mosquito', mosquito: 'mosquito', cricket: 'cricket',
  cat: 'purrcat', wolf: 'wolf', gull: 'seagull', fish: 'bubble', bubble: 'bubble', soap: 'bubble', sun: 'wakeup', sunrise: 'wakeup', sunset: 'goodnight', bed: 'goodnight', sleep: 'goodnight',
  // music and games
  music: 'notes', note: 'notes', piano: 'pianochord', guitar: 'pluckchord', harp: 'harpchord', drum: 'bassdrum', drums: 'snare', cymbal: 'crash', trumpet: 'fanfare', microphone: 'focus', headphones: 'notes', bell_ring: 'bell',
  gamepad: 'startgame', joystick: 'arcade', controller: 'startgame', dice: 'shuffle', puzzle: 'selectitem', chess: 'woodtap', ball: 'bounceball', basketball: 'basketball', football: 'kick', soccer: 'kick', tennis: 'tennis',
  golf: 'golfhit', bowling: 'bowling', dumbbell: 'clank', boxing: 'punch', heart: 'heartbeat', star: 'sparkle', sparkles: 'sparkle', magic: 'magic', wand: 'magic', ghost: 'cloak', skull: 'die',
  // people and hands
  hand: 'clap', clap: 'clap', handshake: 'slap', fist: 'punch', 'thumbs-up': 'correct', 'thumbs-down': 'wrong', snap: 'fingersnap', wave_hand: 'hello', smile: 'tweet', laugh: 'tada2', sad: 'wahwah', angry: 'honk',
  footprints: 'tiptoe', walk: 'tiptoe', run: 'running', running: 'running', dizzy: 'dizzy', question: 'question', help: 'question', info: 'softalert', warning: 'warning', alert: 'warning', error: 'error', check: 'correct', ok: 'correct',
  // food
  pizza: 'sizzle', burger: 'sizzle', bacon: 'sizzle', egg: 'crunch', 'enter-key': 'enterkey', 'air-balloon': 'rise', 'space-bar': 'spacebar', 'alarm-clock': 'alarmclock', 'smoke-alarm': 'smokealarm', 'fire-alarm': 'smokealarm', 'vending-machine': 'vendingmachine', 'credit-card': 'register', 'shopping-cart': 'pickup', 'game-controller': 'startgame', 'light-bulb': 'lightswitch', 'lightbulb': 'lightswitch', 'traffic-light': 'turnsignal', soda: 'fizz', beer: 'fizz', champagne: 'celebrate', wine: 'glasstap', glass: 'glasstap', bottle: 'gulp', drink: 'gulp', juice: 'gulp', popcorn: 'pops', apple: 'crunch', carrot: 'crunch',
};
// endings that change the meaning
// only where the icon's current sound says nothing (a plain tap or pop), not where it already fits (alert, success)
const SUFFIX = [[/-off$/, 'switchoff'], [/-x$/, 'cancel'], [/-(slash|ban|no)$/, 'deselect'], [/-(check|done|ok)$/, 'correct'], [/-(question|help)$/, 'question']];
const PLAIN = new Set(['tap', 'pop', 'pops', 'blink', 'tick2', 'glow', 'soft', 'beep', 'breeze', 'scribble', 'knock', 'thump', 'click', 'chime', 'whoosh', 'drop', 'notes', 'swish']);
function pick(ic) {
  const name = ic.n, words = name.split('-');
  for (const [re, s] of SUFFIX) if (re.test(name)) return PLAIN.has(ic.s) ? [s, 'ending ' + name.match(re)[0]] : null;
  for (let i = words.length - 1; i >= 0; i--) {          // the last word usually names the thing (credit-card, coffee-cup)
    const two = i > 0 ? words[i - 1] + '-' + words[i] : null;
    if (two && WORD[two]) return [WORD[two], 'name "' + two + '"'];
    if (WORD[words[i]]) return [WORD[words[i]], 'name "' + words[i] + '"'];
  }
  return null;
}
// kept as they are after review
const KEEP = new Set(['phone-arrow-up', 'call-minus']);
// sounds that did not fit in review; never proposed
const NEVER = new Set(['flagflap', 'rustle', 'zipper', 'zipclose', 'flashcharge', 'scan', 'coffee', 'scribble']);
const out = [], counts = {};
for (const ic of all) {
  if (!GENERIC.has(ic.s)) continue;
  if (KEEP.has(ic.n) || /(^|-)moon(-|$)/.test(ic.n)) continue;
  const p = pick(ic); if (!p) continue;
  if (NEVER.has(p[0])) continue;
  const [s, why] = p; if (!SOUNDS.has(s)) { console.warn('unknown sound', s); continue; }
  if (s === ic.s) continue;
  out.push({ n: ic.n, c: ic.c, from: ic.s, to: s, why }); counts[s] = (counts[s] || 0) + 1;
}
fs.writeFileSync(path.join(__dirname, 'sound-match.json'), JSON.stringify(out, null, 1));
const used = new Set(all.map((i) => i.s)); out.forEach((o) => used.add(o.to));
console.log(`${out.length} icons would get a more specific sound; sounds in use: ${new Set(all.map((i) => i.s)).size} -> ${used.size} of ${SOUNDS.size}`);
if (process.argv.includes('--apply')) {
  const by = new Map(out.map((o) => [o.n, o.to]));
  // the runtime has 100 sounds built in; an icon whose sound is in the optional pack carries that sound's steps (S.custom),
  // so it plays the same with or without the pack loaded
  delete require.cache[require.resolve('../web/runtime.js')];
  const base = new Set(require('../web/runtime.js').sound.names());
  for (const ic of all) if (by.has(ic.n)) {
    ic.s = by.get(ic.n);
    if (!base.has(ic.s)) ic.S = Object.assign({}, ic.S, { custom: { synth: L.MG.sound.steps(ic.s) } });
  }
  fs.writeFileSync(DATA, JSON.stringify(d)); console.log('applied to data/icons.json');
}
