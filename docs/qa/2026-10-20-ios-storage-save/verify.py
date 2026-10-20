"""Passive evidence validation, with no native UI, mutation or mount operations."""
from pathlib import Path
import hashlib
import json

p = Path(__file__).resolve().parent

def read(name):
    return json.loads((p / name).read_text())

s = read('state-summary.json')
o, b = s['original-before'], s['disposable-baseline']
assert o['recordCount'] == 11 and o['eventCount'] == 2
assert b['recordCount'] == 4 and b['eventCount'] == 0
for label in ['original-restored', 'original-cold']:
    assert s[label]['hashes'] == o['hashes']
assert s['exhausted-error']['hashes'] == b['hashes']
j = s['journal-error']
assert set(j['hashes']) == set(b['hashes']) | {'SRS_WRITE_JOURNAL_V1'}
assert all(j['hashes'][k] == v for k, v in b['hashes'].items())
assert j['journal']['schemaVersion'] == 1 and j['journal']['bytes'] == 417491
assert len(j['journal']['entryHashes']) == 6
r = s['recovered-cold']
assert r['journal'] is None and r['recordCount'] == 7 and r['eventCount'] == 1
assert all(r['hashes'][k] == v for k, v in j['journal']['entryHashes'].items())
assert r['prefs'] == b['prefs'] and r['daily'] == {**b['daily'], 'count': 1, 'newCount': 1}
resume = s['recovered-resume']
assert {k for k in r['hashes'] if r['hashes'][k] != resume['hashes'][k]} == {'SRS_LAST_STUDY_SESSION_V1'}
assert {k: v for k, v in r['session'].items() if k != 'updatedAt'} == {k: v for k, v in resume['session'].items() if k != 'updatedAt'}
assert s['second-cold']['hashes'] == resume['hashes']
i = read('intent.json')
assert len(i['cardChanges']) == 1
card = i['cardChanges'][0]
assert card['deckId'] == 'deck-travel' and card['before']['id'] == card['after']['id'] == '0038'
assert {k for k in card['before'] if card['before'][k] != card['after'][k]} == {'due', 'interval', 'ease'}
assert card['after']['interval'] == 0.5
assert i['event']['cardId'] == '0038' and i['event']['quality'] == 2
assert i['event']['modality'] == 'recall' and i['event']['evidence'] == 'self-rated'
assert r['session']['cardId'] == '0039' and len(r['session']['queue']['cardIds']) == 9
assert r['session']['queue']['cardIds'] == b['session']['queue']['cardIds'][1:]
assert r['session']['queue']['sessionId'] == b['session']['queue']['sessionId']
for label in ['full-space', 'journal-room-space']:
    f = read(label + '.json')
    assert f['errno'] == 28 and f['hostAvailableBytes'] > 1024**3
assert read('full-space.json')['availableBytes'] == 32768
assert read('journal-room-space.json')['availableBytes'] == 540672
assert read('space-freed.json')['availableBytes'] == 31924224
assert 'Reintenta la misma respuesta' in (p / 'exhausted-error.txt').read_text()
assert (p / 'fault-process.txt').read_text().strip().startswith('22143 ')
a, restored = read('store-active.json'), read('store-restored.json')
assert a['imageBytes'] == 33554432
assert restored['terminateExit'] == restored['detachExit'] == 0
assert restored['restoredSameFilesystem'] and restored['originalFilesPreserved']
assert restored['restoredFiles'] == a['originalFiles'] == restored['originalFiles']
rows = [json.loads(x) for x in (p / 'exclusive-watch.jsonl').read_text().splitlines()]
c = read('cleanup.json')
assert len(rows) == c['samples'] == 210 and not any(x['collision'] for x in rows)
assert c['collisions'] == 0 and not c['qaImageMounted']
assert c['processes'] == {'exit': 1, 'output': ''}
assert c['android']['output'] == 'List of devices attached'
assert not any(json.loads(c['ios']['output'])['devices'].values())
for filename, digest in read('sha256.json').items():
    assert hashlib.sha256((p / filename).read_bytes()).hexdigest() == digest, filename
assert len(list(p.glob('*.png'))) == 7
print('PASS: bounded save failure, six-entry cold recovery, one Hard intent, exact second-cold/original preservation and cleanup')
