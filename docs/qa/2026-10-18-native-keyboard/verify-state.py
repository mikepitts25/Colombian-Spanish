"""Check stored evidence of unsaved keyboard drafts and cold restoration."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['baseline', 'dialogs-before-cancel', 'cold-restored', 'final-cold-restored']
keys = {'SRS_DECKS_V3', 'SRS_DAILY_PLAN_V1', 'SRS_MISSIONS_V1', 'SRS_PREFS_V1',
        'SRS_DAILY_PROGRESS_V1', 'SRS_STUDY_STREAK_V1', 'SRS_SEEN_WORDS_V1',
        'SRS_QUIZ_HISTORY_V1', 'SRS_LAST_STUDY_SESSION_V1',
        'SRS_NOTIFICATION_PREFS_V1', 'SRS_LEARNING_EVENTS_V1'}
for r in rows:
    assert r['device'] == 'F8D6111F-AD0F-413A-A6B5-86EEB4CB5EB6'
    assert set(r['keyHashes']) == keys
    assert r['keyHashes'] == rows[0]['keyHashes']
    assert r['journal'] is None
    assert r['cardCount'] == 1392 and r['deckCount'] == 47
    assert r['flaggedCards'] == []
    assert r['prefs']['uiLanguage'] == 'es'
print('PASS: all eleven logical app hashes unchanged through unsaved dialogs and cold restart; 47 decks/1392 cards, empty journal, no learning credit.')
