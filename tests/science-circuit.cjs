// Run: node tests/science-circuit.cjs
// Compare with the drawing on origin/main: node tests/science-circuit.cjs --original
// No DOM package, browser, network, or source-file changes are needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const original = process.argv.includes('--original');
const EPS = 1e-7;
let checks = 0;

function load(grade) {
  const nodes = Object.fromEntries(['sw', 'b2', 'cv', 'co'].map(id => [id, {checked: true, innerHTML: ''}]));
  const buttons = ['s', 'p'].map(m => ({dataset: {m}, classList: {add() {}, remove() {}}}));
  const A = {
    S: {done: {}, seen: {}}, R: {}, esc: String, ic: () => '', ar: String,
    pick: a => a[0], shuffle: a => a.slice(), rnd: () => 0,
    save() {}, addXP() {}, quiz() {}, fig() {}, toast() {},
    $: selector => nodes[selector.slice(1)],
    $$: selector => selector === '#cm .chip' ? buttons : []
  };
  const context = {window: {APP: A, CFG: {grade}}, console, setTimeout() {}, requestAnimationFrame() {}, cancelAnimationFrame() {}};
  vm.createContext(context);
  for (const name of ['content.js', 'sc-gen.js', 'sc.js']) {
    const relative = `g${grade}/science/${name}`;
    const source = original && name === 'sc.js'
      ? execFileSync('git', ['show', `origin/main:${relative}`], {cwd: root, encoding: 'utf8'})
      : fs.readFileSync(path.join(root, relative), 'utf8');
    vm.runInContext(source, context, {filename: relative});
  }
  A.SIM.circuit.init();
  return {nodes, show(mode, on, intact) {
    nodes.sw.checked = on;
    nodes.b2.checked = intact;
    buttons.find(b => b.dataset.m === mode).onclick();
    return nodes.cv.innerHTML;
  }};
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
}
function tags(svg, name) {
  return [...svg.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(m => attributes(m[0]));
}
function segments(d) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/g) || [];
  let i = 0, command, at = [0, 0];
  const result = [];
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) command = tokens[i++];
    assert.ok(/[MmLlHhVv]/.test(command), `Unsupported conductor command: ${command}`);
    const relative = command === command.toLowerCase();
    const op = command.toUpperCase();
    let next;
    if (op === 'H') next = [Number(tokens[i++]) + (relative ? at[0] : 0), at[1]];
    else if (op === 'V') next = [at[0], Number(tokens[i++]) + (relative ? at[1] : 0)];
    else next = [Number(tokens[i++]) + (relative ? at[0] : 0), Number(tokens[i++]) + (relative ? at[1] : 0)];
    assert.ok(next.every(Number.isFinite), 'A conductor must have finite coordinates');
    if (op !== 'M') result.push([at, next]);
    else command = relative ? 'l' : 'L';
    at = next;
  }
  return result;
}
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const key = p => p.map(n => Math.round(n * 1e6) / 1e6).join(',');
function onSegment(p, [a, b]) {
  return Math.abs(cross(sub(p, a), sub(b, a))) < EPS &&
    p.every((n, i) => n >= Math.min(a[i], b[i]) - EPS && n <= Math.max(a[i], b[i]) + EPS);
}
function intersections(s, t) {
  const [a, b] = s, [c, d] = t, r = sub(b, a), v = sub(d, c), den = cross(r, v);
  if (Math.abs(den) < EPS) return [a, b, c, d].filter(p => onSegment(p, s) && onSegment(p, t));
  const u = cross(sub(c, a), r) / den, k = cross(sub(c, a), v) / den;
  return k >= -EPS && k <= 1 + EPS && u >= -EPS && u <= 1 + EPS
    ? [[a[0] + k * r[0], a[1] + k * r[1]]] : [];
}
function graph(wires, extra = []) {
  const points = new Map([...wires.flat(), ...extra].map(p => [key(p), p]));
  for (let i = 0; i < wires.length; i++) for (let j = i + 1; j < wires.length; j++) {
    for (const p of intersections(wires[i], wires[j])) points.set(key(p), p);
  }
  const g = new Map([...points.keys()].map(k => [k, new Set()]));
  for (const wire of wires) {
    const pp = [...points.values()].filter(p => onSegment(p, wire));
    pp.sort((a, b) => (a[0] - wire[0][0]) ** 2 + (a[1] - wire[0][1]) ** 2 -
      (b[0] - wire[0][0]) ** 2 - (b[1] - wire[0][1]) ** 2);
    for (let i = 1; i < pp.length; i++) {
      g.get(key(pp[i - 1])).add(key(pp[i]));
      g.get(key(pp[i])).add(key(pp[i - 1]));
    }
  }
  return g;
}
function connected(g, from, to) {
  const goals = new Set(to.map(key)), seen = new Set(), pending = from.map(key);
  while (pending.length) {
    const p = pending.pop();
    if (goals.has(p)) return true;
    if (seen.has(p)) continue;
    seen.add(p);
    pending.push(...g.get(p) || []);
  }
  return false;
}

function inspect(svg, mode, on, intact, label) {
  const paths = tags(svg, 'path');
  // Wires and the switch blade are conductors; filaments and break marks are not.
  const wires = paths.filter(p => ['#4a5c30', '#e8a33d'].includes(p.stroke)).flatMap(p => segments(p.d));
  const battery = tags(svg, 'rect').find(r => r.fill === '#2d3320');
  assert.ok(battery, `${label}: a battery is drawn`);
  const x = +battery.x, y = +battery.y, width = +battery.width, height = +battery.height;
  const contacts = edge => wires.flatMap(w => intersections(w, edge));
  const positive = contacts([[x, y], [x + width, y]]);
  const negative = contacts([[x, y + height], [x + width, y + height]]);
  assert.ok(positive.length && negative.length, `${label}: both battery poles touch conductors`);
  let g = graph(wires, [...positive, ...negative]);
  assert.equal(connected(g, positive, negative), false, `${label}: short circuit: wires bypass the lamps between battery poles`);
  checks++;

  const bulbs = tags(svg, 'circle').filter(c => c.stroke === '#555').map(c => {
    const cx = +c.cx, cy = +c.cy, r = +c.r;
    const cardinal = [[cx - r, cy], [cx + r, cy], [cx, cy - r], [cx, cy + r]];
    const terminals = cardinal.filter(p => wires.some(w => onSegment(p, w)));
    assert.equal(terminals.length, 2, `${label}: every lamp has two conductor terminals on its rim`);
    for (const [a, b] of wires) {
      const delta = sub(b, a), length2 = delta[0] ** 2 + delta[1] ** 2;
      const t = length2 ? Math.max(0, Math.min(1, ((cx - a[0]) * delta[0] + (cy - a[1]) * delta[1]) / length2)) : 0;
      assert.ok(Math.hypot(a[0] + t * delta[0] - cx, a[1] + t * delta[1] - cy) >= r - EPS,
        `${label}: a wire passes through a lamp instead of stopping at its terminals`);
    }
    return {terminals, lit: c.fill === '#ffd36b'};
  });
  assert.equal(bulbs.length, 2, `${label}: two lamps are drawn`);
  const expected = on ? mode === 'p' ? [true, intact] : [intact, intact] : [false, false];
  assert.deepEqual(bulbs.map(b => b.lit), expected, `${label}: visible lamp states match the switch and failed-lamp controls`);
  checks++;

  g = graph(wires, [...positive, ...negative, ...bulbs.flatMap(b => b.terminals)]);
  if (mode === 'p' && on) for (const bulb of bulbs) {
    const [a, b] = bulb.terminals;
    assert.ok((connected(g, positive, [a]) && connected(g, negative, [b])) ||
      (connected(g, positive, [b]) && connected(g, negative, [a])),
    `${label}: each parallel lamp spans both supply rails on its own branch`);
    checks++;
  }
  // Electrical continuity independently predicts illumination: close only intact lamps.
  for (let i = 0; i < bulbs.length; i++) {
    const otherWorkingLamps = bulbs.filter((b, j) => j !== i && (j !== 1 || intact)).map(b => b.terminals);
    const circuit = graph([...wires, ...otherWorkingLamps], [...positive, ...negative, ...bulbs[i].terminals]);
    const [a, b] = bulbs[i].terminals;
    const powered = (i !== 1 || intact) && ((connected(circuit, positive, [a]) && connected(circuit, negative, [b])) ||
      (connected(circuit, positive, [b]) && connected(circuit, negative, [a])));
    assert.equal(powered, bulbs[i].lit, `${label}: illumination must follow the drawn circuit's connectivity`);
    checks++;
  }
}

for (const grade of [6, 8]) {
  const circuit = load(grade);
  // Parallel first: the committed drawing's direct rail short must fail explicitly.
  for (const mode of ['p', 's']) for (const on of [true, false]) for (const intact of [true, false]) {
    inspect(circuit.show(mode, on, intact), mode, on, intact, `g${grade} ${mode} switch=${on} lamp2=${intact}`);
    assert.ok(circuit.nodes.co.innerHTML.length, 'A textual explanation accompanies the drawing');
    checks++;
  }
}
console.log(`Passed ${checks} circuit topology, continuity, control and illumination checks.`);
