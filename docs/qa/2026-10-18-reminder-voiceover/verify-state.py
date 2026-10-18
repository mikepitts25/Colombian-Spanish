"""Offline verification of read-only native focus checkpoints."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before-focus', 'all-three-focused', 'fresh-max-entry', 'restored', 'cold-restored']
base = rows[0]
assert len(base['keyHashes']) == 11
for row in rows:
    assert row['keyHashes'] == base['keyHashes'], row['phase']
    for key in ('prefs', 'notificationPrefs', 'daily', 'session', 'quizHistory', 'events', 'cardCount', 'streak', 'journal', 'plan', 'missions'):
        assert row[key] == base[key], (row['phase'], key)
assert base['notificationPrefs'] is None
print('Five phases verified: all eleven logical hashes identical; no preference, notification, queue, grade or learning-state changes, including cold launch.')
