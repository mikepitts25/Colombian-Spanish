"""Validate committed mini evidence without a simulator or temporary backup."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
rows = json.loads((root / 'native/native-state-check.json').read_text())
s = {r['phase']: r for r in rows}
assert len(s) == len(rows) == 9
meta = json.loads((root / 'fixture-metadata.json').read_text())
assert meta['nativeChanges'] is False and meta['productionJS'] is False
assert meta['deviceType'] == 'com.apple.CoreSimulator.SimDeviceType.iPad-mini-A17-Pro'
def digest(v):
    return hashlib.sha256(json.dumps(v, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
for r in rows:
    assert r['device'] == meta['device'] and r['pathMatchesRequestedDevice']
    assert f"/Devices/{r['device']}/data/Containers/Data/Application/" in r['capturePath']
    assert r['deckCount'] == 48 and r['cardCount'] == 1402 and len(r['events']) == 11
    assert len(r['keyHashes']) == 11
    for field, key in [('plan','SRS_DAILY_PLAN_V1'), ('missions','SRS_MISSIONS_V1'), ('prefs','SRS_PREFS_V1'), ('session','SRS_LAST_STUDY_SESSION_V1'), ('daily','SRS_DAILY_PROGRESS_V1'), ('streak','SRS_STUDY_STREAK_V1'), ('quizHistory','SRS_QUIZ_HISTORY_V1'), ('notificationPrefs','SRS_NOTIFICATION_PREFS_V1')]:
        assert digest(r[field]) == r['keyHashes'][key], (r['phase'], field)
    assert digest({'schemaVersion':1, 'events':r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert all(e['matchesStored'] for e in (r.get('journal') or {}).get('entries', []))
assert s['mini-baseline']['keyHashes'] == s['mini-restored']['keyHashes']
previous = json.loads((root.parent / '2026-10-18-barrio-home-fixtures/native/native-state-check.json').read_text())
assert s['mini-baseline']['keyHashes'] == next(r for r in previous if r['phase'] == 'mini-untouched-final')['keyHashes']
base = s['mini-completed-home-light']
assert base['keyHashes'] == meta['expectedKeyHashes']
assert base['plan']['current']['phase'] == 'complete' and base['plan']['current']['day'] == '2026-10-18'
assert base['missions']['runs'][0]['completed'] is True
for phase in ['mini-completed-opened','mini-completed-system-dark','mini-barrio-return','mini-system-cold']:
    assert s[phase]['keyHashes'] == base['keyHashes'], phase
classic = s['mini-classic']
assert classic['prefs'] == dict(base['prefs'], themeId='classic')
assert {k for k,v in classic['keyHashes'].items() if v != base['keyHashes'][k]} == {'SRS_PREFS_V1'}
due = s['mini-due-deck-opened']
assert {k for k,v in due['keyHashes'].items() if v != base['keyHashes'][k]} == {'SRS_LAST_STUDY_SESSION_V1'}
assert due['session']['deckId'] == 'catchup-qa' and due['session']['cardId'] == 'catchup-4'
assert due['session']['queue'] == {'schemaVersion':1, 'cardIds':[f'catchup-{i}' for i in range(4,10)], 'region':'all', 'sessionId':'mve21jcw-2-yq0p1t43mmj'}
assert due['session']['updatedAt'] == 1792341819999
for p in (root / 'native').glob('*-preflight.json'):
    r = json.loads(p.read_text())
    assert r['isolated'] and r['requestedDevice'] == meta['device']
    assert f"/Devices/{meta['device']}/data/" in r['resolvedContainer']
images = json.loads((root / 'images.json').read_text())
assert len(images) == 9
assert {r['file'] for r in images} == {str(p.relative_to(root)) for p in (root/'native').glob('*.png')}
for r in images:
    assert hashlib.sha256((root/r['file']).read_bytes()).hexdigest() == r['sha256']
print('PASS: 9 snapshots/9 images; completed/System/Classic/cold state, exact deck queue, all11-key original restoration. Visual/touch claims require observation; remaining matrix stays open.')
