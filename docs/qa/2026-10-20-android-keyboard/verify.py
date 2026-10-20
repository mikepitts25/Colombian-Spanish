"""Verify bounded evidence integrity/state; not a substitute for native observation."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
start, final = json.loads((root / 'state-summary.json').read_text())
previous = json.loads((root.parent / '2026-10-20-android-routes/state-summary.json').read_text())[-1]
assert start['hashes'] == previous['hashes']
for key in ['SRS_DECKS_V3', 'SRS_DAILY_PROGRESS_V1', 'SRS_SEEN_WORDS_V1',
            'SRS_STUDY_STREAK_V1', 'SRS_LAST_STUDY_SESSION_V1']:
    assert start['hashes'][key] == final['hashes'][key], key
assert start['daily'] == final['daily'] == {'date': '2026-10-20', 'count': 1, 'target': 5, 'newCount': 1}
assert len(final['session']['queue']['cardIds']) == 9
assert start['events']['events'] == final['events']['events'][:1]
assert len(final['events']['events']) == 2
assert final['events']['events'][1]['evidence'] == 'answer-checked'
assert final['events']['events'][1]['missionId'] == 'first-morning-medellin'
assert {**start['prefs'], 'uiLanguage': 'es'} == final['prefs']
assert start['mission'] is None
run, = final['mission']['runs']
assert run['feedback'] == {'status': 'accent', 'answerIndex': 0}
assert not run['completed'] and run['nodeId'] == 'greeting'
for row in map(json.loads, (root / 'runtime-inventory.jsonl').read_text().splitlines()):
    assert not row['collision'] and not row['ios']
    assert row['android'] in [[], ['emulator-5554']]
manifest = json.loads((root / 'sha256.json').read_text())
for name, digest in manifest.items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == digest, name
assert 'Expected: 400' in (root / 'regression-red.txt').read_text()
assert 'Tests:       20 passed, 20 total' in (root / 'focused-green.txt').read_text()
print('PASS: exact recovered baseline, bounded SRS preservation, one mission result, runtime samples and evidence digests.')
