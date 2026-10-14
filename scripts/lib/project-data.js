const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

// Load trusted, repository-owned data modules without modifying require hooks
// or installing another TypeScript runner. Type-only imports are removed.
function loadDataModule(file, cache = new Map()) {
  const resolved = [file, `${file}.ts`, path.join(file, 'index.ts')].find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
  if (!resolved) throw new Error(`Data module not found: ${file}`);
  if (cache.has(resolved)) return cache.get(resolved).exports;
  const module = { exports: {} };
  cache.set(resolved, module);
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: resolved,
  }).outputText;
  const evaluate = new vm.Script(`(function(exports, require, module) { ${source}\n})`, {
    filename: resolved,
  }).runInThisContext();
  evaluate(
    module.exports,
    (request) => {
      if (!request.startsWith('.')) throw new Error(`Unexpected data dependency: ${request}`);
      return loadDataModule(path.resolve(path.dirname(resolved), request), cache);
    },
    module,
  );
  return module.exports;
}

function readAudioEntries(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const entries = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'pronunciationAudio') {
      if (!node.initializer || !ts.isObjectLiteralExpression(node.initializer)) {
        throw new Error('Audio manifest must be a static object');
      }
      for (const property of node.initializer.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.name)) {
          throw new Error('Audio manifest entries must have literal IDs');
        }
        const call = property.initializer;
        if (
          !ts.isCallExpression(call) ||
          call.expression.getText(source) !== 'require' ||
          call.arguments.length !== 1 ||
          !ts.isStringLiteral(call.arguments[0])
        ) {
          throw new Error(`Invalid audio mapping: ${property.name.text}`);
        }
        entries.push({
          id: property.name.text,
          path: path.resolve(path.dirname(file), call.arguments[0].text),
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return entries;
}
module.exports = { loadDataModule, readAudioEntries };
