"""Passive recorded-state validation; never replays UI, clocks or storage writes."""
from pathlib import Path
import hashlib
import json
import struct

root = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text())
digest = lambda v: hashlib.sha256(json.dumps(v, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
rows = read(root / 'native/native-state-check.json')
meta = read(root / 'verification.json')
assert [r['phase'] for r in rows] == ['original', 'before-grade', 'after-one-good',
    'graded-home', 'nextday-home', 'nextday-progress', 'nextday-resumed',
    'restored-before-cold', 'restored-cold', 'final-home']
original, before, graded, home, cold, progress, resumed, restored, final_cold, final = rows
previous = read(root.parent / '2026-10-19-native-zone/native/native-state-check.json')[-1]
assert original['keyHashes'] == previous['keyHashes']
assert original['events'] == before['events'] == []
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for i, r in enumerate(rows):
    assert r['device'] == meta['device'] == 'D5502A06-4858-428C-901C-587B58280F64'
    assert r['capturePath'] == original['capturePath'] and r['pathMatchesRequestedDevice']
    assert '/Devices/' + meta['device'] + '/data/Containers/Data/Application/' in r['capturePath']
    assert r['deckCount'] == 47 and r['cardCount'] == 1392 and r['journal'] is None
    assert len(r['keyHashes']) == 11
    for f, k in fields.items():
        assert digest(r[f]) == r['keyHashes'][k]
    history = None if i < 2 else {'schemaVersion': 1, 'events': r['events']}
    assert digest(history) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert r['taskCards'] == {} and r['flaggedCards'] == original['flaggedCards']

def changed(a, b):
    return {k for k in a['keyHashes'] if a['keyHashes'][k] != b['keyHashes'][k]}

assert changed(original, before) == {'SRS_PREFS_V1', 'SRS_DAILY_PROGRESS_V1', 'SRS_LAST_STUDY_SESSION_V1'}
assert before['prefs'] == dict(original['prefs'], themeId='barrio')
assert before['daily'] == dict(original['daily'], date='2026-10-18')
assert before['session'] == dict(original['session'], updatedAt=before['session']['updatedAt'])
assert graded['daily'] == dict(before['daily'], count=1, newCount=1)
assert len(graded['events']) == 1
event = graded['events'][0]
assert event['cardId'] == '0009' and event['deckId'] == 'deck-greetings'
assert event['quality'] == 4 and event['modality'] == 'recall'
assert event['evidence'] == 'self-rated' and event['outcome'] == 'correct'
assert event['sessionId'] == original['session']['queue']['sessionId']
expected_session = dict(before['session'], cardId='0010', updatedAt=graded['session']['updatedAt'],
    queue=dict(before['session']['queue'], cardIds=['0010', '0011', '0012', '0013']))
assert graded['session'] == expected_session
assert graded['streak'] == {'streak': 1, 'lastStudyDate': '2026-10-18', 'freezes': 0}
assert changed(before, graded) == {'SRS_DECKS_V3', 'SRS_DAILY_PROGRESS_V1', 'SRS_STUDY_STREAK_V1',
    'SRS_SEEN_WORDS_V1', 'SRS_LAST_STUDY_SESSION_V1', 'SRS_LEARNING_EVENTS_V1'}
assert graded['keyHashes'] == home['keyHashes']
assert changed(home, cold) == {'SRS_DAILY_PROGRESS_V1'}
assert cold['daily'] == original['daily']
assert cold['session'] == home['session'] and cold['events'] == home['events']
assert cold['keyHashes'] == progress['keyHashes']
assert changed(progress, resumed) == {'SRS_LAST_STUDY_SESSION_V1'}
assert resumed['session'] == dict(cold['session'], updatedAt=resumed['session']['updatedAt'])
assert resumed['session']['updatedAt'] > cold['session']['updatedAt']
assert restored['keyHashes'] == final_cold['keyHashes'] == final['keyHashes']
defaults = {'plan': {'schemaVersion': 1, 'current': None}, 'missions': {'schemaVersion': 1, 'runs': []},
    'streak': {'streak': 0, 'freezes': 0}, 'seenWords': [], 'quizHistory': [], 'notificationPrefs': {}}
expected = dict(original['keyHashes'], SRS_LEARNING_EVENTS_V1=digest({'schemaVersion': 1, 'events': graded['events']}))
for f, value in defaults.items():
    assert original[f] is None and final[f] == value
    expected[fields[f]] = digest(value)
assert final['keyHashes'] == expected and len(changed(original, final)) == 7
assert final['events'] == graded['events'] and final['session'] == original['session']
assert final['prefs'] == original['prefs'] and final['daily'] == original['daily']
assert final['deckHash'] == original['deckHash']
flights = list((root / 'native').glob('*preflight.json'))
assert len(flights) == 6
for p in flights:
    f = read(p)
    assert f['isolated'] and f['requestedDevice'] == meta['device']
    assert f['container'] == f['resolvedContainer'] == original['capturePath']
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 7
for p in images:
    assert hashlib.sha256(p.read_bytes()).hexdigest() == meta['imageSHA256'][p.name]
    assert struct.unpack('>II', p.read_bytes()[16:24]) == (750, 1334)
print('PASS: 10 snapshots, 6 own-path preflights, 7 PNGs; one grade, daily-only cold reset, exact retained queue, normalized restore with one merged QA event. Not exact original all11 restoration or UI replay.')
