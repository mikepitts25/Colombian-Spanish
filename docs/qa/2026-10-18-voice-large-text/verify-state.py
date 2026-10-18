"""Verify recorded two-device state restoration, including a language-only phase."""
import hashlib
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['tablet-baseline', 'phone-baseline', 'tablet-cold-restored', 'phone-english', 'phone-cold-restored']
by_phase = {r['phase']: r for r in rows}
keys = {'SRS_DECKS_V3', 'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1', 'SRS_PREFS_V1',
        'SRS_DAILY_PROGRESS_V1', 'SRS_STUDY_STREAK_V1', 'SRS_SEEN_WORDS_V1',
        'SRS_QUIZ_HISTORY_V1', 'SRS_LAST_STUDY_SESSION_V1',
        'SRS_NOTIFICATION_PREFS_V1', 'SRS_LEARNING_EVENTS_V1'}
phone = 'F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6'
tablet = 'A7494C5C-D6C5-42E9-9CD4-BB2DEC70499F'
for r in rows:
    assert set(r['keyHashes']) == keys
    assert r['device'] == (phone if r['phase'].startswith('phone-') else tablet)
    assert r['journal'] is None
    assert r['cardCount'] == 1392 and r['deckCount'] == 47
for device in ['phone', 'tablet']:
    assert by_phase[device + '-baseline']['keyHashes'] == by_phase[device + '-cold-restored']['keyHashes']
base = by_phase['phone-baseline']
en = by_phase['phone-english']
assert en['prefs'] == {**base['prefs'], 'uiLanguage': 'en'}
for key in keys - {'SRS_PREFS_V1'}:
    assert en['keyHashes'][key] == base['keyHashes'][key]
assert en['keyHashes']['SRS_PREFS_V1'] == hashlib.sha256(json.dumps(en['prefs'], sort_keys=True, separators=(',', ':')).encode()).hexdigest()
print('PASS: eleven logical app hashes restored on each device; intermediate phone change only Spanish→English; no content, schedule or learning credit changes.')
