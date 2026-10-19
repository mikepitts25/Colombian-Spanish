"""Verify saved native evidence, not UI replay or screenshot content."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
rows = json.loads((root / 'native/native-state-check.json').read_text())
meta = json.loads((root / 'verification.json').read_text())
phases = ['source-baseline', 'destination-baseline', 'destination-resumed',
          'destination-after-again', 'destination-after-hard', 'destination-cold-home',
          'destination-cold-resumed', 'editor-first-save', 'editor-second-save',
          'create-touch-attempt', 'deck-created', 'card-added', 'deck-renamed',
          'deck-deleted', 'destination-final-cold', 'destination-final-resumed',
          'source-after-cold', 'destination-due-observation', 'source-final',
          'destination-after-again-due']
assert [r['phase'] for r in rows] == phases
by = {r['phase']: r for r in rows}
source, baseline, resumed, again, hard = rows[:5]
prior = json.loads((root.parent / '2026-10-19-fresh-study-editor/native/native-state-check.json').read_text())
assert source['keyHashes'] == prior[0]['keyHashes']
assert baseline['keyHashes'] == prior[3]['keyHashes']

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

fields = {'plan':'SRS_DAILY_PLAN_V1', 'missions':'SRS_MISSIONS_V1',
          'prefs':'SRS_PREFS_V1', 'daily':'SRS_DAILY_PROGRESS_V1',
          'streak':'SRS_STUDY_STREAK_V1', 'quizHistory':'SRS_QUIZ_HISTORY_V1',
          'session':'SRS_LAST_STUDY_SESSION_V1', 'notificationPrefs':'SRS_NOTIFICATION_PREFS_V1'}
source_rows = [r for r in rows if r['phase'].startswith('source-')]
destination_rows = [r for r in rows if r not in source_rows]
for r in rows:
    expected = source if r in source_rows else baseline
    assert r['device'] == meta['source' if r in source_rows else 'destination']
    assert r['capturePath'] == expected['capturePath'] and r['pathMatchesRequestedDevice'] is True
    assert f"/Devices/{r['device']}/data/Containers/Data/Application/" in r['capturePath']
    assert r['journal'] is None and len(r['keyHashes']) == 11
    for field, key in fields.items():
        assert digest(r[field]) == r['keyHashes'][key], (r['phase'], field)
    assert digest({'schemaVersion':1, 'events':r['events']}) == r['keyHashes']['SRS_LEARNING_EVENTS_V1']
    if 'seenWords' in r:
        assert digest(r['seenWords']) == r['keyHashes']['SRS_SEEN_WORDS_V1']
for r in source_rows:
    assert r['keyHashes'] == source['keyHashes']
assert source['capturePath'] != baseline['capturePath']
assert len(source['events']) == 10
for r in destination_rows:
    idx = phases.index(r['phase'])
    grades = 0 if idx < 3 else 1 if idx == 3 else 2
    assert r['daily'] == {'date':'2026-10-19','count':grades,'target':5,'newCount':0}
    assert r['events'][:10] == source['events'] and len(r['events']) == 10 + grades
    for key in ['SRS_DAILY_PLAN_V1','SRS_MISSIONS_V1','SRS_PREFS_V1','SRS_QUIZ_HISTORY_V1','SRS_NOTIFICATION_PREFS_V1']:
        assert r['keyHashes'][key] == baseline['keyHashes'][key]
    assert r['streak'] == (baseline['streak'] if grades == 0 else {'streak':2,'lastStudyDate':'2026-10-19','freezes':0})
    session = r['session']
    assert session['deckId'] == 'catchup-qa'
    assert session['queue'] == {'schemaVersion':1,'cardIds':['catchup-7','catchup-8','catchup-9'][grades:],'region':'all','sessionId':'native-fresh-study-editor-20261019'}
    assert session['cardId'] == ['catchup-7','catchup-8','catchup-9'][grades]
    assert isinstance(session['updatedAt'], int)
    for card_id, card in r['taskCards'].items():
        expected = dict(baseline['taskCards'][card_id])
        if card_id == 'catchup-7' and grades >= 1:
            expected.update(reps=2, interval=0, ease=1.96, due=again['taskCards'][card_id]['due'])
        if card_id == 'catchup-8' and grades >= 2:
            expected.update(reps=2, interval=0.5, ease=2.1799999999999997, due=hard['taskCards'][card_id]['due'])
        if card_id in ['catchup-5','catchup-6'] and idx >= (7 if card_id == 'catchup-5' else 8):
            saved = by['editor-first-save' if card_id == 'catchup-5' else 'editor-second-save']['taskCards'][card_id]
            expected.update(back=f"Hello {card_id[-1]} [fresh native QA]", flagged=False, reviewStatus='reviewed', reviewedAt=saved['reviewedAt'])
            assert resumed['capturedAt'] * 1000 < saved['reviewedAt'] < r['capturedAt'] * 1000
        assert card == expected, (r['phase'],card_id)
    has_new = r['phase'] in ['deck-created','card-added','deck-renamed']
    assert r['deckCount'] == (49 if has_new else 48)
    assert r['cardCount'] == (1403 if r['phase'] in ['card-added','deck-renamed'] else 1402)
    if not has_new:
        assert r['taskCardNormalizedDeckHash'] == baseline['taskCardNormalizedDeckHash']
    else:
        assert r['withoutNativeDeckHash'] == by['editor-second-save']['keyHashes']['SRS_DECKS_V3']
    if grades == 2:
        assert r['events'] == hard['events']
        assert r['keyHashes']['SRS_SEEN_WORDS_V1'] == hard['keyHashes']['SRS_SEEN_WORDS_V1']
for index, (card_id, quality, delay) in enumerate([('catchup-7',1,900000), ('catchup-8',2,43200000)]):
    event = hard['events'][10+index]
    assert {k:event[k] for k in ['schemaVersion','sessionId','cardId','deckId','modality','evidence','outcome','quality','hintsUsed']} == {
        'schemaVersion':1,'sessionId':'native-fresh-study-editor-20261019','cardId':card_id,'deckId':'catchup-qa',
        'modality':'recall','evidence':'self-rated','outcome':'incorrect','quality':quality,'hintsUsed':None}
    assert isinstance(event['durationMs'], int) and event['durationMs'] > 0
    assert abs((hard['taskCards'][card_id]['due'] - event['occurredAt']) - delay) < 100
assert len({e['id'] for e in hard['events']}) == 12
expected_seen = list(by['source-final']['seenWords'])
for event in hard['events'][10:]:
    num = event['cardId'][-1]
    expected_seen.append({'cardId':event['cardId'],'deckId':'catchup-qa','front':f'Hola {num}','back':f'Hello {num}',
                          'spanish':f'Hola {num}','english':f'Hello {num}','lastSeen':event['occurredAt'], 'correctCount':0,'incorrectCount':1})
assert by['destination-after-again-due']['seenWords'] == expected_seen
created = by['deck-created']['nativeDecks']
added = by['card-added']['nativeDecks']
renamed = by['deck-renamed']['nativeDecks']
assert len(created) == len(added) == len(renamed) == 1
assert created[0]['cards'] == [] and created[0]['name'] == 'Fresh Native QA'
assert added[0]['id'] == created[0]['id'] and added[0]['name'] == 'Fresh Native QA'
assert renamed == [dict(added[0], name='Fresh Native QA Renamed')]
card = added[0]['cards'][0]
assert len(added[0]['cards']) == 1
assert card == {'id':card['id'],'front':'QA café de prueba','back':'QA test coffee','tags':[],
                'createdAt':card['createdAt'],'due':card['createdAt'],'reps':0,'interval':0,'ease':2.5}
assert by['deck-deleted']['nativeDecks'] == by['destination-final-cold']['nativeDecks'] == []
assert by['deck-deleted']['keyHashes'] == by['destination-final-cold']['keyHashes']
assert hard['keyHashes'] == by['destination-cold-home']['keyHashes']
for phase in phases[7:15]:
    assert by[phase]['session'] == by['destination-cold-resumed']['session']
assert by['destination-final-resumed']['session'] == by['destination-after-again-due']['session']
assert by['destination-after-again-due']['capturedAt'] * 1000 > hard['taskCards']['catchup-7']['due']
preflights = list((root / 'native').glob('*-preflight.json'))
assert len(preflights) == 6
for p in preflights:
    r = json.loads(p.read_text()); expected = source if p.name.startswith('source-') else baseline
    assert r['isolated'] is True and r['requestedDevice'] == expected['device']
    assert r['container'] == r['resolvedContainer'] == expected['capturePath']
assert set(meta['imageSHA256']) == {p.name for p in (root / 'native').glob('*.png')}
for name, expected in meta['imageSHA256'].items():
    assert hashlib.sha256((root / 'native' / name).read_bytes()).hexdigest() == expected
print('20 own-path snapshots: exactly two Again/Hard grades, exact SRS/event/seen-word/counter deltas, cold remainder9 and no refill after real Again due; two exact editorial patches; disposable create/add/rename/delete; source11 hashes through actual cold launch; six preflights/ten image digests pass.')
print('Saved-evidence verification only. No touch-only/max-text, long-draft, hardware, notification, Android or full parent acceptance inferred.')
