"""Passive archived native recovery checks; no UI replay or app writes."""
from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text())
digest = lambda v: hashlib.sha256(json.dumps(v, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
rows = read(root / 'native/native-state-check.json')
meta = read(root / 'verification.json')
assert [r['phase'] for r in rows] == ['baseline', 'fixture-imported', 'fixture-cold-home',
    'unavailable-open-es', 'returned-home-es', 'changed-preferences-home-en',
    'unavailable-en-max', 'unavailable-en-max-positioned', 'ended-plan-home',
    'ended-plan-cold', 'restored-before-cold', 'restored-cold-home']
baseline = rows[0]
previous = read(root.parent / '2026-10-19-release-calendar-return/native/native-state-check.json')[-1]
assert baseline['keyHashes'] == previous['keyHashes']
assert baseline['plan'] == {'schemaVersion': 1, 'current': None}
assert len(baseline['events']) == 1
assert baseline['session']['cardId'] == '0009'
assert baseline['session']['queue']['cardIds'] == ['0009', '0010', '0011', '0012', '0013']
fixture = {'schemaVersion': 1, 'current': {'id': 'release-unavailable-plan-20261019',
    'day': '2001-01-01', 'minutes': 3, 'createdAt': 1000, 'phase': 'applied',
    'applied': {'missionId': 'daily-morning-greeting', 'contentVersion': 99,
        'runId': 'release-retained-run-99'}}}
assert meta['fixturePlan'] == fixture
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for i, r in enumerate(rows):
    assert r['device'] == meta['device'] == 'D5502A06-4858-428C-901C-587B58280F64'
    assert r['capturePath'] == baseline['capturePath'] and r['pathMatchesRequestedDevice']
    assert '/Devices/' + meta['device'] + '/data/Containers/Data/Application/' in r['capturePath']
    assert r['deckCount'] == 47 and r['cardCount'] == 1392 and r['journal'] is None
    assert r['deckHash'] == baseline['deckHash'] and r['taskCards'] == {}
    assert r['events'] == baseline['events'] and r['session'] == baseline['session']
    assert r['missions'] == {'schemaVersion': 1, 'runs': []}
    assert len(r['keyHashes']) == 11
    for f, k in fields.items():
        assert digest(r[f]) == r['keyHashes'][k]
    assert digest({'schemaVersion': 1, 'events': r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    prefs = dict(baseline['prefs'])
    if 1 <= i <= 9:
        prefs['themeId'] = 'barrio'
    if 5 <= i <= 9:
        prefs.update(uiLanguage='en', studyMinutes=10)
    plan = fixture if 1 <= i <= 7 else baseline['plan']
    assert r['prefs'] == prefs and r['plan'] == plan
    expected = dict(baseline['keyHashes'], SRS_PREFS_V1=digest(prefs), SRS_DAILY_PLAN_V1=digest(plan))
    assert r['keyHashes'] == expected
assert rows[1]['keyHashes'] == rows[2]['keyHashes'] == rows[3]['keyHashes'] == rows[4]['keyHashes']
assert rows[5]['keyHashes'] == rows[6]['keyHashes'] == rows[7]['keyHashes']
assert rows[8]['keyHashes'] == rows[9]['keyHashes']
assert rows[10]['keyHashes'] == rows[11]['keyHashes'] == baseline['keyHashes']
flights = list((root / 'native').glob('*preflight.json'))
assert len(flights) == 7
for p in flights:
    f = read(p)
    assert f['isolated'] and f['requestedDevice'] == meta['device']
    assert f['container'] == f['resolvedContainer'] == baseline['capturePath']
    assert f['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 6
for p in images:
    assert hashlib.sha256(p.read_bytes()).hexdigest() == meta['imageSHA256'][p.name]
    assert struct.unpack('>II', p.read_bytes()[16:24]) == (750, 1334)
print('PASS: 12 snapshots, 7 own-path preflights, 6 PNGs; exact unavailable fixture retention, preference-only changes, plan-only End, cold persistence and all11 current-batch baseline recovery. No UI replay or full matrix claim.')
