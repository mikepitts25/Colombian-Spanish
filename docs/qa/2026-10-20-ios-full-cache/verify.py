"""Passive evidence check only; never mounts an image or controls a simulator."""
from pathlib import Path
import hashlib
import json

p = Path(__file__).resolve().parent

def read(name):
    return json.loads((p / name).read_text())

s = read('state-summary.json')
b = s['baseline']
assert b['recordCount'] == 11 and (b['decks'], b['cards'], b['eventCount']) == (47, 1392, 2)
for label, d in s.items():
    changed = {k for k in b['hashes'] if d['hashes'][k] != b['hashes'][k]}
    assert changed == ({'SRS_PREFS_V1'} if label == 'incidental-language' else set()), label
    assert d['daily'] == b['daily'] and d['session'] == b['session']
    assert d['journal'] is None and d['eventCount'] == 2
assert s['incidental-language']['prefs'] == {**b['prefs'], 'uiLanguage': 'en'}
f, freed, restored = read('fault-active.json'), read('space-freed.json'), read('fault-restored.json')
assert f['device'] == b['device'] and f['fillerErrno'] == 28
assert f['imageBytes'] == 33554432 and f['totalBytes'] == 33513472
assert f['freeBytes'] == 16384 and f['hostFreeBytes'] > 1024**3
assert freed['sameMountedFilesystem'] and freed['freedAvailableBytes'] == 32718848
assert restored['detachExit'] == 0 and restored['restoredSameFilesystem']
assert restored['originalFilesPreserved']
assert restored['originalFiles'] == restored['restoredFiles'] == f['originalFiles']
setup = read('setup-attempt-restored.json')
assert setup['detachExit'] == 0 and setup['originalFilesPreserved']
assert 'Error de respaldo' in (p / 'export-error.txt').read_text()
m = read('retry-metadata.json')
assert m['version'] == 3 and m['bytes'] == 372661
assert (m['decks'], m['cards'], m['eventCount']) == (47, 1392, 2)
assert len(m['appStateKeys']) == 9 and m['allBaselineSectionsExact']
for filename in ['same-process.txt', 'after-retry-process.txt']:
    assert (p / filename).read_text().strip().startswith('18490 ')
rows = [json.loads(x) for x in (p / 'exclusive-watch.jsonl').read_text().splitlines()]
c = read('cleanup.json')
assert len(rows) == c['samples'] == 142 and not any(x['collision'] for x in rows)
assert c['collisions'] == 0 and not c['qaImageMounted']
assert c['processes'] == {'exit': 1, 'output': ''}
assert c['android']['output'] == 'List of devices attached'
assert not any(json.loads(c['ios']['output'])['devices'].values())
for filename, digest in read('sha256.json').items():
    assert hashlib.sha256((p / filename).read_bytes()).hexdigest() == digest, filename
assert len(list(p.glob('*.png'))) == 4
print('PASS: bounded ENOSPC metadata, same-process valid retry, eleven-record recovery, original cache/mount restoration and resource cleanup')
