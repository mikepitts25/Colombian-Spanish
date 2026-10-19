"""Verify archived records and evidence integrity; no UI replay or image interpretation."""
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
phases = ['baseline', 'long-draft-default', 'long-draft-max', 'max-save-visible',
          'es-draft-canceled', 'english-selected', 'en-new-deck-max-actions',
          'en-rename-max-actions', 'en-drafts-canceled', 'restored-spanish',
          'final-cold', 'exact-restored', 'exact-restored-cold']
assert [r['phase'] for r in rows] == phases
baseline = rows[0]
prior = read(root.parent / '2026-10-19-fresh-graded-editor/native/native-state-check.json')[-1]
assert baseline['keyHashes'] == prior['keyHashes']
assert baseline['session']['cardId'] == 'catchup-9'
assert baseline['session']['queue'] == {'schemaVersion': 1, 'cardIds': ['catchup-9'],
    'region': 'all', 'sessionId': 'native-fresh-study-editor-20261019'}
assert baseline['session']['updatedAt'] == 1792385700000
assert baseline['daily'] == {'date': '2026-10-19', 'count': 2, 'target': 5, 'newCount': 0}
assert baseline['streak'] == {'streak': 2, 'lastStudyDate': '2026-10-19', 'freezes': 0}
assert len(baseline['events']) == 12
fields = {'plan': 'SRS_DAILY_PLAN_V1', 'missions': 'SRS_MISSIONS_V1',
          'prefs': 'SRS_PREFS_V1', 'daily': 'SRS_DAILY_PROGRESS_V1',
          'streak': 'SRS_STUDY_STREAK_V1', 'quizHistory': 'SRS_QUIZ_HISTORY_V1',
          'session': 'SRS_LAST_STUDY_SESSION_V1', 'notificationPrefs': 'SRS_NOTIFICATION_PREFS_V1',
          'seenWords': 'SRS_SEEN_WORDS_V1'}
for index, row in enumerate(rows):
    assert row['device'] == meta['device'] == 'BF511B0E-479F-429E-83B7-4134E910847F'
    assert row['capturePath'] == baseline['capturePath'] and row['pathMatchesRequestedDevice'] is True
    assert f"/Devices/{meta['device']}/data/Containers/Data/Application/77D86906-220A-4801-9E47-AA7B6AC55DEC" in row['capturePath']
    assert row['journal'] is None and len(row['keyHashes']) == 11
    assert row['deckCount'] == 48 and row['cardCount'] == 1402
    expected_prefs = dict(baseline['prefs'])
    if 5 <= index <= 10:
        expected_prefs.update(themeId='classic', appearanceMode='system')
    if 5 <= index <= 8:
        expected_prefs['uiLanguage'] = 'en'
    assert row['prefs'] == expected_prefs
    expected_hashes = dict(baseline['keyHashes'], SRS_PREFS_V1=digest(expected_prefs))
    assert row['keyHashes'] == expected_hashes, row['phase']
    for field, key in fields.items():
        assert digest(row[field]) == row['keyHashes'][key], (row['phase'], field)
        if field != 'prefs':
            assert row[field] == baseline[field]
    assert row['events'] == baseline['events']
    assert digest({'schemaVersion': 1, 'events': row['events']}) == row['keyHashes']['SRS_LEARNING_EVENTS_V1']
    assert row['taskCards'] == baseline['taskCards']
assert rows[-2]['keyHashes'] == rows[-1]['keyHashes'] == baseline['keyHashes']
assert meta['recoveryLogicalHashes'] == baseline['keyHashes']
preflights = list((root / 'native').glob('*-preflight.json'))
assert len(preflights) == 5
for path in preflights:
    item = read(path)
    assert item['isolated'] is True and item['requestedDevice'] == meta['device']
    assert item['container'] == item['resolvedContainer']
    assert item['container'] == baseline['capturePath']
    assert item['bundle'] == 'com.mikepitts.colombianspanish'
images = list((root / 'native').glob('*.png'))
assert len(images) == len(meta['imageSHA256']) == 7
for path in images:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == meta['imageSHA256'][path.name]
inputs = read(root / 'draft-inputs.json')
lengths = {key: len(value) for key, value in inputs['form'].items()}
assert lengths == {'front': 215, 'back': 551, 'example': 503, 'tags': 107}
assert len(inputs['modal']) == 158
observations = read(root / 'ui-comparisons.json')['observations']
assert [o['phase'] for o in observations] == ['es-max-before-refocus', 'es-default-return',
    'en-new-deck-max-before-refocus', 'en-new-deck-max-actions', 'en-rename-max-actions']
assert [o['textSize'] for o in observations] == [11, 3, 11, 11, 11]
for observation in observations[:2]:
    assert observation['lengths'] == lengths
    assert observation['exactValues'] == dict.fromkeys(lengths, True)
for observation in observations[2:]:
    assert observation['exactName'] is True and observation['length'] == 158
print('PASS: 13 snapshots, 5 own-path preflights, 7 image digests; 10 learning records unchanged throughout; all 11 baseline hashes exact after supported recovery and cold launch. UI observation metadata consistent; raw AX strings are not independently replayed.')
