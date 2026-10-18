"""Validate recorded maximum-text focus evidence without simulator access."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parent
rows = json.loads((root / 'native/native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['mini-baseline', 'mini-max-primary', 'mini-restored']
previous = json.loads((root.parent / '2026-10-18-barrio-home-calendar/native/native-state-check.json').read_text())
assert rows[0]['keyHashes'] == previous[-1]['keyHashes']
u = 'DF3686C1-A2E7-4870-B127-A83A8B67541D'
for r in rows:
    assert r['device'] == u and r['pathMatchesRequestedDevice']
    assert f'/Devices/{u}/data/Containers/Data/Application/' in r['capturePath']
    assert r['keyHashes'] == rows[0]['keyHashes'] and len(r['keyHashes']) == 11
    assert r['events'] == rows[0]['events'] and len(r['events']) == 11
    assert r['deckCount'] == 48 and r['cardCount'] == 1402
p = json.loads((root / 'native/mini-baseline-preflight.json').read_text())
assert p['isolated'] and p['requestedDevice'] == u
assert f'/Devices/{u}/data/' in p['resolvedContainer']
images = json.loads((root / 'images.json').read_text())
assert len(images) == 3
assert {i['file'] for i in images} == {str(p.relative_to(root)) for p in (root / 'native').glob('*.png')}
for i in images:
    assert hashlib.sha256((root / i['file']).read_bytes()).hexdigest() == i['sha256']
print('PASS: 3 checkpoints/3 observed images; all11 app keys and11events unchanged. Focus visibility only; touch-only positioning remains open.')
