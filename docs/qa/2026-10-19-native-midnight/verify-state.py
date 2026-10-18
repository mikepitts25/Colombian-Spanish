"""Validate saved evidence only; does not launch a simulator or inspect image text."""
from pathlib import Path
import datetime
import hashlib
import json

root = Path(__file__).resolve().parent
states = json.loads((root / 'native-state-check.json').read_text())
assert [s['phase'] for s in states] == ['before', 'after', 'restored-text3']
a, b, c = states
config = json.loads((root / 'verification.json').read_text())
preflight = json.loads((root / 'return-preflight.json').read_text())
assert preflight['isolated'] is True
assert preflight['requestedDevice'] == config['device']
assert preflight['container'] == preflight['resolvedContainer']
assert len(a['keyHashes']) == 11
for state in states:
    assert state['device'] == config['device']
    assert state['pathMatchesRequestedDevice'] is True
    assert state['capturePath'] == preflight['container']
    assert state['journal'] is None
    assert state['deckCount'] == 48 and state['cardCount'] == 1402
    assert len(state['events']) == 10
assert a['daily'] == {'date': '2026-10-18', 'count': 0, 'target': 5, 'newCount': 0}
assert b['daily'] == {**a['daily'], 'date': '2026-10-19'}
assert c['daily'] == b['daily']
assert [k for k in a['keyHashes'] if a['keyHashes'][k] != b['keyHashes'][k]] == ['SRS_DAILY_PROGRESS_V1']
assert c['keyHashes'] == b['keyHashes']
for key in ['session', 'plan', 'missions', 'events', 'prefs', 'streak', 'notificationPrefs', 'quizHistory', 'deckHash']:
    assert a[key] == b[key] == c[key], key
assert a['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
assert a['session']['cardId'] == 'catchup-7'
assert a['session']['queue']['sessionId'] == 'mvch686p-e-kaznxi22mfb'
before = json.loads((root / 'before-meta.json').read_text())
after = json.loads((root / 'after-meta.json').read_text())
assert before['process'] == after['process']
assert before['process'].startswith('77843 ')
assert '-RCT_jsLocation localhost:8099' in before['process']
start = datetime.datetime.fromisoformat(before['hostLocal'])
end = datetime.datetime.fromisoformat(after['hostLocal'])
assert start.date().isoformat() == '2026-10-18' and end.date().isoformat() == '2026-10-19'
assert 60 < (end - start).total_seconds() < 600
for name, expected in config['imageSHA256'].items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == expected
words = json.loads((root / 'expected-words.json').read_text())
assert [(x['day'], x['front']) for x in words] == [('2026-10-18', 'tinto'), ('2026-10-19', 'meter presión')]
print('Three saved checkpoints: exact daily-date rollover only; ten other keys, full queue/plan/events preserved; image digests and own path match.')
print('No native replay, image-text recognition, other-theme/platform or source-cold proof is supplied by this verifier.')
