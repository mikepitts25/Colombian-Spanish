"""Passive recorded-evidence checks; never reads or writes simulator storage."""
import hashlib
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parent
native = root / 'native'
rows = json.loads((native / 'native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before', 'imported', 'default-draft', 'rotated-ungraded', 'fixed-rotated-ungraded', 'restored', 'final-cold']
base = rows[0]
profile = json.loads((native/'device-provenance.json').read_text())
assert profile['device'] == base['device']
assert profile['deviceType'] == 'com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M4-8GB'
assert len(base['keyHashes']) == 11
assert rows[-2]['keyHashes'] == rows[-1]['keyHashes'] == base['keyHashes']
assert rows[-1]['plan']['current']['phase'] == 'complete'
assert rows[1]['plan']['current']['phase'] == 'applied' and rows[1]['missions']['runs'] == []
assert rows[2]['keyHashes'] == rows[3]['keyHashes'] == rows[4]['keyHashes']
assert len(rows[2]['missions']['runs']) == 1 and rows[2]['missions']['runs'][0]['revision'] == 0
allowed = {'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1', 'SRS_PREFS_V1'}
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
fields = dict(plan='SRS_DAILY_PLAN_V1', missions='SRS_MISSIONS_V1', prefs='SRS_PREFS_V1', daily='SRS_DAILY_PROGRESS_V1', streak='SRS_STUDY_STREAK_V1', session='SRS_LAST_STUDY_SESSION_V1', quizHistory='SRS_QUIZ_HISTORY_V1', notificationPrefs='SRS_NOTIFICATION_PREFS_V1')
for row in rows:
    assert row['device'] == 'F9BC32B5-9591-4CEA-9363-707D3A7E204D'
    assert row['pathMatchesRequestedDevice'] and row['device'] in row['capturePath']
    assert row['journal'] is None and row['events'] == base['events'] and len(row['events']) == 11
    assert row['deckCount'] == 48 and row['cardCount'] == 1402
    assert all(value == base['keyHashes'][key] for key,value in row['keyHashes'].items() if key not in allowed)
    assert all(digest(row[field]) == row['keyHashes'][key] for field,key in fields.items())
    assert digest(dict(schemaVersion=1, events=row['events'])) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
    prefs = dict(row['prefs']);prefs['uiLanguage'] = 'es'
    assert prefs == base['prefs']
assert json.loads((native/'fixture.json').read_text())['sourceKeyHashes'] == base['keyHashes']
preflights = list(native.glob('*preflight.json'))
assert len(preflights) == 9
for path in preflights:
    item = json.loads(path.read_text())
    assert item['isolated'] and item['requestedDevice'] == base['device'] and base['device'] in item['container']
images = json.loads((native/'screenshots.json').read_text())
assert len(images) == 8
for item in images:
    data = (native/item['file']).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    assert list(struct.unpack('>II',data[16:24])) == item['dimensions']
    assert hashlib.sha256(data).hexdigest() == item['sha256']
assert 'Tests:       1099 passed, 1099 total' in (root/'software/mini-applied-full-final.log').read_text()
print('PASS: seven snapshots; unchanged11 observations/eight invariant records; exact all11 restore/cold; nine preflights/eight images; 1099-test log.')
