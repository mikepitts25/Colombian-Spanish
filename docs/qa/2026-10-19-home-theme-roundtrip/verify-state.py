"""Check saved native records only; no UI replay or image-content recognition."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
rows = json.loads((root / 'native/native-state-check.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
phases = ['baseline-settings', 'barrio-system-light-home', 'barrio-system-dark-home',
          'barrio-system-dark-max', 'barrio-system-light-return', 'classic-saved-home',
          'classic-cold-home', 'classic-cold-metro', 'baseline-restored', 'baseline-cold-restored']
assert [r['phase'] for r in rows] == phases
start = rows[0]
previous = json.loads((root.parent / '2026-10-19-native-midnight/native-state-check.json').read_text())[-1]
assert start['keyHashes'] == previous['keyHashes']
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
fields = {'plan':'SRS_DAILY_PLAN_V1', 'missions':'SRS_MISSIONS_V1', 'prefs':'SRS_PREFS_V1',
          'session':'SRS_LAST_STUDY_SESSION_V1', 'daily':'SRS_DAILY_PROGRESS_V1',
          'streak':'SRS_STUDY_STREAK_V1', 'quizHistory':'SRS_QUIZ_HISTORY_V1',
          'notificationPrefs':'SRS_NOTIFICATION_PREFS_V1'}
for r in rows:
    assert r['device'] == meta['device']
    assert r['pathMatchesRequestedDevice'] is True
    assert r['capturePath'] == start['capturePath']
    assert f"/Devices/{meta['device']}/data/Containers/Data/Application/" in r['capturePath']
    assert r['journal'] is None
    assert r['deckCount'] == 48 and r['cardCount'] == 1402
    assert len(r['keyHashes']) == 11 and len(r['events']) == 10
    for f, k in fields.items():
        assert digest(r[f]) == r['keyHashes'][k], (r['phase'], f)
    assert digest({'schemaVersion':1, 'events':r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    for key in start['keyHashes']:
        if key != 'SRS_PREFS_V1':
            assert r['keyHashes'][key] == start['keyHashes'][key], (r['phase'], key)
    for field in ['session', 'plan', 'missions', 'events', 'daily', 'streak', 'notificationPrefs', 'quizHistory', 'deckHash']:
        assert r[field] == start[field], (r['phase'], field)
for r in rows[1:5]:
    assert r['prefs'] == dict(start['prefs'], themeId='barrio', appearanceMode='system')
for r in rows[5:8]:
    assert r['prefs'] == dict(start['prefs'], themeId='classic', appearanceMode='system')
for r in rows[8:]:
    assert r['keyHashes'] == start['keyHashes']
assert start['session']['queue'] == {'schemaVersion':1, 'cardIds':['catchup-7','catchup-8','catchup-9'], 'region':'all', 'sessionId':'mvch686p-e-kaznxi22mfb'}
assert start['session']['cardId'] == 'catchup-7'
assert start['daily'] == {'date':'2026-10-19','count':0,'target':5,'newCount':0}
for p in (root / 'native').glob('*-preflight.json'):
    r = json.loads(p.read_text())
    assert r['isolated'] is True and r['requestedDevice'] == meta['device']
    assert r['container'] == r['resolvedContainer'] == start['capturePath']
assert len(list((root / 'native').glob('*-preflight.json'))) == 6
images = meta['imageSHA256']
assert set(images) == {p.name for p in (root / 'native').glob('*.png')}
for name, expected in images.items():
    assert hashlib.sha256((root / 'native' / name).read_bytes()).hexdigest() == expected
assert meta['failedLaunchImage'] == 'classic-cold-home.png'
print('Ten checkpoints: only intended theme preferences changed; all eleven baseline hashes restored through cold launch; six own-path preflights and image digests match.')
print('The no-script-URL image is a failed plain launch, not a passing cold-launch screen. This verifier does not replay UI or establish omitted layout/platform/source-cold acceptance.')
