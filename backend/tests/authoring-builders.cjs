// Run from the repository root: node backend/tests/authoring-builders.cjs.
// Reuse the frontend contract tests against the private Laravel editor copies.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const root = path.resolve(__dirname, '../..');
const proxy = Object.create(fs);
proxy.readFileSync = (file, ...args) => {
  const filename = path.resolve(String(file));
  for (const asset of ['quiz-builder.js', 'content-builder.js']) {
    if (filename === path.join(root, 'admin', asset)) {
      return fs.readFileSync(path.join(root, 'backend/resources/js/admin', asset), ...args);
    }
  }
  return fs.readFileSync(file, ...args);
};
for (const name of ['content-builder.cjs', 'quiz-builder.cjs']) {
  const filename = path.join(root, 'tests', name);
  const originalRequire = Module.createRequire(filename);
  const requireProxy = name => name === 'node:fs' ? proxy : originalRequire(name);
  const run = vm.runInThisContext(Module.wrap(fs.readFileSync(filename, 'utf8')), { filename });
  run({}, requireProxy, { exports: {} }, filename, path.dirname(filename));
}
