"""Check retained observations only; no simulator access or mutations."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = '5E9A8854-135A-4675-A437-4EFCA043F656'
DESTINATION = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
states = {row['phase']: row for row in rows}
assert len(rows) == len(states) == 11
for row in rows:
    assert row['pathMatchesRequestedDevice']
    assert Path(row['capturePath']).parts[-6] == row['device']
    assert row['journal'] is None and len(row['keyHashes']) == 11
source = states['source-before']
for phase in ['source-before', 'source-after-clear', 'source-cold', 'source-final']:
    row = states[phase]
    assert row['device'] == SOURCE and row['keyHashes'] == source['keyHashes']
    assert len(row['flaggedCards']) == 20
before = states['before-import']
imported = states['imported']
baseline = states['before-clear']
assert before['device'] == imported['device'] == baseline['device'] == DESTINATION
assert imported['deckHash'] == source['deckHash']
assert imported['keyHashes'] == baseline['keyHashes']
assert imported['cardCount'] == 1402 and imported['deckCount'] == 48
assert len(baseline['flaggedCards']) == 20
assert before['keyHashes']['SRS_DECKS_V3'] != imported['keyHashes']['SRS_DECKS_V3']
for key in before['keyHashes']:
    if key != 'SRS_DECKS_V3':
        assert before['keyHashes'][key] == imported['keyHashes'][key]
for phase in ['cleared', 'cleared-cold', 'cleared-cold-ui']:
    row = states[phase]
    assert row['device'] == DESTINATION and row['flaggedCards'] == []
    assert row['keyHashes'] == states['cleared']['keyHashes']
    assert row['keyHashes']['SRS_DECKS_V3'] == baseline['expectedClearedDeckHash']
    assert row['deckWithoutFlagsHash'] == baseline['deckWithoutFlagsHash']
    for key in baseline['keyHashes']:
        if key != 'SRS_DECKS_V3':
            assert row['keyHashes'][key] == baseline['keyHashes'][key]
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 8
for path in preflights:
    record = json.loads(path.read_text())
    expected = SOURCE if path.name.startswith('source-') else DESTINATION
    assert record['isolated'] and record['requestedDevice'] == expected
    assert record['container'] == record['resolvedContainer']
    assert record['container'] == (source if expected == SOURCE else baseline)['capturePath']
fixture = json.loads((HERE / 'fixture.json').read_text())
assert fixture['version'] == 1 and fixture['flaggedCount'] == 20
assert fixture['sourceDeckHash'] == source['keyHashes']['SRS_DECKS_V3']
assert fixture['sourceContainer'] == source['capturePath']
print('PASS: independent source/destination paths; exact deck-only import; 20→0 flag-only clear survives cold launch; ten destination records and eleven source records preserved')
