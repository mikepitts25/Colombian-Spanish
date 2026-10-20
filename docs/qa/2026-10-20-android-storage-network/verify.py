"""Passive artifact consistency, not a UI replay or independent provenance proof."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

s = read('state-summary.json')
b = s['baseline']
assert b == s['after-cases'] == s['final-cold']
assert b['recordCount'] == len(b['hashes']) == 7
assert b['eventCount'] == 1 and b['deckCount'] == 47 and b['cardCount'] == 1392
assert b['daily'] == {'date': '2026-10-20', 'count': 0, 'target': 5, 'newCount': 0}
assert b['checkpoint']['queue']['cardIds'] == ['0039', '0045', '0046', '0057']
n = read('remote-probe.json')
assert all(x['httpOk'] and x['responseBytes'] > 0 for x in n)
assert n[0]['firstByteSeconds'] == 0.134 and n[1]['firstByteSeconds'] == 2.094
assert '473600 bits/s' in n[1]['status'] and '2000 ms' in n[1]['status']
assert '32 100%' in read('pressure-topup.json')['afterDf']
a = read('after-pressure-space.json')
assert a['removedOwnFiller'] and not a['fillerStillExists']
m = read('retry-backup-metadata.json')
assert m['version'] == 3 and m['bytes'] == 372343
assert (m['decks'], m['cards'], m['events']) == (47, 1392, 1)
assert len(m['applicationStateKeys']) == 9
assert m['sha256'] == '8025633f99850046513ddf322393547621e7ec9fd92d24d8b46e5555535a3852'
os = read('restored-settings.json')
assert os['autoTime']['output'] == os['autoZone']['output'] == '1'
assert os['airplane']['output'] == '0' and os['fontScale']['output'] == '1.0'
assert 'Wifi is connected' in os['wifi']['output']
assert os['filler']['exit'] == os['appPid']['exit'] == 1
assert 'No such file' in os['filler']['stderr']
rows = [json.loads(x) for x in (root / 'exclusive-watch.jsonl').read_text().splitlines()]
c = read('cleanup.json')
assert len(rows) == c['samples'] == 704 and not any(x['collision'] for x in rows)
assert c['collisions'] == 0 and c['android']['output'] == 'List of devices attached'
assert not any(json.loads(c['ios']['output'])['devices'].values())
assert c['processes']['exit'] == 1 and not c['processes']['output']
for name, digest in read('sha256.json').items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == digest, name
print('PASS: bounded network/storage artifacts, seven exact record digests, export metadata, restoration and runtime cleanup; not broad native acceptance.')
