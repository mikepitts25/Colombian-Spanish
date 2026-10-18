"""Verify retained evidence only; never run a simulator or write app storage."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = '5E9A8854-135A-4675-A437-4EFCA043F656'
DESTINATION = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
states = {r['phase']: r for r in rows}
assert len(rows) == len(states) == 15
source = states['source-before']
baseline = states['harness-before']
held = states['held-partial']
recovered = states['recovered']
for row in rows:
    assert row['pathMatchesRequestedDevice'] and len(row['keyHashes']) == 11
    assert Path(row['capturePath']).parts[-6] == row['device']
    assert row['device'] == (SOURCE if row['phase'].startswith('source-') else DESTINATION)
    assert row['capturePath'] == (source if row['device'] == SOURCE else baseline)['capturePath']
assert source['capturePath'] != baseline['capturePath']
for phase in ['source-before', 'source-cold', 'source-final']:
    assert states[phase]['keyHashes'] == source['keyHashes']
    assert states[phase]['journal'] is None
for phase in ['clipboard-restored', 'clipboard-cold', 'before-harness', 'harness-baseline', 'harness-before']:
    assert states[phase]['keyHashes'] == source['keyHashes']
    assert states[phase]['journal'] is None
assert len(baseline['events']) == 10
assert baseline['cardCount'] == 1402 and baseline['deckCount'] == 48
assert states['destination-before']['keyHashes'] != source['keyHashes']
for phase in ['cold-blocked', 'retry-still-blocked']:
    assert states[phase]['journal'] == held['journal']
    assert states[phase]['keyHashes'] == held['keyHashes']
entries = held['journal']['entries']
assert len(entries) == len({e['key'] for e in entries}) == 11
assert next(e for e in entries if e['key'] == 'SRS_DECKS_V3')['matchesStored']
assert not next(e for e in entries if e['key'] == 'SRS_PREFS_V1')['matchesStored']
assert {k for k in held['keyHashes'] if held['keyHashes'][k] != baseline['keyHashes'][k]} == {'SRS_DECKS_V3'}
assert recovered['journal'] is None
for entry in entries:
    assert recovered['keyHashes'][entry['key']] == entry['expectedHash']
assert {k for k in recovered['keyHashes'] if recovered['keyHashes'][k] != baseline['keyHashes'][k]} == {'SRS_DECKS_V3', 'SRS_PREFS_V1'}
assert recovered['prefs'] == dict(baseline['prefs'], speechRate=0.9)
assert recovered['restoreCard'] == dict(baseline['restoreCard'], back=baseline['restoreCard']['back'] + ' [independent restore QA]')
assert states['normal-cold']['keyHashes'] == recovered['keyHashes']
for phase in ['recovered', 'normal-cold', 'normal-resumed']:
    row = states[phase]
    assert row['journal'] is None
    for field in ['daily', 'events', 'plan', 'missions', 'streak', 'cardCount', 'flaggedCards']:
        assert row[field] == baseline[field], (phase, field)
resumed = states['normal-resumed']
for key in recovered['keyHashes']:
    if key != 'SRS_LAST_STUDY_SESSION_V1':
        assert resumed['keyHashes'][key] == recovered['keyHashes'][key]
assert resumed['session'] == dict(baseline['session'], updatedAt=resumed['session']['updatedAt'])
assert resumed['session']['updatedAt'] > baseline['session']['updatedAt']
assert resumed['session']['cardId'] == 'catchup-7'
assert resumed['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 13
for path in preflights:
    record = json.loads(path.read_text())
    expected = SOURCE if path.name.startswith('source-') else DESTINATION
    assert record['isolated'] and record['requestedDevice'] == expected
    assert record['container'] == record['resolvedContainer'] == (source if expected == SOURCE else baseline)['capturePath']
fixture = json.loads((HERE / 'fixture.json').read_text())
assert fixture['sourceKeyHashes'] == source['keyHashes'] and fixture['normalizedFields'] == []
assert fixture['sourceContainer'] == source['capturePath'] and fixture['eventCount'] == 10
assert len(fixture['applicationStateFields']) == 9
print('PASS: real clipboard full-state restore/cold equality; independent destination interrupted journal and blocked Retry; all eleven after-images recover; exact normal queue and actual source preserved')
