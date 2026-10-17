// Run: node tests/admin-dashboard.cjs. Isolated synthetic data, UI and real service-worker fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'admin');
const read = file => fs.readFileSync(path.join(directory, file), 'utf8');
const scope = 'https://example.test/abboud-math/admin/';
const source = read('admin.js');
const worker = read('sw.js');
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
function equal(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++; }
const demoContext = {window: {}};
vm.runInNewContext(read('demo-data.js'), demoContext);
const data = JSON.parse(JSON.stringify(demoContext.window.ADMIN_DEMO));

// A preview must never inspect the real profiles or substitute pretend API requests.
for (const file of ['admin.js', 'demo-data.js', 'index.html']) {
  const text = read(file);
  check(!/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/.test(text), file + ': no private storage/network clients');
  check(!/\bfetch\s*\(|profiles\.js|catalog\.js|entry\.js|bustan_profiles|bustan_owner/.test(text), file + ': preview is isolated from live progress');
}
check(/بيانات تجريبية/.test(read('index.html')), 'Synthetic preview is disclosed before the dashboard');
check(/noindex\s*,\s*nofollow/.test(read('index.html')), 'Preview requests no indexing');
check(/ليست أعداد دروس المنهاج الفعلية/.test(read('demo-data.js')), 'Demo denominators are not presented as verified textbook totals');
equal(data.courses.length, 8, 'Exactly the eight existing grade/subject courses');
const combinations = new Set();
for (const course of data.courses) {
  check([6, 8].includes(course.grade), 'Known grade');
  check(['math', 'arabic', 'english', 'science'].includes(course.subject), 'Known subject');
  check(!combinations.has(course.grade + ':' + course.subject), 'No duplicate grade/subject');
  combinations.add(course.grade + ':' + course.subject);
  equal(course.path, '../g' + course.grade + '/' + course.subject + '/', 'Course link stays within its declared grade and subject');
  check(fs.existsSync(path.resolve(directory, course.path, 'index.html')), 'Course destination exists');
  check(typeof course.name === 'string' && course.name.trim() && typeof course.description === 'string' && course.description.trim(), 'Course has a useful label and description');
}
equal(new Set(data.students.map(student => student.id)).size, data.students.length, 'Demo student identifiers are unique');
for (const student of data.students) {
  check(/^demo-/.test(student.id), 'Identifiers explicitly belong to the demo');
  check([6, 8].includes(student.grade) && typeof student.name === 'string' && student.name.trim(), 'Well-formed synthetic student');
  check(fs.existsSync(path.resolve(directory, student.avatar)), 'Student illustration exists');
  equal(student.subjects.length, 4, 'Four subject summaries per demo student');
  equal(new Set(student.subjects.map(item => item.id)).size, 4, 'No duplicate subject summaries');
  for (const subject of student.subjects) {
    check(combinations.has(student.grade + ':' + subject.id), 'Student subject links to an available course');
    check(Number.isInteger(subject.completed) && Number.isInteger(subject.total) && subject.total > 0 && subject.completed >= 0 && subject.completed <= subject.total, 'Finite, ordered completion counts');
    check(Number.isFinite(subject.assessment) && subject.assessment >= 0 && subject.assessment <= 100, 'Assessment uses an independent bounded scale');
    check(typeof subject.focus === 'string' && subject.focus.trim(), 'Each summary gives a next learning step');
    check(!Object.keys(subject).some(key => /mastery|readingScore/i.test(key)), 'No invented uniform mastery/reading score');
  }
}

// Execute the actual UI with values deliberately unlike each other. A completion
// ratio and a practice result must keep their distinct meanings in the output.
function uiFixture() {
  const nodes = new Map();
  const events = {};
  const contentEvents = {};
  const classList = {contains() {return false;}, remove() {}, toggle() {}};
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {innerHTML: '', textContent: '', hidden: false, value: '', classList,
      setAttribute() {}, removeAttribute() {}, focus() {}, contains() {return false;}, showModal() {}, close() {},
      addEventListener(type, callback) {if (id === 'page-content') contentEvents[type] = callback;},
      querySelectorAll() {return [];}});
    return nodes.get(id);
  }
  const model = JSON.parse(JSON.stringify(data));
  model.students[0].subjects[0].completed = 1;
  model.students[0].subjects[0].total = 4;
  model.students[0].subjects[0].assessment = 91;
  const window = {ADMIN_DEMO: model, matchMedia() {return {matches: false, addEventListener() {}};}, addEventListener(type, callback) {events[type] = callback;}};
  const context = {window, document: {getElementById: node, querySelectorAll() {return [];}, addEventListener() {}, body: {classList}},
    location: {hash: '#overview'}, navigator: {onLine: true}, URL, Blob, setTimeout, clearTimeout};
  for (const key of ['localStorage', 'sessionStorage', 'indexedDB', 'fetch', 'XMLHttpRequest']) {
    Object.defineProperty(context, key, {get() {throw Error('Preview accessed forbidden live facility: ' + key);}});
    Object.defineProperty(window, key, {get() {throw Error('Preview accessed forbidden live facility: ' + key);}});
  }
  vm.runInNewContext(source, context);
  return {context, node, events, contentEvents};
}
const ui = uiFixture();
check(/إنجاز الدروس حسب المادة/.test(ui.node('page-content').innerHTML), 'Chart identifies lesson completion');
check(/لا تعبّر عن إتقان موحّد بين المواد/.test(ui.node('page-content').innerHTML), 'Chart does not imply a uniform mastery percentage');
ui.contentEvents.click({target: {closest(selector) {return selector === '[data-student]' ? {dataset: {student: data.students[0].id}} : null;}}});
const details = ui.node('dialog-content').innerHTML;
check(/دروس مكتملة<\/dt><dd>١ من ٤/.test(details), 'Lesson completion remains a count');
check(/نتيجة تدريب توضيحية<\/dt><dd>٩١٪/.test(details), 'Practice result retains its independent value');
check(!/نتيجة تدريب توضيحية<\/dt><dd>٢٥٪/.test(details), 'Practice result is not synthesized from completion ratio');
check(/لا يُعد هذا التقرير تقييمًا فعليًا/.test(details), 'Detail report discloses its illustrative status');
ui.context.location.hash = '#integration';
ui.events.hashchange();
check(/إنجاز القراءة يختلف عن نتيجة التدريب/.test(ui.node('page-content').innerHTML), 'Integration view preserves reading/practice distinction');

function fixture() {
  const handlers = {};
  const stores = new Map();
  const fetches = [];
  const writes = [];
  const additions = [];
  const deletions = [];
  let network = async () => new Response('network public asset', {status: 200});
  let quota = false;
  let skipped = 0;
  let claimed = 0;
  const key = request => new URL(typeof request === 'string' ? request : request.url, scope).href;
  const cache = name => {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async addAll(files) {for (const file of files) {const url = key(file); additions.push(url); entries.set(url, new Response('installed ' + url));}},
      async put(request, response) {if (quota) throw Error('quota exceeded'); const url = key(request); writes.push({name, url}); entries.set(url, response.clone());},
      async match(request) {return entries.get(key(request))?.clone();}
    };
  };
  const context = {URL, Response, self: {registration: {scope}, addEventListener(type, callback) {handlers[type] = callback;},
      async skipWaiting() {skipped++;}, clients: {async claim() {claimed++;}}},
    caches: {async open(name) {return cache(name);}, async keys() {return [...stores.keys()];}, async delete(name) {deletions.push(name); return stores.delete(name);}},
    async fetch(request) {fetches.push(request.url); return network(request);}};
  vm.runInNewContext(worker, context);
  const files = Array.from(vm.runInNewContext('FILES', context));
  const version = vm.runInNewContext('VERSION', context);
  async function dispatch(type) {const waits = []; handlers[type]({waitUntil(promise) {waits.push(promise);}}); await Promise.all(waits);}
  async function request(relative, method = 'GET') {
    let intercepted = false;
    let answer;
    const waits = [];
    const event = {request: {url: new URL(relative, scope).href, method}, respondWith(promise) {intercepted = true; answer = promise;}, waitUntil(promise) {waits.push(promise);}};
    handlers.fetch(event);
    if (!intercepted) return {intercepted};
    const response = await answer;
    await Promise.all(waits);
    return {intercepted, response};
  }
  return {files, version, stores, fetches, writes, additions, deletions, cache, dispatch, request,
    setNetwork(callback) {network = callback;}, setQuota(value) {quota = value;}, skipped: () => skipped, claimed: () => claimed};
}

(async () => {
  const f = fixture();
  equal(new Set(f.files).size, f.files.length, 'Public manifest has no duplicate path declarations');
  const publicUrls = new Set(f.files.map(file => new URL(file, scope).href));
  for (const file of f.files) {
    const url = new URL(file, scope);
    equal(url.origin, new URL(scope).origin, 'Public manifest remains same-origin');
    check(!url.search && !url.hash, 'Manifest contains no private parameters');
    check(!/profiles|entry\.js|catalog\.js|\/api\/|\.php(?:$|\/)/i.test(file), 'No real profile, login, backend, or API asset in preview cache');
    const local = path.resolve(directory, file === './' ? 'index.html' : file);
    check(fs.existsSync(local) && fs.statSync(local).isFile(), 'Every declared public cache file exists: ' + file);
  }
  const assets = [];
  for (const match of read('index.html').matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/\.(?:js|css|svg|webp|png|woff2)(?:[?#]|$)/.test(match[1])) assets.push(match[1]);
  }
  for (const match of read('admin.css').matchAll(/url\(\s*['"]?([^'"\s)]+)/g)) assets.push(match[1]);
  for (const match of source.matchAll(/(?:src|href)="(\.\.?\/[^"$]+\.(?:webp|svg|png|md))"/g)) assets.push(match[1]);
  for (const student of data.students) assets.push(student.avatar);
  for (const asset of assets) check(publicUrls.has(new URL(asset, scope).href), 'UI asset is available offline: ' + asset);
  check(!/@import\b|https?:\/\//.test(read('admin.css')), 'Styles and fonts have no network dependency');
  await f.dispatch('install');
  equal(new Set(f.additions), publicUrls, 'Installation caches precisely the public allowlist');
  equal(f.skipped(), 1, 'Installed preview worker advances activation');
  for (const file of f.files) {
    const result = await f.request(file);
    check(result.intercepted && result.response.status === 200, 'Explicit public asset is served: ' + file);
  }
  const beforePrivate = {fetches: f.fetches.length, writes: f.writes.length};
  for (const url of ['../api/students', '/api/students', '/abboud-math/api/progress?student=private', 'students.json', 'private/report.csv', '../profiles.js', '../login.html', 'unlisted.js', 'https://other.test/abboud-math/admin/index.html', 'https://example.test/other/admin/index.html']) {
    equal((await f.request(url)).intercepted, false, 'Unknown/private/cross-origin GET is not intercepted: ' + url);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']) {
    for (const url of ['index.html', '../api/progress']) equal((await f.request(url, method)).intercepted, false, 'Non-GET request bypasses all cache handling: ' + method + ' ' + url);
  }
  equal({fetches: f.fetches.length, writes: f.writes.length}, beforePrivate, 'Bypassed requests cause no worker network or cache operations');
  f.setNetwork(async () => {throw Error('offline');});
  for (const file of f.files) {
    const result = await f.request(file);
    check(result.intercepted && result.response && result.response.status === 200, 'Every public preview asset survives offline: ' + file);
  }
  const queried = await f.request('index.html?preview=qa');
  check(queried.response && queried.response.status === 200, 'Public preview query variants use the canonical offline asset');
  const writesBeforeFailure = f.writes.length;
  for (const status of [401, 403, 404, 500]) {
    f.setNetwork(async () => new Response('failure', {status}));
    equal((await f.request('admin.js')).response.status, status, 'HTTP errors are not replaced with cached success');
  }
  equal(f.writes.length, writesBeforeFailure, 'Unsuccessful HTTP responses never overwrite public cache');
  f.setNetwork(async () => ({ok: true, type: 'opaque', status: 0, clone() {throw Error('Opaque must not be cloned');}}));
  equal((await f.request('admin.js')).response.type, 'opaque', 'Opaque response remains uncached');
  equal(f.writes.length, writesBeforeFailure, 'Opaque response does not write cache');
  f.setQuota(true);
  f.setNetwork(async () => new Response('network works while cache is full'));
  equal(await (await f.request('admin.js')).response.text(), 'network works while cache is full', 'Storage quota failure does not break online response');

  const old = f.version + '-retired';
  const protectedCaches = ['bustan-entry-keep', 'g6math-existing', 'g8math-existing', 'g6arabic-existing', 'g8arabic-existing', 'g6english-existing', 'g8english-existing', 'g6science-existing', 'g8science-existing', 'g6math-media', 'unrelated-private-cache'];
  f.cache(old);
  for (const name of protectedCaches) f.cache(name);
  await f.dispatch('activate');
  equal(f.deletions, [old], 'Activation removes only an old cache belonging to this preview');
  check(f.stores.has(f.version), 'Current preview cache survives activation');
  for (const name of protectedCaches) check(f.stores.has(name), 'Unrelated entry/subject/media cache is preserved: ' + name);
  equal(f.claimed(), 1, 'Activation claims the preview scope');

  // New files have no old version. Existing workers compare against Git rather
  // than pinning the release name, allowing independent cache bumps to merge.
  const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
  let baseline = process.env.CACHE_BASE_REF;
  if (baseline) git('rev-parse', '--verify', baseline);
  else {try {git('rev-parse', '--verify', 'origin/main'); baseline = 'origin/main';} catch {}}
  if (baseline) {
    let previous;
    try {previous = git('show', baseline + ':admin/sw.js');} catch {previous = null;}
    const cachedPaths = [...new Set(f.files.map(file => path.relative(root, path.resolve(directory, file === './' ? 'index.html' : file)).replace(/\\/g, '/')))];
    const changed = git('diff', '--name-only', baseline, '--', 'admin', ...cachedPaths);
    const untracked = git('ls-files', '--others', '--exclude-standard', '--', 'admin', ...cachedPaths);
    if (previous && (previous !== worker.trim() || changed || untracked)) {
      const match = previous.match(/\bconst\s+VERSION\s*=\s*(['"])([^'"\r\n]+)\1/);
      check(match, 'Existing baseline declares its cache version');
      check(match[2] !== f.version, 'Changed preview worker receives a different cache version');
    }
  }
  console.log('PASS: ' + checks + ' dashboard isolation, course/data semantics, public cache, API bypass and offline checks');
})().catch(error => {console.error(error); process.exitCode = 1;});
