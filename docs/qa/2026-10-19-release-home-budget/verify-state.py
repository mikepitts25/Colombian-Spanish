"""Passive archived allowance/retained-plan validation, never UI or storage replay."""
from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text())
digest = lambda v: hashlib.sha256(json.dumps(v, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
rows = read(root / 'native/native-state-check.json')
meta = read(root / 'verification.json')
assert [r['phase'] for r in rows] == ['baseline', 'cap-imported', 'cap-cold-home',
    'cap-browse', 'cap-home-es', 'review-imported', 'review-cold-home',
    'review-changed-prefs-home-es', 'review-started', 'review-started-cold',
    'review-linked-resumed', 'restored-before-cold', 'restored-cold-home']
baseline = rows[0]
previous = read(root.parent / '2026-10-19-release-plan-recovery/native/native-state-check.json')[-1]
assert baseline['keyHashes'] == previous['keyHashes']
assert baseline['plan'] == {'schemaVersion': 1, 'current': None}
assert len(baseline['events']) == 1
assert baseline['daily'] == {'date': '2026-10-19', 'count': 0, 'target': 5, 'newCount': 0}
session = dict(baseline['session'], updatedAt=1000,
    queue=dict(baseline['session']['queue'], sessionId='release-retained-review-session-20261019'))
assert session['cardId'] == '0009'
assert session['queue']['cardIds'] == ['0009', '0010', '0011', '0012', '0013']
assert session['queue']['limits'] == {'cardLimit': 6, 'newLimit': 5}
plan = {'schemaVersion': 1, 'current': {'id': 'release-retained-review-plan-20261019',
    'day': '2001-01-01', 'minutes': 3, 'createdAt': 1000, 'phase': 'review',
    'review': {'initialCardIds': session['queue']['cardIds'], 'session': session}}}
assert meta['fixturePlan'] == plan
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
    assert r['events'] == baseline['events'] and r['missions'] == baseline['missions']
    assert len(r['keyHashes']) == 11
    for f, k in fields.items():
        assert digest(r[f]) == r['keyHashes'][k]
    assert digest({'schemaVersion': 1, 'events': r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    prefs = dict(baseline['prefs'])
    daily = dict(baseline['daily'])
    if 1 <= i <= 10:
        prefs.update(themeId='barrio', uiLanguage='en', newCardsPerDay=1)
        daily.update(count=1, newCount=1)
    if i == 4 or 7 <= i <= 10:
        prefs['uiLanguage'] = 'es'
    if 7 <= i <= 10:
        prefs['studyMinutes'] = 10
    expected_plan = plan if 5 <= i <= 10 else baseline['plan']
    expected_session = dict(session, updatedAt=r['session']['updatedAt']) if 8 <= i <= 10 else baseline['session']
    assert r['prefs'] == prefs and r['daily'] == daily
    assert r['plan'] == expected_plan and r['session'] == expected_session
    expected = dict(baseline['keyHashes'], SRS_PREFS_V1=digest(prefs),
        SRS_DAILY_PROGRESS_V1=digest(daily), SRS_DAILY_PLAN_V1=digest(expected_plan),
        SRS_LAST_STUDY_SESSION_V1=digest(expected_session))
    assert r['keyHashes'] == expected
assert rows[1]['keyHashes'] == rows[2]['keyHashes'] == rows[3]['keyHashes']
assert rows[5]['keyHashes'] == rows[6]['keyHashes']
assert rows[8]['keyHashes'] == rows[9]['keyHashes']
assert rows[10]['session']['updatedAt'] > rows[9]['session']['updatedAt'] > 1000
assert rows[11]['keyHashes'] == rows[12]['keyHashes'] == baseline['keyHashes']
flights = list((root / 'native').glob('*preflight.json'))
assert len(flights) == 9
for p in flights:
    f = read(p)
    assert f['isolated'] and f['requestedDevice'] == meta['device']
    assert f['container'] == f['resolvedContainer'] == baseline['capturePath']
    assert f['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 8
for p in images:
    assert hashlib.sha256(p.read_bytes()).hexdigest() == meta['imageSHA256'][p.name]
    assert struct.unpack('>II', p.read_bytes()[16:24]) == (750, 1334)
print('PASS: 13 snapshots, 9 own-path preflights, 8 PNGs; prepared cap Browse no-write, exact retained plan, global session ownership/timestamp changes only, cold persistence and all11 baseline restoration. No UI replay or graded-cap proof.')
