import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(__dirname, '..', '..', 'src');

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    if (/\.(ts|tsx)$/.test(entry.name)) return [fullPath];
    return [];
  });
}

describe('deprecated React Native imports', () => {
  it('does not import SafeAreaView from react-native', () => {
    const offenders = listSourceFiles(SRC_DIR).filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return /import\s*\{[\s\S]*\bSafeAreaView\b[\s\S]*\}\s*from\s*['"]react-native['"]/.test(source);
    });

    expect(offenders.map((file) => path.relative(SRC_DIR, file))).toEqual([]);
  });
});
