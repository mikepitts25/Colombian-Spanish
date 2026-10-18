"""Validate calendar-control observation checkpoints without simulator access."""
import hashlib
import json
from pathlib import Path
root=Path(__file__).resolve().parent
rows=json.loads((root/'native/native-state-check.json').read_text())
assert [r['phase'] for r in rows]==['mini-baseline','mini-returned']
assert rows[0]['keyHashes']==rows[1]['keyHashes']
previous=json.loads((root.parent/'2026-10-18-barrio-home-goal/native/native-state-check.json').read_text())
assert rows[0]['keyHashes']==next(r for r in previous if r['phase']=='mini-final-normal')['keyHashes']
u='DF3686C1-A2E7-4870-B127-A83A8B67541D'
for r in rows:
    assert r['device']==u and r['pathMatchesRequestedDevice']
    assert f'/Devices/{u}/data/Containers/Data/Application/' in r['capturePath']
    assert len(r['keyHashes'])==11 and len(r['events'])==11
    assert r['deckCount']==48 and r['cardCount']==1402
for p in (root/'native').glob('*-preflight.json'):
    r=json.loads(p.read_text());assert r['isolated'] and r['requestedDevice']==u
    assert f'/Devices/{u}/data/' in r['resolvedContainer']
imgs=json.loads((root/'images.json').read_text());assert len(imgs)==2
assert {i['file'] for i in imgs}=={str(p.relative_to(root)) for p in (root/'native').glob('*.png')}
for i in imgs: assert hashlib.sha256((root/i['file']).read_bytes()).hexdigest()==i['sha256']
print('PASS:2 native checkpoints/2 observed settings-search images; all11 app keys and11events unchanged. No live date/time-zone transition established.')
