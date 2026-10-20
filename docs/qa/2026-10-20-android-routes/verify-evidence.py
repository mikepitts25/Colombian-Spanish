"""Passive QA artifact checks; no device control or substitute for UI review."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).parent
meta = json.loads((root / 'verification.json').read_text())
for name, expected in meta['filesSha256'].items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == expected, name
states = {s['label']: s for s in json.loads((root / 'state-summary.json').read_text())}
start, resumed, after = [states[name] for name in ['start', 'resumed', 'after-preview']]
prior = json.loads((root.parent / '2026-10-20-android-docked/state-summary.json').read_text())[-1]
assert start['hashes'] == prior['hashes']
assert [k for k in start['hashes'] if start['hashes'][k] != resumed['hashes'][k]] == ['SRS_LAST_STUDY_SESSION_V1']
assert {k: v for k, v in start['session'].items() if k != 'updatedAt'} == {k: v for k, v in resumed['session'].items() if k != 'updatedAt'}
assert resumed['session']['cardId'] == '0039'
assert len(resumed['session']['queue']['cardIds']) == 9
assert len(resumed['events']['events']) == 1
assert resumed['daily']['count'] == 1
assert [k for k in resumed['hashes'] if resumed['hashes'][k] != after['hashes'][k]] == ['SRS_PREFS_V1']
assert {k: v for k, v in resumed['prefs'].items() if k != 'uiLanguage'} == {k: v for k, v in after['prefs'].items() if k != 'uiLanguage'}
assert resumed['prefs']['uiLanguage'] == 'es' and after['prefs']['uiLanguage'] == 'en'
assert 'mNightMode=1 (no)' in (root / 'os-light.txt').read_text()
monitor = [json.loads(line) for line in (root / 'exclusive-watch.jsonl').read_text().splitlines()]
assert all(not row['collision'] and row['ios'] == [] and row['android'] in ([], ['emulator-5554']) for row in monitor[:-1])
assert monitor[-1]['collision']
assert json.loads((root / 'exclusive-abort.json').read_text())['ownStopped']
print('PASS: digests; prior/start identity; resume timestamp-only change; one event/nine-card queue; preview learning preservation/language-only preference change; OS Light and sampled interruption guard. No post-voice equality or capture success inferred.')
