"""Passive recorded-state checks; does not operate or write simulator storage."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
rows = json.loads((HERE / 'native-state-check.json').read_text())
assert [row['phase'] for row in rows] == [
    'before', 'imported', 'draft-ungraded', 'restored', 'final-cold'
]
before, imported, draft, restored, cold = rows
assert len(before['keyHashes']) == 11
assert before['keyHashes'] == restored['keyHashes'] == cold['keyHashes']
assert before['deckCount'] == 48 and before['cardCount'] == 1402
assert len(before['events']) == 11
assert cold['plan']['current']['phase'] == 'complete'
assert imported['plan']['current']['phase'] == draft['plan']['current']['phase'] == 'applied'
assert imported['missions']['runs'] == []
assert len(draft['missions']['runs']) == 1
assert draft['missions']['runs'][0]['revision'] == 0
assert not draft['missions']['runs'][0]['completed']
changed = {'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1'}
fields = {
    'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1',
    'prefs': 'SRS_PREFS_V1', 'daily': 'SRS_DAILY_PROGRESS_V1',
    'streak': 'SRS_STUDY_STREAK_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1'
}
def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
for row in rows:
    assert row['pathMatchesRequestedDevice'] and row['device'] in row['capturePath']
    assert row['journal'] is None
    assert row['events'] == before['events']
    for field, key in fields.items():
        assert digest(row[field]) == row['keyHashes'][key]
    assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert {k: v for k, v in row['keyHashes'].items() if k not in changed} == {
        k: v for k, v in before['keyHashes'].items() if k not in changed
    }
metadata = json.loads((HERE / 'fixture.json').read_text())
assert metadata['sourceKeyHashes'] == before['keyHashes']
assert metadata['normalizedFields'] == []
for path in HERE.glob('*preflight.json'):
    report = json.loads(path.read_text())
    assert report['isolated'] and report['requestedDevice'] == before['device']
assert len(list(HERE.glob('*preflight.json'))) == 5
print('PASS: five snapshots; nine invariant records; exact eleven-record restore/cold; no added events; five own-path preflights.')
