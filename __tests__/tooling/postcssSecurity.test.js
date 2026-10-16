const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Exercise the exact PostCSS resolved by Expo, outside Jest's module mocks.
const postcssPath = require.resolve('postcss', {
  paths: [path.dirname(require.resolve('@expo/metro-config/package.json'))],
});
it.each([false, true])(
  'does not load an untrusted out-of-tree source map (from supplied: %s)',
  (withFrom) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'colombian-postcss-'));
    try {
      fs.mkdirSync(path.join(dir, 'project'));
      const map = path.join(dir, 'outside.map');
      fs.writeFileSync(
        map,
        JSON.stringify({
          version: 3,
          names: [],
          mappings: '',
          sources: ['outside.css'],
          sourcesContent: ['TEST_ONLY_OUTSIDE_SOURCE'],
        }),
      );
      const annotation = withFrom ? '../outside.map' : map;
      const script = `const postcss = require(${JSON.stringify(postcssPath)}); (async()=>{ const result = await postcss([]).process(${JSON.stringify('a{color:red}\n/*# sourceMappingURL=' + annotation + ' */')}, {${withFrom ? 'from:' + JSON.stringify(path.join(dir, 'project', 'input.css')) + ',' : ''}map:{inline:false}}); process.stdout.write(JSON.stringify(result.map && result.map.toJSON())); })().catch(e=>{console.error(e);process.exitCode=1});`;
      const output = execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' });
      expect(output).not.toContain('TEST_ONLY_OUTSIDE_SOURCE');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
);
it('preserves ordinary PostCSS declaration transforms and generated maps', () => {
  const script = `const postcss=require(${JSON.stringify(postcssPath)}); (async()=>{const result=await postcss([{postcssPlugin:'fixture',Declaration(decl){if(decl.prop==='color')decl.value='blue'}}]).process('a{color:red}',{from:'input.css',to:'output.css',map:{inline:false}});process.stdout.write(JSON.stringify({css:result.css,map:result.map.toJSON()}));})().catch(e=>{console.error(e);process.exitCode=1});`;
  const result = JSON.parse(execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' }));
  expect(result.css).toContain('a{color:blue}');
  expect(result.map.sources).toEqual(['input.css']);
  expect(result.map.sourcesContent).toEqual(['a{color:red}']);
});
