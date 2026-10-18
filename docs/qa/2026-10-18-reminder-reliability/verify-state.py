"""Check read-only own-app snapshots; no device writes."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
assert [r['phase'] for r in rows] == ['before-ui', 'english-ui', 'spanish-restored', 'cold-restored']
base = rows[0]
assert len(base['keyHashes']) == 11
for row in rows:
    expected = dict(base['prefs'])
    if row['phase'] == 'english-ui':
        expected['uiLanguage'] = 'en'
    assert row['prefs'] == expected
    assert row['notificationPrefs'] is None
    assert row['keyHashes'].keys() == base['keyHashes'].keys()
    for key, digest in base['keyHashes'].items():
        if key != 'SRS_PREFS_V1' or row['phase'] != 'english-ui':
            assert row['keyHashes'][key] == digest, (row['phase'], key)
    for key in ('daily', 'session', 'quizHistory', 'events', 'cardCount', 'streak', 'journal', 'plan', 'missions'):
        assert row[key] == base[key], (row['phase'], key)
print('Four phases verified: only temporary English UI preference; all eleven hashes restored; notification preferences and learning state unchanged.')
