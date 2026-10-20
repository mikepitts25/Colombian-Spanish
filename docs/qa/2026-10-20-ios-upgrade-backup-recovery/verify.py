"""Passive consistency only: does not replay UI, build, or apply the fault."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

s = read('state-summary.json')
b = s['baseline']
assert b['recordCount'] == 11 and b['decks'] == 47 and b['cards'] == 1392 and b['eventCount'] == 2
for name in ['after-upgrade', 'after-visible-navigation']:
    assert s[name]['hashes'] == b['hashes']
r = s['resumed']
changed = [k for k in b['hashes'] if b['hashes'][k] != r['hashes'][k]]
assert changed == ['SRS_LAST_STUDY_SESSION_V1']
assert {k: v for k, v in b['session'].items() if k != 'updatedAt'} == {k: v for k, v in r['session'].items() if k != 'updatedAt'}
assert r['session']['queue']['cardIds'] == ['0010', '0011', '0012', '0013']
for name in ['final-cold', 'after-write-error', 'after-export-retry', 'final-storage-cold']:
    assert s[name]['hashes'] == r['hashes'] and s[name]['journal'] is None
m = read('build-metadata.json')
assert m['version'] == '1.0.1' and m['build'] == '2' and not m['signingAllowed']
assert '1.0.1 · compilación 2' in (root / 'version-settings.txt').read_text()
f = read('cache-denied.json')
a = read('cache-restored.json')
assert f['originalMode'] == a['restoredMode'] == '0o755' and f['appliedMode'] == '0o555'
assert f['device'] == b['device'] and a['cache'] == f['cache']
assert 'Error de respaldo' in (root / 'cache-write-error.txt').read_text()
e = read('retry-metadata.json')
assert e['version'] == 3 and e['bytes'] == 372661
assert (e['decks'], e['cards'], e['events']) == (47, 1392, 2) and len(e['stateKeys']) == 9
rows = [json.loads(x) for x in (root / 'exclusive-watch.jsonl').read_text().splitlines()]
c = read('cleanup.json')
assert len(rows) == c['samples'] == 236 and not any(x['collision'] for x in rows)
assert c['processes']['exit'] == 1 and not c['processes']['output']
assert c['android']['output'] == 'List of devices attached'
assert not any(json.loads(c['ios']['output'])['devices'].values())
for name, digest in read('sha256.json').items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == digest, name
print('PASS: iOS update/resume, eleven-record preservation, bounded cache fault/retry metadata, restoration and cleanup. Not broad release acceptance.')
