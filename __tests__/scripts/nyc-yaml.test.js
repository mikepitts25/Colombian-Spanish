const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Exercise Istanbul's actual loader outside the Expo Jest transform/mocks.
// This guards the scoped YAML migration: real coverage settings must survive,
// while YAML must remain data instead of constructing JavaScript-only objects.
function load(files, entry = '.nycrc.yaml') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'colombian-nyc-yaml-'));
  try {
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    for (const [name, contents] of Object.entries(files))
      fs.writeFileSync(path.join(dir, name), contents);
    return JSON.parse(
      execFileSync(
        process.execPath,
        [
          '-e',
          `const {loadNycConfig}=require('@istanbuljs/load-nyc-config');
          loadNycConfig({cwd:${JSON.stringify(dir)},nycrcPath:${JSON.stringify(entry)}})
            .then(config=>process.stdout.write(JSON.stringify({config})))
            .catch(error=>process.stdout.write(JSON.stringify({error:error.name})));`,
        ],
        { cwd: process.cwd(), encoding: 'utf8', timeout: 10000 },
      ),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('coverage YAML preserves extends, kebab-case fields, aliases and thresholds', () => {
  const result = load({
    'base.yaml':
      'branches: 80\ncheck-coverage: true\nexclude: &excluded\n  - "**/*.test.ts"\ninclude: *excluded\n',
    '.nycrc.yaml': 'extends: ./base.yaml\nreporter: [text, json-summary]\nall: true\nlines: 90\n',
  });
  expect(result.config).toMatchObject({
    branches: 80,
    checkCoverage: true,
    exclude: ['**/*.test.ts'],
    include: ['**/*.test.ts'],
    reporter: ['text', 'json-summary'],
    all: true,
    lines: 90,
  });
  expect(result.config).not.toHaveProperty('extends');
});

test('coverage YAML rejects JavaScript-specific object tags', () => {
  expect(load({ '.nycrc.yaml': 'exclude: !!js/regexp /secret/i\n' })).toEqual({
    error: 'YAMLException',
  });
});

test('coverage config fails closed on malformed YAML and circular extends', () => {
  expect(load({ '.nycrc.yaml': 'reporter: [text\n' })).toEqual({ error: 'YAMLException' });
  expect(
    load({ '.nycrc.yaml': 'extends: ./other.yaml\n', 'other.yaml': 'extends: ./.nycrc.yaml\n' }),
  ).toEqual({ error: 'Error' });
});
