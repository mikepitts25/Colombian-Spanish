"""Verify recorded observations only; no simulator interaction or storage writes."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEVICE = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
s = {r['phase']: r for r in rows}
assert len(rows) == len(s) == 10
assert list(s) == ['before', 'started', 'software-draft', 'maximum-draft', 'foreground-draft', 'checked', 'cold', 'english-feedback', 'complete-english', 'final']
b = s['before']
for r in rows:
    assert r['device'] == DEVICE and r['pathMatchesRequestedDevice']
    assert Path(r['capturePath']).parts[-6] == DEVICE
    assert r['capturePath'] == b['capturePath']
    assert len(r['keyHashes']) == 11 and r['journal'] is None
    assert r['deckCount'] == 48 and r['cardCount'] == 1402
    for k in b['keyHashes']:
        if k not in ['SRS_MISSIONS_V1', 'SRS_LEARNING_EVENTS_V1', 'SRS_DAILY_PLAN_V1', 'SRS_PREFS_V1']:
            assert r['keyHashes'][k] == b['keyHashes'][k]
    assert r['session'] == b['session']
    assert r['daily'] == b['daily']
    assert r['events'][:10] == b['events']
assert len(b['events']) == 10 and b['missions']['runs'] == []
plan = b['plan']['current']
assert plan['day'] == '2026-10-17' and plan['phase'] == 'applied'
assert plan['review']['session']['queue']['cardIds'] == []
run_id = plan['applied']['runId']
for phase in list(s)[1:]:
    r = s[phase]
    assert len(r['missions']['runs']) == 1
    run = r['missions']['runs'][0]
    assert run['id'] == run_id and run['missionId'] == plan['applied']['missionId']
    assert run['contentVersion'] == plan['applied']['contentVersion']
    expected_plan = dict(plan, phase='complete') if phase in ['complete-english', 'final'] else plan
    assert r['plan'] == dict(b['plan'], current=expected_plan)
    expected_prefs = dict(b['prefs'], uiLanguage='en') if phase in ['english-feedback', 'complete-english'] else b['prefs']
    assert r['prefs'] == expected_prefs
for phase in ['software-draft', 'maximum-draft', 'foreground-draft']:
    assert s[phase]['keyHashes'] == s['started']['keyHashes']
assert s['started']['events'] == b['events']
assert s['started']['missions']['runs'][0]['revision'] == 0
assert s['checked']['keyHashes'] == s['cold']['keyHashes']
for phase in ['checked', 'cold', 'english-feedback', 'complete-english', 'final']:
    r = s[phase]
    assert r['events'] == s['checked']['events'] and len(r['events']) == 11
    run = r['missions']['runs'][0]
    assert run['assisted'] and not run['modelAnswerRevealed']
    assert run['activeTiming'] == {'durationMs': 305496}
    assert run['reviewCardIds'] == ['0010']
for phase in ['checked', 'cold', 'english-feedback']:
    run = s[phase]['missions']['runs'][0]
    assert run == s['checked']['missions']['runs'][0]
    assert run['revision'] == 1 and not run['completed']
    assert run['feedback'] == {'status': 'accent', 'answerIndex': 0}
for phase in ['complete-english', 'final']:
    run = s[phase]['missions']['runs'][0]
    assert run == s['final']['missions']['runs'][0]
    assert run['revision'] == 2 and run['completed'] and run['nodeId'] == 'complete'
    assert 'feedback' not in run
new = s['final']['events'][-1]
assert new['sessionId'] == run_id and new['outcome'] == 'incorrect'
assert new['evidence'] == 'answer-checked' and new['modality'] == 'recall'
assert new['exercise'] == {'id': 'morning-greeting', 'contentVersion': 1, 'kind': 'typed-recall'}
assert new['cardId'] == '0010' and new['missionId'] == 'daily-morning-greeting'
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 3
for path in preflights:
    r = json.loads(path.read_text())
    assert r['isolated'] and r['requestedDevice'] == DEVICE
    assert r['container'] == r['resolvedContainer'] == b['capturePath']
print('PASS: 10 own-path snapshots; one linked run/answer; cold feedback retained; assisted completion; original preferences, decks, daily credit and Study queue preserved')
