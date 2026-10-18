"""Check saved phone evidence; does not replay native UI interactions."""
import hashlib
import itertools
import json
from pathlib import Path

root = Path(__file__).resolve().parent
rows = json.loads((root/'native/native-state-check.json').read_text())
meta = json.loads((root/'fixture-metadata.json').read_text())
s = {r['phase']: r for r in rows}
assert len(rows) == len(s) == 10
assert list(s) == ['phone-baseline','phone-imported','phone-es-light-default','phone-deck-opened','phone-en-light-default','phone-en-dark-default','phone-es-dark-default','phone-es-dark-maximum','phone-en-dark-maximum','phone-restored']
def digest(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
fields = {'plan':'SRS_DAILY_PLAN_V1','missions':'SRS_MISSIONS_V1','prefs':'SRS_PREFS_V1','session':'SRS_LAST_STUDY_SESSION_V1','daily':'SRS_DAILY_PROGRESS_V1','streak':'SRS_STUDY_STREAK_V1','quizHistory':'SRS_QUIZ_HISTORY_V1','notificationPrefs':'SRS_NOTIFICATION_PREFS_V1'}
for r in rows:
    assert r['device'] == meta['device'] == '2EDF21F0-7DBD-4B09-8D5F-85560FD0E730'
    assert r['pathMatchesRequestedDevice'] and f"/Devices/{r['device']}/data/Containers/Data/Application/" in r['capturePath']
    assert r['deckCount'] == 48 and r['cardCount'] == 1402 and len(r['keyHashes']) == 11
    assert r['events'] == rows[0]['events'] and len(r['events']) == 10
    for field,key in fields.items():
        assert digest(r[field]) == r['keyHashes'][key], (r['phase'],field)
    assert digest({'schemaVersion':1,'events':r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert all(e['matchesStored'] for e in (r.get('journal') or {}).get('entries',[]))
previous = json.loads((root.parent/'2026-10-18-barrio-home-fixtures/native/native-state-check.json').read_text())
original = next(r for r in previous if r['phase'] == 'phone-restored')
assert rows[0]['keyHashes'] == original['keyHashes'] == s['phone-restored']['keyHashes']
expected = meta['fixtureExpectedKeyHashes']
assert {k for k,v in expected.items() if v != rows[0]['keyHashes'][k]} == {'SRS_DECKS_V3','SRS_PREFS_V1'}
for phase in ['phone-imported','phone-es-light-default']:
    assert s[phase]['keyHashes'] == expected
start = s['phone-deck-opened']
assert {k for k,v in start['keyHashes'].items() if v != expected[k]} == {'SRS_LAST_STUDY_SESSION_V1'}
assert start['session'] == meta['startedSession']
assert start['session']['deckId'] == 'catchup-qa' and start['session']['cardId'] == 'catchup-4'
assert start['session']['queue'] == {'schemaVersion':1,'cardIds':[f'catchup-{i}' for i in range(4,10)],'region':'all','sessionId':'mve74rb1-2-pa5e0ia3qk9'}
for phase,lang,mode in [('phone-en-light-default','en','light'),('phone-en-dark-default','en','dark'),('phone-es-dark-default','es','dark'),('phone-es-dark-maximum','es','dark'),('phone-en-dark-maximum','en','dark')]:
    r = s[phase]
    assert r['prefs'] == dict(start['prefs'],uiLanguage=lang,appearanceMode=mode)
    assert r['session'] == start['session']
    assert {k for k,v in r['keyHashes'].items() if v != start['keyHashes'][k]} == {'SRS_PREFS_V1'}
assert meta['nativeChanges'] is False and meta['productionJS'] is False
assert len(meta['name']) == meta['nameCharacters'] == 100
assert meta['deviceType'] == 'com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation'
for p in (root/'native').glob('*-preflight.json'):
    r = json.loads(p.read_text())
    assert r['isolated'] and r['requestedDevice'] == meta['device']
    assert f"/Devices/{meta['device']}/data/" in r['resolvedContainer']
images = json.loads((root/'images.json').read_text())
assert len(images) == 17
assert {i['file'] for i in images} == {str(p.relative_to(root)) for p in (root/'native').glob('*.png')}
for i in images:
    assert hashlib.sha256((root/i['file']).read_bytes()).hexdigest() == i['sha256']
matrix = meta['matrix']
assert len(matrix) == 8
assert {(m['language'],m['appearance'],m['nativeTextSize']) for m in matrix} == set(itertools.product(['es','en'],['light','dark'],[3,11]))
assert all(p in {i['file'] for i in images} for m in matrix for p in m['images'])
assert sum(m['status']=='full title and count' for m in matrix) == 4
assert sum(m['status'].startswith('full title across') for m in matrix) == 2
assert sum(m['status'].startswith('partial;') for m in matrix) == 1
assert sum(m['status']=='not exercised' for m in matrix) == 1
print('PASS: 10 checkpoints/17 PNGs, exact fixture/session/prefs deltas, all11 original hashes/10events restored. Matrix remains partial; native visual/input claims require observation.')
