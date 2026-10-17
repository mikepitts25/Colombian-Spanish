// Audits source colors against an objective 4.5:1 floor; does not assert palette literals.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '../../..');
const theme = fs.readFileSync(path.join(root, 'src/styles/theme.ts'), 'utf8');
const exportsObject = {};
vm.runInNewContext(
  ts.transpileModule(theme, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: exportsObject },
);
const colors = exportsObject.colors;
function rgb(hex) {
  assert.match(hex, /^#[a-f0-9]{6}$/i);
  return hex
    .slice(1)
    .match(/../g)
    .map((channel) => parseInt(channel, 16) / 255);
}
function luminance(channels) {
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
assert.equal(contrast(rgb('#000000'), rgb('#ffffff')), 21);
assert.equal(contrast(rgb('#123456'), rgb('#123456')), 1);
const cases = [];
function check(name, foreground, background) {
  const ratio = contrast(rgb(foreground), background);
  cases.push({
    name,
    foreground,
    ratio: Number(ratio.toFixed(3)),
    minimum: 4.5,
    pass: ratio >= 4.5,
  });
}
for (const foreground of ['textPrimary', 'textSecondary', 'textTertiary']) {
  for (const background of ['bg', 'surface', 'surfaceElevated']) {
    check(`${foreground} on ${background}`, colors[foreground], rgb(colors[background]));
  }
}
// Resolve the actual colored in-review value and its inline panel background.
const source = ts.createSourceFile(
  'ProgressScreen.tsx',
  fs.readFileSync(path.join(root, 'src/screens/ProgressScreen.tsx'), 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
let stat;
function visit(node) {
  if (
    ts.isJsxElement(node) &&
    node.openingElement.tagName.getText(source) === 'Text' &&
    node.children.some(
      (child) => ts.isJsxExpression(child) && child.expression?.getText(source) === 'stats.studied',
    )
  )
    stat = node;
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(stat, 'Locate the actual in-review text');
function styleProperty(element, name) {
  const attribute = element.openingElement.attributes.properties.find(
    (item) => ts.isJsxAttribute(item) && item.name.getText(source) === 'style',
  );
  assert.ok(attribute?.initializer && ts.isJsxExpression(attribute.initializer));
  let found;
  function property(node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(source) === name)
      found = node.initializer;
    ts.forEachChild(node, property);
  }
  property(attribute.initializer.expression);
  assert.ok(found, `Resolve actual ${name}`);
  if (ts.isStringLiteral(found)) return found.text;
  if (ts.isPropertyAccessExpression(found) && found.expression.getText(source) === 'colors')
    return colors[found.name.text];
  throw new Error(`Unsupported ${name} source; update audit to match actual rendering`);
}
let panel = stat.parent;
while (
  panel &&
  !(ts.isJsxElement(panel) && panel.openingElement.tagName.getText(source) === 'View')
)
  panel = panel.parent;
assert.ok(panel);
const rgba = styleProperty(panel, 'backgroundColor');
const match = rgba.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
assert.ok(match, 'Resolve actual translucent stat panel');
const alpha = Number(match[4]);
assert.ok(alpha >= 0 && alpha <= 1);
const base = rgb(colors.bg);
const composite = base.map(
  (channel, i) => (Number(match[i + 1]) / 255) * alpha + channel * (1 - alpha),
);
check(
  'Progress in-review value on actual composited panel',
  styleProperty(stat, 'color'),
  composite,
);
const result = { cases, passed: cases.filter((item) => item.pass).length, total: cases.length };
console.log(JSON.stringify(result, null, 2));
if (result.passed !== result.total) process.exitCode = 1;
