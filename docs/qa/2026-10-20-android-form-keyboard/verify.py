"""Passive evidence consistency, not UI automation or full QA acceptance."""
from pathlib import Path
import json
import hashlib
p = Path(__file__).resolve().parent
rows = json.loads((p / 'state-summary.json').read_text())
assert [r['label'] for r in rows] == ['start', 'max-open', 'example-focused', 'fixed-example', 'validation', 'canceled', 'restored', 'final-cold']
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
assert 'Expected: 326' in (p / 'regression-red.txt').read_text()
assert 'Received: undefined' in (p / 'regression-red.txt').read_text()
assert '13 passed' in (p / 'focused-green.txt').read_text()
print('PASS: eight exact eleven-record checkpoints, bounded regression evidence, exclusive samples and cleanup; UI and broader acceptance are separate.')
