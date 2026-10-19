"""Check saved native records and artifact digests; does not replay UI."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent

def read(path):
    return json.loads(path.read_text())

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

rows = read(root / 'native/native-state-check.json')
meta = read(root / 'verification.json')
inputs = read(root / 'inputs.json')
assert [r['phase'] for r in rows] == ['baseline', 'deck-created', 'draft-default',
    'draft-max', 'card-saved', 'editor-draft', 'editor-saved', 'content-cold', 'restored', 'restored-cold']
baseline = rows[0]
prior = read(root.parent / '2026-10-19-long-drafts/native/native-state-check.json')[-1]
assert baseline['keyHashes'] == prior['keyHashes']
assert baseline['daily'] == {'date': '2026-10-19', 'count': 2, 'target': 5, 'newCount': 0}
assert baseline['session']['queue']['cardIds'] == ['catchup-9'] and len(baseline['events']) == 12
assert baseline['nativeDecks'] == []
created_deck = rows[1]['nativeDecks'][0]
assert created_deck['name'] == 'Fresh Native QA Long Draft' and created_deck['cards'] == []
card = rows[4]['nativeDecks'][0]['cards'][0]
assert {key: len(value) for key, value in inputs['initial'].items()} == {'front': 215, 'back': 551, 'example': 503, 'tags': 107}
for key in ['front', 'back', 'example']:
    assert card[key] == inputs['initial'][key]
assert card['tags'] == [tag.strip() for tag in inputs['initial']['tags'].split(',')]
assert card['reps'] == card['interval'] == 0 and card['ease'] == 2.5
assert card['due'] == card['createdAt']
assert rows[3]['capturedAt'] * 1000 < card['createdAt'] < rows[4]['capturedAt'] * 1000
assert set(card) == {'id', 'front', 'back', 'example', 'tags', 'createdAt', 'due', 'reps', 'interval', 'ease'}
edited = rows[6]['nativeDecks'][0]['cards'][0]
expected = dict(card, back=inputs['editedBack'], example=inputs['editedExample'],
    flagged=False, reviewStatus='reviewed', reviewedAt=edited['reviewedAt'])
assert edited == expected
assert len(edited['back']) == 610 and len(edited['example']) == 549
assert rows[5]['capturedAt'] * 1000 < edited['reviewedAt'] < rows[6]['capturedAt'] * 1000
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1', 'prefs': 'SRS_PREFS_V1',
    'daily': 'SRS_DAILY_PROGRESS_V1', 'streak': 'SRS_STUDY_STREAK_V1',
    'quizHistory': 'SRS_QUIZ_HISTORY_V1', 'session': 'SRS_LAST_STUDY_SESSION_V1',
    'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1', 'seenWords': 'SRS_SEEN_WORDS_V1'}
for index, row in enumerate(rows):
    assert row['device'] == meta['device'] == 'BF511B0E-479F-429E-83B7-4134E910847F'
    assert row['capturePath'] == baseline['capturePath'] and row['pathMatchesRequestedDevice'] is True
    assert row['capturePath'].endswith('/Devices/' + meta['device'] + '/data/Containers/Data/Application/77D86906-220A-4801-9E47-AA7B6AC55DEC')
    assert row['journal'] is None and len(row['keyHashes']) == 11
    prefs = dict(baseline['prefs'])
    if 1 <= index <= 7:
        prefs.update(uiLanguage='en', themeId='classic', appearanceMode='system')
    assert row['prefs'] == prefs
    for field, key in fields.items():
        assert digest(row[field]) == row['keyHashes'][key]
        if field != 'prefs':
            assert row[field] == baseline[field]
    assert row['events'] == baseline['events']
    assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert row['taskCards'] == baseline['taskCards']
    if 1 <= index <= 7:
        assert row['deckCount'] == 49 and row['cardCount'] == (1402 if index <= 3 else 1403)
        assert len(row['nativeDecks']) == 1
        deck = dict(created_deck, cards=[] if index <= 3 else [card if index <= 5 else edited])
        assert row['nativeDecks'][0] == deck
        assert row['withoutNativeDeckHash'] == baseline['keyHashes']['SRS_DECKS_V3']
        if index in [2, 3, 5, 7]:
            assert row['keyHashes'] == rows[index - 1]['keyHashes']
    else:
        assert row['deckCount'] == 48 and row['cardCount'] == 1402 and row['nativeDecks'] == []
        assert row['keyHashes'] == baseline['keyHashes']
assert meta['recoveryLogicalHashes'] == baseline['keyHashes']
preflights = list((root / 'native').glob('*preflight.json'))
assert len(preflights) == 5
for path in preflights:
    item = read(path)
    assert item['isolated'] is True and item['requestedDevice'] == meta['device']
    assert item['container'] == item['resolvedContainer'] == baseline['capturePath']
    assert item['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 5
for path in images:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == meta['imageSHA256'][path.name]
print('PASS: 10 snapshots, 5 preflights, 5 image digests; exact long-card create/edit, unchanged original decks and learning records, exact edited-state cold persistence and all11 baseline hashes restored through cold launch.')
