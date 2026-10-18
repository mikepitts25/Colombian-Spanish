"""Passive mini evidence checks; never accesses or writes simulator storage."""
import hashlib
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parent
native = root/'native'
rows = json.loads((native/'native-state-check.json').read_text())
meta = json.loads((native/'fixture.json').read_text())
profile = json.loads((native/'device-provenance.json').read_text())
assert profile['deviceType'] == 'com.apple.CoreSimulator.SimDeviceType.iPad-mini-A17-Pro'
assert profile['UDID'] == 'DF3686C1-A2E7-4870-B127-A83A8B67541D'
assert [r['phase'] for r in rows] == ['initialized-spanish','spanish-draft','spanish-rotated','english-switch','english-draft','english-rotated','restored-fixture','final-cold']
source = json.loads((root.parent/'2026-10-18-applied-keyboard-reveal/native/native-state-check.json').read_text())[0]
assert meta['expectedBaselineHashes'] == source['keyHashes']
assert rows[0]['keyHashes'] == meta['expectedAppliedHashes']
assert rows[-2]['keyHashes'] == rows[-1]['keyHashes'] == meta['expectedBaselineHashes']
assert rows[1]['keyHashes'] == rows[2]['keyHashes']
assert rows[3]['keyHashes'] == rows[4]['keyHashes'] == rows[5]['keyHashes']
assert rows[0]['missions']['runs'] == []
assert all(r['plan']['current']['phase'] == 'applied' for r in rows[:6])
assert all(r['plan']['current']['phase'] == 'complete' for r in rows[-2:])
assert len(rows[1]['missions']['runs']) == 1
assert all(r['missions']['runs'][0]['revision'] == 0 and not r['missions']['runs'][0]['completed'] for r in rows[1:6])
allowed = {'SRS_DAILY_PLAN_V1','SRS_MISSIONS_V1','SRS_PREFS_V1'}
fields = dict(plan='SRS_DAILY_PLAN_V1', missions='SRS_MISSIONS_V1', prefs='SRS_PREFS_V1', daily='SRS_DAILY_PROGRESS_V1', streak='SRS_STUDY_STREAK_V1', session='SRS_LAST_STUDY_SESSION_V1', quizHistory='SRS_QUIZ_HISTORY_V1', notificationPrefs='SRS_NOTIFICATION_PREFS_V1')
def digest(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
for i,r in enumerate(rows):
    assert r['device'] == profile['UDID'] and r['pathMatchesRequestedDevice'] and r['device'] in r['capturePath']
    assert len(r['keyHashes']) == 11 and r['journal'] is None
    assert r['events'] == source['events'] and len(r['events']) == 11
    assert r['deckCount'] == 48 and r['cardCount'] == 1402 and len(r['flaggedCards']) == 20
    assert all(value == rows[0]['keyHashes'][key] for key,value in r['keyHashes'].items() if key not in allowed)
    assert all(digest(r[field]) == r['keyHashes'][key] for field,key in fields.items())
    assert digest(dict(schemaVersion=1,events=r['events'])) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert r['prefs']['uiLanguage'] == ('en' if i in [3,4,5] else 'es')
    prefs=dict(r['prefs']);prefs['uiLanguage']='es';assert prefs == rows[0]['prefs']
preflights=list(native.glob('*preflight.json'));assert len(preflights) == 5
for f in preflights:
    p=json.loads(f.read_text());assert p['isolated'] and p['requestedDevice'] == profile['UDID'] and profile['UDID'] in p['container']
images=json.loads((native/'screenshots.json').read_text());assert len(images) == 9
for item in images:
    data=(native/item['file']).read_bytes();assert data[:8] == b'\x89PNG\r\n\x1a\n'
    dimensions=list(struct.unpack('>II',data[16:24]));assert dimensions == item['dimensions'] and tuple(dimensions) in [(1488,2266),(2266,1488)]
    assert hashlib.sha256(data).hexdigest() == item['sha256']
print('PASS: actual mini; eight snapshots/11 unchanged events; exact target-fixture restore/cold; five own-path preflights/nine image digests.')
