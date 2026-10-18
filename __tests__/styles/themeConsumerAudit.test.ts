import path from 'path';
const { auditSources } = require('../../scripts/audit-theme-colors');
const root = path.resolve(__dirname, '../..');
test('the full runtime has no static palette consumers or unclassified colors', () => {
  expect(auditSources(root).errors).toEqual([]);
});
test('a metric-only import is legal but an injected static palette import is caught', () => {
  expect(
    auditSources(root, {
      'src/components/Injected.tsx': "import { spacing } from '../styles/theme';",
    }).errors,
  ).toEqual([]);
  expect(
    auditSources(root, {
      'src/components/Injected.tsx': "import { colors } from '../styles/theme';",
    }).errors,
  ).toEqual(expect.arrayContaining([expect.stringContaining('static palette')]));
});
test('an injected color occurrence requires explicit classification', () => {
  expect(
    auditSources(root, { 'src/components/Injected.tsx': "const style = { color: '#123456' };" })
      .errors,
  ).toEqual(expect.arrayContaining([expect.stringContaining('unclassified')]));
});

test('named paint colors are audited while vocabulary and content names are not', () => {
  const { inspectSource } = require('../../scripts/audit-theme-colors');
  const scan = inspectSource(
    'src/components/Injected.tsx',
    `
    const card = { front: 'blanco', back: 'white' };
    const style = { color: 'white', backgroundColor: 'rebeccapurple', shadowColor: 'transparent' };
  `,
  );
  expect(scan.literals.map((item: { value: string }) => item.value)).toEqual([
    'white',
    'rebeccapurple',
    'transparent',
  ]);
  expect(
    auditSources(root, {
      'src/components/Injected.tsx': "const style = { color: 'white' };",
    }).errors,
  ).toEqual(expect.arrayContaining([expect.stringContaining('unclassified color white')]));
});
