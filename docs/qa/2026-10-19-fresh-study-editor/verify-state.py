"""Validate saved records and artifact integrity; does not replay UI."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
meta = json.loads((root / 'verification.json').read_text())
rows = json.loads((root / 'native/native-state-check.json').read_text())
assert [r['phase'] for r in rows] == [
    'source-before', 'destination-onboarded', 'destination-imported',
    'destination-fixture-cold', 'source-after-cold']
source, fresh, imported, cold, source_cold = rows

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

fields = {'plan':'SRS_DAILY_PLAN_V1', 'missions':'SRS_MISSIONS_V1',
          'prefs':'SRS_PREFS_V1', 'daily':'SRS_DAILY_PROGRESS_V1',
          'streak':'SRS_STUDY_STREAK_V1', 'quizHistory':'SRS_QUIZ_HISTORY_V1',
          'session':'SRS_LAST_STUDY_SESSION_V1', 'notificationPrefs':'SRS_NOTIFICATION_PREFS_V1'}
for r in rows:
    expected_device = meta['source'] if r['phase'].startswith('source-') else meta['destination']
    assert r['device'] == expected_device and r['pathMatchesRequestedDevice'] is True
    assert f'/Devices/{expected_device}/data/Containers/Data/Application/' in r['capturePath']
    assert r['journal'] is None and len(r['keyHashes']) == 11
    for field, key in fields.items():
        assert digest(r[field]) == r['keyHashes'][key], (r['phase'], field)
    # Fresh startup has no stored events envelope yet, rather than an empty one.
    if r is fresh:
        assert r['events'] == [] and r['keyHashes']['SRS_LEARNING_EVENTS_V1'] == digest(None)
    else:
        assert digest({'schemaVersion':1, 'events':r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
assert fresh['deckCount'] == 47 and fresh['cardCount'] == 1392
assert fresh['capturePath'] == imported['capturePath'] == cold['capturePath']
assert source['capturePath'] == source_cold['capturePath'] != fresh['capturePath']
assert source['keyHashes'] == source_cold['keyHashes']
previous = json.loads((root.parent / '2026-10-19-home-theme-roundtrip/native/native-state-check.json').read_text())[-1]
assert source['keyHashes'] == previous['keyHashes']
assert imported['keyHashes'] == cold['keyHashes'] == meta['fixtureLogicalHashes']
assert imported['session'] == cold['session'] == meta['fixtureSession']
assert imported['session']['queue']['cardIds'] == ['catchup-7','catchup-8','catchup-9']
assert imported['session']['queue']['sessionId'] == 'native-fresh-study-editor-20261019'
assert source['session']['queue']['sessionId'] == 'mvch686p-e-kaznxi22mfb'
assert imported['session']['cardId'] == source['session']['cardId'] == 'catchup-7'
assert imported['daily'] == source['daily'] == {'date':'2026-10-19','count':0,'target':5,'newCount':0}
assert imported['events'] == cold['events'] == source['events'] and len(source['events']) == 10
assert imported['deckCount'] == 48 and imported['cardCount'] == 1402
assert {k for k in source['keyHashes'] if source['keyHashes'][k] != imported['keyHashes'][k]} == {'SRS_DECKS_V3','SRS_LAST_STUDY_SESSION_V1'}
baseline = json.loads((root / 'fixture-card-baseline.json').read_text())
assert imported['taskCards'] == cold['taskCards'] == baseline
assert source['taskCardNormalizedDeckHash'] == imported['taskCardNormalizedDeckHash'] == cold['taskCardNormalizedDeckHash']
for card_id, card in baseline.items():
    expected = dict(source['taskCards'][card_id])
    if card_id in ['catchup-7','catchup-8','catchup-9']:
        expected.update(reps=3, interval=1, ease=2.5, due=1792274400000)
    assert card == expected, card_id
preflights = list((root / 'native').glob('*-preflight.json'))
assert len(preflights) == 6
for p in preflights:
    r = json.loads(p.read_text())
    expected = source if p.name.startswith('source-') else imported
    assert r['isolated'] is True and r['requestedDevice'] == expected['device']
    assert r['container'] == r['resolvedContainer'] == expected['capturePath']
assert set(meta['imageSHA256']) == {p.name for p in (root / 'native').glob('*.png')}
for name, expected in meta['imageSHA256'].items():
    assert hashlib.sha256((root / 'native' / name).read_bytes()).hexdigest() == expected
assert meta['nativeGradesPerformed'] == meta['editorSavesPerformed'] == 0
print('Five snapshots: fresh own-store fixture cold persistence; exact intended three-card/session preparation; eleven original source hashes exact through actual source cold launch; six preflights and two image digests match.')
print('No grading, editor lifecycle, maximum touch/keyboard or full R1/R2 acceptance is inferred. This check does not replay native UI or recognize image content.')
