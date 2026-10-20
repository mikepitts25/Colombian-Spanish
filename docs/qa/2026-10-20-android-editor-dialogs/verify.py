"""Passive evidence consistency, not UI automation or full QA acceptance."""
from pathlib import Path
import json
import hashlib
p = Path(__file__).resolve().parent
rows = json.loads((p / 'state-summary.json').read_text())
assert [r['label'] for r in rows] == ['start', 'max-start', 'new-draft', 'new-canceled', 'rename-canceled', 'editor-draft', 'fixed-editor', 'editor-canceled', 'restored', 'final-cold']
assert len(rows[0]['hashes']) == 11
for r in rows:
    assert r['hashes'] == rows[0]['hashes']
    assert r['learningEvents'] == 15
    assert (r['deckCount'], r['cardCount']) == (47, 1392)
    assert r['daily'] == {'date': '2026-10-20', 'count': 2, 'target': 5, 'newCount': 2}
assert json.loads((p / 'cleanup.json').read_text()) == {'iosBooted': [], 'androidDevices': [], 'metroListening': False, 'studioRunning': False}
samples = [json.loads(l) for l in (p / 'runtime-inventory.jsonl').read_text().splitlines()]
assert len(samples) > 2
assert all(not s['ios'] and not s['collision'] and set(s['android']) <= {'emulator-5554'} for s in samples)
for name, digest in json.loads((p / 'sha256.json').read_text()).items():
    assert hashlib.sha256((p / name).read_bytes()).hexdigest() == digest, name
for case, expected in [('new', 400), ('rename', 400), ('editor', 326)]:
    red = (p / (case + '-regression-red.txt')).read_text()
    assert 'Expected: ' + str(expected) in red
    assert 'Received: undefined' in red
assert '31 passed' in (p / 'focused-green.txt').read_text()
print('PASS: ten exact eleven-record checkpoints, bounded regression evidence, exclusive samples and cleanup; UI and broader acceptance are separate.')
