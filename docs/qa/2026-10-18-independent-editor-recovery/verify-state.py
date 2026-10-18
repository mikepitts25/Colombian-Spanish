"""Check saved editor/source evidence only; no simulator operations."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCE = '5E9A8854-135A-4675-A437-4EFCA043F656'
DESTINATION = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
states = {row['phase']: row for row in rows}
assert len(rows) == len(states) == 11
baseline = states['destination-before']
source = states['source-before']
saved = states['retried']
held = states['held']
for row in rows:
    expected = SOURCE if row['phase'].startswith('source-') else DESTINATION
    assert row['device'] == expected and row['pathMatchesRequestedDevice']
    assert Path(row['capturePath']).parts[-6] == expected
    assert row['capturePath'] == (source if expected == SOURCE else baseline)['capturePath']
    assert len(row['keyHashes']) == 11
assert source['capturePath'] != baseline['capturePath']
for phase in ['source-before', 'source-cold', 'source-final']:
    assert states[phase]['keyHashes'] == source['keyHashes']
    assert states[phase]['journal'] is None
for phase in ['held', 'rejected', 'rejected-maximum']:
    assert states[phase]['keyHashes'] == baseline['keyHashes']
    assert states[phase]['journal'] == held['journal']
assert held['journal']['schemaVersion'] == 1
entries = held['journal']['entries']
assert len(entries) == 1 and entries[0]['key'] == 'SRS_DECKS_V3'
assert not entries[0]['matchesStored']
assert saved['keyHashes']['SRS_DECKS_V3'] == entries[0]['expectedHash']
for phase in ['retried', 'retry-verified', 'normal-cold', 'normal-resumed']:
    row = states[phase]
    assert row['journal'] is None
    assert row['restoreCard'] == saved['restoreCard']
    assert row['restoreCard'] == dict(baseline['restoreCard'], back='Hello 0 — independent tablet retry', reviewStatus='reviewed', flagged=False, reviewedAt=saved['restoreCard']['reviewedAt'])
    assert row['restoreCard']['reviewedAt'] > baseline['restoreCard']['reviewedAt']
    for key in baseline['keyHashes']:
        if key not in ['SRS_DECKS_V3', 'SRS_LAST_STUDY_SESSION_V1']:
            assert row['keyHashes'][key] == baseline['keyHashes'][key]
    if phase != 'normal-resumed':
        assert row['keyHashes'] == saved['keyHashes']
        assert row['session'] == baseline['session']
    if phase != 'retried':
        assert row['deckWithBaselineCardHash'] == baseline['keyHashes']['SRS_DECKS_V3']
resumed = states['normal-resumed']
assert resumed['keyHashes']['SRS_DECKS_V3'] == saved['keyHashes']['SRS_DECKS_V3']
assert resumed['session'] == dict(baseline['session'], updatedAt=resumed['session']['updatedAt'])
assert resumed['session']['updatedAt'] > baseline['session']['updatedAt']
assert resumed['session']['cardId'] == 'catchup-7'
assert resumed['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
assert len(resumed['events']) == 10 and resumed['cardCount'] == 1402
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 7
for path in preflights:
    record = json.loads(path.read_text())
    expected = SOURCE if path.name.startswith('source-') else DESTINATION
    assert record['isolated'] and record['requestedDevice'] == expected
    assert record['container'] == record['resolvedContainer'] == (source if expected == SOURCE else baseline)['capturePath']
print('PASS: independent editor retry matches original one-entry journal; only card0 patch persisted; normal cold/three-card queue and all eleven source records preserved')
