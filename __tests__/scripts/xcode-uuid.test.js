const { execFileSync } = require('node:child_process');

function runWithXcodeUuid(body) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        '-e',
        `const {createRequire} = require('node:module');
         const fromXcode = createRequire(require.resolve('xcode/package.json'));
         const uuid = fromXcode('uuid');
         ${body}`,
      ],
      { cwd: process.cwd(), encoding: 'utf8' },
    ),
  );
}

// Catch silent partial buffer writes in the actual dependency resolved by xcode.
// The project generator currently uses v4; this does not assert a vulnerable app input path.
test.each(['v3', 'v5'])(
  'xcode UUID %s rejects invalid output bounds without modifying buffers',
  (api) => {
    const result = runWithXcodeUuid(`
    const results = [];
    for (const [size, offset] of [[8, 4], [16, 1], [16, -1]]) {
      const output = new Uint8Array(size).fill(170);
      let error;
      try { uuid.${api}('x', uuid.${api}.DNS, output, offset); }
      catch (failure) { error = failure.name; }
      results.push({error, unchanged: output.every(value => value === 170)});
    }
    console.log(JSON.stringify(results));
  `);
    expect(result).toEqual([
      { error: 'RangeError', unchanged: true },
      { error: 'RangeError', unchanged: true },
      { error: 'RangeError', unchanged: true },
    ]);
  },
);

test('xcode still generates unique project identifiers and valid name UUIDs', () => {
  const result = runWithXcodeUuid(`
    const project = require('xcode').project('unused.pbxproj');
    project.hash = {project: {objects: {PBXGroup: {}}}};
    const ids = Array.from({length: 1000}, () => project.generateUuid());
    const output = new Uint8Array(20).fill(170);
    uuid.v5('www.example.com', uuid.v5.DNS, output, 4);
    console.log(JSON.stringify({
      unique: new Set(ids).size,
      valid: ids.every(id => /^[A-F0-9]{24}$/.test(id)),
      prefix: Array.from(output.slice(0, 4)),
      name: uuid.v5('www.example.com', uuid.v5.DNS),
      written: Array.from(output.slice(4))
    }));
  `);
  expect(result).toEqual({
    unique: 1000,
    valid: true,
    prefix: [170, 170, 170, 170],
    name: '2ed6657d-e927-568b-95e1-2665a8aea6a2',
    written: [46, 214, 101, 125, 233, 39, 86, 139, 149, 225, 38, 101, 168, 174, 166, 162],
  });
});
