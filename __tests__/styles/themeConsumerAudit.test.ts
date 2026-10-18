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
