"""Passive artifact consistency; not UI replay or independent provenance proof."""
from pathlib import Path
import json
import hashlib

root = Path(__file__).resolve().parent

def read(name):
    return json.loads((root / name).read_text())

s = read('state-summary.json')
b = s['baseline']
assert b['recordCount'] == 7 and b['decks'] == 47 and b['cards'] == 1392
assert b['hashes'] == s['after-upgrade']['hashes']
assert not s['after-upgrade']['rawChangedFromBaseline']
assert s['empty-stored']['decks'] == s['empty-stored']['cards'] == 0
for name in ['empty-stored', 'after-empty-cold']:
    assert s[name]['semanticChangedFromBaseline'] == ['SRS_DECKS_V3']
assert s['after-empty-cold']['decks'] == 47 and s['after-empty-cold']['cards'] == 1392
for name in ['recovered', 'final-cold']:
    assert s[name]['semanticHashes'] == b['semanticHashes']
    assert s[name]['rawChangedFromBaseline'] == ['SRS_LEARNING_EVENTS_V1']
for item in s.values():
    assert item['recordCount'] == 7 and item['events'] == 1
    assert item['daily'] == b['daily'] and item['queue'] == b['queue']
m = read('build-metadata.json')
assert m['versionCode'] == 2 and m['versionName'] == '1.0.1-qa'
assert m['bundleSha256'] == 'ac36fbe217590e4cc457415ac2baccd2b567bccc2ee0cc5a801bd3ff67797227'
assert "versionCode='2'" in (root / 'apk-metadata.txt').read_text()
assert 'LaunchState: COLD' in (root / 'v2-cold-launch.txt').read_text()
assert 'versionCode=1' in (root / 'restored-package.txt').read_text()
os = read('restored-os.json')
assert os['autoTime']['output'] == os['autoZone']['output'] == '1'
assert os['pid']['exit'] == 1 and not os['pid']['output']
c = read('cleanup.json')
rows = [json.loads(x) for x in (root / 'exclusive-watch.jsonl').read_text().splitlines()]
assert len(rows) == c['samples'] == 219 and not any(x['collision'] for x in rows)
assert c['collisions'] == 0 and c['processes']['exit'] == 1
assert c['android']['output'] == 'List of devices attached'
assert not any(json.loads(c['ios']['output'])['devices'].values())
for name, digest in read('sha256.json').items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == digest, name
print('PASS: bounded package update, stored-empty/reseeded recovery, exactness boundaries, restoration, cleanup and artifact digests.')
