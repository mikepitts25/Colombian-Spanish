"""Verify saved mini visual-matrix evidence without controlling a simulator."""
import hashlib
import itertools
import json
from pathlib import Path
root = Path(__file__).resolve().parent
rows = json.loads((root / 'native/native-state-check.json').read_text())
meta = json.loads((root / 'fixture-metadata.json').read_text())
s = {r['phase']: r for r in rows}
assert len(s) == len(rows) == 9
assert list(s) == ['mini-baseline','mini-imported','mini-default-long-label','mini-maximum-long-label','mini-deck-start','mini-en-dark','mini-en-light','mini-es-light','mini-restored']
def digest(v):
    return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
fields = {'plan':'SRS_DAILY_PLAN_V1','missions':'SRS_MISSIONS_V1','prefs':'SRS_PREFS_V1','session':'SRS_LAST_STUDY_SESSION_V1','daily':'SRS_DAILY_PROGRESS_V1','streak':'SRS_STUDY_STREAK_V1','quizHistory':'SRS_QUIZ_HISTORY_V1','notificationPrefs':'SRS_NOTIFICATION_PREFS_V1'}
for r in rows:
    assert r['device'] == meta['device'] == 'DF3686C1-A2E7-4870-B127-A83A8B67541D'
    assert r['pathMatchesRequestedDevice'] and f"/Devices/{r['device']}/data/Containers/Data/Application/" in r['capturePath']
    assert r['deckCount'] == 48 and r['cardCount'] == 1402 and len(r['keyHashes']) == 11
    assert r['events'] == rows[0]['events'] and len(r['events']) == 11
    for field,key in fields.items():
        assert digest(r[field]) == r['keyHashes'][key], (r['phase'],field)
    assert digest({'schemaVersion':1,'events':r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert all(e['matchesStored'] for e in (r.get('journal') or {}).get('entries',[]))
previous = json.loads((root.parent / '2026-10-18-barrio-home-touch-stop/native/native-state-check.json').read_text())
assert rows[0]['keyHashes'] == previous[-1]['keyHashes'] == s['mini-restored']['keyHashes']
expected = meta['fixtureExpectedKeyHashes']
assert {k for k,v in expected.items() if v != rows[0]['keyHashes'][k]} == {'SRS_DECKS_V3'}
for phase in ['mini-imported','mini-default-long-label','mini-maximum-long-label']:
    assert s[phase]['keyHashes'] == expected
start = s['mini-deck-start']
assert {k for k,v in start['keyHashes'].items() if v != expected[k]} == {'SRS_LAST_STUDY_SESSION_V1'}
assert start['session'] == meta['startedSession']
assert start['session']['deckId'] == 'catchup-qa' and start['session']['cardId'] == 'catchup-4'
assert start['session']['queue'] == {'schemaVersion':1,'cardIds':[f'catchup-{i}' for i in range(4,10)],'region':'all','sessionId':'mve5iisn-2-3582vylo8lf'}
for phase,lang,appearance in [('mini-en-dark','en','dark'),('mini-en-light','en','light'),('mini-es-light','es','light')]:
    r = s[phase]
    assert r['prefs'] == dict(start['prefs'], uiLanguage=lang, appearanceMode=appearance)
    assert {k for k,v in r['keyHashes'].items() if v != start['keyHashes'][k]} == {'SRS_PREFS_V1'}
assert meta['nativeChanges'] is False and meta['productionJS'] is False
assert len(meta['name']) == meta['nameCharacters'] == 100
assert meta['deviceType'] == 'com.apple.CoreSimulator.SimDeviceType.iPad-mini-A17-Pro'
for p in (root/'native').glob('*-preflight.json'):
    r = json.loads(p.read_text())
    assert r['isolated'] and r['requestedDevice'] == meta['device']
    assert f"/Devices/{meta['device']}/data/" in r['resolvedContainer']
images = json.loads((root/'images.json').read_text())
assert len(images) == 10
assert {i['file'] for i in images} == {str(p.relative_to(root)) for p in (root/'native').glob('*.png')}
for i in images:
    assert hashlib.sha256((root/i['file']).read_bytes()).hexdigest() == i['sha256']
matrix = meta['matrix']
assert len(matrix) == 8
assert {(m['language'],m['appearance'],m['nativeTextSize']) for m in matrix} == set(itertools.product(['es','en'],['light','dark'],[3,11]))
assert len({m['image'] for m in matrix}) == 8
assert all(m['image'] in {i['file'] for i in images} for m in matrix)
assert all(m['positioning'] == 'VoiceOver keyboard focus' for m in matrix if m['nativeTextSize'] == 11)
print('PASS: 9 checkpoints/10 PNGs/8 visual matrix entries, exact queue/prefs deltas, all11 original hashes and11events restored. Native visual/input claims require observation.')
