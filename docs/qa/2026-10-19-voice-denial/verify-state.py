"""Verify archived app records and evidence integrity, not native UI or OS replay."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(path):
    return json.loads(path.read_text())

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

rows = read(root / 'native/native-state-check.json')
inputs = read(root / 'native/input-route-state.json')
meta = read(root / 'verification.json')
assert [r['phase'] for r in rows] == ['baseline', 'denied', 'es-alternative', 'en-denied',
    'en-alternative', 'restored', 'restored-cold']
assert [r['phase'] for r in inputs] == ['baseline', 'final']
baseline = rows[0]
prior = read(root.parent / '2026-10-19-long-draft-save/native/native-state-check.json')[-1]
assert baseline['keyHashes'] == prior['keyHashes']
assert baseline['daily'] == {'date': '2026-10-19', 'count': 2, 'target': 5, 'newCount': 0}
assert len(baseline['events']) == 12 and baseline['session']['queue']['cardIds'] == ['catchup-9']
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for row in inputs + rows:
    assert row['device'] == meta['device'] == 'BF511B0E-479F-429E-83B7-4134E910847F'
    assert row['capturePath'] == baseline['capturePath'] and row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'].endswith('/Devices/' + meta['device'] + '/data/Containers/Data/Application/77D86906-220A-4801-9E47-AA7B6AC55DEC')
    assert row['journal'] is None and row['deckCount'] == 48 and row['cardCount'] == 1402
    prefs = dict(baseline['prefs'])
    if row['phase'] in ['en-denied', 'en-alternative']:
        prefs.update(uiLanguage='en', themeId='classic', appearanceMode='system')
    assert row['prefs'] == prefs
    assert row['keyHashes'] == dict(baseline['keyHashes'], SRS_PREFS_V1=digest(prefs))
    for field, key in fields.items():
        assert digest(row[field]) == row['keyHashes'][key]
        if field != 'prefs':
            assert row[field] == baseline[field]
    assert row['events'] == baseline['events']
    assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert row['taskCards'] == baseline['taskCards'] and row['nativeDecks'] == []
assert rows[-1]['keyHashes'] == rows[-2]['keyHashes'] == baseline['keyHashes']
assert meta['recovery']['keyHashes'] == baseline['keyHashes']
assert meta['recovery']['permissionBeforeReset'] == [['kTCCServiceMicrophone', 0]]
assert meta['recovery']['audioFileCount'] == 0
assert meta['baselinePermissionObservation']['permissionRows'] == meta['cleanup']['permissionRows'] == []
assert meta['baselinePermissionObservation']['audioFileCount'] == meta['cleanup']['audioFileCount'] == 0
assert meta['cleanup']['foregroundPID'] == 44646 and meta['cleanup']['coldPID'] == 62564
preflights = list((root / 'native').glob('*preflight.json'))
assert len(preflights) == 4
for path in preflights:
    item = read(path)
    assert item['isolated'] is True and item['requestedDevice'] == meta['device']
    assert item['container'] == item['resolvedContainer'] == baseline['capturePath']
    assert item['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 8
for path in images:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == meta['imageSHA256'][path.name]
print('PASS: 7 voice + 2 input-route snapshots, 4 preflights, 8 image digests; 10 learning records unchanged, exact all11 baseline restore/cold. OS permission/file/PID observations are internally consistent acquisition metadata, not live replay.')
