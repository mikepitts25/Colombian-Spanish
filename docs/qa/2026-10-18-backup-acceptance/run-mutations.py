"""Run the new restore audit with controlled mutations in a disposable source copy."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

qa = Path(__file__).resolve().parent
root = qa.parents[2]
sandbox = Path(tempfile.mkdtemp(prefix='colombian-backup-mutation-'))
shutil.copytree(root / 'src', sandbox / 'src')
(sandbox / '__tests__/storage').mkdir(parents=True)
shutil.copy2(root / '__tests__/storage/legacyBackupRecovery.test.ts', sandbox / '__tests__/storage/legacyBackupRecovery.test.ts')
for name in ['package.json', 'jest.config.js', 'jest.setup.js', 'babel.config.js', 'tsconfig.json']:
    shutil.copy2(root / name, sandbox / name)
(sandbox / 'node_modules').symlink_to(root / 'node_modules', target_is_directory=True)
command = ['node', str(root / 'node_modules/jest/bin/jest.js'), '--runInBand', '--watchman=false', '--config', str(sandbox / 'jest.config.js'), '__tests__/storage/legacyBackupRecovery.test.ts']
results = []

def run(name, expected):
    result = subprocess.run(command, cwd=sandbox, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (qa / (name + '.log')).write_text(result.stdout)
    assert result.returncode == expected, (name, result.stdout[-4000:])
    results.append({'case': name, 'exitCode': result.returncode, 'expectedExitCode': expected})

run('isolated-baseline', 0)
path = sandbox / 'src/storage/durableStorage.ts'
original = path.read_text()
assert '    await recover();' in original
path.write_text(original.replace('    await recover();', '    // QA mutation: skip recovery before application reads.', 1))
run('skipped-recovery', 1)
path.write_text(original)
path = sandbox / 'src/storage/backupRestore.ts'
original = path.read_text()
needle = "        if (stored?.schemaVersion !== 1) throw new Error('Unsupported learning history version');"
assert needle in original
path.write_text(original.replace(needle, '        // QA mutation: accept unsupported local history schema.', 1))
run('unsupported-history', 1)
path.write_text(original)
run('isolated-restored', 0)
(qa / 'mutation-results.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps({'sandbox': str(sandbox), 'results': results}, indent=2))
