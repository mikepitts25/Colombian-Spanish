"""Assert the recorded simulator checkpoints; no simulator access or writes."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
by_phase = {row['phase']: row for row in rows}
base = by_phase['before-focus-check']
for phase in ['hard-focused-no-grade', 'before-hard-touch']:
    assert by_phase[phase]['keyHashes'] == base['keyHashes']
after = by_phase['after-hard-touch']
assert after['events'][:-1] == base['events']
assert after['events'][-1]['cardId'] == 'catchup-6'
assert after['events'][-1]['quality'] == 2
assert after['daily'] == {**base['daily'], 'count': 7, 'newCount': 1}
assert after['session']['queue'] == {**base['session']['queue'], 'cardIds': ['catchup-7', 'catchup-8', 'catchup-9']}
old = {card['id']: card for card in base['fixtureCards']}
new = {card['id']: card for card in after['fixtureCards']}
assert [key for key in old if old[key] != new[key]] == ['catchup-6']
assert by_phase['cold-home']['keyHashes'] == after['keyHashes']
for phase in ['cold-resumed-three', 'final-maximum-restored']:
    row = by_phase[phase]
    assert row['events'] == after['events']
    assert row['daily'] == after['daily']
    assert row['deckHash'] == after['deckHash']
    assert row['session']['queue'] == after['session']['queue']
for row in rows:
    assert row['cardCount'] == 1402
    assert row['journal'] is None
    assert row['plan'] == base['plan']
    assert row['missions'] == base['missions']
    assert row['prefs'] == base['prefs']
print('PASS: focus made no durable changes; Hard graded once; new credit correct; exact three-card cold resume; linked plan retained')
