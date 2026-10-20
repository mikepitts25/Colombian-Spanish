"""Passive consistency checks only; no native mutations, UI or mounts."""
from pathlib import Path
import hashlib
import json

p = Path(__file__).resolve().parent

def read(name):
    return json.loads((p / name).read_text())

s = read('state-summary.json')
o, b = s['original-before'], s['baseline']
assert o['recordCount'] == 11 and o['eventCount'] == 2
assert b['recordCount'] == 7 and b['eventCount'] == 1
prior = json.loads((p.parent / '2026-10-20-ios-storage-save/state-summary.json').read_text())['second-cold']
assert s['reused-before-launch']['hashes'] == prior['hashes']
for label in ['reused-before-launch', 'before-restore', 'restore-error']:
    assert s[label]['hashes'] == b['hashes']
for label in ['original-restored', 'original-cold']:
    assert s[label]['hashes'] == o['hashes']
a, cold = s['after-retry'], s['restored-cold']
assert a['recordCount'] == 11 and a['eventCount'] == 1 and a['hashes'] == cold['hashes']
assert {k for k in b['hashes'] if b['hashes'][k] != a['hashes'][k]} == {'SRS_LEARNING_EVENTS_V1'}
assert all(a['semanticHashes'][k] == v for k, v in b['semanticHashes'].items())
assert a['daily'] == b['daily'] and a['session'] == b['session']
assert all(x['journal'] is None for x in s.values())
r = read('restore-result.json')
assert r['changedExistingRaw'] == ['SRS_LEARNING_EVENTS_V1'] and r['allExistingParsedExact']
assert r['expectedSemanticHashes'] == a['semanticHashes']
assert r['normalizedAbsentRecords'] == {'SRS_DAILY_PLAN_V1': {'schemaVersion': 1, 'current': None}, 'SRS_MISSIONS_V1': {'schemaVersion': 1, 'runs': []}, 'SRS_QUIZ_HISTORY_V1': [], 'SRS_NOTIFICATION_PREFS_V1': {}}
assert r['event']['id'] == 'mvgn7inp-7-vc67av9ng7' and r['event']['quality'] == 2
m = read('backup-metadata.json')
assert m['version'] == 3 and m['bytes'] == 372359
assert (m['decks'], m['cards'], m['eventCount']) == (47, 1392, 1) and len(m['stateKeys']) == 9
assert len(m['providerMatches']) == 1
assert m['providerMatches'][0]['sha256'] == m['providerAfterSha256'] == m['sha256']
f = read('full-space.json')
assert f['errno'] == 28 and f['availableBytes'] == 24576 and f['hostAvailableBytes'] > 1024**3
assert read('space-freed.json') == {'availableBytes': 32333824, 'sameMountedFilesystem': True}
assert 'No se pudo finalizar la importación' in (p / 'restore-error.txt').read_text()
for name in ['same-process.txt', 'after-retry-process.txt']:
    assert (p / name).read_text().strip().startswith('26141 ')
g, restored = read('store-active.json'), read('store-restored.json')
assert g['imageBytes'] == 33554432
assert restored['terminateExit'] == restored['detachExit'] == 0
assert restored['restoredSameFilesystem'] and restored['originalFilesPreserved']
assert restored['restoredFiles'] == restored['originalFiles'] == g['originalFiles']
rows = [json.loads(x) for x in (p / 'exclusive-watch.jsonl').read_text().splitlines()]
c = read('cleanup.json')
assert len(rows) == c['samples'] == 186 and not any(x['collision'] for x in rows)
assert c['collisions'] == 0 and not c['qaImageMounted']
assert c['processes'] == {'exit': 1, 'output': ''}
assert c['android']['output'] == 'List of devices attached'
assert not any(json.loads(c['ios']['output'])['devices'].values())
for filename, digest in read('sha256.json').items():
    assert hashlib.sha256((p / filename).read_bytes()).hexdigest() == digest, filename
assert len(list(p.glob('*.png'))) == 6
print('PASS: real full-state restore failure/retry, supported normalization, single event, exact cold/original protection and cleanup')
