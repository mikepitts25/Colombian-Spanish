"""Passive archived-state and image verification; does not replay native UI."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

rows = json.loads((root / 'native/native-state-check.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
assert [r['phase'] for r in rows] == ['baseline', 'normal-cold', 'after-native-reopen',
    'es-max', 'en-default', 'en-max-landscape', 'restored', 'restored-cold']
baseline = rows[0]
assert baseline['daily'] == {'date': '2026-10-19', 'count': 0, 'target': 5, 'newCount': 0}
assert len(baseline['events']) == 11
assert baseline['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
assert baseline['plan']['current']['phase'] == 'complete'
assert baseline['prefs']['themeId'] == 'barrio' and baseline['prefs']['appearanceMode'] == 'dark'
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for row in rows:
    assert row['device'] == meta['device'] == 'DF3686C1-A2E7-4870-B127-A83A8B67541D'
    assert row['capturePath'] == baseline['capturePath'] and row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'].endswith('/Devices/' + meta['device'] + '/data/Containers/Data/Application/C44142DA-0CDC-4927-A01A-38E7B024B9D1')
    assert row['journal'] is None and row['deckCount'] == 48 and row['cardCount'] == 1402
    prefs = dict(baseline['prefs'], uiLanguage='en' if row['phase'].startswith('en-') else 'es')
    assert row['prefs'] == prefs
    assert len(row['keyHashes']) == 11
    assert row['keyHashes'] == dict(baseline['keyHashes'], SRS_PREFS_V1=digest(prefs))
    for field, key in fields.items():
        assert digest(row[field]) == row['keyHashes'][key]
        if field != 'prefs':
            assert row[field] == baseline[field]
    assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert row['events'] == baseline['events'] and row['taskCards'] == baseline['taskCards']
    assert row['deckHash'] == baseline['deckHash']
assert rows[-1]['keyHashes'] == rows[-2]['keyHashes'] == baseline['keyHashes']
preflights = list((root / 'native').glob('*preflight.json'))
assert len(preflights) == 4
for path in preflights:
    item = json.loads(path.read_text())
    assert item['isolated'] is True and item['requestedDevice'] == meta['device']
    assert item['container'] == item['resolvedContainer'] == baseline['capturePath']
    assert item['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 8
for path in images:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == meta['imageSHA256'][path.name]
print('PASS: 8 snapshots, 4 own-path preflights, 8 image digests; prefs-only English change, exact all11 restoration and cold preservation. UI/OS observations require acquisition review.')
