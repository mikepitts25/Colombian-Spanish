"""Check recorded native journal/recovery evidence; never modifies app storage."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
base, held, blocked, recovered, cold = rows
assert [row['phase'] for row in rows] == [
    'before-restore', 'held-partial-restore', 'cold-recovery-blocked',
    'recovered-through-native-retry', 'normal-entry-cold-resume',
]
assert base['journal'] is None
assert held['journal'] == blocked['journal']
assert held['keyHashes'] == blocked['keyHashes']
entries = held['journal']['entries']
assert len(entries) == 11
assert next(e for e in entries if e['key'] == 'SRS_DECKS_V3')['matchesStored']
assert not next(e for e in entries if e['key'] == 'SRS_PREFS_V1')['matchesStored']
assert recovered['journal'] is None
for entry in entries:
    assert recovered['keyHashes'][entry['key']] == entry['expectedHash'], entry['key']
for row in (recovered, cold):
    assert row['journal'] is None
    for key in ('daily', 'events', 'plan', 'missions', 'streak', 'cardCount'):
        assert row[key] == base[key], key
    assert row['session']['deckId'] == base['session']['deckId']
    assert row['session']['cardId'] == base['session']['cardId'] == 'catchup-3'
    assert row['session']['queue'] == base['session']['queue']
    assert row['prefs'] == dict(base['prefs'], speechRate=0.85)
    expected_cards = json.loads(json.dumps(base['fixtureCards']))
    expected_cards[0]['back'] += ' [restore QA]'
    assert row['fixtureCards'] == expected_cards
for key, value in recovered['keyHashes'].items():
    if key != 'SRS_LAST_STUDY_SESSION_V1':
        assert cold['keyHashes'][key] == value, key
print('PASS: partial state retained through blocked startup; all 11 after-images replayed; exact cold queue and counters preserved')
