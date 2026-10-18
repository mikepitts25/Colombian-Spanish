"""Passive validation of saved observations; no simulator interaction."""
import json
from pathlib import Path

folder = Path(__file__).parent
rows = json.loads((folder / 'native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before', 'resumed', 'english-dialog', 'restored', 'cold']
base, resumed, english, restored, cold = rows
session_key = 'SRS_LAST_STUDY_SESSION_V1'
prefs_key = 'SRS_PREFS_V1'
assert len(base['keyHashes']) == 11
assert base['session']['queue']['cardIds'] == ['catchup-7', 'catchup-8', 'catchup-9']
for row in rows:
    assert row['device'] == '5E9A8854-135A-4675-A437-4EFCA043F656'
    assert row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'] == base['capturePath']
    assert f"/Devices/{row['device']}/data/Containers/Data/Application/" in row['capturePath']
    assert set(row['keyHashes']) == set(base['keyHashes'])
    assert row['journal'] is None
    assert row['events'] == base['events']
    assert row['daily'] == base['daily']
    assert row['plan'] == base['plan']
    assert row['missions'] == base['missions']
    assert row['cardCount'] == base['cardCount'] == 1402
    assert row['deckCount'] == base['deckCount'] == 48
    assert row['flaggedCards'] == base['flaggedCards']
    assert {k: v for k, v in row['session'].items() if k != 'updatedAt'} == {k: v for k, v in base['session'].items() if k != 'updatedAt'}
    expected = set() if row is base else {session_key, prefs_key} if row is english else {session_key}
    assert {k for k, v in base['keyHashes'].items() if row['keyHashes'][k] != v} == expected
assert resumed['session']['updatedAt'] > base['session']['updatedAt']
assert all(row['session'] == resumed['session'] for row in rows[1:])
assert english['prefs'] == dict(base['prefs'], uiLanguage='en')
assert restored['keyHashes'] == cold['keyHashes'] == resumed['keyHashes']
for name in ['before-preflight', 'after-launch-preflight', 'before-cold-preflight', 'after-cold-preflight']:
    observation = json.loads((folder / f'{name}.json').read_text())
    assert observation['isolated'] is True
    assert observation['requestedDevice'] == base['device']
    assert observation['container'] == base['capturePath']
boot = {r['device']: r['state'] for r in json.loads((folder / 'final-boot-states.json').read_text())}
assert boot == {base['device']: 'Shutdown', 'DABA2821-3619-4F4A-B0C3-54E70B31511F': 'Booted', 'E66076BE-D9F8-49FB-870F-F29B57C4CA40': 'Booted'}
print('PASS: own-path narrow resume; exact queue with timestamp-only refresh; English-only prefs restored; all cold hashes exact; no grade/rename')
