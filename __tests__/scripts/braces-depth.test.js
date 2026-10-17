const { spawnSync } = require('node:child_process');

function run(body) {
  const result = spawnSync(
    process.execPath,
    [
      '-e',
      `
    const braces = require('braces');
    try { const value = (() => { ${body} })(); console.log(JSON.stringify({ value })); }
    catch (error) { console.log(JSON.stringify({ error: error.name, message: error.message })); }
  `,
    ],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 5000 },
  );
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
  return JSON.parse(result.stdout);
}

const controlledError = { error: 'SyntaxError', message: 'Maximum nesting depth (128) exceeded' };

test.each(['parse', 'compile', 'expand', 'stringify', 'create'])(
  '%s rejects excessive nested source without exhausting the stack',
  (method) => {
    expect(run(`return braces.${method}('{'.repeat(4900) + 'x' + '}'.repeat(4900));`)).toEqual(
      controlledError,
    );
  },
);

test.each([
  "'('.repeat(2000) + 'x' + ')'.repeat(2000)",
  "'{('.repeat(1000) + 'x' + ')}'.repeat(1000)",
  "'{'.repeat(2000) + 'x'",
  "'{'.repeat(2000) + '1..3' + '}'.repeat(2000)",
])('parser rejects excessive semantic container depth: %s', (expression) => {
  expect(run(`return braces.expand(${expression});`)).toEqual(controlledError);
});

test.each(['compile', 'expand', 'stringify'])(
  '%s bounds traversal of caller-supplied ASTs',
  (method) => {
    expect(
      run(`
    let ast = { type: 'text', value: 'x' };
    for (let i = 0; i < 12000; i++) ast = { type: 'root', nodes: [ast] };
    return braces.${method}(ast);
  `),
    ).toEqual(controlledError);
  },
);

test('quoted and escaped braces remain literal instead of consuming nesting depth', () => {
  expect(run(`return braces.expand('"' + '{'.repeat(1000) + '"');`)).toEqual({
    value: ['{'.repeat(1000)],
  });
  expect(run(`return braces.expand('\\\\{'.repeat(1000));`)).toEqual({ value: ['{'.repeat(1000)] });
});

test('preserves ordinary nested, numeric, padded, escaped, and glob patterns', () => {
  expect(
    run(`return [
    braces.expand('a/{b,{c,d}}/e'),
    braces.expand('file-{01..03}.js'),
    braces.expand('{3..1}'),
    braces.expand('{a..c}'),
    braces.compile('src/{components,screens}/**/*.{ts,tsx}'),
    require('micromatch')(['src/a.ts', 'src/a.tsx', 'test/a.js'], 'src/**/*.{ts,tsx}')
  ];`),
  ).toEqual({
    value: [
      ['a/b/e', 'a/c/e', 'a/d/e'],
      ['file-01.js', 'file-02.js', 'file-03.js'],
      ['3', '2', '1'],
      ['a', 'b', 'c'],
      'src/(components|screens)/**/*.(ts|tsx)',
      ['src/a.ts', 'src/a.tsx'],
    ],
  });
});

test('supports the documented local depth boundary', () => {
  const pattern = '{'.repeat(128) + 'x' + '}'.repeat(128);
  expect(run(`return braces.stringify(${JSON.stringify(pattern)});`)).toEqual({ value: pattern });
  expect(run(`return braces.expand('{'.repeat(129) + 'x' + '}'.repeat(129));`)).toEqual(
    controlledError,
  );
});

test('installed and archived patch match every vendored executable and license file', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { execFileSync } = require('node:child_process');
  const source = path.resolve('vendor/braces');
  const installed = path.dirname(require.resolve('braces/package.json'));
  const files = [
    'index.js',
    'package.json',
    'LICENSE',
    'README.md',
    ...fs.readdirSync(path.join(source, 'lib')).map((name) => `lib/${name}`),
  ];
  const archive = path.resolve('vendor/braces-3.0.3.tgz');
  const archivedFiles = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .sort();
  expect(archivedFiles).toEqual(files.map((file) => `package/${file}`).sort());
  for (const file of files) {
    const expected = fs.readFileSync(path.join(source, file));
    expect(execFileSync('tar', ['-xOzf', archive, `package/${file}`])).toEqual(expected);
    expect(fs.readFileSync(path.join(installed, file))).toEqual(expected);
  }
});
