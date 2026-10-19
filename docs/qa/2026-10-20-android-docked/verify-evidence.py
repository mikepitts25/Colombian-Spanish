"""Passive artifact checks only; does not operate devices or replace UI review."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).parent
metadata = json.loads((root / 'verification.json').read_text())
for name, expected in metadata['filesSha256'].items():
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == expected, name
states = {row['label']: row for row in json.loads((root / 'state-summary.json').read_text())}
assert len(states['graded']['hashes']) == 7
assert states['graded']['hashes'] == states['cold']['hashes']
for label, appearance in [('barrio-system', 'system'), ('barrio-light', 'light')]:
    current = states[label]
    assert current['prefs']['themeId'] == 'barrio'
    assert current['prefs']['appearanceMode'] == appearance
    assert [key for key in current['hashes'] if current['hashes'][key] != states['cold']['hashes'][key]] == ['SRS_PREFS_V1']
assert states['cold']['daily']['count'] == 1
assert len(states['cold']['session']['queue']['cardIds']) == 9
assert 'LaunchState: COLD' in (root / 'cold-launch.txt').read_text()
assert 'mNightMode=2 (yes)' in (root / 'os-dark.txt').read_text()
monitor = [json.loads(line) for line in (root / 'exclusive-runtime.jsonl').read_text().splitlines()]
assert all(row['ios'] == [] and row['android'] in ([], ['emulator-5554']) and not row['collision'] for row in monitor[:-1])
assert monitor[-1]['collision']
assert json.loads((root / 'exclusive-abort.json').read_text())['ownStopped']
print('PASS: evidence digests; seven exact cold records; theme-only preference changes; retained count/queue; sampled runtime guard and recorded interruption. UI claims require screenshot review.')
