/* Theme migration guard. Run normally to verify; --record updates the reviewed inventory. */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const manifestPath = 'docs/qa/2026-10-18-theme-picker/color-roles.json';
const isColor = /^(#[\da-f]{3,8}|rgba?\([^\n]+\))$/i;
function sourcePaths(root, dir = 'src') {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${dir}/${entry.name}`;
    return entry.isDirectory()
      ? sourcePaths(root, relative)
      : /\.tsx?$/.test(entry.name)
        ? [relative]
        : [];
  });
}
function inspectSource(file, source) {
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const literals = [],
    imports = [],
    semanticUses = [];
  function visit(node) {
    if (
      ts.isImportDeclaration(node) &&
      /(?:styles\/theme|classicTheme)$/.test(node.moduleSpecifier.text) &&
      !file.startsWith('src/styles/')
    ) {
      const binding = node.importClause;
      if (
        binding?.name ||
        (binding?.namedBindings &&
          (!ts.isNamedImports(binding.namedBindings) ||
            binding.namedBindings.elements.some((entry) =>
              ['colors', 'elevation', 'theme', 'classicColors', 'classicElevation'].includes(
                (entry.propertyName ?? entry.name).text,
              ),
            )))
      )
        imports.push(`${file}: static palette import`);
    }
    if (
      ts.isPropertyAccessExpression(node) &&
      /(^|\.)colors$/.test(node.expression.getText(ast)) &&
      !file.startsWith('src/styles/')
    ) {
      const role = node.name.text;
      const base = `${file}|${role}`;
      semanticUses.push({
        key: `${base}|${semanticUses.filter((item) => item.base === base).length + 1}`,
        base,
        path: file,
        role,
        line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
      });
    }
    if (ts.isStringLiteralLike(node) && isColor.test(node.text)) {
      let owner = node;
      while (owner.parent && !ts.isVariableDeclaration(owner)) owner = owner.parent;
      const declaration = ts.isVariableDeclaration(owner) ? owner.name.getText(ast) : 'render';
      const property = ts.isPropertyAssignment(node.parent)
        ? node.parent.name.getText(ast)
        : 'inline';
      // Identity is independent of formatting; a new occurrence is a new inventory item.
      const base = `${file}|${declaration}|${property}|${node.text}`;
      const occurrence = literals.filter((item) => item.base === base).length + 1;
      literals.push({
        key: `${base}|${occurrence}`,
        base,
        path: file,
        declaration,
        property,
        value: node.text,
        line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { literals, imports, semanticUses };
}
function classify(item) {
  if (item.path.startsWith('src/styles/')) return 'palette-definition';
  if (item.property === 'shadowColor') return 'shadow';
  if (/^rgba\(0,\s*0,\s*0,/.test(item.value)) return 'modal-scrim';
  if (
    item.path === 'src/utils/deckCategories.ts' ||
    ['GRADES', 'CATEGORY_COLORS', 'REGISTER_COLORS'].includes(item.declaration)
  )
    return 'classic-only';
  if (item.path === 'src/components/ConjugationTable.tsx') return 'classic-only';
  if (
    ['src/screens/HomeScreen.tsx', 'src/screens/OnboardingScreen.tsx'].includes(item.path) &&
    ['#FFDA00', '#003893', '#CE1126'].includes(item.value)
  )
    return 'meaningful-flag-art';
  throw new Error(`Unreviewed inventory classification: ${item.key}`);
}
function loadPalette(root) {
  const cache = {};
  function load(filename) {
    if (cache[filename]) return cache[filename];
    const result = { exports: {} };
    cache[filename] = result.exports;
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    new Function('require', 'module', 'exports', code)(
      (relative) => load(path.resolve(path.dirname(filename), `${relative}.ts`)),
      result,
      result.exports,
    );
    return result.exports;
  }
  return load(path.join(root, 'src/styles/appTheme.ts')).resolveAppTheme;
}
function rgba(value) {
  if (value.startsWith('#')) {
    let h = value.slice(1);
    if (h.length === 3)
      h = h
        .split('')
        .map((x) => x + x)
        .join('');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1,
    ];
  }
  const [r, g, b, a = 1] = value.match(/[\d.]+/g).map(Number);
  return [r, g, b, a];
}
function composite(fg, bg) {
  return fg
    .slice(0, 3)
    .map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]))
    .concat(1);
}
function luminance(color) {
  const [r, g, b] = color.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(foreground, background, canvas) {
  const bg = composite(rgba(background), rgba(canvas));
  const fg = composite(rgba(foreground), bg);
  const l = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l[0] + 0.05) / (l[1] + 0.05);
}
function contrastPairs() {
  const pairs = [];
  const textRoles = [
    'textPrimary',
    'textSecondary',
    'textTertiary',
    'brand',
    'accentBlue',
    'accentRed',
    'success',
    'warning',
    'danger',
    'info',
    'focus',
    'audioText',
    'mutedInk',
    'flagHighlight',
    'alertInk',
    'restoreDanger',
    'scheduleInk',
    'tagText',
    'quizReviewInk',
    'quizFeedbackInk',
    'editorInk',
    'editorSecondary',
    'editorTertiary',
    'editorText',
    'swipeHardInk',
    'swipeEasyInk',
  ];
  for (const fg of textRoles)
    for (const bg of ['bg', 'surface', 'surfaceElevated'])
      pairs.push({
        foreground: fg,
        background: bg,
        minimum: 4.5,
        purpose: 'text/icon ink on route surfaces',
      });
  for (const [fg, bg] of [
    ['onBrand', 'brand'],
    ['onBrand', 'brandPressed'],
    ['textInverse', 'brand'],
    ['regionInk', 'regionFill'],
    ['editorActionInk', 'editorPrimary'],
    ['editorActionInk', 'editorDangerFill'],
    ['disabledText', 'disabledBg'],
    ['tagText', 'tagSurface'],
    ['warning', 'warningMuted'],
    ['danger', 'dangerMuted'],
    ['success', 'successMuted'],
    ['info', 'infoMuted'],
  ])
    pairs.push({
      foreground: fg,
      background: bg,
      minimum: 4.5,
      purpose: 'actual control/status pair',
    });
  for (const fg of [
    'border',
    'borderActive',
    'borderBrand',
    'tabBorder',
    'audioBorder',
    'cardBorder',
    'highlightEdge',
    'softHighlightEdge',
    'strongHighlightEdge',
    'softBrandBorder',
    'neutralEdge',
    'dividerEdge',
    'editorRule',
    'editorBorder',
    'editorSoftEdge',
  ])
    for (const bg of ['bg', 'surface', 'surfaceElevated'])
      pairs.push({ foreground: fg, background: bg, minimum: 3, purpose: 'control boundary' });
  return pairs;
}
function auditSources(root, overrides = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
  const known = new Map(manifest.literals.map((item) => [item.key, item]));
  const errors = [],
    found = new Set();
  const knownUses = new Set(manifest.semanticUses.map((item) => item.key)),
    foundUses = new Set();
  const sources = [...new Set([...sourcePaths(root), 'App.tsx', ...Object.keys(overrides)])];
  for (const file of sources) {
    const scan = inspectSource(
      file,
      overrides[file] ?? fs.readFileSync(path.join(root, file), 'utf8'),
    );
    errors.push(...scan.imports);
    for (const item of scan.semanticUses) {
      foundUses.add(item.key);
      if (!knownUses.has(item.key))
        errors.push(`${file}:${item.line}: unclassified semantic role use ${item.role}`);
    }
    for (const item of scan.literals) {
      found.add(item.key);
      if (!known.has(item.key))
        errors.push(`${file}:${item.line}: unclassified color ${item.value}`);
    }
  }
  for (const key of known.keys())
    if (!found.has(key)) errors.push(`source drift: removed classified occurrence ${key}`);
  for (const key of knownUses)
    if (!foundUses.has(key)) errors.push(`source drift: removed role use ${key}`);
  const resolve = loadPalette(root),
    contrasts = [];
  for (const themeId of ['classic', 'barrio'])
    for (const appearanceMode of themeId === 'classic' ? ['dark'] : ['light', 'dark']) {
      const theme = resolve({ themeId, appearanceMode }, null);
      for (const pair of manifest.contrastPairs) {
        const actual = contrast(
          theme.colors[pair.foreground],
          theme.colors[pair.background],
          theme.colors.bg,
        );
        const pass = actual >= pair.minimum;
        const row = {
          themeId,
          appearanceMode,
          ...pair,
          foregroundValue: theme.colors[pair.foreground],
          backgroundValue: theme.colors[pair.background],
          ratio: Number(actual.toFixed(3)),
          pass,
        };
        if (!pass && themeId === 'classic')
          row.exception =
            'Preserved Classic legacy pair; this migration does not certify Classic accessibility.';
        else if (!pass)
          errors.push(
            `Barrio/${appearanceMode}: ${pair.foreground} on ${pair.background} ${actual.toFixed(3)} < ${pair.minimum}`,
          );
        contrasts.push(row);
      }
    }
  return { errors, literalCount: found.size, contrasts };
}
if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  if (process.argv.includes('--record')) {
    const old = fs.existsSync(path.join(root, manifestPath))
      ? JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'))
      : {};
    const literals = [...sourcePaths(root), 'App.tsx']
      .flatMap(
        (file) => inspectSource(file, fs.readFileSync(path.join(root, file), 'utf8')).literals,
      )
      .map((item) => ({ ...item, disposition: classify(item) }));
    const semanticUses = [...sourcePaths(root), 'App.tsx'].flatMap(
      (file) => inspectSource(file, fs.readFileSync(path.join(root, file), 'utf8')).semanticUses,
    );
    fs.writeFileSync(
      path.join(root, manifestPath),
      JSON.stringify(
        {
          description:
            'Reviewed literal inventory plus original-to-semantic role migration. Unknown additions/removals fail the normal audit. Contrast uses composited sRGB values, not raw alpha RGB. Classic exceptions are reported explicitly.',
          migrated: old.migrated ?? [],
          literals,
          semanticUses,
          contrastPairs: contrastPairs(),
        },
        null,
        2,
      ) + '\n',
    );
  }
  const report = auditSources(root);
  fs.writeFileSync(
    path.join(root, 'docs/qa/2026-10-18-theme-picker/color-audit-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  process.stdout.write(
    `${report.literalCount} classified color literals; ${report.contrasts.length} composited contrast pairs; ${report.contrasts.filter((p) => p.exception).length} explicit Classic exceptions; ${report.errors.length} errors.\n`,
  );
  for (const error of report.errors) process.stderr.write(error + '\n');
  process.exitCode = report.errors.length ? 1 : 0;
}
module.exports = { auditSources, inspectSource, contrast, loadPalette };
