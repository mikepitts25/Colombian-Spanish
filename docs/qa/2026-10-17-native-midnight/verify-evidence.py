"""Verify recorded real-midnight checkpoints; never access simulator storage."""
import json
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
by_phase = {row['phase']: row for row in rows}
before = by_phase['before-midnight']
after = by_phase['observed-new-day']
midnight = datetime(2026, 10, 18, tzinfo=ZoneInfo('Europe/Berlin')).timestamp()
assert before['capturedAt'] < midnight <= after['capturedAt']
assert after['capturedAt'] - midnight < 120, 'Observe the focused minute refresh within two minutes'
assert before['daily'] == {'date': '2026-10-17', 'count': 7, 'target': 5, 'newCount': 1}
assert after['daily'] == {'date': '2026-10-18', 'count': 0, 'target': 5, 'newCount': 0}
for key, value in before['keyHashes'].items():
    if key != 'SRS_DAILY_PROGRESS_V1':
        assert after['keyHashes'][key] == value, key
assert len(after['events']) == 10
assert after['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
assert after['plan']['current']['phase'] == 'applied'
for row in rows:
    assert row['journal'] is None
    assert row['cardCount'] == 1402
    assert row['events'] == before['events']
    assert row['plan'] == before['plan']
    assert row['missions'] == before['missions']
    assert row['prefs'] == before['prefs']
    assert row['streak'] == before['streak']
    assert row['session'] == before['session']
for phase in ['progress-new-day', 'home-return-new-day']:
    assert by_phase[phase]['keyHashes'] == after['keyHashes']
print('PASS: real midnight reset daily count/new allowance only; target, exact queues/plan/events retained; Progress/Home navigation added no credit')
print('First observed app write after midnight:', round(after['capturedAt'] - midnight, 2), 'seconds')
