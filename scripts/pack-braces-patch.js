// Recreate the committed local tarball; npm normalizes archive metadata.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const result = execFileSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['pack', './vendor/braces', '--pack-destination', './vendor', '--ignore-scripts', '--json'],
  { cwd: root, encoding: 'utf8' },
);
const [{ filename, integrity }] = JSON.parse(result);
console.log(`${filename}: ${integrity}`);
