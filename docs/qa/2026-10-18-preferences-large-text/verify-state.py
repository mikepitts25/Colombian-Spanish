"""Offline verification of read-only native preference snapshots."""
import json
from pathlib import Path

rows = json.loads(Path(__file__).with_name('native-state-check.json').read_text())
phases = ['before-actions', 'profile-unsaved-max', 'profile-saved-max', 'audio-unsaved-max', 'audio-saved-default', 'english-profile-reopened', 'english-profile-unsaved-restoration', 'english-profile-restored', 'english-audio-restored', 'spanish-restored', 'cold-restored']
assert [r['phase'] for r in rows] == phases
base = rows[0]
assert len(base['keyHashes']) == 11
for i, row in enumerate(rows):
    expected = dict(base['prefs'])
    if 2 <= i <= 6:
        expected.update(learningLevel='basic', studyMinutes=10, tripDate='2028-02-29')
    if 4 <= i <= 7:
        expected.update(autoSpeak=True, speechRate=0.75)
    if 5 <= i <= 8:
        expected['uiLanguage'] = 'en'
    assert row['prefs'] == expected, row['phase']
    assert row['keyHashes'].keys() == base['keyHashes'].keys()
    for key, digest in base['keyHashes'].items():
        if key != 'SRS_PREFS_V1' or i in (0, 1, 9, 10):
            assert row['keyHashes'][key] == digest, (row['phase'], key)
    for key in ('daily', 'session', 'quizHistory', 'events', 'cardCount', 'streak', 'journal', 'plan', 'missions'):
        assert row[key] == base[key], (row['phase'], key)
print('11 phases verified: exact expected preferences; all learning state unchanged; all 11 hashes restored before and after cold launch.')
