"""Passive recorded-state check. Does not operate or modify simulators."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEVICE = 'DABA2821-3619-4F4A-B0C3-54E70B31511F'
rows = json.loads((HERE / 'native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before', 'new-deck', 'rename', 'restored', 'cold']
b = rows[0]
keys = {'SRS_DECKS_V3', 'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1', 'SRS_PREFS_V1', 'SRS_DAILY_PROGRESS_V1', 'SRS_STUDY_STREAK_V1', 'SRS_SEEN_WORDS_V1', 'SRS_QUIZ_HISTORY_V1', 'SRS_LAST_STUDY_SESSION_V1', 'SRS_NOTIFICATION_PREFS_V1', 'SRS_LEARNING_EVENTS_V1'}
for r in rows:
    assert r['device'] == DEVICE and r['pathMatchesRequestedDevice']
    assert Path(r['capturePath']).parts[-6] == DEVICE
    assert r['capturePath'] == b['capturePath'] and set(r['keyHashes']) == keys
    assert r['journal'] is None and r['deckCount'] == 48 and r['cardCount'] == 1402
    english = r['phase'] in ['new-deck', 'rename']
    assert r['prefs'] == (dict(b['prefs'], uiLanguage='en') if english else b['prefs'])
    digest = hashlib.sha256(json.dumps(r['prefs'], sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    assert r['keyHashes']['SRS_PREFS_V1'] == digest
    for key in keys - {'SRS_PREFS_V1'}:
        assert r['keyHashes'][key] == b['keyHashes'][key]
    for field in ['plan', 'missions', 'events', 'daily', 'session', 'streak', 'notificationPrefs', 'quizHistory', 'restoreCard', 'deckHash']:
        assert r[field] == b[field]
    if not english:
        assert r['keyHashes'] == b['keyHashes']
assert b['prefs']['uiLanguage'] == 'es'
assert len(b['events']) == 11
preflights = list(HERE.glob('*preflight.json'))
assert len(preflights) == 3
for path in preflights:
    p = json.loads(path.read_text())
    assert p['isolated'] and p['requestedDevice'] == DEVICE
    assert p['container'] == p['resolvedContainer'] == b['capturePath']
print('PASS: 5 own-path snapshots; only temporary English preference; all eleven baseline hashes restored and cold-persisted; no deck or learning-state changes')
